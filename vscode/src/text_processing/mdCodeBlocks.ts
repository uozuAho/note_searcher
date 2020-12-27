export function excludeCodeBlocks(text: string): string {
  const sections = text.split('```');
  const remainingSections = [];
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (i % 2 === 0) {
      remainingSections.push(section);
    }
  }
  return remainingSections.join('');
}
