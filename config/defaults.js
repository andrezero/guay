'use strict';

const path = require('path');

const config = {
    loglevel: 'info',
    source: {
        paths: ['./src']
    },
    pages: {
        paths: ['./src/pages']
    },
    processors: [{
        path: path.join(__dirname, '../lib/processors/title'),
        config: {}
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
        path: './build'
    }
};


module.exports = config;
