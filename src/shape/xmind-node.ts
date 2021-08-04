import config from "../config";
import G6, { Util, IGroup, ShapeOptions } from "@antv/g6";
import { ModelNode } from "../types";

export const FOLD_BUTTON_GROUP = "node-fold-button";

const drawFoldButton = (group: IGroup) => {
  group.addShape("circle", {
    attrs: {
      x: 0,
      y: 0,
      r: 6,
      fill: "#fff",
      stroke: config.global.stroke,
      lineWidth: 1,
    },
  });
};

const drawUnfoldButton = (group: IGroup, count: number) => {
  group.addShape("circle", {
    attrs: {
      x: 0,
      y: 0,
      r: 6,
      fill: "#fff",
      stroke: config.global.stroke,
      lineWidth: 1,
    },
  });
  group.addShape("text", {
    attrs: {
      text: `${count}`,
      fill: "#000",
      x: 0,
      y: 0,
      fontSize: 8,
      textBaseline: "middle",
      textAlign: "center",
    },
  });
};

export const XmindNode: ShapeOptions = {
  afterDraw(model, group) {
    if (!this.hasButton(model)) return;
    if (!group) return;

    this.drawButton(model, group);
  },
  hasButton(model: ModelNode) {
    return model.children.length;
  },
  drawButton(model: ModelNode, group: IGroup) {
    const items = group.findAllByName(FOLD_BUTTON_GROUP);

    items.forEach((item) => group.removeChild(item, true));
    const buttonGroup = group.addGroup({
      name: FOLD_BUTTON_GROUP,
    });
    const { collapsed } = model;
    if (collapsed) {
      let len = -1;
      Util.traverseTree(model, () => len++);
      drawUnfoldButton(buttonGroup, len);
    } else {
      drawFoldButton(buttonGroup);
    }
    const [width, height] = this.getSize!(model);
    buttonGroup.translate(width, height);
  },
  afterUpdate(model: any, item) {
    if (!this.hasButton(model)) return;
    const container = item?.getContainer();
    if (!container) return;

    this.drawButton(model, container);
  },
};

G6.registerNode("xmindNode", XmindNode, "subNode");
