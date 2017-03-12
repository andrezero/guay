const _ = require('lodash');

const ObjPathable = function (data) {
    'use strict';
    const self = this;
    _.merge(self, data);
};

// -- meta

Object.defineProperty(ObjPathable.prototype, 'getKeys', {
    enumerable: false,
    value: function () {
        return Object.keys(this);
    }
});

// -- api

Object.defineProperty(ObjPathable.prototype, 'get', {
    enumerable: false,
    value: function (path, defaultValue) {
        let parts;
        let val = this;
        let key;
        let args;

        if ('undefined' === typeof path || 'string' === typeof path) {
            parts = path ? path.split('.') : [];
            while (parts.length && val) {
                key = parts.shift();
                if (val.hasOwnProperty(key)) {
                    val = val[key];
                } else if ('undefined' === typeof defaultValue) {
                    throw new Error('path "' + path + '" is not defined.');
                } else {
                    return defaultValue;
                }
            }
        } else {
            throw new Error('invalid property path.');
        }

        return val;
    }
});

Object.defineProperty(ObjPathable.prototype, 'set', {
    enumerable: false,
    value: function (path, value) {
        let parts;
        let val = this;
        let key;

        if ('string' === typeof path) {
            parts = path.split('.');
            while (parts.length > 1 && val) {
                key = parts.shift();
                if (!val.hasOwnProperty(key) || typeof val[key] !== 'object') {
                    val[key] = {};
                }
                val = val[key];
            }

            key = parts.shift();
            val[key] = value;
        } else {
            throw new Error('invalid property path.');
        }

        return value;
    }
});

Object.defineProperty(ObjPathable.prototype, 'del', {
    enumerable: false,
    value: function (path) {
        let parts;
        let val = this;
        let key;
        let args;

        if ('string' === typeof path) {
            parts = path ? path.split('.') : [];
            while (parts.length && val) {
                key = parts[0];
                if (parts.length === 1) {
                    if (val.hasOwnProperty(key)) {
                        delete val[key];
                    }
                    return;
                }
                val = val[key];
                parts.shift();
            }
        } else {
            throw new Error('invalid property path.');
        }
    }
});

Object.defineProperty(ObjPathable.prototype, 'asObject', {
    enumerable: false,
    value: function () {
        return _.cloneDeep(this);
    }
});


module.exports = ObjPathable;
