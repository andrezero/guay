'use strict';

const path = require('path');
const q = require('q');
const cheerio = require('cheerio');

const ObjPathable = require('./ObjPathable');

function Node(parent, meta, urlOptions, pth, isIndex) {
    const self = this;

    let href;
    let stats = {};
    let $ = cheerio.load('<html><body></body><head></head></html>');
    let output;

    self.isIndex = isIndex;
    self.meta = new ObjPathable(meta);
    self.nav = new ObjPathable();
    self.$dom = new ObjPathable();
    self.index = new ObjPathable();
    self.children = [];

    if (parent) {
        self.root = parent.root ? parent.root : parent;
        parent.addChild(self);
    }

    // -- api

    Object.defineProperty(self, 'stats', {
        set: (s) => stats = s,
        get: () => stats || {}
    });

    Object.defineProperty(self, 'contents', {
        set: (c) => {
            $ = cheerio.load('<html>' + c + '</html>');
            let $head = $('head');
            let $body = $('body');

            if (!$body.length) {
                $('head').remove();
                $('html').html('<body>' + $('html').html() + '</body>');
                $('html').prepend($head);
            }

            if (!$head.length) {
                $('html').prepend('<head></head>');
            }
        }
    });

    Object.defineProperty(self, 'parent', {
        get: () => parent
    });

    Object.defineProperty(self, '$', {
        set: ($$) => $ = $$,
        get: () => $
    });

    Object.defineProperty(self, '$head', {
        get: () => $('head')
    });

    Object.defineProperty(self, '$body', {
        get: () => $('body')
    });

    Object.defineProperty(self, '$attr', {
        get: () => {
            let attr = $('body').attr();
            return Object.keys(attr).map(key => key + '="' + attr[key] + '"').join(' ');
        }
    });

    Object.defineProperty(self, 'output', {
        set: (o) => output = o,
        get: () => output
    });

    Object.defineProperty(self, 'baseUrl', {
        get: () => urlOptions.base
    });

    Object.defineProperty(self, 'path', {
        set: (p) => pth = p,
        get: () => pth
    });

    Object.defineProperty(self, 'href', {
        set: (h) => href = h,
        get: () => {
            if (href) {
                return href;
            }
            else {
                let ret = path.join(urlOptions.base, pth);
                if (isIndex) {
                    ret = path.join(ret, urlOptions.index);
                }
                else if (urlOptions.extension) {
                    ret += '.' + urlOptions.extension;
                }
                return ret;
            }
        }
    });

    self.addChild = function (node) {
        self.children.push(node);
    };

    self.getIndex = function (name, defaultValue) {
        let fn = self.index.get(name, defaultValue);
        return fn === defaultValue ? defaultValue : fn();
    };

    self.getNav = function (name, defaultValue) {
        let fn = self.nav.get(name, defaultValue);
        return fn === defaultValue ? defaultValue : fn();
    };

    self.asString = function (level) {
        level = level || 1;
        let str = Array(level * 2 - 1).join('.') + self.href + '  ' + (isIndex ? '[i]' : '')+ '\n';
        self.children.forEach(child => {
            str += child.asString(level + 1);
        });
        return str;
    };

    Object.freeze(self);

}


module.exports = Node;
