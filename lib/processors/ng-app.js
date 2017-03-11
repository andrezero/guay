'use strict';

function Processor(options, logger) {
    const self = this;

    self.process = function (node) {
        let $body = node.$body;
        let app = $body.attr('ng-app');
        let deps = $body.attr('ng-deps');

        if (app) {
            node.data.ng = node.data.ng || {};
            node.data.ng.app = app;
            if (deps) {
                node.data.ng.deps = deps.split(',').map(function (item) {
                    return '\'' + item.trim() + '\'';
                }).join(', ');
            }
        }
    };

}


module.exports = Processor;
