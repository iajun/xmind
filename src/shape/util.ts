import { IGroup, Util } from "@antv/g6";
import GlobalConfig from "../config";
import {
  fittingLabelHeight,
  fittingLabelWidth,
  fittingString,
  getLabelByModel,
} from "../utils";

export const drawFoldButton = (group: IGroup) => {
  group.addShape("circle", {
    attrs: {
      x: 0,
      y: 0,
      r: 6,
      fill: "#fff",
      stroke: GlobalConfig.global.stroke,
      lineWidth: 1,
      cursor: "pointer",
    },
  });
};

export const drawUnfoldButton = (group: IGroup, count: number) => {
  group.addShape("circle", {
    attrs: {
      x: 0,
      y: 0,
      r: 6,
      fill: "#fff",
      stroke: GlobalConfig.global.stroke,
      lineWidth: 1,
      cursor: "pointer",
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
      cursor: "pointer",
    },
  });
};

const getIconWidth = (count) => {
  const { fontSize, gap } = GlobalConfig.global.icon;
  return count * (fontSize + gap);
};

export const getSizeByConfig = (config, cfg) => {
  const {
    labelStyle: { lineHeight, fontSize, maxWidth, minWidth },
    padding,
  } = config;

  const formattedPadding = Util.formatPadding(padding);
  const label = fittingString(getLabelByModel(cfg), maxWidth, fontSize);

  const textWidth = Math.max(fittingLabelWidth(label, fontSize), minWidth);
  
  const width =
    (textWidth + fontSize > maxWidth ? maxWidth : textWidth) +
    formattedPadding[1] +
    formattedPadding[3] +
    getIconWidth((cfg.leftIcons?.length || 0) + (cfg.rightIcons?.length || 0));
  const height =
    fittingLabelHeight(label, lineHeight) +
    formattedPadding[0] +
    formattedPadding[2];

  return [width, height];
};