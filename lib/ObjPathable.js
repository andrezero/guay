const _ = require('lodash');

const passThroughTypes = ['number', 'boolean'];

function getValueAsString(val) {
    let type = typeof val;
    if (passThroughTypes.indexOf(type) !== -1) {
        return val;
    }
    else if (val === null) {
        return '<null>';
    }
    else if (type === 'string') {
        return (val.length > 80) ? (val.substring(0, 77) + '... (' + val.length + ')') : val;
    }
    else if (type === 'undefined') {
        return '<undefined>';
    }
    else if (type === 'object' && typeof val.forEach === 'function') {
        return '<array>';
    }
    else {
        return '<' + (typeof val) + '>';
    }
}

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

Object.defineProperty(ObjPathable.prototype, 'getSummary', {
    enumerable: false,
    value: function () {
        let attrs = {};
        let key;
        for (key in this) {
            attrs[key] = getValueAsString(this[key]);
        }
        return attrs;
    }
});

Object.defineProperty(ObjPathable.prototype, 'getSummaryAsString', {
    enumerable: false,
    value: function () {
        let attrs = [];
        let key;
        for (key in this) {
            attrs.push(key + '=' + getValueAsString(this[key]));
        }
        return attrs.join(',');
    }
});

// -- api

Object.defineProperty(ObjPathable.prototype, 'get', {
    enumerable: false,
    value: function (path, defaultValue) {
        let parts;
        let value = this;
        let key;
        let args;

        if ('undefined' === typeof path || 'string' === typeof path) {
            parts = path ? path.split('.') : [];
            while (parts.length && value) {
                key = parts.shift();
                if (value.hasOwnProperty(key)) {
                    value = value[key];
                } else if ('undefined' === typeof defaultValue) {
                    throw new Error('path "' + path + '" is not defined.' + typeof defaultValue);
                } else {
                    return defaultValue;
                }
            }
        } else {
            throw new Error('invalid property path.');
        }

        return 'object' === typeof value ? _.cloneDeep(value) : value;
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
            val[key] = 'object' === typeof value ? _.cloneDeep(value) : value;
        } else {
            throw new Error('invalid property path.');
        }
    }
});

Object.defineProperty(ObjPathable.prototype, 'del', {
    enumerable: false,
    value: function (path) {
        let parts;
        let value = this;
        let key;
        let args;

        if ('string' === typeof path) {
            parts = path ? path.split('.') : [];
            while (parts.length && value) {
                key = parts[0];
                if (parts.length === 1) {
                    if (value.hasOwnProperty(key)) {
                        delete value[key];
                    }
                    return;
                }
                value = value[key];
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
