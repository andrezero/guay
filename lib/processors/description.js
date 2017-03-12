'use strict';

const path = require('path');
const _ = require('lodash-addons');

function Processor(options, logger) {
    const self = this;

    self.process = function (node) {
        let $head = node.$head;
        let $description = $head.find('description');

        let description = $description.text();

        if (description) {
            $description.remove();
            node.data.description = description;
        }
    };

}


module.exports = Processor;
