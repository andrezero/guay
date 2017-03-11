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

            args = args.map(function (arg) {
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
        msg = msg || '';
        console.log(chalk.bold.red(name + ' [error] ' + msg));
        args = args.filter(function (arg) {
            if ('object' === typeof arg && arg.stack && arg.message) {
                console.error(arg.message, arg.stack);
            }
            else {
                return arg !== msg;
            }
        });
        console.error.apply(null, args);
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