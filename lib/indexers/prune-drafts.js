'use strict';

const _ = require('lodash');

const defaults = {};

function Indexer(options, logger) {
    const self = this;

    options = _.merge(defaults, options);

    function pruneNode(node) {
        for (var ix = node.children.length - 1; ix >=0; ix--) {
            if (node.children[ix].meta.status === 'draft') {
                node.children.splice(ix, 1);
            }
            else {
                pruneNode(node.children[ix]);
            }
        }
    }

    self.index = function (tree) {
        pruneNode(tree);
    };

}


module.exports = Indexer;
