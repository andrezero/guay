'use strict';

const EventEmitter = require('events');
const util = require('util');

const Emitter = function () {
    EventEmitter.call(this);
};
util.inherits(Emitter, EventEmitter);

const utils = {

    /**
     * add public emitter API to instance, attached to an internal `Emitter` obj
     *
     * @param {object} instance
     * @param {array} methods to expose
     */
    emitter: function (instance, methods) {
        let emitter = new Emitter();

        methods = methods || ['on', 'once', 'off'];

        methods.forEach(function (method) {
            instance[method] = function (event, callback) {
                emitter[method](event, callback);
            };
        });

        return emitter;
    }

};

Object.freeze(utils);

module.exports = utils;
