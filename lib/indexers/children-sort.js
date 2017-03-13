'use strict';

const _ = require('lodash');

const defaults = {
    sortFns: {
        'alpha+': function (a, b) {
            if (!a.meta.title || a.meta.title < b.meta.title) return -1;
            if (!b.meta.title || a.meta.title > b.meta.title) return 1;
            return 0;
        },
        'alpha-': function (b, a) {
            if (!a.meta.title || a.meta.title < b.meta.title) return -1;
            if (!b.meta.title || a.meta.title > b.meta.title) return 1;
            return 0;
        },
        'dateCreated+': function (a, b) {
            let aCreated = a.meta.dateCreated ? a.meta.dateCreated.getTime() : 0;
            let bCreated = b.meta.dateCreated ? b.meta.dateCreated.getTime() : 0;
            if (aCreated < bCreated) return -1;
            if (aCreated > bCreated) return 1;
            return 0;
        },
        'dateCreated-': function (b, a) {
            let aCreated = a.meta.dateCreated ? a.meta.dateCreated.getTime() : 0;
            let bCreated = b.meta.dateCreated ? b.meta.dateCreated.getTime() : 0;
            if (aCreated < bCreated) return -1;
            if (aCreated > bCreated) return 1;
            return 0;
        },
        'dateUpdated+': function (a, b) {
            let aUpdated = a.meta.dateUpdated ? a.meta.dateUpdated.getTime() : 0;
            let bUpdated = b.meta.dateUpdated ? b.meta.dateUpdated.getTime() : 0;
            if (aUpdated < bUpdated) return -1;
            if (aUpdated > bUpdated) return 1;
            return 0;
        },
        'dateUpdated-': function (b, a) {
            let aUpdated = a.meta.dateUpdated ? a.meta.dateUpdated.getTime() : 0;
            let bUpdated = b.meta.dateUpdated ? b.meta.dateUpdated.getTime() : 0;
            if (aUpdated < bUpdated) return -1;
            if (aUpdated > bUpdated) return 1;
            return 0;
        }
    }
};

function Indexer(options, logger) {
    const self = this;

    options = _.merge(defaults, options);

    function sortNode(node) {
        let order = node.meta['childrenSort'];
        if (options.sortFns[order]) {
            node.children.sort((a, b) => options.sortFns[order](a, b));
        }
        node.children.forEach((child) => sortNode(child));
    }

    self.index = function (tree) {
        sortNode(tree);
    };

}


module.exports = Indexer;
