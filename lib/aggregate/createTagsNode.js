'use strict';

const path = require('path');
const _ = require('lodash');
const Node = require('../Node');

const defaults = {
    parentHref: '/',
    index: 'tags',
    order: 'count-',
    sortFns: {
        'alpha+': function (a, b) {
            if (!a.name || a.name < b.name) return -1;
            if (!b.name || a.name > b.name) return 1;
            return 0;
        },
        'alpha-': function (b, a) {
            if (!a.name || a.name < b.name) return -1;
            if (!b.name || a.name > b.name) return 1;
            return 0;
        },
        'count+': function (a, b) {
            if (a.nodes.length < b.nodes.length) return -1;
            if (a.nodes.length > b.nodes.length) return 1;
            return 0;
        },
        'count-': function (b, a) {
            if (a.nodes.length < b.nodes.length) return -1;
            if (a.nodes.length > b.nodes.length) return 1;
            return 0;
        }
    },
    url: {
        base: '/tags',
        extension: '',
        index: ''
    },
    template: '/tag-list',
    meta: {}
};

function Plugin(options, logger) {
    const self = this;

    self.name = 'Guay:Plugin:' + path.basename(__dirname) + ':' + path.basename(__filename).replace('.js', '');

    options = _.merge({}, defaults, options);

    self.aggregate = function (tree) {
        let tags = tree.index.tags();
        let parent = tree.index['byHref']()[options.parentHref];

        console.log(tags);

        if (!parent) {
            throw new Error('Parent href "' + options.parentHref + '" not found.');
        }

        let tagList = Object.keys(tags).map((tag) => ({name: tag, nodes: tags[tag]}));

        if (options.order && !options.sortFns[options.order]) {
            throw new Error('Invalid sort order "' + options.order + '".');
        }
        else if (options.order) {
            tagList.sort(options.sortFns[options.order]);
        }

        // FUCK NOT INDEXED!

        let meta = _.merge({}, options.meta, {tags: tagList});
        let node = new Node(parent, meta, options.url, '/', true);

        console.log(node.href);
    };


}


module.exports = Plugin;