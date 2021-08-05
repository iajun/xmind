import G6, { IGroup, Item, ShapeOptions, Util } from "@antv/g6";
import config from "../config";
import { ItemState, NodeName } from "../constants";
import { TreeGraphData } from "../types";
import {
  fittingLabelHeight,
  fittingLabelWidth,
  fittingString,
  getLabelByModel,
} from "../utils";

const PRIORITY_MAP = {
  1: {
    text: "\ue659",
    fill: "#FF1403",
  },
  2: {
    text: "\ue658",
    fill: "#0274FF",
  },
  3: {
    text: "\ue657",
    fill: "#06AF00",
  },
};

const NODE_BOTTOM_LINE = "node-bottom-line";
export const FOLD_BUTTON_GROUP = "node-fold-button";
export const ACTIVE_STROKE = "#096DD9";

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

const BaseXMindNode: ShapeOptions = {
  options: {
    style: {
      fill: "#fff",
      lineWidth: 0,
    },
    stateStyles: {
      [ItemState.Selected]: {
        stroke: ACTIVE_STROKE,
        lineWidth: 1,
        fill: "#E2F0FE",
      },
    },
  },
  hasButton(model: TreeGraphData) {
    return model.children.length;
  },
  drawButton(model: TreeGraphData, group: IGroup) {
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
  setState(key?: string, value?: string | boolean, item?: Item) {
    if (!item) return;
    const keyShape = item.getKeyShape();
    const group: IGroup = item.getContainer();
    const path = group.findAllByName(NODE_BOTTOM_LINE)[0];
    if (key === ItemState.Selected) {
      const selectedStyles = this.options.stateStyles[ItemState.Selected];
      if (value) {
        keyShape.attr(selectedStyles);
        path.attr({
          stroke: ACTIVE_STROKE,
        });
      } else {
        keyShape.attr(this.options.style);
        path.attr({
          stroke: config.global.stroke,
        });
      }
    }
  },
  draw(cfg, group) {
    if (!cfg || !group) return;
    const { fontSize, maxLabelWidth, padding, lineHeight, minWidth } =
      config.xmindNode;
    const formattedPadding = Util.formatPadding(padding);
    const label = fittingString(getLabelByModel(cfg), maxLabelWidth, fontSize);

    let textWidth = Math.max(fittingLabelWidth(label, fontSize), minWidth);
    if (textWidth + fontSize >= maxLabelWidth) {
      textWidth = maxLabelWidth;
    }

    const textHeight = fittingLabelHeight(label, lineHeight);
    const [width, height] = this.getSize!(cfg);

    const keyShape = group.addShape("rect", {
      draggable: true,
      attrs: {
        width,
        height,
        radius: 4,
      },
    });

    if (cfg.priority && PRIORITY_MAP[cfg.priority]) {
      group.addShape("text", {
        attrs: {
          x: formattedPadding[3],
          y: -formattedPadding[1],
          fontFamily: "iconfont",
          textAlign: "center",
          textBaseline: "middle",
          fontSize: fontSize * 1.5,
          ...PRIORITY_MAP[cfg.priority],
        },
      });
    }

    if (cfg.remark) {
      group.addShape("text", {
        name: NodeName.Remark,
        attrs: {
          x: fontSize * 1.5 + formattedPadding[3],
          y: -formattedPadding[1],
          fontFamily: "iconfont",
          textAlign: "center",
          textBaseline: "middle",
          fontSize,
          text: "\ue63d",
          fill: "#333",
          cursor: "pointer",
        },
      });
    }

    group.addShape("text", {
      draggable: true,
      name: NodeName.BaseNodeText,
      attrs: {
        width: textWidth,
        height: textHeight,
        x: formattedPadding[3],
        y: height / 2,
        textBaseline: "middle",
        textAlign: "left",
        fontSize,
        fill: "#333",
        text: label,
        lineHeight,
      },
    });

    group.addShape("path", {
      name: NODE_BOTTOM_LINE,
      attrs: {
        stroke: config.global.stroke,
        lineWidth: config.global.lineWidth,
        path: [
          ["M", 0, height],
          ["H", width],
        ],
      },
    });

    if (!this.hasButton(cfg)) return keyShape;
    this.drawButton(cfg, group);

    return keyShape;
  },
  getSize(cfg) {
    const { fontSize, maxLabelWidth, padding, lineHeight, minWidth } =
      config.xmindNode;

    const formattedPadding = Util.formatPadding(padding);
    const label = fittingString(getLabelByModel(cfg), maxLabelWidth, fontSize);

    const textWidth = Math.max(fittingLabelWidth(label, fontSize), minWidth);
    const width =
      (textWidth + fontSize > maxLabelWidth ? maxLabelWidth : textWidth) +
      formattedPadding[1] +
      formattedPadding[3];
    const height =
      fittingLabelHeight(label, lineHeight) +
      formattedPadding[0] +
      formattedPadding[2];

    return [width, height];
  },
  getAnchorPoints() {
    return [
      [0, 1],
      [1, 1],
    ];
  },
};

G6.registerNode("xmindNode", BaseXMindNode);

export default BaseXMindNode;
