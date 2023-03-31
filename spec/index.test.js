import { marked } from 'marked';
import { markedHighlight } from '../src/index.js';
import hljs from 'highlight.js';
import pygmentize from 'pygmentize-bundled';

describe('markedHighlight', () => {
  const markdown = `
# header

\`\`\`
const highlight = "nolang";
\`\`\`

\`\`\`javascript
const highlight = "code";
\`\`\`
`;
  beforeEach(() => {
    marked.setOptions(marked.getDefaults());
  });

  test('no function', () => {
    expect(() => {
      marked.use(markedHighlight());
    }).toThrow('Must provide highlight function');
  });

  test('return null', () => {
    marked.use(markedHighlight((code, lang) => {
      return null;
    }));
    expect(marked(markdown)).toMatchInlineSnapshot(`
"<h1 id="header">header</h1>
<pre><code>const highlight = &quot;nolang&quot;;
</code></pre>
<pre><code class="language-javascript">const highlight = &quot;code&quot;;
</code></pre>
"
`);
  });

  test('function', () => {
    marked.use(markedHighlight((code, lang) => {
      return `<mycode>${code}</mycode>`;
    }));
    expect(marked(markdown)).toMatchInlineSnapshot(`
"<h1 id="header">header</h1>
<pre><code><mycode>const highlight = "nolang";</mycode>
</code></pre>
<pre><code class="language-javascript"><mycode>const highlight = "code";</mycode>
</code></pre>
"
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
"<h1 id="header">header</h1>
<pre><code>const highlight = &quot;nolang&quot;;
</code></pre>
<pre><code class="hljs language-javascript"><span class="hljs-keyword">const</span> highlight = <span class="hljs-string">&quot;code&quot;</span>;
</code></pre>
"
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
"<h1 id="header">header</h1>
<pre><code><div class="highlight"><pre><span class="kr">const</span> <span class="nx">highlight</span> <span class="o">=</span> <span class="s2">&quot;nolang&quot;</span><span class="p">;</span>
</pre></div>
</code></pre>
<pre><code class="language-javascript"><div class="highlight"><pre><span class="kr">const</span> <span class="nx">highlight</span> <span class="o">=</span> <span class="s2">&quot;code&quot;</span><span class="p">;</span>
</pre></div>
</code></pre>
"
`);
  });
});
