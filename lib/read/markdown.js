'use strict';

const path = require('path');
const _ = require('lodash');
const q = require('q');
const fsExtra = require('fs-extra-promise');

const Node = require('../Node');

const defaults = {};

function Plugin(options, logger) {
    const self = this;

    self.name = 'Guay:Plugin:' + path.basename(__dirname) + ':' + path.basename(__filename).replace('.js', '');

    options = _.merge({}, defaults, options);

    const basePath = options.files.path && path.resolve(options.files.path);

    const fileIndexRegExp = new RegExp(options.files.index + '$');
    const fileExtRegExp = new RegExp('.' + options.files.extension + '$');

    function readFile(node, filename) {
        if (!filename) {
            return q.resolve();
        }
        // @todo async not working here!?
        // return fsExtra.readFileAsync(filename).then(contents => {
        //     console.log('<<1 ', filename);
        //     node.contents = contents.toString();
        //     return fsExtra.statAsync(filename).then(s => node.stats = s);
        // });

        let contents = fsExtra.readFileSync(filename);
        node.contents = contents.toString();
        return fsExtra.statAsync(filename).then(s => node.stats = s);
    }

    self.readNode = function (parent, basePath, filename, isIndex, noFile) {
        let pth = (basePath && filename) ? filename.substring(basePath.length, filename.length) : '';

        isIndex = isIndex || pth.match(fileIndexRegExp + '$');
        pth = pth.replace(fileIndexRegExp, '');
        pth = pth.replace(fileExtRegExp, '');

        let node = new Node(parent, options.meta, options.url, pth, isIndex);

        if (noFile) {
            return q.resolve(node);
        }
        return readFile(node, filename).then(() => node);
    };

    function scanDir(parent, pth, filename) {
        let indexFilename = path.join(filename, options.files.index);
        let indexFileExists = fsExtra.existsSync(indexFilename);
        if (options.files.autoIndex || indexFileExists) {
            let promise = self.readNode(parent, basePath, indexFilename, true, !indexFileExists)
            return promise.then(node => scanPath(node, filename));
        }
        return scanPath(parent, filename);
    }

    function scanFile(parent, pth, file) {
        let filename = path.join(pth, file);
        let stats = fsExtra.statSync(filename);
        if (stats.isFile() && filename.match(fileExtRegExp)) {
            return self.readNode(parent, basePath, filename, false);
        }
        else if (stats.isDirectory()) {
            return scanDir(parent, pth, filename);
        }
    }

    function scanPath(parent, pth) {
        return fsExtra.readdirAsync(pth).then(files => {
            return q.all(files.filter(file => file !== options.files.index).map(file => scanFile(parent, pth, file)));
        });
    }

    self.readTree = function (parent) {
        let rootFileName = path.join(basePath, options.files.index);
        let rootFileExists = fsExtra.existsSync(rootFileName);
        if (options.autoRoot || rootFileExists) {
            return self.readNode(parent, basePath, rootFileName, true, !rootFileExists).then(node => scanPath(node, basePath));
        }
        else {
            return scanPath(parent, basePath);
        }
    };

    self.getSourcePatterns = function () {
        return path.resolve(options.path + '/**/*.' + options.extension)
    };

}


module.exports = Plugin;
