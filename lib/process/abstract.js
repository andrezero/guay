'use strict';

const path = require('path');
const _ = require('lodash');

const defaults = {};

function Plugin(options, logger) {
    const self = this;

    self.name = 'Guay:Plugin:' + path.basename(__dirname) + ':' + path.basename(__filename).replace('.js', '');

    options = _.merge({}, defaults, options);

    self.process = function (node) {
        let $ = node.$;
        let $body = node.$body;
        let $abstract = $body.find('#guay-abstract');

        if ($abstract.length) {
            node.meta.abstract = $abstract.text();
            node.meta.description = node.meta.abstract;
            node.$dom.$abstract = $abstract;
            $abstract.remove();
        }
    };

}


module.exports = Plugin;
