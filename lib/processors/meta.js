'use strict';

const path = require('path');

function Processor(options, logger) {
    const self = this;

    self.process = function (node) {
        let $head = node.$head;
        let $meta = $head.find('meta[name="guay"]');

        if ($meta.length) {
            $meta.remove();
            let data = $meta.data();
            for (let key in data) {
                node.data.set(key, data[key]);
            }
        }
    };

}


module.exports = Processor;
