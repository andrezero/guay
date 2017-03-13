'use strict';

const path = require('path');
const _ = require('lodash');

const guay = require('./index');
const Logger = guay.Logger;
const Watcher = guay.Watcher;
const Scanner = guay.Scanner;
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

let watcher = args.watch ? new Watcher(logger) : null;
let scanner = new Scanner(config, logger);
let runner = new Runner(watcher, scanner, config, logger);

config.indexers.forEach(function (indexer) {
    let Indexer = indexer.plugin || require(indexer.path);
    runner.addIndexer(new Indexer(indexer.config, logger));
});

config.processors.forEach(function (processor) {
    let Processor = processor.plugin || require(processor.path);
    runner.addProcessor(new Processor(processor.config, logger));
});

for (let extension in config.templating.engines) {
    let engine = config.templating.engines[extension];
    let TemplateEngine = engine.plugin || require(engine.path);
    runner.addTemplateEngine(extension, new TemplateEngine(args.watch, engine.config, logger));
};

config.templating.paths.forEach(function (templatePath) {
    runner.addTemplatePath(templatePath);
});

runner.start();
