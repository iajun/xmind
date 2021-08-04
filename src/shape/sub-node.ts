import G6, { IGroup, Util } from "@antv/g6";
import config from "../config";
import { ItemState, NodeName } from "../constants";
import { fittingLabelHeight, fittingLabelWidth, fittingString } from "../utils";

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
export const ACTIVE_STROKE = "#096DD9";

const options = {
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
};

const SubNode = {
  options,
  additionalIconCount: 0,
  setState(key, value, item) {
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
  draw(cfg, group: IGroup) {
    const { fontSize, maxLabelWidth, padding, lineHeight, minWidth } =
      config.subNode;
    const formattedPadding = Util.formatPadding(padding);
    const label = fittingString(cfg.label, maxLabelWidth, fontSize);

    let textWidth = Math.max(fittingLabelWidth(label, fontSize), minWidth);
    if (textWidth + fontSize >= maxLabelWidth) {
      textWidth = maxLabelWidth;
    }

    const textHeight = fittingLabelHeight(label, lineHeight);
    const [width, height] = this.getSize(cfg);

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

    return keyShape;
  },
  getSize(cfg) {
    const { fontSize, maxLabelWidth, padding, lineHeight, minWidth } =
      config.subNode;

    const formattedPadding = Util.formatPadding(padding);
    const label = fittingString(cfg.label, maxLabelWidth, fontSize);

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

G6.registerNode("subNode", SubNode);
G6.registerNode("leafNode", SubNode);

export default SubNode;
