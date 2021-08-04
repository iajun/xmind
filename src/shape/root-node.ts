import G6, { Util } from '@antv/g6'
import { fittingLabelHeight, fittingLabelWidth, fittingString } from "../utils";
import config from "../config";

const options = config.rootNode

const RootNode = {
  options,
  jsx(cfg) {
    const { fontSize, maxLabelWidth, padding, lineHeight, minWidth } = options;
    const label = fittingString(
      cfg.label,
      maxLabelWidth,
      fontSize,
    );
    const formattedPadding = Util.formatPadding(padding);
    const width = Math.max(fittingLabelWidth(label, fontSize,), minWidth) + formattedPadding[1] + formattedPadding[3];
    const height = fittingLabelHeight(label, lineHeight) + formattedPadding[0] + formattedPadding[2];
    
    return `
    <group name='rootNode'>
    <rect
    keyshape='true'
    style={{
      x: 0,
      y: 0,
      width: ${width}, 
      height: ${height},
      fill: '#587EF7',
      radius: 8
    }}>
    <text style={{
      marginLeft: ${width / 2},
      marginTop: ${height / 2 - lineHeight},
      lineHeight: ${lineHeight},
      textBaseline: 'middle',
      fill: '#fff',
      textAlign: 'center',
      fontSize: ${fontSize}
    }}>${label}</text>
    </rect> 
    </group>
    `;
  },
  getAnchorPoints() {
    return [
      [0, 0.5],
      [1, 0.5],
    ];
  },
};

G6.registerNode("rootNode", RootNode);

export default RootNode;
