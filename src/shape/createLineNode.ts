import { IGroup, Item, ShapeOptions, Util } from "@antv/g6";
import _ from "lodash";
import C from "../config";
import { ItemState } from "../constants";
import { TreeGraphData } from "../types";
import { NodeConfig } from "./types";
import {
  drawUnfoldButton,
  drawFoldButton,
  getSizeByConfig,
  drawNode,
  getRenderModel
} from "./util";

const NODE_BOTTOM_LINE = "node-bottom-line";
export const FOLD_BUTTON_GROUP = "node-fold-button";

const createLineNode = (options: NodeConfig): ShapeOptions => {
  return {
    options,

    hasButton(model: TreeGraphData) {
      return model.children && model.children.length;
    },

    drawButton(model: TreeGraphData, group: IGroup) {
      const items = group.findAllByName(FOLD_BUTTON_GROUP);

      items.forEach(item => group.removeChild(item, true));
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
            stroke: selectedStyles.stroke
          });
        } else {
          keyShape.attr(this.options.wrapperStyle);
          path.attr({
            stroke: C.edge.stroke
          });
        }
      }
    },
    draw(cfg, group) {
      const [width, height] = this.getSize(cfg);

      group.addShape("path", {
        name: NODE_BOTTOM_LINE,
        attrs: {
          stroke: C.edge.stroke,
          lineWidth: C.edge.lineWidth,
          path: [
            ["M", 0, height],
            ["H", width]
          ]
        },
        zIndex: 2
      });

      const keyShape = drawNode(group, cfg, options);
      if (this.hasButton(cfg)) {
        this.drawButton(cfg, group);
      }

      group.sort();
      return keyShape;
    },
    getSize(cfg) {
      const size = getSizeByConfig(options, getRenderModel(cfg));
      return [size.width, size.height];
    },
    getAnchorPoints() {
      return [
        [0, 1],
        [1, 1]
      ];
    }
  };
};

export default createLineNode;
