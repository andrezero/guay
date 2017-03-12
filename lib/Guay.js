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

    const indexers = [];
    const outputPath = path.resolve(config.output.path);
    const processors = [];

    const templatePaths = [];
    const templateEngines = {};
    const templates = {};

    function loadTemplatePath(extension, templatePath) {
        let pattern = templatePath + '/**/*.' + extension;
        let files = globule.find(pattern);
        let regexp = new RegExp('.' + extension + '$');
        files.forEach((filename) => {
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
        templatePaths.forEach((templatePath) => {
            for (let extension in templateEngines) {
                loadTemplatePath(extension, templatePath);
            }
        });

        for (let name in templates) {
            templates[name].engine.addTemplate(name, templates[name].filename);
        }
    }

    function scan() {
        let tree = scanner.tree();
        logger.debug('run() files', '\n' + tree.asString());
        return tree;
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
                root: tree,
                node: node,
                meta: _.merge({}, config.templating.meta, node.meta)
            };
            node.setOutput(templates[name].engine.render(name, data));
        }
        catch (err) {
            logger.warn('Error parsing template "' + template.filename + '" for node "' + node.filename + '"', err);
        }
    }

    function renderTree(tree, node) {
        let defer = q.defer();
        let childPromises = node.children.map((child) => renderTree(tree, child));
        return q.all([renderNode(tree, node)].concat(childPromises));
    }

    function outputNode(node) {
        let destination = path.resolve(node.destination);
        return fsExtra.ensureDirAsync(path.dirname(destination)).then(() => {
            return fsExtra.writeFileAsync(destination, node.output);
        }).catch((err) => {
            logger.warn('Error saving file "' + destination + '"', err);
            return q.reject(err);
        });
    }

    function outputTree(node) {
        let defer = q.defer();
        let childPromises = node.children.map((child) => outputTree(child));
        return q.all([outputNode(node)].concat(childPromises));
    }

    function run(done) {
        let start = new Date();
        logger.header('run()');

        let tree = scan();

        let promise = tree.read();

        promise = promise.then(() => {
            logger.debug('run() process');
            return tree.process(processors);
        });

        promise = promise.then(() => {
            logger.debug('run() index');
            indexers.forEach((indexer) => indexer.index(tree));
        });

        promise = promise.then(() => {
            logger.debug('run() render');
            return renderTree(tree, tree);
        });

        promise = promise.then(() => {
            logger.debug('run() output');
            return outputTree(tree);
        });

        return promise.then(() => {
            let ellapsed = new Date() - start;
            logger.success('run()', {ellapsed});
            if (done) {
                done();
            }
        }).catch((err) => {
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
        config.tree.paths.forEach((treePath) => {
            watch.sources(path.resolve(treePath.path + '/**/*.' + config.tree.extension));
        });
        watch.on('sources-changed', enqueue);
    }

    function watchTemplates() {
        templatePaths.forEach((templatePath) => {
            for (let extension in templateEngines) {
                watch.templates(templatePath + '/**/*.' + extension);
            }
        });
        watch.on('templates-changed', () => {
            queue.push((done) => {
                logger.info('reload templates');
                loadTemplates();
                done();
                enqueue();
            });
        });
    }

    // -- api

    self.addIndexer = function (indexer) {
        indexers.push(indexer);
    };

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
            queue.push((done) => {
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
