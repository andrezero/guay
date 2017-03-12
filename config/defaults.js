'use strict';

const path = require('path');

const config = {
    loglevel: 'info',
    tree: {
        extension: 'md',
        index: 'index.md',
        root: {
            filename: './src/pages/home.md',
            href: '/'
        },
        paths: [{
            path: './src/pages',
            href: '/',
            autoRoot: false,
            autoIndex: true
        }]
    },
    processors: [{
        path: path.join(__dirname, '../lib/processors/title'),
        config: {
            extension: 'md',
            index: 'index.md'
        }
    }, {
        path: path.join(__dirname, '../lib/processors/meta'),
        config: {}
    }, {
        path: path.join(__dirname, '../lib/processors/markdown'),
        config: {}
    }],
    templating: {
        predefined: 'page',
        data: {
            sitename: 'Guay'
        },
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
