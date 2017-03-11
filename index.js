'use strict';

const path = require('path');
const _ = require('lodash');
const Watcher = require('./lib/Watcher');
const Guay = require('./lib/Guay');
const Logger = require('./lib/Logger');

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

let watcher = args.watch ? new Watcher(config, logger) : null;
let guay = new Guay(watcher, config, logger);

config.processors.forEach(function (processor) {
    let Processor = require(processor.path);
    guay.addProcessor(new Processor(processor.config, logger));
});

for (let extension in config.templating.engines) {
    let engine = config.templating.engines[extension];
    let TemplateEngine = require(engine.path);
    guay.addTemplateEngine(extension, new TemplateEngine(args.watch, engine.config, logger));
};

config.templating.paths.forEach(function (templatePath) {
    guay.addTemplatePath(templatePath);
});

guay.start();
