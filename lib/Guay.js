'use strict';

const path = require('path');
const fsExtra  = require('fs-extra-promise');
const queueFactory = require('queue');
const _ = require('lodash');
const q = require('q');
const globule = require('globule');

const utils = require('./utils');

function Guay (watch, scanner, config, logger) {
    let self = this;

    const queue = queueFactory({
        autostart: true,
        concurrency: 1
    });

    const outputPath = path.resolve(config.output.path);
    const processors = [];

    const templatePaths = [];
    const templateEngines = {};
    const templates = {};

    function loadTemplatePath(extension, templatePath) {
        let pattern = templatePath + '/**/*.' + extension;
        let files = globule.find(pattern);
        let regexp = new RegExp('.' + extension + '$');
        files.forEach(function (filename) {
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
        templatePaths.forEach(function (templatePath) {
            for (let extension in templateEngines) {
                loadTemplatePath(extension, templatePath);
            }
        });

        for (let name in templates) {
            templates[name].engine.addTemplate(name, templates[name].filename);
        }
    }

    function renderNode(tree, node) {
        let name = node.meta.template || config.templating.predefined;
        let template = templates[name];
        if (!template) {
            throw new Error('Unknown template "' + name + '" in node "' + node.filename + '"');
        }
        try {
            let data = {
                config: config,
                node: node,
                data: _.merge({}, config.templating.data, node.data),
                tree: tree
            };
            node.setOutput(templates[name].engine.render(name, data));
        }
        catch (err) {
            logger.warn('Error parsing template "' + template.filename + '" for node "' + node.filename + '"', err);
        }
    }

    function renderTree(tree, node) {
        let defer = q.defer();
        let childPromises = node.children.map(function (child) {
            return renderTree(tree, child);
        });
        return q.all([renderNode(tree, node)].concat(childPromises));
    }

    function outputNode(node) {
        let destination = path.join(outputPath, node.destination);
        return fsExtra.ensureDirAsync(path.dirname(destination)).then(function () {
            return fsExtra.writeFileAsync(destination, node.output);
        }).catch(function (err) {
            logger.warn('Error saving file "' + destination + '"', err);
            return q.reject(err);
        });
    }

    function outputTree(node) {
        let defer = q.defer();
        let childPromises = node.children.map(function (child) {
            return outputTree(child);
        });
        return q.all([outputNode(node)].concat(childPromises));
    }

    function run(done) {
        let start = new Date();
        logger.header('run()');

        let tree = scanner.tree();
        logger.info('run() files', '\n' + tree.asString());

        let promise = tree.read();

        promise = promise.then(function () {
            logger.debug('run() process');
            return tree.process(processors);
        });

        promise = promise.then(function () {
            logger.debug('run() render');
            return renderTree(tree, tree);
        });

        promise = promise.then(function () {
            logger.debug('run() render');
            return outputTree(tree);
        });

        return promise.then(function () {
            let ellapsed = new Date() - start;
            logger.success('run()', {ellapsed});
            if (done) {
                done();
            }
        }).catch(function (err) {
            logger.error('run()', err);
            process.exit();
        });
    }

    function enqueue() {
        if (queue.length < 2) {
            queue.push(run);
        }
    }

    function watchSources() { 
        let sources = [];
        if (config.tree.root) {
            watch.sources(path.resolve(config.tree.root.filename));
        }
        config.tree.paths.forEach(function (treePath) {
            watch.sources(path.resolve(treePath.path + '/**/*.' + config.tree.extension));
        });
        watch.on('sources-changed', enqueue);
    }

    function watchTemplates() {
        templatePaths.forEach(function (templatePath) {
            for (let extension in templateEngines) {
                watch.templates(templatePath + '/**/*.' + extension);
            }
        });
        watch.on('templates-changed', function () {
            queue.push(function (done) {
                logger.info('reload templates');
                loadTemplates();
                done();
                enqueue();
            });
        });
    }

    // -- api

    self.addProcessor = function (processor) {
        processors.push(processor);
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
            queue.push(run);
            queue.push(function (done) {
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


module.exports = Guay;
