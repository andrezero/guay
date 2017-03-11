'use strict';

const path = require('path');

function Processor(options, logger) {
    const self = this;

    self.process = function (node) {
        let $head = node.$head;
        let $title = $head.find('title');

        let title = $title.text();

        if (title) {
            $title.remove();
        }
        else {
            title = path.basename(node.filename);
            if (title === 'index.md') {
                title = path.dirname(node.filename).split('/').pop();
            }
            else {
                title = title.substring(0, title.length -3);
            }
        }
        
        node.data.title = title;
    };

}


module.exports = Processor;
