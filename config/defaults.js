'use strict';

const path = require('path');
const guay = require('../index');

const config = {
    loglevel: 'info',
    root: {},
    plugins: {
        read: [],
        process: [],
        filter: [],
        index: [],
        aggregate: [],
        link: [],
    },
    template: {},
    output: {}
};


// -- root

config.root = {
    filename: './src/content/index.md',
    plugin: guay.plugins.read.markdown,
    options: {
        files: {
            extension: 'md',
            index: 'index.md',
        },
        url: {
            base: '/',
            extension: '',
            index: ''
        },
        meta: {
            sitename: 'Guay',
            author: 'Andre Torgal',
            license: {
                url: 'http://andrezero.mit-license.org/2017',
                name: 'MIT License',
                year: (new Date()).getYear()
            }
        }
    }
};


// -- plugins

const plugins = config.plugins;

// - read

plugins.read.push({
    plugin: guay.plugins.read.markdown,
    options: {
        files: {
            extension: 'md',
            index: 'index.md',
            path: './src/content/pages',
            autoRoot: false,
            autoIndex: true,
        },
        url: {
            base: '/',
            extension: '',
            index: ''
        },
        meta: {
            description: 'Generate static sites from markdown'
        }
    }
});

// - process

plugins.process.push({
    plugin: guay.plugins.process.meta
});

plugins.process.push({
    plugin: guay.plugins.process.title
});

plugins.process.push({
    plugin: guay.plugins.process.markdown
});

// - filter

// - index

// - aggregate

// - link

// -- template

config.template = {
    predefined: 'page',
    engines: {
        'tpl.html': {
            plugin: guay.plugins.template.lodash,
            options: {}
        }
    },
    paths: [
        path.join(__dirname, '../templates/')
    ]
};


// -- output

config.output.path = './build';
config.output.files = {
    extension: 'html',
    index: 'index.html'
};


module.exports = config;
