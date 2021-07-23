import G6 from '@antv/g6'

const options = {
  size: [120, 30],
  fontSize: [0, 0, 14, 10]
}


const RootNode = {
  options ,
  jsx(cfg) {
    const [width, height] = options.size;
    return `
    <group>
    <rect style={{
      fill: '#959EA6',
      x: ${width / 2},
      y: ${height / 2},
      strokeWidth: 2,
      stroke: '#959EA6',
      width: ${width},
      height: ${height + 4}
    }}>
    <rect style={{
      fill: '#fff',
      x: 0,
      y: 0,
      width: ${width},
      height: ${height}
    }}/>
  
    <text style={{
      marginLeft: ${width / 2},
      marginTop: ${height / 2 - 8},
      fill: '#000',
      textAlign: 'center',
      fontSize: ${options.fontSize[cfg.level] || 10}
    }}>${cfg.label}</text>
    </rect>
    </rect>
    </group>
    `
  },
  getAnchorPoints() {
    return [
      [0, 1],
      [1, 1],
    ];
  },
}

G6.registerNode("sub", RootNode);
G6.registerNode("leaf", RootNode);
