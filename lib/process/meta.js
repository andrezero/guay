'use strict';

const path = require('path');
const _ = require('lodash');

const defaults = {};

function Plugin(options, logger) {
    const self = this;

    self.name = 'Guay:Plugin:' + path.basename(__dirname) + ':' + path.basename(__filename).replace('.js', '');

    options = _.merge({}, defaults, options);

    function process(node) {
        let $head = node.$head;
        let $meta = $head.find('meta[name="guay"]');

        if ($meta.length) {
            $meta.remove();
            let meta = $meta.data();
            for (let key in meta) {
                node.meta.set(key, meta[key]);
            }
        }
    }

    function processNode(node) {
        process(node);
        node.children.forEach(child => processNode(child));
    }

    self.process = function (tree) {
        processNode(tree);
    };

}


module.exports = Plugin;
