import { IGroup, Item, ModelConfig, ShapeOptions } from "@antv/g6";
import { drawNode, getSizeByConfig } from "./util";
import _ from "lodash";
import { ItemState } from "../constants";
import { NodeConfig, setGlobal } from "../config";

export const createRectNode = (
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
    draw(cfg, group: IGroup) {
      if (mapCfg) {
        cfg = mapCfg(cfg);
      }
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
