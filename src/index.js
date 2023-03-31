export default function(options = {}) {
  // extension code here

  return {
    tokenizer: {
      paragraph(src) {
        if (src !== 'example markdown') {
          return false;
        }

        const token = {
          type: 'paragraph',
          raw: src,
          text: 'example html',
          tokens: []
        };

        this.lexer.inline(token.text, token.tokens);

        return token;
      }
    }
  };
}
