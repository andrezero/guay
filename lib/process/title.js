'use strict';

const path = require('path');
const _ = require('lodash-addons');

const defaults = {
    extension: 'md',
    index: 'index.md'
};

function Plugin(options, logger) {
    const self = this;

    self.name = 'Guay:Plugin:' + path.basename(__dirname) + ':' + path.basename(__filename).replace('.js', '');

    options = _.merge({}, defaults, options);

    function process(node) {
        let $head = node.$head;
        let $title = $head.find('title');

        let title = $title.text();

        if (title) {
            title = _.capitalize(title.trim());
            $title.remove();
        }
        else {
            title = node.path.replace(/\//g, ' ').trim();
            title = title || node.href.replace(node.baseUrl, '').replace(/\//g, ' ').trim();
            title = title || node.baseUrl.replace(/\//g, ' ').trim();
            title = _.slugify(title).replace(/-/g, ' ');
            title = _.capitalize(title);
        }

        node.meta.title = title;
    }

    function processNode(node) {
        process(node);
        node.children.forEach(child => processNode(child));
    }

    self.process = function (tree) {
        processNode(tree);
    };

}


module.exports = Plugin;
