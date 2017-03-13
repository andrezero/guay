'use strict';

const _ = require('lodash');

const defaults = {};

function Indexer(options, logger) {
    const self = this;

    options = _.merge(defaults, options);

    self.index = function (tree) {
        let flat = tree.index.get('flat');
        let index = flat.concat().filter(n => n.meta.wasUpdated).sort((a, b) => {
            if (a.meta.dateUpdated.getTime() < b.meta.dateUpdated.getTime()) return -1;
            if (a.meta.dateUpdated.getTime() > b.meta.dateUpdated.getTime()) return 1;
            return 0;
        })
        tree.index.set('flat-date-updated', index);
    };

}


module.exports = Indexer;
