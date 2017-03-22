'use strict';

const path = require('path');
const _ = require('lodash-addons');
const dateformat = require('dateformat');
const ellipsize = require('ellipsize');

const defaults = {
    pathMaxLength: 50
};

function Plugin(options, logger) {
    const self = this;

    self.name = 'Guay:Plugin:' + path.basename(__dirname) + ':' + path.basename(__filename).replace('.js', '');

    options = _.merge({}, defaults, options);

    function process(node) {

        if ('blogPost' in node.meta) {

            node.meta.navLinked = true;

            node.$body.addClass('blog-post');

            if (!node.meta.dateCreated) {
                node.meta.dateCreated = new Date();
            }

            let slug = _.slugify(node.meta.title);
            slug = ellipsize(slug, options.pathMaxLength, {chars: ['-'], ellipse: ''});
            node.path = dateformat(node.meta.dateCreated, 'yyyy-mm-dd') + '/' + slug;
        }
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
