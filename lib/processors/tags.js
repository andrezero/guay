'use strict';

const _ = require('lodash');

const defaults = {};

function Processor(options, logger) {
    const self = this;

    options = _.merge(defaults, options);

    self.process = function (node) {
        if (node.meta.tags) {
            node.meta.tags = node.meta.tags.split(',').map((tag) => tag.trim())
        }
    };

}


module.exports = Processor;
