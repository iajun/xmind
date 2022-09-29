import { IGroup, Util } from "@antv/g6";
import _ from "lodash";
import C from "../config";
import { NodeName } from "../constants";
import { ModelConfig } from "../types";
import { getLabelByModel } from "../utils";
import getTextRenderer from "./text";
import { NodeConfig } from './types'

export const drawFoldButton = (group: IGroup) => {
  group.addShape("circle", {
    attrs: {
      x: 0,
      y: 0,
      r: 6,
      fill: "#fff",
      stroke: C.edge.stroke,
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
      stroke: C.edge.stroke,
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

const getIconWidth = (count: number) => {
  const { fontSize, gap } = C.icon;
  return count * (fontSize + gap);
};

export const getSizeByConfig = (config: NodeConfig, cfg: ModelConfig) => {
  const {
    labelStyle,
    padding,
  } = config;

  const formattedPadding = Util.formatPadding(padding);

  const text = getLabelByModel(cfg) || C.textPlaceholder?.(cfg) || '';

  const {
    width: labelWidth,
    height: labelHeight,
    text: label
  } = getTextRenderer(labelStyle).render(text)

  const leftIconWidth = getIconWidth(cfg.leftIcons?.length || 0);
  const rightIconWidth = getIconWidth(cfg.rightIcons?.length || 0);
  const textWidth = labelWidth;
  const textHeight = labelHeight;

  const width =
    textWidth +
    formattedPadding[1] +
    formattedPadding[3] +
    leftIconWidth +
    rightIconWidth;
  const height = textHeight + formattedPadding[0] + formattedPadding[2];

  return {
    label,
    width,
    height,
    leftIconWidth,
    rightIconWidth,
    textWidth,
    textHeight,
    labelWidth,
    labelHeight,
  };
};

export const drawNode = (
  group: IGroup,
  cfg: ModelConfig,
  options: NodeConfig
) => {
  const { labelStyle, wrapperStyle, padding } = options;
  const { lineHeight, fontSize } = labelStyle;
  const formattedPadding = Util.formatPadding(padding);
  const {
    width,
    height,
    textWidth,
    leftIconWidth,
    labelWidth,
    labelHeight,
    label,
  } = getSizeByConfig(options, cfg);
  const {
    leftIcons = [],
    rightIcons = [],
  }: { leftIcons: any[]; rightIcons: any[] } = cfg as any;
  const globalIconConfig = C.icon;

  // outer wrapper;
  const keyShape = group.addShape("rect", {
    draggable: true,
    attrs: {
      width,
      height,
      radius: 4,
      ...wrapperStyle,
    },
    zIndex: 1,
  });

  let baseLeft = formattedPadding[3];

  // left icons
  (leftIcons as any[]).forEach((iconConfig, i) => {
    group.addShape("text", {
      name: iconConfig.text,
      attrs: {
        x: baseLeft + i * (globalIconConfig.fontSize + globalIconConfig.gap),
        y: height / 2,
        textBaseline: "middle",
        ...globalIconConfig,
        ...iconConfig,
      },
      zIndex: 3,
    });
  });

  baseLeft += leftIconWidth;

  // text wrapper;
  group.addShape("rect", {
    draggable: true,
    attrs: {
      width: labelWidth,
      height: labelHeight,
      x: baseLeft,
      y: formattedPadding[0],
      ...((cfg.itemStyle || {}) as object),
    },
    zIndex: 2,
  });

  // text && text style
  const isUnderLine = (cfg.itemStyle as any)?.textDecoration === "underline";
  const isDeleteLine = (cfg.itemStyle as any)?.textDecoration === "deleteLine";
  if (isUnderLine || isDeleteLine) {
    _.range(0, labelHeight / lineHeight).forEach((_a, i) => {
      group.addShape("path", {
        attrs: {
          path: [
            [
              "M",
              baseLeft,
              lineHeight * (i + (isUnderLine ? 1 : 0.5)) + formattedPadding[0],
            ],
            ["H", labelWidth + baseLeft],
          ],
          stroke: "#333",
          lineWidth: 2,
        },
        zIndex: 3,
      });
    });
  }

  group.addShape("text", {
    draggable: true,
    name: NodeName.BaseNodeText,
    attrs: {
      width: labelWidth,
      height: labelHeight,
      x: baseLeft,
      y: formattedPadding[0] + (lineHeight - fontSize) / 2,
      textBaseline: "top",
      textAlign: "left",
      fontSize: labelStyle.fontSize,
      fontFamily: labelStyle.fontFamily,
      fill: "#333",
      text: label,
      lineHeight,
      ...labelStyle,
      ..._.omit((cfg.itemStyle || {}) as object, ["fill"]),
    },
    zIndex: 3,
  });

  baseLeft += textWidth;

  // right icons
  (rightIcons as any[]).forEach((iconConfig, i) => {
    group.addShape("text", {
      name: iconConfig.text,
      attrs: {
        x:
          baseLeft +
          (i + 1) * globalIconConfig.gap +
          i * globalIconConfig.fontSize,
        y: height / 2,
        textBaseline: "middle",
        ...globalIconConfig,
        ...iconConfig,
      },
      zIndex: 3,
    });
  });

  return keyShape;
};
