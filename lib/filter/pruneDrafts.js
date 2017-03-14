'use strict';

const path = require('path');
const _ = require('lodash');

const defaults = {};

function Plugin(options, logger) {
    const self = this;

    self.name = 'Guay:Plugin:' + path.basename(__dirname) + ':' + path.basename(__filename).replace('.js', '');

    options = _.merge({}, defaults, options);

    function pruneNode(node) {
        for (var ix = node.children.length - 1; ix >= 0; ix--) {
            if (node.children[ix].meta.status === 'draft') {
                node.children.splice(ix, 1);
            }
            else {
                pruneNode(node.children[ix]);
            }
        }
    }

    self.filter = function (tree) {
        pruneNode(tree);
    };

}


module.exports = Plugin;
