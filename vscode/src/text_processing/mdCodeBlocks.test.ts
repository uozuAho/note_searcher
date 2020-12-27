import { excludeCodeBlocks } from "./mdCodeBlocks";

describe('mdCodeBlocks', () => {
  it.each([
    ['ab', 'ab'],
    ['a```b```c', 'ac'],
    ['a```b\nc```d', 'ad'],
    ['```a```b', 'b'],
    ['a```b```', 'a'],
  ])('from "%s", extracts "%s"', (input, expectedOutput) => {
    expect(excludeCodeBlocks(input)).toBe(expectedOutput);
  });

  it('excludes code block from large md text', () => {
/* eslint-disable indent */
const input = `
# Hi there

This markdown text contains a code block:

\`\`\`sh
echo hello
\`\`\`

That's all!
`;

// note the extra newline before "That's all!". This isn't "correct", but
// is enough for the current need: excluding links from code blocks
/* eslint-disable indent */
const expectedOutput = `
# Hi there

This markdown text contains a code block:



That's all!
`;
    expect(excludeCodeBlocks(input)).toBe(expectedOutput);
  });
});
