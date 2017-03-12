'use strict';

const _ = require('lodash-addons');
const fsExtra  = require('fs-extra-promise');
const dateformat = require('dateformat');
const gaze = require('gaze');

function TemplateEngine(watch, options, logger) {
    const self = this;

    const templates = {};
    const partialCache = {};

    // extend lodash adding a partial helper
    _.template.partial = function(name, data) {
        if (!partialCache[name]) {
            logger.warn('lodash::partial() unknown partial "' + name + '"');
        }
        else {
            return partialCache[name](data);
        }
    };

    _.template.dateformat = (date, format) => dateformat(date, format);

    // -- util functions

    function updateTemplate(name, filename) {
        let templateContents = fsExtra.readFileSync(filename).toString();
        let fn;
        try {
            fn = _.template(templateContents);
            if (filename.match(/\/partials\//)) {
                partialCache[name] = fn;
            }
            else {
                templates[name] = {
                    fn: fn,
                    filename: filename
                };
            }
        }
        catch (err) {
            logger.error('lodash::updateTemplate() "' + err.message + '" in template "' + name + ' @' + filename, err.source);
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
