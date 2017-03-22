'use strict';

const path = require('path');
const _ = require('lodash');

const defaults = {
    order: null,
    sortFns: {
        'title+': function (a, b) {
            if (!a.meta.title || a.meta.title < b.meta.title) return -1;
            if (!b.meta.title || a.meta.title > b.meta.title) return 1;
            return 0;
        },
        'title-': function (b, a) {
            if (!a.meta.title || a.meta.title < b.meta.title) return -1;
            if (!b.meta.title || a.meta.title > b.meta.title) return 1;
            return 0;
        },
        'position+': function (a, b) {
            let posA = Number(a.meta.navPosition || 0);
            let posB = Number(b.meta.navPosition || 0);
            if (posA < posB) return -1;
            if (posA > posB) return 1;
            return -1;
        },
        'position-': function (b, a) {
            let posA = Number(a.meta.navPosition || 0);
            let posB = Number(b.meta.navPosition || 0);
            if (posA < posB) return -1;
            if (posA > posB) return 1;
            return -1;
        },
        'dateCreated+': function (a, b) {
            let posA = a.meta.dateCreated ? a.meta.dateCreated.getTime() : 0;
            let posB = b.meta.dateCreated ? b.meta.dateCreated.getTime() : 0;
            if (posA < posB) return -1;
            if (posA > posB) return 1;
            return -1;
        },
        'dateCreated-': function (b, a) {
            let posA = a.meta.dateCreated ? a.meta.dateCreated.getTime() : 0;
            let posB = b.meta.dateCreated ? b.meta.dateCreated.getTime() : 0;
            if (posA < posB) return -1;
            if (posA > posB) return 1;
            return -1;
        }
    }
};

function Plugin(options, logger) {
    const self = this;

    self.name = 'Guay:Plugin:' + path.basename(__dirname) + ':' + path.basename(__filename).replace('.js', '');

    options = _.merge({}, defaults, options);

    self.link = function (tree) {
        let flat = tree.getIndex('flat', []);
        flat.forEach(node => {
            node.nav.set('children', () => {
                let children = node.children.filter(child => !child.meta.navHidden);
                let order = node.meta.navOrder || options.order;
                if (order && !options.sortFns[order]) {
                    throw new Error('Invalid sort order "' + order + '" in plugin "' + self.name + '.');
                }
                else if (order) {
                    children.sort(options.sortFns[order]);
                }
                return children;

            });
        });
    };

}


module.exports = Plugin;
