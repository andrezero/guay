'use strict';

const path = require('path');
const _ = require('lodash');

const defaults = {};

function Plugin(options, logger) {
    const self = this;

    self.name = 'Guay:Plugin:' + path.basename(__dirname) + ':' + path.basename(__filename).replace('.js', '');

    options = _.merge({}, defaults, options);

    self.index = function (tree) {
        tree.index.set('flatAlpha', () => {
            let flat = tree.getIndex('flat', []);
            return flat.concat().filter(n => n.meta.title).sort((a, b) => {
                if (a.meta.title < b.meta.title) return -1;
                if (a.meta.title > b.meta.title) return 1;
                return 0;
            });
        });
    };

}


module.exports = Plugin;
