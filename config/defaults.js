'use strict';

const path = require('path');
const guay = require('../index');

const config = {
    loglevel: 'info',
    tree: {
        extension: 'md',
        index: 'index.md',
        meta: {
            description: 'Generate static sites from markdown'            
        },
        root: {
            filename: './src/content/pages/home.md',
            href: '/',
            meta: {
                sitename: 'Guay',
                author: 'Andre Torgal',
                license: {
                    url: 'http://andrezero.mit-license.org/2017',
                    name: 'MIT License',
                    year: '2017'
                }
            }
        },
        paths: [{
            path: './src/content/pages',
            href: '/',
            autoRoot: false,
            autoIndex: true
        }]
    },
    indexers: [],
    processors: [],
    templating: {
        predefined: 'page',
        engines: {
            'tpl.html': {
                plugin: guay.tplEngines.lodash,
                config: {}
            }
        },
        paths: [
            path.join(__dirname, '../templates/')
        ]
    },
    output: {
        path: './build',
        files: {
            extension: 'html',
            index: 'index.html'
        },
        href: {
            extension: 'html',
            index: ''
        }
    }
};

// -- processors

config.processors.push({
    plugin: guay.processors.meta
});

config.processors.push({
    plugin: guay.processors.title,
    config: {
        extension: 'md',
        index: 'index.md'
    }
});

config.processors.push({
    plugin: guay.processors.markdown
});

config.processors.push({
    plugin: guay.processors.abstract
});

config.processors.push({
    plugin: guay.processors.tags
});

config.processors.push({
    plugin: guay.processors.dates
});

config.processors.push({
    plugin: guay.processors.blogPost
});

// -- indexers

config.indexers.push({
    plugin: guay.indexers.pruneDrafts
});

config.indexers.push({
    plugin: guay.indexers.flat
});

config.indexers.push({
    plugin: guay.indexers.childrenSort
});

config.indexers.push({
    plugin: guay.indexers.navChildren
});

config.indexers.push({
    plugin: guay.indexers.navLinked
});

config.indexers.push({
    plugin: guay.indexers.flatAlpha
});

config.indexers.push({
    plugin: guay.indexers.flatDateCreated
});

config.indexers.push({
    plugin: guay.indexers.flatDateUpdated
});

config.indexers.push({
    plugin: guay.indexers.byHref
});

config.indexers.push({
    plugin: guay.indexers.tags
});

module.exports = config;
