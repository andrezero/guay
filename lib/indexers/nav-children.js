'use strict';

const _ = require('lodash');

const defaults = {};

function Indexer(options, logger) {
    const self = this;

    options = _.merge(defaults, options);

    self.index = function (tree) {
        let flat = tree.index.get('flat');
        flat.forEach((node) => {
            node.meta.set('nav.children', node.children.filter((child) => {
                return !('navHidden' in child.meta);
            }));
        });
    };

}


module.exports = Indexer;
