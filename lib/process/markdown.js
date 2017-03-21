'use strict';

const path = require('path');
const _ = require('lodash');
const markdown = require('markdown-js').makeHtml;

const defaults = {};

function Plugin(options, logger) {
    const self = this;

    self.name = 'Guay:Plugin:' + path.basename(__dirname) + ':' + path.basename(__filename).replace('.js', '');

    options = _.merge({}, defaults, options);

    function parseText(text) {
        return (text.match(/\n/)) ? markdown(text) : text;
    }

    function parseElement($, $node) {
        let parsed = '';
        $node.contents().map((index, el) => {
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

    function process(node) {
        node.$body.html(parseElement(node.$, node.$body));
    };

    function processNode(node) {
        process(node);
        node.children.forEach(child => processNode(child));
    }

    self.process = function (tree) {
        processNode(tree);
    };

}


module.exports = Plugin;
