'use strict';

const _ = require('lodash');

const defaults = {};

function Indexer(options, logger) {
    const self = this;

    options = _.merge(defaults, options);

    function linkNode(node) {
        if ('linkedList' in node.meta) {
            for (var ix = 0; ix < node.children.length; ix++) {
                let node = node.children[ix];
                let prev = node.children[ix - 1];
                let next = node.children[ix + 1];
                node.meta.set('link.prev', prev); 
                node.meta.set('link.next', next); 
                linkNode(node.children[ix]);
            }
        }
    }

    self.index = function (tree) {
        linkNode(tree);
    };

}


module.exports = Indexer;
