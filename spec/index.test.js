import { marked } from 'marked';
import thisExtension from '../src/index.js';

describe('this-extension', () => {
  beforeEach(() => {
    marked.setOptions(marked.getDefaults());
  });

  test('no options', () => {
    marked.use(thisExtension());
    expect(marked('example markdown')).toBe('<p>example html</p>\n');
  });

  test('markdown not using this extension', () => {
    marked.use(thisExtension());
    expect(marked('not example markdown')).not.toBe('<p>example html</p>\n');
  });
});
