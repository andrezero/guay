'use strict';

const path = require('path');
const q = require('q');
const cheerio = require('cheerio');
const fsExtra  = require('fs-extra-promise');

const ObjPathable = require('./ObjPathable');

function Node(config, filename, outputPath, baseHref, href) {
    const self = this;

    const filesIndex = config.output.files.index;
    const filesExt = config.output.files.extension;
    const hrefIndex = config.output.href.index;
    const hrefExt = config.output.href.extension;
    const filesExtRegExp = new RegExp('.' + filesExt + '$');
    const filesIndexRegExp = new RegExp(filesIndex + '$');

    // -- state

    let parent;
    let contents;
    let $;
    let $head;
    let $body;
    let output;

    self.filename = filename;
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

    function getHref() {
        let ret = path.join(baseHref, href);
        if (filesIndex !== hrefIndex && ret.match(filesIndexRegExp)) {
            ret = ret.replace(filesIndexRegExp, hrefIndex);
        }
        if (filesExt !== hrefExt && ret.match(filesExtRegExp)) {
            let replaceWith = hrefExt ? '.' + hrefExt : '';
            ret = ret.replace(filesExtRegExp, replaceWith);
        }
        return ret;
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

    Object.defineProperty(self, 'destination', {
        get: function () {
            return path.join(outputPath, baseHref, href);
        }
    });

    Object.defineProperty(self, 'href', {
        get: getHref
    });

    // -

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
