import { IGroup, Util, ModelConfig } from "@antv/g6";
import _ from "lodash";
import GlobalConfig, { NodeConfig } from "../config";
import { NodeName } from "../constants";
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

  let labelWidth = Math.max(fittingLabelWidth(label, fontSize), minWidth);
  labelWidth = labelWidth + fontSize > maxWidth ? maxWidth : labelWidth;
  const labelHeight = fittingLabelHeight(label, lineHeight);

  let descHeight = 0,
    descWidth = 0;
  const desc = cfg.description as string;
  let description = "";
  if (desc) {
    const formattedPaddingDesc = Util.formatPadding(
      GlobalConfig.nodeDescription.padding
    );
    description = fittingString(
      desc,
      maxWidth - formattedPaddingDesc[3],
      GlobalConfig.nodeDescription.labelStyle.fontSize
    );
    descWidth = Math.max(
      fittingLabelWidth(
        description,
        GlobalConfig.nodeDescription.labelStyle.fontSize
      ),
      minWidth
    );

    descHeight = fittingLabelHeight(
      description,
      GlobalConfig.nodeDescription.labelStyle.lineHeight
    );
  }

  const leftIconWidth = getIconWidth(cfg.leftIcons?.length || 0);
  const rightIconWidth = getIconWidth(cfg.rightIcons?.length || 0);
  const textWidth = Math.max(labelWidth, descWidth);
  const textHeight = labelHeight + descHeight;

  const width =
    textWidth +
    formattedPadding[1] +
    formattedPadding[3] +
    leftIconWidth +
    rightIconWidth;
  const height = textHeight + formattedPadding[0] + formattedPadding[2];

  return {
    label,
    desc: description,
    width,
    height,
    leftIconWidth,
    rightIconWidth,
    textWidth,
    textHeight,
    labelWidth,
    labelHeight,
    descWidth,
    descHeight,
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
    textHeight,
    textWidth,
    leftIconWidth,
    labelWidth,
    labelHeight,
    descHeight,
    descWidth,
    desc,
    label,
  } = getSizeByConfig(options, cfg);
  const {
    leftIcons = [],
    rightIcons = [],
  }: { leftIcons: any[]; rightIcons: any[] } = cfg as any;
  const globalIconConfig = GlobalConfig.global.icon;

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

  // text && text style
  const isUnderLine = (cfg.itemStyle as any)?.textDecoration === "underline";
  const isDeleteLine = (cfg.itemStyle as any)?.textDecoration === "deleteLine";
  if (isUnderLine || isDeleteLine) {
    _.range(0, textHeight / lineHeight).forEach((_a, i) => {
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
      y: formattedPadding[0],
      textBaseline: "top",
      textAlign: "left",
      fontSize,
      fontFamily: "PingFang SC",
      fill: "#333",
      text: label,
      lineHeight,
      ...labelStyle,
      ..._.omit((cfg.itemStyle || {}) as object, ["fill"]),
    },
    zIndex: 3,
  });

  // description
  if (desc) {
    const descriptionPadding = Util.formatPadding(
      GlobalConfig.nodeDescription.padding
    );

    group.addShape("path", {
      zIndex: 3,
      attrs: {
        stroke: GlobalConfig.global.stroke,
        lineWidth: GlobalConfig.global.lineWidth,
        path: [
          ["M", baseLeft, labelHeight + descriptionPadding[0]],
          ["V", labelHeight + descHeight],
        ],
      },
    });

    group.addShape("text", {
      zIndex: 3,
      name: NodeName.BaseNodeDesc,
      attrs: {
        x: baseLeft + descriptionPadding[3],
        y: labelHeight + formattedPadding[2],
        width: descWidth,
        height: descHeight,
        text: desc,
        textBaseline: "top",
        ...GlobalConfig.nodeDescription.labelStyle,
      },
    });
  }

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
