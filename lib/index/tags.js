'use strict';

const path = require('path');
const _ = require('lodash');

const defaults = {
    index: 'flatAlpha'
};

function Plugin(options, logger) {
    const self = this;

    self.name = 'Guay:Plugin:' + path.basename(__dirname) + ':' + path.basename(__filename).replace('.js', '');

    options = _.merge({}, defaults, options);

    self.index = function (tree) {
        tree.index.set('tags', () => {
            let index;
            try {
                index = tree.getIndex(options.index);
            }
            catch (err) {
                throw new Error('Index "' + options.index + '" is not populated.');
            }
            let tags = {};
            index.forEach(node => {
                (node.meta.tags || []).forEach((tag) => {
                    tags[tag] = tags[tag] || [];
                    tags[tag].push(node);
                });
            });
            return tags;
        });
    };

}


module.exports = Plugin;
