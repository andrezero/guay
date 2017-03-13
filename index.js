'use strict';

const API = {
    Node: require('./lib/Node'),
    Logger: require('./lib/Logger'),
    Watcher: require('./lib/Watcher'),
    Scanner: require('./lib/Scanner'),
    Runner: require('./lib/Runner'),
    processors: {
        abstract: require('./lib/processors/abstract'),
        blogPost: require('./lib/processors/blog-post'),
        dates: require('./lib/processors/dates'),
        markdown: require('./lib/processors/markdown'),
        meta: require('./lib/processors/meta'),
        tags: require('./lib/processors/tags'),
        title: require('./lib/processors/title'),
    },
    indexers: {
        byHref: require('./lib/indexers/by-href'),
        childrenSort: require('./lib/indexers/children-sort'),
        flatAlpha: require('./lib/indexers/flat-alpha'),
        flatDateCreated: require('./lib/indexers/flat-date-created'),
        flatDateUpdated: require('./lib/indexers/flat-date-updated'),
        flat: require('./lib/indexers/flat'),
        linkedList: require('./lib/indexers/linked-list'),
        pruneDrafts: require('./lib/indexers/prune-drafts'),
        tags: require('./lib/indexers/tags'),
    },
    tplEngines: {
        lodash: require('./lib/tpl-engines/lodash'),
    },
}


module.exports = API;
