import G6 from '@antv/g6'

const options = {
  size: [120, 40]
}

const RootNode = {
  options ,
  jsx() {
    const [width, height] = options.size;
    return `
    <group>

    <rect style={{
      x: 0,
      y: 0,
      width: ${width}, 
      height: ${height},
      fill: '#587EF7',
      radius: 8
    }}>

    <text style={{
      marginLeft: ${width / 2},
      marginTop: ${height / 2 - 8},
      fill: '#fff',
      textAlign: 'center',
      fontSize: 16
    }}>hello</text>
    </rect> 

    </group>

    `
  },
  getAnchorPoints() {
    return [
      [0, 0.8],
      [1, 0.8],
    ];
  },
}

G6.registerNode("root", RootNode);
