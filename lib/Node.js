'use strict';

const path = require('path');
const q = require('q');
const cheerio = require('cheerio');
const fsExtra  = require('fs-extra-promise');

const ObjPathable = require('./ObjPathable');

function Node(filename, href) {
    const self = this;

    let parent;
    let contents;
    let $;
    let $head;
    let $body;
    let output;

    self.filename = filename;
    self.href = href;
    self.data = new ObjPathable();
    self.meta = new ObjPathable();
    self.children = [];

    // -- util functions

    function readEmpty() {
        contents = '';
        $ = cheerio.load('<html><body></body><head></head></html>');
        $head = $('head');
        $body = $('body');    
    }

    function readFile(defer) {
        fsExtra.readFile(filename, function (err, contents) {
            if (err) {
                return defer.reject(err);
            }
            contents = contents.toString();
            $ = cheerio.load('<html>' + contents + '</html>');
            $head = $('head');
            $body = $('body');

            if (!$body.length) {
                $('head').remove();
                $('html').html('<body>' + $('html').html() + '</body>');
                $('html').prepend($head);
                $body = $('body');
            }

            if (!$head.length) {
                $('html').prepend('<head></head>');
                $head = $('head');
            }
            
            return defer.resolve();
        });
    }

    // -- api

    Object.defineProperty(self, 'contents', {
        get: function () {
            return contents;
        }
    });

    Object.defineProperty(self, '$', {
        get: function () {
            return $;
        }
    });

    Object.defineProperty(self, '$head', {
        get: function () {
            return $head;
        }
    });

    Object.defineProperty(self, '$body', {
        get: function () {
            return $body;
        }
    });

    Object.defineProperty(self, 'output', {
        get: function () {
            return output;
        }
    });

    self.addChild = function (node) {
        node.setParent(self);
        self.children.push(node);
    };

    self.setParent = function (node) {
        parent = node;
    };

    self.read = function () {
        let defer = q.defer();
        if (!fsExtra.existsSync(filename)) {
            readEmpty();
            defer.resolve();
        }
        else {
            readFile(defer);
        }
        let childPromises = self.children.map(function (child) {
            return child.read();
        });
        return q.all([defer.promise].concat(childPromises));
    };

    self.process = function (processors) {
        let processorPromises = processors.map(function(processor) {
            return processor.process(self);
        });
        let childPromises = self.children.map(function (child) {
            return child.process(processors);
        });
        return q.all(processorPromises.concat(childPromises));
    };

    self.setOutput = function (text) {
        output = text;
    };

    self.asString = function (level) {
        level = level || 1;
        let str = Array(level * 2 - 1).join('.') + href + '    (' + filename + ')\n';
        self.children.forEach(function (child) {
            str += child.asString(level + 1);
        });
        return str;
    };

    Object.freeze(self);
}


module.exports = Node;
