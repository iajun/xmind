import G6 from '@antv/g6'
import config from './config';
import { NodeName } from './constants';
import { fittingLabelHeight, fittingLabelWidth, fittingString } from './utils';

const options = {
  stateStyles: {
    selected: {
      stroke: "#50B6F0",
      lineWidth: config.global.lineWidth
    },
  },
}

const FOLD_BUTTON_RADIUS = 4


// <group style={{
//   opacity: 0
// }}> 
// <circle
// style={{
//   fill: '#fff',
//   marginLeft: ${width},
//   r: ${FOLD_BUTTON_RADIUS},
//   stroke: '#959EA6'
// }}
// >

// </circle>
// <path style={{
//   stroke: '#959EA6',
//   path: [
//     ['M', ${width - FOLD_BUTTON_RADIUS * 0.6}, ${height + 4}],
//     ['L', ${width + FOLD_BUTTON_RADIUS * 0.6}, ${height + 4}]
//   ],
// }} />
// </group>


const SubNode = {
  options ,
  jsx(cfg) {
    const { fontSize, maxWidth, padding, lineHeight } = config.subNode;
    const label = fittingString(
      cfg.label,
      maxWidth,
      fontSize,
    );
    const width = fittingLabelWidth(label, fontSize, padding[1]);
    const height = fittingLabelHeight(label, lineHeight, padding[0]);

    return `
    <group id='a' style={{
      name: '${NodeName.BaseNode}'
    }}>
      <rect 
      keyshape='true' 
      style={{
        fill: '#eee',
        x: ${width / 2},
        y: ${height / 2},
        width: ${width},
        height: ${height},
        radius: 4,
      }}
      >
        <text style={{
          marginLeft: ${padding[1]},
          marginTop: ${height / 2 - lineHeight},
          fill: '#000',
          lineHeight: ${lineHeight},
          textBaseline: 'middle',
          textAlign: 'left',
          fontSize: ${fontSize}
        }}>${label}</text>
      </rect>
    </group>
    `
  },
  getSize(cfg) {
    const { fontSize, maxWidth, padding, lineHeight } = config.subNode;
    const label = fittingString(
      cfg.label,
      maxWidth,
      fontSize,
    );
    const width = fittingLabelWidth(label, fontSize, padding[1]);
    const height = fittingLabelHeight(label, lineHeight, padding[0]);
    return [width, height]
  },
  getAnchorPoints() {
    return [
      [0, 0.5],
      [1, 0.5],
    ];
  },
}

G6.registerNode("subNode", SubNode);
G6.registerNode("leafNode", SubNode)

export default SubNode