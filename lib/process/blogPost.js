'use strict';

const path = require('path');
const _ = require('lodash-addons');
const dateformat = require('dateformat');
const ellipsize = require('ellipsize');

const defaults = {};

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

            let href = dateformat(node.meta.dateCreated, 'yyyy-mm-dd') + '/' + _.slugify(node.meta.title);
            node.href = ellipsize(href, 20, {chars: ['-'], ellipse: ''});
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
