'use strict';

const path = require('path');
const fsExtra  = require('fs-extra-promise');
const queueFactory = require('queue');
const _ = require('lodash');
const q = require('q');
const globule = require('globule');

const utils = require('./utils');
const scan = require('./scan');

function Guay (watcher, config, logger) {
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
        let files = globule.find(templatePath + '/**/*.' + extension);
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
        templatePaths.forEach(function (templatePath) {
            for (let extension in templateEngines) {
                loadTemplatePath(extension, templatePath);
            }
        });

        for (let name in templates) {
            templates[name].engine.addTemplate(name, templates[name].filename);
            watcher.add(templates[name].filename);
        }
    }

    function renderNode(tree, node) {
        let name = node.template || config.templating.predefined;
        let template = templates[name];
        if (!template) {
            throw new Error('Unknown template "' + name + '"');
        }
        try {
            let data = {
                config: config,
                node: node,
                data: node.data,
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

        let tree = scan.paths(config.pages.paths);
        logger.debug('run() files', '\n' + tree.asString());

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

        promise.then(function () {
            let ellapsed = new Date() - start;
            logger.success('run()', {ellapsed});
            done();
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
        watcher.watch();
        queue.push(run);
        watcher.on('changed', enqueue);
    };
}


module.exports = Guay;
