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
    // remove deprecation warnings
    marked.use({
      mangle: false,
      headerIds: false
    });
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
      }
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
    expect(await marked(markdown, { async: true })).toMatchInlineSnapshot(`
"<pre><code class="language-javascript"><div class="highlight"><pre><span class="kr">const</span> <span class="nx">highlight</span> <span class="o">=</span> <span class="s2">&quot;code&quot;</span><span class="p">;</span>
</pre></div>
</code></pre>"
`);
  });
});
