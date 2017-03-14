'use strict';

const path = require('path');
const _ = require('lodash');

const guay = require('./index');
const Logger = guay.Logger;
const Watcher = guay.Watcher;
const Runner = guay.Runner;

const commandLineCommands = require('command-line-commands');
const commandLineArgs = require('command-line-args');

function loadConfig(configFile) {
    configFile = path.resolve(configFile);
    return require(configFile);
}

function readCommandLineOptions() {
    let validCommands = ['develop'];
    try {
        let { command, argv } = commandLineCommands(validCommands);
        let optionDefinitions = [
            { name: 'loglevel', alias: 'l', type: String },
            { name: 'config', type: String },
            { name: 'watch', type: Boolean }
        ];
        try {
            let args = commandLineArgs(optionDefinitions);
            return {
                command,
                args
            };
        }
        catch (err) {
            console.error(err.message);
            process.exit();
        }
    }
    catch (err) {
        console.error(err.message);
        process.exit();
    }
}

const { command, args } = readCommandLineOptions();
const config = loadConfig(args.config);

const logger = new Logger('GUAY!', (args.loglevel || config.loglevel) === 'debug');

logger.title(command);
logger.debug('args', args);

logger.header('cli boot');

let watcher = args.watch ? new Watcher(logger) : null;
let runner = new Runner(watcher, config, logger);

logger.debug('- root reader');

let Reader = config.root.plugin || require(config.root.path);
runner.setRootReader(new Reader(config.root.options, logger));

logger.debug('- plugins');

Object.keys(config.plugins).forEach(type => {
    logger.debug('- plugins', type);
    config.plugins[type].forEach((item, index) => {
        if (!item.plugin && !item.path) {
            logger.error('Invalid plugin "' + type + '#' + index + '" configuration.', item);
            process.exit();
        }
        try {
            let Plugin = item.plugin || require(item.path);
            runner.addPlugin(type, new Plugin(item.options, logger));
        }
        catch (err) {
            logger.error('Error creating plugin "' + type + '#' + index + '".', item);
            process.exit();
        }
    });
});

for (let extension in config.template.engines) {
    let engine = config.template.engines[extension];
    let TemplateEngine = engine.plugin || require(engine.path);
    runner.addTemplateEngine(extension, new TemplateEngine(args.watch, engine.options, logger));
};

config.template.paths.forEach(function (templatePath) {
    runner.addTemplatePath(templatePath);
});

runner.start();
