'use strict';

const path = require('path');
const _ = require('lodash');

const defaults = {};

function Plugin(options, logger) {
    const self = this;

    self.name = 'Guay:Plugin:' + path.basename(__dirname) + ':' + path.basename(__filename).replace('.js', '');

    options = _.merge({}, defaults, options);

    self.index = function (tree) {
        tree.index.set('byHref', () => {
            let flat = tree.index.flat();
            let byHref = {};
            flat.forEach(node => byHref[node.href] = node);
            return byHref;
        });
    };

}


module.exports = Plugin;
