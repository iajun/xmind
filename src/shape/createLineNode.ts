import { IGroup, Item, ModelConfig, ShapeOptions, Util } from "@antv/g6";
import _ from "lodash";
import { NodeConfig, setGlobal } from "../config";
import { ItemState } from "../constants";
import { TreeGraphData } from "../types";
import {
  drawUnfoldButton,
  drawFoldButton,
  getSizeByConfig,
  drawNode,
} from "./util";

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
        zIndex: 4,
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

      buttonGroup.translate(width, height / 2);
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
    draw(cfg, group) {
      if (mapCfg) {
        cfg = mapCfg(cfg);
      }

      const keyShape = drawNode(group, cfg, options);
      if (this.hasButton(cfg)) {
        this.drawButton(cfg, group);
      }

      group.sort();
      return keyShape;
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

export default createLineNode;
