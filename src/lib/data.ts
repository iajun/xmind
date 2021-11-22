import { TreeGraphData } from "../types";

const list: Omit<TreeGraphData, "children">[] = [
  {
    id: "__1__",
    parentId: null,
    label: "root node",
    leftIcons: [
      {
        text: "\ue63f",
        fill: "#333",
      },
      {
        text: "\ue63e",
        fill: "#333",
      },
      {
        text: "\ue63e",
        fill: "#333",
      },
      {
        text: "\ue63e",
        fill: "#333",
      },
      {
        text: "\ue63e",
        fill: "#333",
      },
    ],
    priority: 3,
  },
  {
    id: "__2__",
    parentId: "__1__",
    nextId: "__3__",
    label: "second first node",
    description:
      "descriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescriptiondescription",
    priority: 1,
    leftIcons: [
      {
        text: "\ue63f",
        fill: "#333",
      },
      {
        text: "\ue63e",
        fill: "#333",
      },
      {
        text: "\ue63e",
        fill: "#333",
      },
      {
        text: "\ue63e",
        fill: "#333",
      },
      {
        text: "\ue63e",
        fill: "#333",
      },
    ],
    rightIcons: [
      {
        text: "\ue63f",
        fill: "#333",
      },
      {
        text: "\ue63e",
        fill: "#333",
      },
      {
        text: "\ue63e",
        fill: "#333",
      },
      {
        text: "\ue63e",
        fill: "#333",
      },
      {
        text: "\ue63e",
        fill: "#333",
      },
    ],
    remark: "hello",
  },
  {
    id: "__3__",
    parentId: "__1__",
    nextId: null,
    label: "second second node",
    priority: 2,
    remark: "分局案例放假啦flajfljadlfjalflajlfa分局案例饭局按逻辑阀了",
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
