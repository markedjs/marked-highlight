export function markedHighlight(options) {
  if (typeof options === 'function') {
    options = {
      highlight: options
    };
  }

  if (!options || typeof options.highlight !== "function") {
    throw new Error("Must provide highlight function");
  }

  const extension = {
    walkTokens(token) {
      if (token.type !== 'code') {
        return;
      }

      const lang = getLang(token);

      if (options.async) {
        return Promise.resolve(options.highlight(token.text, lang)).then(updateToken(token));
      }

      const code = options.highlight(token.text, lang);
      updateToken(token)(code);
    }
  };

  if (options.async) {
    extension.async = true;
  }

  if (typeof options.langPrefix === "string") {
    extension.langPrefix = options.langPrefix;
  }

  return extension;
}

function getLang(token) {
  return (token.lang || '').match(/\S*/)[0];
}

function updateToken(token) {
  return (code) => {
    if (typeof code === 'string' && code !== token.text) {
      token.escaped = true;
      token.text = code;
    }
  };
}
