import G6, { Util } from "@antv/g6";
import config from "../config";
import { ItemState, NodeName } from "../constants";
import { fittingLabelHeight, fittingLabelWidth, fittingString } from "../utils";

const NODE_BOTTOM_LINE = 'node-bottom-line'
export const ACTIVE_STROKE =  "#096DD9"

const options = {
  style: {
    fill: "#fff",
    lineWidth: 0,
  },
  stateStyles: {
    [ItemState.Selected]: {
      stroke:ACTIVE_STROKE,
      lineWidth: 1,
      fill: "#E2F0FE",
    },
  },
};

const SubNode = {
  options,
  setState(key, value, item) {
    const keyShape = item.getKeyShape();
    const group = item.getContainer();
    const path = group.findAllByName(NODE_BOTTOM_LINE)[0];
    if (key === ItemState.Selected) {
      const selectedStyles = this.options.stateStyles[ItemState.Selected];
      if (value) {
        keyShape.attr(selectedStyles);
        path.attr({
          stroke: ACTIVE_STROKE
        })
      } else {
        keyShape.attr(this.options.style);
        path.attr({
          stroke: config.global.stroke
        })
      }
    }
  },
  jsx(cfg) {
    const { fontSize, maxLabelWidth, padding, lineHeight, minWidth } = config.subNode;
    const formattedPadding = Util.formatPadding(padding);
    const label = fittingString(cfg.label, maxLabelWidth, fontSize);
    const width = Math.max(fittingLabelWidth(label, fontSize,), minWidth) + formattedPadding[1] + formattedPadding[3];
    const height = fittingLabelHeight(label, lineHeight) + formattedPadding[0] + formattedPadding[2];

    return `
    <group>
      <rect 
      draggable='true'
      keyshape='true' 
      style={{
        x: ${width / 2},
        y: ${height / 2},
        width: ${width},
        height: ${height},
        radius: 4,
      }}
      >
        <text
        name=${NodeName.BaseNodeText}
        draggable='true'
        style={{
          marginLeft: ${formattedPadding[3]},
          lineHeight: ${lineHeight},
          marginTop: ${-formattedPadding[0]},
          fill: '#333',
          textBaseline: 'top',
          textAlign: 'left',
          fontSize: ${fontSize}
        }}>${label}</text>

        <path name=${NODE_BOTTOM_LINE} style={{
          stroke: ${config.global.stroke},
          lineWidth: ${config.global.lineWidth},
          path: [
            ['M', 0, ${height}],
            ['H', ${width}]
          ]
        }} />
      </rect>
    </group>
    `;
  },
  getSize(cfg) {
    const { fontSize, maxLabelWidth, padding, lineHeight, minWidth } = config.subNode;
    const formattedPadding = Util.formatPadding(padding);
    const label = fittingString(cfg.label, maxLabelWidth, fontSize);
    const width = Math.max(fittingLabelWidth(label, fontSize,), minWidth) + formattedPadding[1] + formattedPadding[3];
    const height = fittingLabelHeight(label, lineHeight) + formattedPadding[0] + formattedPadding[2];
    return [width, height];
  },
  getAnchorPoints() {
    return [
      [0, 1],
      [1, 1],
    ];
  },
};

G6.registerNode("subNode", SubNode);
G6.registerNode("leafNode", SubNode);

export default SubNode;
