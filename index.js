'use strict';

const path = require('path');
const fsExtra = require('fs-extra-promise');

function scanPlugins(type) {
    let pth = path.resolve(path.join(__dirname, 'lib', type));
    let files = fsExtra.readdirSync(pth);
    return files.filter((file) => fsExtra.statSync(path.join(pth, file)).isFile()).map((file) => path.join(pth, file));
}
const API = {
    Node: require('./lib/Node'),
    Logger: require('./lib/Logger'),
    Watcher: require('./lib/Watcher'),
    Runner: require('./lib/Runner'),
    plugins: {}
};

const pluginTypes = ['read', 'process', 'filter', 'index', 'aggregate', 'link', 'template'];

pluginTypes.forEach((type) => {
    API.plugins[type] = {};
    scanPlugins(type).forEach((pth) => {
        let name = path.basename(pth).replace('.js', '');
        API.plugins[type][name] = require(pth);
    });
});


module.exports = API;
