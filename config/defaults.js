'use strict';

const path = require('path');

const config = {
    loglevel: 'info',
    tree: {
        extension: 'md',
        index: 'index.md',
        meta: {
            description: 'Generate static sites from markdown'            
        },
        root: {
            filename: './src/pages/home.md',
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
            path: './src/pages',
            href: '/',
            autoRoot: false,
            autoIndex: true
        }]
    },
    processors: [{
        path: path.join(__dirname, '../lib/processors/meta')
    }, {
        path: path.join(__dirname, '../lib/processors/title'),
        config: {
            extension: 'md',
            index: 'index.md'
        }
    }, {
        path: path.join(__dirname, '../lib/processors/markdown')
    }],
    templating: {
        predefined: 'page',
        engines: {
            'tpl.html': {
                path: path.join(__dirname, '../lib/tpl-engines/lodash'),
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
