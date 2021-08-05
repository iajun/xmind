import G6, { IGroup, Util } from "@antv/g6";
import { fittingLabelHeight, fittingLabelWidth, fittingString } from "../utils";
import config from "../config";

const options = config.rootNode;

const RootNode = {
  options,
  draw(cfg, group: IGroup) {
    const { fontSize, maxLabelWidth, padding, lineHeight, minWidth } = options;
    const label = fittingString(cfg.label, maxLabelWidth, fontSize);
    const formattedPadding = Util.formatPadding(padding);
    const width =
      Math.max(fittingLabelWidth(label, fontSize), minWidth) +
      formattedPadding[1] +
      formattedPadding[3];
    const height =
      fittingLabelHeight(label, lineHeight) +
      formattedPadding[0] +
      formattedPadding[2];

    const keyShape = group.addShape("rect", {
      attrs: {
        x: 0,
        y: 0,
        width,
        height,
        fill: "#587EF7",
        radius: 8,
      },
    });

    group.addShape("text", {
      attrs: {
        text: label,
        x: width / 2,
        y: height / 2,
        lineHeight,
        textBaseline: "middle",
        fill: "#fff",
        textAlign: "center",
        fontSize,
      },
    });

    return keyShape;
  },
  getSize(cfg) {
    const { fontSize, maxLabelWidth, padding, lineHeight, minWidth } =
      config.rootNode;

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
      [0, 0.5],
      [1, 0.5],
    ];
  },
};

G6.registerNode("rootNode", RootNode);

export default RootNode;
