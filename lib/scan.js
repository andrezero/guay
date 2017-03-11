'use strict';

const path = require('path');
const fsExtra = require('fs-extra-promise');

const Node = require('./Node');

function getHref(basePath, filename, replaceExtension, withExtension) {
    let href = filename.substring(basePath.length, filename.length);
    if (replaceExtension) {
        href = href.replace(new RegExp('\.' + replaceExtension + '$'), '.' + withExtension);
    }
    else if (!href.match(/\/$/)) {
        href += '/';
    }
    return href;
}

function getDestination(href) {
    if (href.match(/\/$/)) {
        href = href + 'index.html';
    }
    return href;
}

function scanChildren(parent, basePath, scanPath) {
    let fileNames = fsExtra.readdirSync(scanPath);
    fileNames.forEach(function (file) {
        let filename = path.join(scanPath, file);
        let stats = fsExtra.statSync(filename);
        if (stats) {
            if (stats.isFile() && file !== 'index.md' && filename.match(/\.md$/)) {
                let href = getHref(basePath, filename, 'md', 'html');
                let destination = getDestination(href);
                let childFile = new Node(filename, destination, href);
                parent.addChild(childFile);
            }
            else if (stats.isDirectory()) {
                let href = getHref(basePath, filename);
                let destination = getDestination(href);
                let childFile = new Node(path.join(filename, 'index.md'), destination, href);
                parent.addChild(childFile);
                scanChildren(childFile, basePath, filename);
            }

        }
    });
}

function scanPaths(paths, rootFilePath) {
    let rootFile;

    if (!paths.length) {
        throw new Error('No paths set');
    }
    else if (!rootFilePath && paths.length > 1) {
        throw new Error('When multiple paths set, root file must be set too');
    }
    else if (rootFilePath) {
        let basePath = path.resolve(rootFilePath);
        rootFile = new Node(basePath, '/index.html', '/');
    }
    else {
        let basePath = path.resolve(path.join(paths[0], 'index.md'))
        rootFile = new Node(basePath, '/index.html', '/');
    }

    paths.forEach(function (scanPath) {
        scanPath = path.resolve(scanPath);
        scanChildren(rootFile, scanPath, scanPath);
    });

    return rootFile;
}


module.exports = {
    paths: scanPaths
};
