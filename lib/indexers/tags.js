'use strict';

const _ = require('lodash');

const defaults = {
    index: 'flat-alpha'
};

function Indexer(options, logger) {
    const self = this;

    options = _.merge(defaults, options);

    self.index = function (tree) {

        let tags = tree.index.set('tags', {});
        let flat;

        try {
            flat = tree.index.get(options.index);
        }
        catch (err) {
            throw new Error('Index "' + options.index + '" is not populated.');
        }
        
        flat.forEach((node) => {
            (node.meta.tags || []).forEach((tag) => {
                tags[tag] = tags[tag] || [];
                tags[tag].push(node);
            });
        });
    };


}


module.exports = Indexer;
