'use strict';

const _ = require('lodash');

const defaults = {};

function Indexer(options, logger) {
    const self = this;

    options = _.merge(defaults, options);

    function linkNode(node) {
        if ('navLinked' in node.meta) {
            let children = node.children.filter((child) => !('navHidden' in child.meta));
            for (var ix = 0; ix < children.length; ix++) {
                let node = children[ix];
                let previous = children[ix - 1];
                let next = children[ix + 1];
                node.meta.set('nav.previous', previous); 
                node.meta.set('nav.next', next); 
                linkNode(node.children[ix]);
            }
        }
    }

    self.index = function (tree) {
        linkNode(tree);
    };

}


module.exports = Indexer;
