const path = require('path');

import { ExTester } from "vscode-extension-tester";

const source_dir = 'e2e';
const output_dir = 'e2e-out';

const test_groups = [
  {
    pattern: `${output_dir}/default_settings/*.js`,
    settings: null
  },
  {
    pattern: `${output_dir}/dead_links_on/*.js`,
    settings: path.join(source_dir, 'dead_links_on', 'settings.json')
  }
];

async function runAllTests() {
  const tester = new ExTester();

  // todo: this attempts to run all tests at the same time :(
  for (const group of test_groups) {
    await tester.runTests(group.pattern, undefined, group.settings);
  }
}

runAllTests();
