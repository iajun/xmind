import { ModelNode, Node } from "./types";
import _ from "lodash";

const NO_ID = "__NO_ID__";
const CONCAT_ID_KEY = "$$";



const genMap = <T>(
  list: T[],
  genKey: (item: T) => string
): Record<string, T> => {
  return _.keyBy(list, genKey);
};

const traverse = <T extends { children: T[] }>(
  list: T[],
  cb: (item: T) => void
) => {
  list.forEach((item) => {
    if (item.children) {
      traverse(item.children, cb);
    } else {
      cb(item);
    }
  });
};

class Model {
  public sourceData: Node[];
  private tree?: ModelNode;

  constructor(data: Node[]) {
    this.sourceData = data;
    this.init(data);
  }

  private init(list: Node[]) {
    this.tree = this.genTree(list);
  }

  private genKey(parentNode: Node | null, childId: string) {
    const parentId = parentNode === null ? NO_ID : parentNode.id;
    return `${parentId}${CONCAT_ID_KEY}${childId}`;
  }

  get rootKey() {
    return this.genKey(null, NO_ID);
  }

  private genTree(list: Node[]) {
    const map = genMap(
      list,
      (item: Node) =>
        `${item.parentId || NO_ID}${CONCAT_ID_KEY}${item.nextId || NO_ID}`
    );

    const genChildren = (
      parentNode: Node | null,
      lastChildNodeId: string | null,
      level: number
    ): ModelNode[] => {
      const key = this.genKey(parentNode, lastChildNodeId || NO_ID);
      if (map[key]) {
        let node: Node = map[key];
        const children = [];
        while (node) {
          node.children = genChildren(node, null, level + 1);
          node.collapsed = false
          node.type =
            key === this.rootKey
              ? "rootNode"
              : node.children.length
              ? "xmindNode"
              : "xmindNode";
          node.level = level;
          children.push(node as ModelNode);
          node = map[this.genKey(parentNode, node.id)];
        }
        return children.reverse();
      } else {
        return [];
      }
    };

    return genChildren(null, null, 1)[0];
  }

  get data() {
    return this.tree;
  }
}

export default Model;
