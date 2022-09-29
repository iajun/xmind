import { v4 } from "uuid";
import G6, {
  ComboConfig,
  EdgeConfig,
  IGraph,
  INode,
  Item,
  NodeConfig,
} from "@antv/g6";
import _ from "lodash";
import { LabelStyle } from './shape/types'
import { EditorEvent } from "./constants";
import {
  ModelConfig,
  Transaction,
  TransactionPayload,
  TransactionType,
  TreeGraphData,
} from "./types";
import { getNodeConfig } from "./config";
const { Util } = G6;

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

    let isMatched = false;
    if (!Array.isArray(shortcut)) {
      isMatched = shortcut === key;
    } else {
      isMatched = shortcut.every((item, index) => {
        if (index === shortcut.length - 1) {
          return item === key;
        }
        return e[item];
      });
    }

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

export function getFirstChildId(node: Item): string | null {
  const children = node.get("children") || [];
  if (!children.length) return null;
  return children[0].getID();
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

export function setBounds(clientX: number, clientY: number) {
  const selection = document.getSelection();
  const range = document.caretRangeFromPoint(clientX, clientY);

  if (selection && range) {
    selection.setBaseAndExtent(
      range.startContainer,
      range.startOffset,
      range.startContainer,
      range.startOffset
    );
    return true;
  } else {
    return false;
  }
}

export function getNodeInfo(node: INode) {
  return {
    model: node.getModel() as TreeGraphData,
    pointer: {
      parentId: getParentId(node),
      prevId: getPrevId(node),
    },
  };
}

export function createTransaction(
  type: TransactionType,
  payload: TransactionPayload
): Transaction {
  return {
    command: type,
    payload,
  };
}

export function createClipboardItem(node: INode) {
  const model = node.getModel() as TreeGraphData;
  return {
    id: model.id,
    model,
  };
}

export function getNodeLabelStyle(model: ModelConfig): LabelStyle | undefined {
  return getNodeConfig(model.type?.toString() || '')?.labelStyle;
}
