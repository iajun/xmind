import G6 from '@antv/g6'
import { fittingLabelHeight, fittingLabelWidth, fittingString } from "./utils";
import config from "./config";

const options = config.rootNode

const RootNode = {
  options,
  jsx(cfg) {
    const { fontSize, maxWidth, padding, lineHeight } = options;
    const label = fittingString(
      cfg.label,
      maxWidth,
      fontSize,
    );
    const width = fittingLabelWidth(label, fontSize, padding[1]);
    const height = fittingLabelHeight(label, lineHeight, padding[0]);
    
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
