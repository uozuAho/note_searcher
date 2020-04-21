import { LunrSearch } from "./lunrSearch";
import * as lunr from 'lunr';

const documents = [{
  "name": "Lunr",
  "text": "Like Solr, but much smaller, and not as bright."
}, {
  "name": "React",
  "text": "A JavaScript library for building user interfaces."
}, {
  "name": "Lodash",
  "text": "A modern JavaScript utility library delivering modularity, performance & extras."
}];

describe('lunr search', () => {
  let lunrSearcher: LunrSearch;

  beforeEach(() => {
    lunrSearcher = new LunrSearch();
  });

  it.only('searches', () => {
    const idx = lunr(function () {
      const _builder = this;
      _builder.ref('name');
      _builder.field('text');

      documents.forEach(function (doc) {
        _builder.add(doc);
      }, _builder);
    });

    console.log(idx.search('solr'));
  });
});
