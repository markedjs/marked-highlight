declare module 'marked-highlight' {
  /**
   * A synchronous function to highlight code
   *
   * @param code The raw code to be highlighted
   * @param language The language tag found immediately after the code block opening marker (e.g. ```typescript -> language='typescript')
   * @return The highlighted code as a HTML string
   */
  type SyncHighlightFunction = (code: string, language: string) => string;

  /**
   * An asynchronous function to highlight code
   *
   * @param code The raw code to be highlighted
   * @param language The language tag found immediately after the code block opening marker (e.g. ```typescript -> language='typescript')
   * @return A Promise for the highlighted code as a HTML string
   */
  type AsyncHighlightFunction = (code: string, language: string) => Promise<string>;

  /**
   * Options for configuring the marked-highlight extension using a synchronous highlighting function.
   */
  interface SynchronousOptions {
    /** Function to highlight code with */
    highlight: SyncHighlightFunction;
    /** Not necessary when using a synchronous highlighting function, but can be set without harm (will make `marked.parse()` return a promise if true) */
    async?: boolean;
    /** The language tag found immediately after the code block opening marker is appended to this to form the class attribute added to the <code> element. */
    langPrefix?: string;
  }

  /**
   * Options for configuring the marked-highlight extension using an asynchronous highlighting function.
   * 
   * Note that the {async: true} option must also be passed to markdown.parse() when using an asynchronous highlighting function.
   */
  interface AsynchronousOptions {
    /** Function to highlight code with */
    highlight: AsyncHighlightFunction;
    /** Must be set to true when using an asynchronous highlight function */
    async: true;
    /** The language tag found immediately after the code block opening marker is appended to this to form the class attribute added to the <code> element. */
    langPrefix?: string;
  }

  /**
   * Configures a marked extension to apply syntax highlighing to code elements.
   *
   * @param options Options for the extension
   * @return A MarkedExtension to be passed to `marked.use()`
   */
  export function markedHighlight(options: SynchronousOptions): import('marked').MarkedExtension;

  /**
   * Configures a marked extension to apply syntax highlighing to code elements.
   *
   * @param options Options for the extension
   * @return A MarkedExtension to be passed to `marked.use()`
   */
  export function markedHighlight(options: AsynchronousOptions): import('marked').MarkedExtension;

  /**
   * Configures a marked extension to apply syntax highlighing to code elements.
   *
   * @param highlightFunction A synchronous function to apply syntax highlighting
   * @return A MarkedExtension to be passed to `marked.use()`
   */
  export function markedHighlight(
    highlightFunction: SyncHighlightFunction
  ): import('marked').MarkedExtension;

  /**
   * Encode special characters (ampersands, angle brackets, and quotes) in code as their respective HTML entities
   * 
   * @param code The code to be encoded
   * @param encode If true, blindly encodes all ampersands. If false, uses a more complicate regex to avoid re-encoding the ampersand at the start of existing HTML entities in the code
   * @return The code with the special characters encoded.
   */
  export function encode(code: string, encode: boolean): string;
}
