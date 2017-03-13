'use strict';

const _ = require('lodash');

const defaults = {};

function Indexer(options, logger) {
    const self = this;

    options = _.merge(defaults, options);

    self.index = function (tree) {
        let flat = tree.index.get('flat');
        let index = flat.concat().filter(n => n.meta.title).sort((a, b) => {
            if (a.meta.title < b.meta.title) return -1;
            if (a.meta.title > b.meta.title) return 1;
            return 0;
        })
        tree.index.set('flat-alpha', index);
    };

}


module.exports = Indexer;
