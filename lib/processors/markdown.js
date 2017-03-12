'use strict';

const _ = require('lodash');
const markdown = require('markdown-js').makeHtml;

const defaults = {};

function Processor(options, logger) {
    const self = this;

    options = _.merge(defaults, options);

    function parseText(text) {
        return markdown(text);
    }

    function parseElement($, $node) {
        let parsed = '';
        $node.contents().map(function (index, el) {
            if (el.type === 'text') {
                parsed += parseText(el.data);
            }
            else {
                let $el = $(el);
                $el.html(parseElement($, $el));
                parsed += $.html(el);
            }
        }).get().join('\n');

        return parsed;
    }

    self.process = function (node) {
        let $body = node.$body;
        $body.html(parseElement(node.$, $body));
    };
    
}


module.exports = Processor;
