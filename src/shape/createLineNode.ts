import { IGroup, Item, ModelConfig, ShapeOptions, Util } from "@antv/g6";
import _ from "lodash";
import config, { NodeConfig, setGlobal } from "../config";
import { ItemState, NodeName } from "../constants";
import { TreeGraphData } from "../types";
import {
  fittingLabelHeight,
  fittingLabelWidth,
  fittingString,
  getLabelByModel,
} from "../utils";
import { drawUnfoldButton, drawFoldButton, getSizeByConfig } from "./util";

const NODE_BOTTOM_LINE = "node-bottom-line";
export const FOLD_BUTTON_GROUP = "node-fold-button";

const createLineNode = (
  name: string,
  options: NodeConfig,
  mapCfg?: (cfg) => ModelConfig
): ShapeOptions => {
  setGlobal({
    registeredNodes: {
      [name]: { options, mapCfg },
    },
  });
  return {
    options,

    hasButton(model: TreeGraphData) {
      return model.children && model.children.length;
    },

    drawButton(model: TreeGraphData, group: IGroup) {
      const items = group.findAllByName(FOLD_BUTTON_GROUP);

      items.forEach((item) => group.removeChild(item, true));
      const buttonGroup = group.addGroup({
        name: FOLD_BUTTON_GROUP,
        zIndex: 4
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
            stroke: selectedStyles.stroke,
          });
        } else {
          keyShape.attr(this.options.wrapperStyle);
          path.attr({
            stroke: config.global.stroke,
          });
        }
      }
    },
    draw(cfg, group) {
      const { labelStyle, wrapperStyle, padding } = options;
      const { lineHeight, fontSize, maxWidth, minWidth } = labelStyle;
      const formattedPadding = Util.formatPadding(padding);
      const label = fittingString(getLabelByModel(cfg), maxWidth, fontSize);
      if (mapCfg) {
        cfg = mapCfg(cfg);
      }
      let textWidth = Math.max(fittingLabelWidth(label, fontSize), minWidth);
      if (textWidth + fontSize >= maxWidth) {
        textWidth = maxWidth;
      }

      const textHeight = fittingLabelHeight(label, lineHeight);
      const [width, height] = this.getSize(cfg);

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
        zIndex: 2,
      });

      const globalIconConfig = config.global.icon;

      const { leftIcons = [] as any[], rightIcons = [] as any[] } = cfg;

      let baseLeft = formattedPadding[3];

      (leftIcons as any[]).forEach((iconConfig, i) => {
        group.addShape("text", {
          name: iconConfig.text,
          attrs: {
            x:
              baseLeft + i * (globalIconConfig.fontSize + globalIconConfig.gap),
            y: height / 2,
            textBaseline: "middle",
            ...globalIconConfig,
            ...iconConfig,
          },
          zIndex: 3,
        });
      });

      baseLeft +=
        (leftIcons as any[]).length *
        (globalIconConfig.fontSize + globalIconConfig.gap);

      const isUnderLine =
        (cfg.itemStyle as any)?.textDecoration === "underline";
      const isDeleteLine =
        (cfg.itemStyle as any)?.textDecoration === "deleteLine";
      if (isUnderLine || isDeleteLine) {
        _.range(0, textHeight / lineHeight).forEach((_a, i) => {
          group.addShape("path", {
            attrs: {
              path: [
                [
                  "M",
                  baseLeft,
                  lineHeight * (i + (isUnderLine ? 1 : 0.5)) +
                    formattedPadding[0],
                ],
                ["H", textWidth + baseLeft],
              ],
              stroke: "#333",
              lineWidth: 2,
            },
            zIndex: 3,
          });
        });
      }

      group.addShape("rect", {
        draggable: true,
        attrs: {
          width: textWidth,
          height: textHeight,
          x: baseLeft,
          y: formattedPadding[0],
          ...((cfg.itemStyle || {}) as object),
        },
        zIndex: 2,
      });

      group.addShape("text", {
        draggable: true,
        name: NodeName.BaseNodeText,
        attrs: {
          width: textWidth,
          height: textHeight,
          x: baseLeft,
          y: height / 2,
          textBaseline: "middle",
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

      baseLeft += textWidth;

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

      if (this.hasButton(cfg)) {
        this.drawButton(cfg, group);
      }

      group.sort();
      return keyShape;
    },
    getSize(cfg) {
      return getSizeByConfig(options, cfg);
    },
    getAnchorPoints() {
      return [
        [0, 1],
        [1, 1],
      ];
    },
  };
};

export default createLineNode;
