import { createGraph } from "./createGraph";

const leaf1 = {
  id: "2",
  type: "xmindNode",
  label: "leaf1",
  children: [
    { id: "7", label: `edit draft, choose "Non- TO" chute, can edit Chute Direction, Parcel Sorting with multi receiver`, type: "xmindNode" },
    { id: "8", label: `edit draft, upload file with "Non-TO" chute, can edit Chute Direction, Parcel Sorting with multi receiver`, type: "xmindNode" },
  ],
};

const leaf2 = {
  id: "3",
  type: "xmindNode",
  label: "hello world",
  children: [
    { id: "5", label: "excellent", type: "xmindNode" },
    { id: "6", label: "tell me you", type: "xmindNode" },
  ],
};

const data = {
  id: "1",
  type: "rootNode",
  label: `root edit draft, choose "Non- TO" chute, can edit Chute Direction, Parcel Sorting with multi receiver`,
  children: [
    leaf1,
    leaf2,
    { id: "4", label: "you are great", type: "xmindNode" },
  ],
};

const graph = ((window as any).graph = createGraph({
  data,
  container: "mindmap",
  width: 1400,
  height: 800,
}));

graph.fitCenter();
