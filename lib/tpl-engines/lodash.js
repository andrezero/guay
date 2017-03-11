'use strict';

const _ = require('lodash');
const fsExtra  = require('fs-extra-promise');
const gaze = require('gaze');

function TemplateEngine(watch, options, logger) {
    const self = this;

    const templates = {};
    const partialCache = {};

    // extend lodash adding a partial helper
    _.template.partial = function(name, data) {
        return partialCache[name](data);
    };

    // -- util functions

    function updateTemplate(name, filename) {
        let templateContents = fsExtra.readFileSync(filename);
        if (filename.match(/\/partials\//)) {
            partialCache[name] = _.template(templateContents);
        }
        else {
            templates[name] = {
                fn: _.template(templateContents.toString()),
                filename: filename
            };
        }
    }

    // -- api

    self.addTemplate = function (name, filename) {
        updateTemplate(name, filename);
        if (watch) {
            gaze(filename, function (err, watcher) {
                watcher.on('changed', function () {
                    logger.debug('lodash::addTemplate() changed', name, filename);
                    updateTemplate(name, filename);
                });
            });
        }
    };

    self.render = function (name, data) {
        let template = templates[name];
        return template.fn(data);
    };
}


module.exports = TemplateEngine;
