import { v4 } from "uuid";
import G6, {
  ComboConfig,
  EdgeConfig,
  IGraph,
  Item,
  NodeConfig,
  TreeGraphData,
} from "@antv/g6";
import _ from "lodash";
import { EditorEvent } from "./constants";
const { Util } = G6;

const isTextWrap = (str: string) => str === "\n";

export const fittingString = (
  text: string,
  maxWidth: number,
  fontSize: number
) => {
  if (!text) return "";
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

function isMacintosh() {
  return navigator.platform.indexOf("Mac") > -1;
}

export const CTRL_KEY = isMacintosh ? "metaKey" : "ctrlKey";

export const onResize = (graph: IGraph, cb: () => void) => {
  const debounced = _.throttle(cb, 60);
  window.addEventListener("resize", debounced);

  graph.on(EditorEvent.onBeforeDestroy, () => {
    window.removeEventListener("resize", debounced);
  });
};

export const isFired = (shortcuts: string[] | string[][], e) => {
  return shortcuts.some((shortcut: string | string[]) => {
    const { key } = e;

    if (!Array.isArray(shortcut)) {
      return shortcut === key;
    }

    const isMatched = shortcut.every((item, index) => {
      if (index === shortcut.length - 1) {
        return item === key;
      }

      return e[item];
    });

    // 不要按下其他按键
    if (isMatched) {
      return _.difference(
        ["metaKey", "shiftKey", "ctrlKey", "altKey"],
        shortcut
      ).every((item) => !e[item]);
    }
    return false;
  });
};

export const cloneTree = <
  T extends {
    children?: T[];
    id: string;
  }
>(
  tree: T,
  forEachItem?: (item: T) => T
) => {
  const newTree = _.cloneDeep(tree);
  Util.traverseTree(newTree, (item: T) => {
    const id = v4();
    forEachItem && forEachItem(item);
    item.id = id;
  });
  return newTree;
};

export const Clipboard = {
  key: "$_Case_Clipboard",
  get() {
    try {
      const data = JSON.parse(localStorage.getItem(Clipboard.key));
      if (!_.isEmpty(data) && data[Clipboard.key]) {
        delete data[Clipboard.key];
        return data;
      }
      return null;
    } catch (error) {
      return null;
    }
  },
  set(data: any) {
    if (_.isEmpty(data)) {
      data = {};
    }
    data[Clipboard.key] = true;
    return localStorage.setItem(Clipboard.key, JSON.stringify(data));
  },
};

export function getParentId(node: Item): string | null {
  const parent = node.get("parent");
  if (!parent) return null;
  return parent.get("id") || null;
}

export function getNextId(node: Item): string | null {
  const parent = node.get("parent");
  if (!parent) return null;
  const children = parent.getModel().children || [];
  const idx = children.findIndex((item) => item.id === node.getID());
  if (~idx) {
    return children[idx + 1]?.id || null;
  }
  return null;
}

export function getPrevId(node: Item): string | null {
  const parent = node.get("parent");
  if (!parent) return null;
  const children = parent.getModel().children || [];
  const idx = children.findIndex((item) => item.id === node.getID());
  if (~idx) {
    return children[idx - 1]?.id || null;
  }
  return null;
}

export function setBounds (clientX: number, clientY: number) {
  const selection = document.getSelection();
  const range = document.caretRangeFromPoint(clientX, clientY);

  if (selection && range) {
    selection.setBaseAndExtent(
      range.startContainer,
      range.startOffset,
      range.startContainer,
      range.startOffset,
    );
    return true;
  } else {
    return false;
  }
};

