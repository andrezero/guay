'use strict';

const _ = require('lodash');

const defaults = {};

function Indexer(options, logger) {
    const self = this;

    options = _.merge(defaults, options);

    function flatten(index, node) {
        index.push(node);
        node.children.forEach((child) => flatten(index, child));
    }

    self.index = function (tree) {
        let index = tree.index.set('flat', []);
        flatten(index, tree);
    };

}


module.exports = Indexer;
