'use strict';

const _ = require('lodash');

const defaults = {};

function Processor(options, logger) {
    const self = this;

    options = _.merge(defaults, options);

    self.process = function (node) {

        let meta = node.meta;
        let stats = node.stats;

        if (meta.dateCreated) {
            meta.dateCreated = new Date(meta.dateCreated);
        }
        else if (stats.birthtime) {
            meta.dateCreated = stats.birthtime;
        }

        if (meta.dateUpdated) {
            meta.dateUpdated = new Date(meta.dateUpdated);
        }
        else if (stats.mtime) {
            meta.dateUpdated = stats.mtime;
        }

        if (meta.dateCreated && meta.dateUpdated) {
            meta.wasUpdated = meta.dateUpdated.getTime() > meta.dateCreated.getTime();
        }
    };

}


module.exports = Processor;
