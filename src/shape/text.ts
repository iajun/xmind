
export type TextRendererConfig = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  maxWidth: number;
}

export const fillText = (
  text: string,
  maxWidth: number,
  measureLetterWidth: (letter: string) => number
) => {
  function trimText(text: string) {
    return text.replace(/^(\n| )*/g, '').replace(/(\n| )*$/g, '')
  }

  const breakLine = (text: string, maxWidth: number, measureLetterWidth: (letter: string) => number) => {
    let res = [];
    let width = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '\n') {
        width = 0;
      } else {
        let letterWidth = measureLetterWidth(text[i]);
        if (width + letterWidth > maxWidth) {
          if (text[i] === ' ') {
            // remove heading ' ' after a line break
            while (text[i] === ' ') {
              i++;
            }
            width = measureLetterWidth(text[i])
          } else {
            width = letterWidth;
          }
          res.push('\n')
        } else {
          width += letterWidth;
        }
      }
      res.push(text[i])
    }
    return {
      text: res.join(''),
      lines: res.filter(c => c === '\n').length + 1
    }
  }

  return breakLine(trimText(text), maxWidth, measureLetterWidth);
}

export type TextRendererResult = {
  text: string;
  lines: number;
  width: number;
  height: number;
}

class TextRenderer {
  private rendererConfig: TextRendererConfig;
  private measureLetter: (letter: string) => number
  private canvas: HTMLCanvasElement
  private cache: Record<string, number> = {}

  constructor(config: TextRendererConfig) {
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext("2d")
    this.rendererConfig = config;
    ctx.font = `${config.fontSize}px "${config.fontFamily}"`
    this.measureLetter = (letter: string) => {
      if (this.cache[letter]) return this.cache[letter];
      const width = ctx.measureText(letter).width;
      if (letter.length === 1) {
        this.cache[letter] = width;
      }
      return width;
    };
  }

  render(text: string): TextRendererResult {
    const { text: resText, lines } = fillText(text, this.rendererConfig.maxWidth, this.measureLetter)
    return {
      text: resText,
      lines,
      width: lines > 1 ? this.rendererConfig.maxWidth : this.measureLetter(resText),
      height: this.rendererConfig.lineHeight * lines
    }
  }
}

const instances: Record<string, TextRenderer> = {};

export default function getTextRenderer(config: TextRendererConfig) {
  const key = [config.fontFamily, config.fontSize, config.lineHeight, config.maxWidth].join('__$__');
  if (!instances[key]) {
    instances[key] = new TextRenderer(config);
  }
  return instances[key]
}
