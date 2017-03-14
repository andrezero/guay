'use strict';

var chalk = require('chalk');
var _ = require('lodash');

var beautify = require('js-beautify').js_beautify;
const JSON_BEAUTIFIER_OPTS = {
    indent_size: 4,
    end_with_newline: true
};

function Logger(name, debugEnabled) {
    var self = this;

    // -- api

    self.enableDebug = function () {
        debugEnabled = true;
    };

    self.title = function (msg) {
        console.log(chalk.magenta.bold(name + ' # ' + msg));
    };

    self.header = function (msg) {
        var args = [].slice.call(arguments);
        args.shift();
        args.unshift(chalk.white.bold(name + ' > ' + msg));
        console.log.apply(null, args);
    };

    self.info = function (msg) {
        var args = [].slice.call(arguments);
        args[0] = name + ' [info] ' + args[0];
        console.log.apply(null, args);
    };

    self.debug = function () {
        if (debugEnabled) {
            var args = [].slice.call(arguments);

            args = args.map(arg => {
                arg = (typeof arg === 'object') ? beautify(JSON.stringify(arg), JSON_BEAUTIFIER_OPTS) : arg;
                return chalk.dim(arg);
            });

            args[0] = chalk.dim(name + ' [debug] ') + args[0];

            console.log.apply(null, args);
        }
    };

    self.data = function (obj) {
        console.dir(obj, {depth: null, colors: true});
    }

    self.warn = function (msg) {
        var args = [].slice.call(arguments);
        args.shift();
        msg = msg || '';
        args.unshift(chalk.yellow(name + ' [warn] ' + msg));
        console.error.apply(null, args);
    };

    self.error = function (msg) {
        var args = [].slice.call(arguments);
        args.shift();
        if ('object' === typeof args[0] && args[0].stack) {
            msg = msg + ' ' + args[0].name + ' ' + args[0].message;
            let stack = args[0].stack;
            let lines = stack.split('\n');
            lines.shift();
            lines[0] = lines[0].trim();
            console.log(chalk.bold.red(name + ' [error] ' + msg), lines.join('\n'));
        }
        else {
            msg = msg || '';
            console.error(chalk.bold.red(name + ' [error] ' + msg));
            console.error.apply(null, args);
        }
    };

    self.success = function (msg) {
        var args = [].slice.call(arguments);
        args.shift();
        msg = msg || '';
        args.unshift(chalk.bold.green(name + ' [ok] ' + msg));
        console.error.apply(null, args);
    };

}


module.exports = Logger;