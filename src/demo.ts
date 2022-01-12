import { createGraph } from "./createGraph";

const leaf1 = {
  id: "2",
  type: "xmindNode",
  label: "leaf1",
};

const leaf2 = {
  id: "3",
  type: "xmindNode",
  label: "",
};

const data = {
  id: "1",
  type: "rootNode",
  label: "root",
  children: [leaf1, leaf2],
};

const graph = (window as any).graph = createGraph({
  data,
  container: "mindmap",
  width: 1400,
  height: 800,
});

graph.fitCenter()
