import { excludeCodeBlocks } from "./mdCodeBlocks";

const mdWithCodeBlocks = `
# Hi there

This markdown text contains a code block:

\`\`\`sh
echo hello
\`\`\`

That's all!
`;

describe('mdCodeBlocks', () => {
  it.each([
    ['ab', 'ab'],
    ['a```b```c', 'ac'],
    ['a```b\nc```d', 'ad'],
  ])('from "%s", extracts "%s"', (input, expectedOutput) => {
    expect(excludeCodeBlocks(input)).toBe(expectedOutput);
  });
});
