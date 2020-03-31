var retext = require('retext');
var pos = require('retext-pos');
var keywords = require('retext-keywords');
var toString = require('nlcst-to-string');

export async function extractKeywords(text: string): Promise<string[]> {
  const retextResult = await process(text);
  return Array.from(getKeywords(retextResult));
}

function process(text: string): Promise<any> {
  return new Promise((resolve, reject) => {
    retext()
      .use(pos)
      .use(keywords)
      .process(text, (err: any, retextResult: any) => {
        if (err) { reject(err); }
        else     { resolve(retextResult); }
      });
  });
}

function* getKeywords(retextResult: any): Generator<string> {
  for (const word of retextResult.data.keywords) {
    yield toString(word.matches[0].node);
  }
}
