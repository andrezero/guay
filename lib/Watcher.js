'use strict';

const path = require('path');
const gaze = require('gaze');

const utils = require('./utils');

function Watcher (config, logger) {
    const self = this;

    const emitter = utils.emitter(this);

    let sources = [];
    config.source.paths.forEach(function (srcPath) {
         sources.push(path.resolve(srcPath + '/**/*.js'));
         sources.push(path.resolve(srcPath + '/**/*.md'));
         sources.push(path.resolve(srcPath + '/**/*.scss'));
    });

    self.add = function (filename) {
       sources.push(filename);
    };

    self.watch = function () {

        logger.debug('watch()', {sources});

        gaze(sources, function(err, watcher) {
            watcher.on('changed', function(filepath) {
                logger.info('watch() on changed', filepath);
                emitter.emit('changed', filepath);
            });

            watcher.on('added', function(filepath) {
                logger.info('watch() on added', filepath);
                emitter.emit('changed', filepath);
            });

            watcher.on('deleted', function(filepath) {
                logger.info('watch() on deleted', filepath);
                emitter.emit('changed', filepath);
            });
        });
    };
}


module.exports = Watcher;
