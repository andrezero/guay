'use strict';

const path = require('path');
const _ = require('lodash-addons');

function Processor(options, logger) {
    const self = this;

    self.process = function (node) {
        let $head = node.$head;
        let $title = $head.find('title');

        let title = $title.text();

        if (title) {
            title = _.capitalize(title.trim());
            $title.remove();
        }
        else {
            title = path.basename(node.filename);
            if (title === options.index) {
                title = path.dirname(node.filename).split('/').pop();
            }
            else if (options.extension) {
                title = title.replace(new RegExp('.' + options.extension + '$'), '');
            }
            title = _.slugify(title).replace('-', ' ');
            title = _.capitalize(title);
        }

        node.data.title = title;
    };

}


module.exports = Processor;
