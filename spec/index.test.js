import { marked } from 'marked';
import { markedHighlight } from '../src/index.js';
import hljs from 'highlight.js';

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
"<pre><code class="language-don&#39;t"><mycode>don't do this</mycode>
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
<pre><code class="language-js"><mycode>code</mycode>
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
"<pre><code class="language-space"><mycode>only keeps first word</mycode>
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
"<pre><code><mycode>no language</mycode>
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
"<pre><code>no language
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
"<pre><code class="language-js">no need to escape chars
</code></pre>"
`);
  });

  test('return null', () => {
    marked.use(markedHighlight((code, lang) => {
      return null;
    }));
    expect(marked(markdown)).toMatchInlineSnapshot(`
"<pre><code class="language-javascript">const highlight = &quot;code&quot;;
</code></pre>"
`);
  });

  test('function', () => {
    marked.use(markedHighlight((code, lang) => {
      return `<mycode>${code}</mycode>`;
    }));
    expect(marked(markdown)).toMatchInlineSnapshot(`
"<pre><code class="language-javascript"><mycode>const highlight = "code";</mycode>
</code></pre>"
`);
  });

  test('sync', () => {
    marked.use(markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      },
    }));
    expect(marked(markdown)).toMatchInlineSnapshot(`
"<pre><code class="hljs language-javascript"><span class="hljs-keyword">const</span> highlight = <span class="hljs-string">&quot;code&quot;</span>;
</code></pre>"
`);
  });

  test('async', async() => {
    marked.use(markedHighlight({
      async: true,
      highlight(code, lang) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve('async code');
          }, 1);
        });
      },
    }));
    expect(await marked(markdown)).toMatchInlineSnapshot(`
"<pre><code class="language-javascript">async code
</code></pre>"
`);
  });

  test('async highlight without async option', async() => {
    marked.use(markedHighlight({
      highlight(code, lang) {
        return new Promise((resolve, reject) => {
          resolve(code);
        });
      },
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
      },
    }));

    expect(marked(markdownWithSpaceInLang)).toMatchInlineSnapshot(`
"<pre><code class="language-ts">ts twoslash
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
      },
    }));

    expect(await marked(markdownWithSpaceInLang)).toMatchInlineSnapshot(`
"<pre><code class="language-ts">ts twoslash
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
      },
    }));
    expect(marked(markdownWithoutLang)).toMatchInlineSnapshot(`
"<pre><code>
</code></pre>"
`);
  });

  test('async nullish infostring is cast to empty string', async() => {
    marked.use(markedHighlight({
      async: true,
      highlight(code, lang, info) {
        expect(info).toBe('');
        return Promise.resolve(info);
      },
    }));
    expect(await marked(markdownWithoutLang)).toMatchInlineSnapshot(`
"<pre><code>
</code></pre>"
`);
  });

  test('nullish infostring is cast to emptyLangClass option', () => {
    marked.use(markedHighlight({
      emptyLangClass: 'empty',
      highlight(code, lang, info) {
        expect(info).toBe('');
        return info;
      },
    }));
    expect(marked(markdownWithoutLang)).toMatchInlineSnapshot(`
"<pre><code class="empty">
</code></pre>"
`);
  });

  test('no class when emptyLangClass is empty string', () => {
    marked.use(markedHighlight({
      emptyLangClass: '',
      highlight(code, lang, info) {
        expect(info).toBe('');
        return info;
      },
    }));
    expect(marked(markdownWithoutLang)).toMatchInlineSnapshot(`
"<pre><code>
</code></pre>"
`);
  });

  test('wrapper is not a function', () => {
    marked.use(markedHighlight({
      wrapper: 'not a function',
      highlight(code, lang, info) {
        return code;
      },
    }));
    expect(marked(markdown)).toMatchInlineSnapshot(`
"<pre><code class="language-javascript">const highlight = &quot;code&quot;;
</code></pre>"
`);
  });

  test('wrapper is used when provided', () => {
    marked.use(markedHighlight({
      wrapper: x => `<div class="wrapper">${x}</div>`,
      highlight(code, lang, info) {
        return code;
      },
    }));
    expect(marked(markdown)).toMatchInlineSnapshot(`
"<div class="wrapper"><pre><code class="language-javascript">const highlight = &quot;code&quot;;
</code></pre></div>"
`);
  });

  test('async wrapper is used when provided', async() => {
    marked.use(markedHighlight({
      wrapper: x => `<div class="wrapper">${x}</div>`,
      highlight(code, lang, info) {
        return code;
      },
      async: true,
    }));
    expect(await marked(markdown)).toMatchInlineSnapshot(`
"<div class="wrapper"><pre><code class="language-javascript">const highlight = &quot;code&quot;;
</code></pre></div>"
`);
  });
});
