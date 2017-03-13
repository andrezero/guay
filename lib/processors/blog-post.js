'use strict';

const path = require('path');
const _ = require('lodash-addons');
const dateformat = require('dateformat');
const ellipsize = require('ellipsize');

const defaults = {};

function Processor(options, logger) {
    const self = this;

    options = _.merge(defaults, options);

    self.process = function (node) {

        if ('blogPost' in node.meta) {

            node.$body.addClass('blog-post');

            if (!node.meta.dateCreated) {
                node.meta.dateCreated = new Date();
            }
            
            let href = dateformat(node.meta.dateCreated, 'yyyy-mm-dd') + '/' + _.slugify(node.meta.title);
            node.href = ellipsize(href, 20, {chars: ['-'], ellipse: ''});
        }
    };

}


module.exports = Processor;
