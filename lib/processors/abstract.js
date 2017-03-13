'use strict';

const _ = require('lodash');

const defaults = {};

function Processor(options, logger) {
    const self = this;

    options = _.merge(defaults, options);

    self.process = function (node) {
        let $ = node.$;
        let $body = node.$body;
        let $abstract = $body.find('#guay-abstract');

        if ($abstract.length) {
            node.meta.description = $abstract.text();
            node.$dom.$abstract = $abstract;
            $abstract.remove();
        }
    };

}


module.exports = Processor;
