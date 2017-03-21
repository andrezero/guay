'use strict';

const path = require('path');
const fsExtra  = require('fs-extra-promise');
const queueFactory = require('queue');
const _ = require('lodash');
const q = require('q');
const globule = require('globule');

const utils = require('./utils');

function Runner (watch, config, logger) {
    let self = this;

    const queue = queueFactory({
        autostart: true,
        concurrency: 1
    });

    let rootReader;
    const plugins = {
        read: [],
        process: [],
        filter: [],
        index: [],
        aggregate: [],
        link: [],
    };

    const templatePaths = [];
    const templateEngines = {};
    const templates = {};

    function loadTemplatePath(extension, templatePath) {
        let pattern = templatePath + '/**/*.' + extension;
        let files = globule.find(pattern);
        let regexp = new RegExp('.' + extension + '$');
        files.forEach(filename => {
            let name = path.basename(filename).replace(regexp, '');
            templates[name] = {
                engine: templateEngines[extension],
                filename: filename
            }
        });
    }

    function loadTemplates() {
        for (let name in templates) {
            delete templates[name];
        }
        templatePaths.forEach(templatePath => Object.keys(templateEngines).forEach(extension => loadTemplatePath(extension, templatePath)));

        for (let name in templates) {
            templates[name].engine.addTemplate(name, templates[name].filename);
        }
    }

    function renderNode(tree, node) {
        let name = node.meta.template || config.template.predefined;
        let template = templates[name];
        if (!template) {
            throw new Error('Unknown template "' + name + '" in node "' + node.filename + '"');
        }
        try {
            let data = {
                config: config,
                root: tree,
                node: node,
                meta: _.merge({}, config.template.meta, node.meta)
            };
            node.output = templates[name].engine.render(name, data);
        }
        catch (err) {
            logger.warn('Error rendering node "' + node.href + '" template "' + template.filename + '"', err.message);
        }
    }

    function renderTree(tree, node) {
        let defer = q.defer();
        let childPromises = node.children.map((child) => {
            renderTree(tree, child)
        });
        return q.all([renderNode(tree, node)].concat(childPromises));
    }

    // @todo use instance of writer plugin
    // - configured with own basePath instead of using the node's baseUrl
    function outputNode(node) {
        let destination = path.join(config.output.path, node.baseUrl, node.path);
        if (node.isIndex) {
            destination = path.join(destination, config.output.files.index);
        }
        else if (config.output.files.extension) {
            destination += '.' + config.output.files.extension;
        }
        destination = path.resolve(destination);
        return fsExtra.ensureDirAsync(path.dirname(destination)).then(() => {
            return fsExtra.writeFileAsync(destination, node.output);
        }).catch(err => {
            logger.warn('Error saving file "' + destination + '"', err);
            return q.reject(err);
        });
    }

    function outputTree(node) {
        let defer = q.defer();
        let childPromises = node.children.map(child => outputTree(child));
        return q.all([outputNode(node)].concat(childPromises));
    }

    function run() {
        let start = new Date();
        logger.header('run()');

        let promise = rootReader.readNode(null, null, config.root.filename, true)

        return promise.then(root => {
            logger.debug('run() read');

            let promise = q.all(plugins.read.map(plugin => {
                logger.debug('run() read', plugin.name);
                return plugin.readTree(root);
            }));

            promise = promise.then(() => {
                logger.debug('run() tree', '\n' + root.asString());
                logger.debug('run() process');
                return q.all(plugins.process.map(plugin => {
                    logger.debug('run() process', plugin.name);
                    return plugin.process(root);
                }));
            });

            promise = promise.then(() => {
                logger.debug('run() filter');
                return q.all(plugins.filter.map(plugin => {
                    logger.debug('run() filter', plugin.name);
                    return plugin.filter(root);
                }));
            });

            promise = promise.then(() => {
                logger.debug('run() index');
                return q.all(plugins.index.map(plugin => {
                    logger.debug('run() index', plugin.name);
                    return plugin.index(root);
                }));
            });

            promise = promise.then(() => {
                logger.debug('run() aggregate');
                return q.all(plugins.aggregate.map(plugin => {
                    logger.debug('run() aggregate', plugin.name);
                    return plugin.aggregate(root);
                }));
            });

            promise = promise.then(() => {
                logger.debug('run() link');
                return q.all(plugins.link.map(plugin => {
                    logger.debug('run() link', plugin.name);
                    return plugin.link(root);
                }));
            });

            promise = promise.then(() => {
                logger.debug('run() render');
                return renderTree(root, root);
            });

            promise = promise.then(() => {
                logger.debug('run() output');
                return outputTree(root);
            });

            return promise.then(() => {
                let ellapsed = new Date() - start;
                logger.success('run()', {ellapsed});
            });

        }).catch(err => {
            logger.error('run()', err);
            process.exit();
        });
    }

    function enqueue() {
        if (queue.length < 2) {
            queue.push(done => run().then(done));
        }
    }

    function watchSources() {
        let sources = [];
        watch.sources(config.root.filename);
        plugins.read.forEach(reader => {
            watch.sources(reader.getSourcePatterns());
        });
        watch.on('sources-changed', enqueue);
    }

    function watchTemplates() {
        templatePaths.forEach(templatePath => Object.keys(templateEngines).forEach(extension => watch.templates(templatePath + '/**/*.' + extension)))
        watch.on('templates-changed', () => {
            queue.push(done => {
                logger.info('reload templates');
                loadTemplates();
                done();
                enqueue();
            });
        });
    }

    // -- api

    self.setRootReader = function (r) {
        rootReader = r;
    };

    self.addPlugin = function (type, plugin) {
        plugins[type].push(plugin);
    };

    self.addTemplateEngine = function (extension, engine) {
        templateEngines[extension] = engine;
    };

    self.addTemplatePath = function (pth) {
        templatePaths.push(pth);
    };

    self.start = function () {
        loadTemplates();
        if (watch) {
            watchTemplates();
            watchSources();
            queue.push(done => run().then(done));
            queue.push(done => {
                logger.info('watching...');
                done();
                watch.start();
            });
        }
        else {
            run();
        }
    };

}


module.exports = Runner;
