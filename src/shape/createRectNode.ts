import { IGroup, Item, ShapeOptions } from "@antv/g6";
import { drawNode, getSizeByConfig } from "./util";
import _ from "lodash";
import { ItemState } from "../constants";
import { NodeConfig } from "./types";

export const createRectNode = (
  options: NodeConfig,
): ShapeOptions => {
  return {
    options,
    draw(cfg, group: IGroup) {
      const keyshape = drawNode(group, cfg, options);
      return keyshape;
    },
    setState(key?: string, value?: string | boolean, item?: Item) {
      if (!item) return;
      const keyShape = item.getKeyShape();
      if (key === ItemState.Selected) {
        const selectedStyles = this.options.stateStyles[ItemState.Selected];
        if (value) {
          keyShape.attr(selectedStyles);
        } else {
          keyShape.attr(this.options.wrapperStyle);
        }
      }
    },
    getSize(cfg) {
      const size = getSizeByConfig(options, cfg);
      return [size.width, size.height];
    },
    getAnchorPoints() {
      return [
        [0, 0.5],
        [1, 0.5],
      ];
    },
  };
};

export default createRectNode;
