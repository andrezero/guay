'use strict';

const path = require('path');
const _ = require('lodash');

const defaults = {};

function Plugin(options, logger) {
    const self = this;

    self.name = 'Guay:Plugin:' + path.basename(__dirname) + ':' + path.basename(__filename).replace('.js', '');

    options = _.merge({}, defaults, options);

    function linkNode(node) {
        let siblings = node.parent.nav.children();
        node.nav.set('previous', () => siblings.find((sibling, index) => siblings[index + 1] === node));
        node.nav.set('next', () => siblings.find((sibling, index) => siblings[index - 1] === node));
    }

    self.link = function (tree) {
        let flat = tree.index.flat();
        flat.filter(node => !!node.parent).forEach(node => linkNode(child));
    };

}


module.exports = Plugin;
