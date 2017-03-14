'use strict';

const path = require('path');
const _ = require('lodash');

const defaults = {};

function Plugin(options, logger) {
    const self = this;

    self.name = 'Guay:Plugin:' + path.basename(__dirname) + ':' + path.basename(__filename).replace('.js', '');

    options = _.merge({}, defaults, options);

    self.process = function (node) {
        if (node.meta.tags) {
            node.meta.tags = node.meta.tags.split(',').map((tag) => tag.trim())
        }
    };

}


module.exports = Plugin;
