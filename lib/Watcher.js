'use strict';

const path = require('path');
const gaze = require('gaze');

const utils = require('./utils');

function Watcher(logger) {
    const self = this;

    const emitter = utils.emitter(this);

    let sources = [];
    let templates = [];

    self.sources = function (pattern) {
       sources.push(pattern);
    };

    self.templates = function (pattern) {
       templates.push(pattern);
    };

    self.start = function () {

        logger.debug('watch()', {sources, templates});

        gaze(sources, function(err, watcher) {
            watcher.on('changed', function(filepath) {
                logger.info('watch() source changed', filepath);
                emitter.emit('sources-changed', filepath);
            });

            watcher.on('added', function(filepath) {
                logger.info('watch() source added', filepath);
                emitter.emit('sources-changed', filepath);
            });

            watcher.on('deleted', function(filepath) {
                logger.info('watch() source deleted', filepath);
                emitter.emit('sources-changed', filepath);
            });
        });

        gaze(templates, function(err, watcher) {
            watcher.on('changed', function(filepath) {
                logger.info('watch() template changed', filepath);
                emitter.emit('templates-changed', filepath);
            });

            watcher.on('added', function(filepath) {
                logger.info('watch() template added', filepath);
                emitter.emit('templates-changed', filepath);
            });

            watcher.on('deleted', function(filepath) {
                logger.info('watch() template deleted', filepath);
                emitter.emit('templates-changed', filepath);
            });
        });
    };
}


module.exports = Watcher;
