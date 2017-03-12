'use strict';

const path = require('path');
const fsExtra = require('fs-extra-promise');

const Node = require('./Node');

function Scanner(config, logger) {
    const self = this;

    const treeExtRegExp = new RegExp('.' + config.tree.extension + '$');
    const treeIndexRegExp = new RegExp(config.tree.index + '$');
    const outputExtension = config.output.destination.extension ? '.' + config.output.destination.extension : '';

    function getHref(baseHref, basePath, filename) {
        let relative = filename.substring(basePath.length, filename.length);
        let href = path.join(baseHref, relative);
        if (href.match(treeIndexRegExp)) {
            href = href.replace(treeIndexRegExp, config.output.destination.index);
        }
        else if (href.match(treeExtRegExp)) {
            href = href.replace(treeExtRegExp, outputExtension);
        }
        return href;
    }

    function scan(parent, scanPath, basePath, baseHref, autoIndex) {

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
                    let href = getHref(baseHref, basePath, filename);
                    let childNode = new Node(filename, href);
                    parent.addChild(childNode);
                }
                else if (stats.isDirectory()) {
                    let indexFilename = path.join(filename, config.tree.index);
                    if (autoIndex || fsExtra.existsSync(indexFilename)) {
                        let href = getHref(baseHref, basePath, indexFilename);
                        let childNode = new Node(indexFilename, href);
                        parent.addChild(childNode);
                        scan(childNode, filename, basePath, baseHref, autoIndex);
                    }
                    else {
                        scan(parent, filename, basePath, baseHref, autoIndex);
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
        let href = getHref(treeRoot.href, filename, path.join(filename, config.tree.index));
        rootNode = new Node(filename, getHref(href, filename, filename));

        config.tree.paths.forEach(function (scanPath) {
            let pth = path.resolve(scanPath.path);
            let indexFilename = path.join(pth, config.tree.index);
            if (scanPath.autoRoot || fsExtra.existsSync(indexFilename)) {
                let href = getHref(scanPath.href, pth, indexFilename);
                let childNode = new Node(indexFilename, href);
                rootNode.addChild(childNode);
                scan(childNode, pth, pth, scanPath.href, scanPath.autoIndex);
            }
            else {
                scan(rootNode, pth, pth, scanPath.href, scanPath.autoIndex);
            }
        });

        return rootNode;
    };
}


module.exports = Scanner;
