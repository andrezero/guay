'use strict';

const path = require('path');
const _ = require('lodash-addons');

const defaults = {
    extension: 'md',
    index: 'index.md'
};

function Processor(options, logger) {
    const self = this;

    options = _.merge(defaults, options);

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
            title = _.slugify(title).replace(/-/g, ' ');
            title = _.capitalize(title);
        }

        node.meta.title = title;
    };

}


module.exports = Processor;
