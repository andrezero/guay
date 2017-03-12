'use strict';

const path = require('path');
const _ = require('lodash');
const fsExtra = require('fs-extra-promise');

const Node = require('./Node');

function Scanner(config, logger) {
    const self = this;

    const treeExtRegExp = new RegExp('.' + config.tree.extension + '$');
    const treeIndexRegExp = new RegExp(config.tree.index + '$');
    const outputExtension = config.output.files.extension ? '.' + config.output.files.extension : '';

    function getHref(basePath, filename) {
        let relative = filename.substring(basePath.length, filename.length);
        let href = path.join(relative);
        if (href.match(treeIndexRegExp)) {
            href = href.replace(treeIndexRegExp, config.output.files.index);
        }
        else if (href.match(treeExtRegExp)) {
            href = href.replace(treeExtRegExp, outputExtension);
        }
        return href;
    }

    function scan(parent, meta, scanPath, basePath, outputPath, baseHref, autoIndex) {

        if (!fsExtra.existsSync(scanPath)) {
            logger.warn('scanner() Invalid path "' + scanPath + '"');
            return;
        }

        let fileNames = fsExtra.readdirSync(scanPath);
        fileNames.forEach(function (file) {
            let filename = path.join(scanPath, file);
            let stats = fsExtra.statSync(filename);
            if (stats) {
                if (stats.isFile() && filename !== parent.filename && filename.match(treeExtRegExp)) {
                    let href = getHref(basePath, filename);
                    let childNode = new Node(config, meta, filename, outputPath, baseHref, href);
                    parent.addChild(childNode);
                }
                else if (stats.isDirectory()) {
                    let indexFilename = path.join(filename, config.tree.index);
                    if (autoIndex || fsExtra.existsSync(indexFilename)) {
                        let href = getHref(basePath, indexFilename);
                        let childNode = new Node(config, meta, indexFilename, outputPath, baseHref, href);
                        parent.addChild(childNode);
                        scan(childNode, meta, filename, basePath, outputPath, baseHref, autoIndex);
                    }
                    else {
                        scan(parent, meta, filename, basePath, outputPath, baseHref, autoIndex);
                    }
                }
            }
        });
    }

    self.tree = function () {
        let treeRoot = config.tree.root;
        let treePaths = config.tree.paths;
        let rootNode;

        if (!treeRoot) {
            throw new Error('No root set');
        }
        if (!treePaths || !treePaths.length) {
            throw new Error('No paths set');
        }

        let filename = path.resolve(treeRoot.filename);
        let meta = _.merge({}, config.tree.meta, config.tree.root.meta);
        let href = getHref(filename, path.join(filename, config.tree.index));
        let rootOutputPath = treeRoot.outputPath || config.output.path;
        rootNode = new Node(config, meta, filename, rootOutputPath, treeRoot.href, href);

        config.tree.paths.forEach(function (scanPath) {
            let pth = path.resolve(scanPath.path);
            let meta = _.merge({}, config.tree.meta, scanPath.meta);
            let outputPath = scanPath.outputPath || config.output.path;
            let indexFilename = path.join(pth, config.tree.index);
            if (scanPath.autoRoot || fsExtra.existsSync(indexFilename)) {
                let href = getHref(pth, indexFilename);
                let childNode = new Node(config, meta, indexFilename, outputPath, scanPath.href, href);
                rootNode.addChild(childNode);
                scan(childNode, meta, pth, pth, outputPath, scanPath.href, scanPath.autoIndex);
            }
            else {
                scan(rootNode, meta, pth, pth, outputPath, scanPath.href, scanPath.autoIndex);
            }
        });

        return rootNode;
    };
}


module.exports = Scanner;
