import { Node } from "./types";

const list: Node[] = [
  {
    id: "__1__",
    parentId: null,
    nextId: null,
    label: "root node",
  },
  {
    id: "__2__",
    parentId: "__1__",
    nextId: "__3__",
    label: "second first node",
  },
  {
    id: "__3__",
    parentId: "__1__",
    nextId: null,
    label: "second second node",
  },
  {
    id: "__4__",
    parentId: "__2__",
    nextId: "__5__",
    label: "third first node",
  },
  {
    id: "__5__",
    parentId: "__2__",
    nextId: null,
    label: "third second node",
  },
  {
    id: "__6__",
    parentId: "__3__",
    nextId: null,
    label: "third third node",
  },
];

export default list;
