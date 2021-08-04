import G6 from "@antv/g6";

export const ACTIVE_STROKE =  "#096DD9"
const delegateStyle = {
}

const DelegateNode = {
  jsx() {
    const width = 100
    const height = 40

    return `
    <group>
      <rect 
      keyshape='true' 
      style={{
        x: ${width / 2},
        y: ${height / 2},
        width: ${width},
        height: ${height},
        radius: 4,
        fill: '#000'
      }}
      >
      </rect>
    </group>
    `;
  },
  getAnchorPoints() {
    return [
      [0, 1],
      [1, 1],
    ];
  },
};

G6.registerNode("delegateNode", DelegateNode);

export default DelegateNode;
