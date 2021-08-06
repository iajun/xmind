import G6, {
  ComboConfig,
  EdgeConfig,
  NodeConfig,
  TreeGraphData,
} from "@antv/g6";
import _ from "lodash";
const { Util } = G6;

const isTextWrap = (str: string) => str === "\n";

export const fittingString = (
  text: string,
  maxWidth: number,
  fontSize: number
) => {
  if (!text) return '';
  let currentWidth = 0;
  let res = "";
  let tmp = "";
  text.split("").forEach((letter) => {
    if (isTextWrap(letter)) {
      res += `${tmp}\n`;
      currentWidth = 0;
      tmp = "";
      return;
    }
    const letterWidth = Util.getLetterWidth(letter, fontSize);
    if (currentWidth + letterWidth > maxWidth) {
      res += `${tmp}\n`;
      if (letter === " ") {
        tmp = "";
        currentWidth = 0;
      } else {
        tmp = letter;
        currentWidth = letterWidth;
      }
    } else {
      tmp += letter;
      currentWidth += letterWidth;
    }
  });

  if (tmp) res += tmp;
  return res;
};

export const fittingLabelWidth = (label: string, fontSize: number) => {
  const maxLabelWidth = Math.max(
    ...label.split("\n").map((line) => Util.getTextSize(line, fontSize)[0])
  );
  return maxLabelWidth;
};

export const fittingLabelHeight = (label: string, lineHeight: number) => {
  const textCols = label.split("\n").length;
  return lineHeight * textCols;
};

export const getLabelByModel = (
  model: NodeConfig | EdgeConfig | ComboConfig | TreeGraphData
): string => {
  if (typeof model.label === "object") {
    return model.label.text || "";
  } else {
    return model.label || "";
  }
};

export const isLabelEqual = (t1: string, t2: string) => {
  const mapText = (t: string) => t.trim();
  return _.isEqual(t1.split("\n").map(mapText), t2.split("\n").map(mapText));
};
