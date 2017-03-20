'use strict';

const path = require('path');
const _ = require('lodash');

const defaults = {};

function Plugin(options, logger) {
    const self = this;

    self.name = 'Guay:Plugin:' + path.basename(__dirname) + ':' + path.basename(__filename).replace('.js', '');

    options = _.merge({}, defaults, options);

    self.link = function (tree) {
        let flat = tree.getIndex('flat', []);
        flat.forEach(node => {
            node.nav.set('children', () => node.children.filter(child => !child.meta.navHidden));
        });
    };

}


module.exports = Plugin;
