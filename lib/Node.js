'use strict';

const path = require('path');
const q = require('q');
const cheerio = require('cheerio');
const fsExtra  = require('fs-extra-promise');

const ObjPathable = require('./ObjPathable');

function Node(config, meta, filename, outputPath, baseHref, href) {
    const self = this;

    const filesIndex = config.output.files.index;
    const filesExt = config.output.files.extension;
    const hrefIndex = config.output.href.index;
    const hrefExt = config.output.href.extension;
    const filesExtRegExp = new RegExp('.' + filesExt + '$');
    const filesIndexRegExp = new RegExp(filesIndex + '$');

    // -- state

    let parent;
    let stats;
    let contents;
    let $;
    let $head;
    let $body;
    let output;

    self.filename = filename;
    self.meta = new ObjPathable(meta);
    self.$dom = new ObjPathable();
    self.index = new ObjPathable();
    self.children = [];

    // -- util functions

    function readEmpty() {
        contents = '';
        $ = cheerio.load('<html><body></body><head></head></html>');
        $head = $('head');
        $body = $('body');    
    }


    function readFile() {
        return fsExtra.readFileAsync(filename).then((contents) => {
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
        });
    }

    function readStats() {
        return fsExtra.statAsync(filename).then((s) => stats = s);
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
        get: () => contents
    });

    Object.defineProperty(self, 'stats', {
        get: () => stats || {}
    });

    Object.defineProperty(self, '$', {
        get: () => $
    });

    Object.defineProperty(self, '$head', {
        get: () => $head
    });

    Object.defineProperty(self, '$body', {
        get: () => $body
    });

    Object.defineProperty(self, 'output', {
        get: () => output
    });

    Object.defineProperty(self, 'destination', {
        get: () => path.join(outputPath, baseHref, href)
    });

    Object.defineProperty(self, 'href', {
        get: getHref,
        set: (h) => href = h + (filesExt ? '.' + filesExt : '')
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
        let promise;
        if (!fsExtra.existsSync(filename)) {
            readEmpty();
        }
        else {
            promise = readFile().then(() => readStats());
        }
        let childPromises = self.children.map((child) => child.read());
        return q.all(childPromises.concat(promise));
    };

    self.process = function (processors) {
        let processorPromises = processors.map((processor) => processor.process(self));
        let childPromises = self.children.map((child) => child.process(processors));
        return q.all(processorPromises.concat(childPromises));
    };

    self.setOutput = function (text) {
        output = text;
    };

    self.asString = function (level) {
        level = level || 1;
        let str = Array(level * 2 - 1).join('.') + href + '    (' + filename + ')\n';
        self.children.forEach((child) => {
            str += child.asString(level + 1);
        });
        return str;
    };

    Object.freeze(self);

}


module.exports = Node;
