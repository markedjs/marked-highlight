import {markedHighlight} from 'marked-highlight';
import {expectError} from 'tsd';

// Single function argument
markedHighlight((code: string, language: string) => code+language);

// Invalid asynchronous function argument - missing async: true
expectError(markedHighlight(async (code: string, language: string) => code+language));

// Minimal synchronous options argument
markedHighlight({
  highlight(code: string, language: string) {
    return code+language;
  }
});

// Full synchronous options argument
markedHighlight({
  highlight(code: string, language: string) {
    return code+language;
  },
  async: false,
  langPrefix: 'foo',
});

// Force asynchronous extension with synchronous highlight function
markedHighlight({
  highlight(code: string, language: string) {
    return code+language;
  },
  async: false,
  langPrefix: 'foo',
});

// Minimal asynchronous options argument
markedHighlight({
  highlight: async (code: string, language: string) => code+language,
  async: true,
})

// Full asynchronous options argument
markedHighlight({
  highlight: async (code: string, language: string) => code+language,
  async: true,
  langPrefix: 'foo',
})

// Invalid asynchronous options argument - missing async: true
expectError(markedHighlight({
  highlight: async (code: string, language: string) => code+language,
}));
