import { marked } from 'marked';
import { markedHighlight } from '../src/index.js';
import hljs from 'highlight.js';
import pygmentize from 'pygmentize-bundled';

describe('markedHighlight', () => {
  const markdown = `
\`\`\`javascript
const highlight = "code";
\`\`\`
`;
  beforeEach(() => {
    marked.setOptions(marked.getDefaults());
  });

  test('excape lang', () => {
    marked.use(markedHighlight((code, lang) => {
      return `<mycode>${code}</mycode>`;
    }));
    expect(marked(`
\`\`\`don't
don't do this
\`\`\`
`)).toMatchInlineSnapshot(`
"<pre><code class="language-don&#39;t" tabIndex="0"><mycode>don't do this</mycode>
</code></pre>"
`);
  });

  test('not code', () => {
    marked.use(markedHighlight((code, lang) => {
      return `<mycode>${code}</mycode>`;
    }));
    expect(marked(`
# header

\`\`\`js
code
\`\`\`
`)).toMatchInlineSnapshot(`
"<h1>header</h1>
<pre><code class="language-js" tabIndex="0"><mycode>code</mycode>
</code></pre>"
`);
  });

  test('space in language', () => {
    marked.use(markedHighlight((code, lang) => {
      return `<mycode>${code}</mycode>`;
    }));
    expect(marked(`
\`\`\`space in lang
only keeps first word
\`\`\`
`)).toMatchInlineSnapshot(`
"<pre><code class="language-space" tabIndex="0"><mycode>only keeps first word</mycode>
</code></pre>"
`);
  });

  test('no language', () => {
    marked.use(markedHighlight((code, lang) => {
      return `<mycode>${code}</mycode>`;
    }));
    expect(marked(`
\`\`\`
no language
\`\`\`
`)).toMatchInlineSnapshot(`
"<pre><code tabIndex="0"><mycode>no language</mycode>
</code></pre>"
`);
  });

  test('no language return null', () => {
    marked.use(markedHighlight((code, lang) => {
      return null;
    }));
    expect(marked(`
\`\`\`
no language
\`\`\`
`)).toMatchInlineSnapshot(`
"<pre><code tabIndex="0">no language
</code></pre>"
`);
  });

  test('no function', () => {
    expect(() => {
      marked.use(markedHighlight());
    }).toThrow('Must provide highlight function');
  });

  test('return null no escape chars', () => {
    marked.use(markedHighlight((code, lang) => {
      return null;
    }));
    expect(marked(`
\`\`\`js
no need to escape chars
\`\`\`
`)).toMatchInlineSnapshot(`
"<pre><code class="language-js" tabIndex="0">no need to escape chars
</code></pre>"
`);
  });

  test('return null', () => {
    marked.use(markedHighlight((code, lang) => {
      return null;
    }));
    expect(marked(markdown)).toMatchInlineSnapshot(`
"<pre><code class="language-javascript" tabIndex="0">const highlight = &quot;code&quot;;
</code></pre>"
`);
  });

  test('function', () => {
    marked.use(markedHighlight((code, lang) => {
      return `<mycode>${code}</mycode>`;
    }));
    expect(marked(markdown)).toMatchInlineSnapshot(`
"<pre><code class="language-javascript" tabIndex="0"><mycode>const highlight = "code";</mycode>
</code></pre>"
`);
  });

  test('sync', () => {
    marked.use(markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      }
    }));
    expect(marked(markdown)).toMatchInlineSnapshot(`
"<pre><code class="hljs language-javascript" tabIndex="0"><span class="hljs-keyword">const</span> highlight = <span class="hljs-string">&quot;code&quot;</span>;
</code></pre>"
`);
  });

  test('async', async() => {
    marked.use(markedHighlight({
      async: true,
      highlight(code, lang) {
        return new Promise((resolve, reject) => {
          pygmentize({ lang, format: 'html' }, code, function(err, result) {
            if (err) {
              resolve(err);
              return;
            }

            resolve(result.toString());
          });
        });
      }
    }));
    expect(await marked(markdown)).toMatchInlineSnapshot(`
"<pre><code class="language-javascript" tabIndex="0">const highlight = &quot;code&quot;;
</code></pre>"
`);
  });

  test('async highlight without async option', async() => {
    marked.use(markedHighlight({
      highlight(code, lang) {
        return new Promise((resolve, reject) => {
          resolve(code);
        });
      }
    }));

    expect(() => marked(markdown)).toThrow(/set the async option to true/i);
  });

  const markdownWithSpaceInLang = `
\`\`\`ts twoslash
let a = 1
\`\`\``;

  test('uses infostring', () => {
    marked.use(markedHighlight({
      highlight(code, lang, info) {
        return info;
      }
    }));

    expect(marked(markdownWithSpaceInLang)).toMatchInlineSnapshot(`
"<pre><code class="language-ts" tabIndex="0">ts twoslash
</code></pre>"
`);
  });

  test('async uses infostring', async() => {
    marked.use(markedHighlight({
      async: true,
      highlight(code, lang, info) {
        return new Promise((resolve, reject) => {
          resolve(info);
        });
      }
    }));

    expect(await marked(markdownWithSpaceInLang)).toMatchInlineSnapshot(`
"<pre><code class="language-ts" tabIndex="0">ts twoslash
</code></pre>"
`);
  });

  const markdownWithoutLang = `
\`\`\`
no language provided
\`\`\`
`;

  test('nullish infostring is cast to empty string', () => {
    marked.use(markedHighlight({
      highlight(code, lang, info) {
        expect(info).toBe('');
        return info;
      }
    }));
    expect(marked(markdownWithoutLang)).toMatchInlineSnapshot(`
"<pre><code tabIndex="0">
</code></pre>"
`);
  });

  test('async nullish infostring is cast to empty string', async() => {
    marked.use(markedHighlight({
      async: true,
      highlight(code, lang, info) {
        expect(info).toBe('');
        return Promise.resolve(info);
      }
    }));
    expect(await marked(markdownWithoutLang)).toMatchInlineSnapshot(`
"<pre><code tabIndex="0">
</code></pre>"
`);
  });
});
