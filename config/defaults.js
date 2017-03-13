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
    processors: [{
        plugin: guay.processors.meta
    }, {
        plugin: guay.processors.title,
        config: {
            extension: 'md',
            index: 'index.md'
        }
    }, {
        plugin: guay.processors.markdown
    }],
    indexers: [],
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


module.exports = config;
