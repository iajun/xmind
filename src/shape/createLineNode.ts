import { IGroup, Item, ShapeOptions, Util } from "@antv/g6";
import _ from "lodash";
import config, { NodeConfig } from "../config";
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

const createLineNode = (options: NodeConfig, globalCfg?: object): ShapeOptions => {
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
      cfg = _.merge({}, cfg, globalCfg || {});

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

      const globalIconConfig = config.global.icon;

      const {leftIcons = [] as any[], rightIcons = [] as any[]} = cfg;

      let baseLeft = formattedPadding[3];

      ((leftIcons) as any[]).forEach((iconConfig, i) => {
        group.addShape("text", {
          attrs: {
            x:
              baseLeft + i * (globalIconConfig.fontSize  + globalIconConfig.gap),
            y: height / 2,
            textBaseline: "middle",
            ...globalIconConfig,
            ...iconConfig,
          },
        });
      });

      baseLeft += (leftIcons as any[]).length * (globalIconConfig.fontSize + globalIconConfig.gap);

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
          fill: "#333",
          text: label,
          lineHeight,
          ...labelStyle,
        },
      });

      baseLeft += textWidth;


      ((rightIcons) as any[]).forEach((iconConfig, i) => {
        group.addShape("text", {
          attrs: {
            x: baseLeft + (i + 1) * globalIconConfig.gap + i * globalIconConfig.fontSize,
            y: height / 2,
            textBaseline: "middle",
            ...globalIconConfig,
            ...iconConfig,
          },
        });
      });

      if (!this.hasButton(cfg)) return keyShape;
      this.drawButton(cfg, group);

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
