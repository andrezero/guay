'use strict';

const _ = require('lodash');

const defaults = {};

function Indexer(options, logger) {
    const self = this;

    options = _.merge(defaults, options);

    self.index = function (tree) {
        let index = tree.index.get('flat');
        let byHref = tree.index.set('by-href', {});
        index.forEach((node) => byHref[node.href] = node);
    };

}


module.exports = Indexer;
