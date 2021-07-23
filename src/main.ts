import Model from "./model";
import "./style.css";
import G6 from "@antv/g6";
import list from "./data";
import './root-node'
import './sub-node'

const model = new Model(list);
// const controller = new Controller(list)

const { Util } = G6;

const tree = new G6.TreeGraph({
  container: "xmind",
  width: 800,
  height: 800,
  fitView: true,
  fitViewPadding: [10, 20],
  layout: {
    type: "mindmap",
    direction: "H",
    getHeight: () => {
      return 16;
    },
    getWidth: (node) => {
      return node.level === 0
        ? Util.getTextSize(node.label, 16)[0] + 12
        : Util.getTextSize(node.label, 12)[0];
    },
    getVGap: () => {
      return 10;
    },
    getHGap: () => {
      return 60;
    },
    getSide: () => {
      return 'right'
    },
  },
  defaultEdge: {
    type: "cubic-horizontal",
    style: {
      lineWidth: 1,
      stroke: '#959EA6'
    },
  },
  minZoom: 0.5,
  modes: {
    default: ["drag-canvas", "zoom-canvas", "dice-mindmap",  {
      type: 'collapse-expand',
      trigger: 'click',
    }, {
      type: 'drag-node',
      enableDelegate: true
    }],
  },
  nodeStateStyles: {
  },
  edgeStateStyles: {
    moving: {
      stroke: '#959EA6'
    }
  }
});

tree.on('node:mouseenter', (evt) => {
  const { item } = evt;
  console.log(item?.getContainer())
});
tree.data(model.data);

tree.render();
