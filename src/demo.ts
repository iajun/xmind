import { createGraph } from "./createGraph";
import DomAlign from "./plugin/domAlign";
import G6 from '@antv/g6'


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

const domAlign = new DomAlign({
  placement: 'top',
  align: {
    offset: [0, 20]
  },
  getContent() {
    const div = document.createElement('div')
    div.innerHTML = `<div style="width: fit-content; padding: 20px; background: cyan;">you are great</div>`
    return div.childNodes[0];
  }
})

const domAlign2 = new DomAlign({
  placement: 'bottom',
  align: {
    offset: [0, 20]
  },
  getContent() {
    const div = document.createElement('div')
    div.innerHTML = `<div style="width: fit-content; padding: 20px; background: cyan;">you are great</div>`
    return div.childNodes[0];
  }
})

const minimap = new G6.ImageMinimap({
  width: 200,
  height: 300
});
const graph = ((window as any).graph = createGraph({
  data,
  container: "mindmap",
  plugins: [
    domAlign,
    domAlign2,
    minimap
  ]
}));

const drawMinimap = () => {
  setTimeout(() => {
    graph.toFullDataURL(
      res => minimap.updateGraphImg(res),
      undefined,
      {
        padding: 60
      }
    )
  })
}

graph.on('afterlayout', drawMinimap)
graph.on('afterrender', drawMinimap)
graph.on('graphstatechange', drawMinimap)

graph.fitCenter();
drawMinimap()

