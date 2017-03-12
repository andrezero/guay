'use strict';

const path = require('path');
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

    function scan(parent, scanPath, basePath, outputPath, baseHref, autoIndex) {

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
                    let childNode = new Node(config, filename, outputPath, baseHref, href);
                    parent.addChild(childNode);
                }
                else if (stats.isDirectory()) {
                    let indexFilename = path.join(filename, config.tree.index);
                    if (autoIndex || fsExtra.existsSync(indexFilename)) {
                        let href = getHref(basePath, indexFilename);
                        let childNode = new Node(config, indexFilename, outputPath, baseHref, href);
                        parent.addChild(childNode);
                        scan(childNode, filename, basePath, outputPath, baseHref, autoIndex);
                    }
                    else {
                        scan(parent, filename, basePath, outputPath, baseHref, autoIndex);
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
        let href = getHref(filename, path.join(filename, config.tree.index));
        let rootOutputPath = treeRoot.outputPath || config.output.path;
        rootNode = new Node(config, filename, rootOutputPath, treeRoot.href, href);

        config.tree.paths.forEach(function (scanPath) {
            let pth = path.resolve(scanPath.path);
            let indexFilename = path.join(pth, config.tree.index);
            let outputPath = scanPath.outputPath || config.output.path;
            if (scanPath.autoRoot || fsExtra.existsSync(indexFilename)) {
                let href = getHref(pth, indexFilename);
                let childNode = new Node(config, indexFilename, outputPath, scanPath.href, href);
                rootNode.addChild(childNode);
                scan(childNode, pth, pth, outputPath, scanPath.href, scanPath.autoIndex);
            }
            else {
                scan(rootNode, pth, pth, outputPath, scanPath.href, scanPath.autoIndex);
            }
        });

        return rootNode;
    };
}


module.exports = Scanner;
