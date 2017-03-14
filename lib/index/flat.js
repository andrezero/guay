'use strict';

const path = require('path');
const _ = require('lodash');

const defaults = {};

function Plugin(options, logger) {
    const self = this;

    self.name = 'Guay:Plugin:' + path.basename(__dirname) + ':' + path.basename(__filename).replace('.js', '');

    options = _.merge({}, defaults, options);

    function flatten(index, node) {
        index.push(node);
        return node.children.forEach((child) => {
            flatten(index, child);
        });
    }

    self.index = function (tree) {
        tree.index.set('flat', () => {
            let index = [];
            flatten(index, tree);
            return index;
        });
    };

}


module.exports = Plugin;
