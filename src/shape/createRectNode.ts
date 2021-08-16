import { IGroup, Item, ModelConfig, ShapeOptions, Util } from "@antv/g6";
import {
  fittingLabelHeight,
  fittingLabelWidth,
  fittingString,
  getLabelByModel,
} from "../utils";
import { getSizeByConfig } from "./util";
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
      [name]: { options , mapCfg}
    },
  });
  return {
    options,
    draw(cfg, group: IGroup) {
      const { labelStyle, wrapperStyle, padding } = options;
      const { lineHeight, fontSize, maxWidth, minWidth } = labelStyle;
      const label = fittingString(getLabelByModel(cfg), maxWidth, fontSize);
      const formattedPadding = Util.formatPadding(padding);
      const width =
        Math.max(fittingLabelWidth(label, fontSize), minWidth) +
        formattedPadding[1] +
        formattedPadding[3];
      const height =
        fittingLabelHeight(label, lineHeight) +
        formattedPadding[0] +
        formattedPadding[2];

      if (mapCfg) {
        cfg = mapCfg(cfg);
      }

      const keyShape = group.addShape("rect", {
        attrs: {
          x: 0,
          y: 0,
          width,
          height,
          radius: 8,
          ...wrapperStyle,
        },
      });

      group.addShape("text", {
        attrs: {
          text: label,
          x: width / 2,
          y: height / 2,
          lineHeight,
          fontFamily: 'PingFang SC',
          textBaseline: "middle",
          textAlign: "center",
          fontSize,
          ...labelStyle,
        },
      });

      return keyShape;
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
      return getSizeByConfig(options, cfg);
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
