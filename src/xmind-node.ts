import G6, { IGroup, ModelConfig, ShapeOptions } from '@antv/g6'
import config from './config';

export const FOLD_BUTTON_NAME = 'node-fold-button';
export const UNFOLD_BUTTON_NAME = 'node-unfold-button';

export const drawFoldButton = (group:IGroup) => {
  group.addShape('circle', {
    attrs: {
      x: 0,
      y: 0,
      r: 6,
      fill: "#fff",
      stroke: config.global.stroke,
      lineWidth: 1
    }
  })
}

export const drawUnfoldButton = (group: IGroup) => {
  group.addShape('circle', {
    attrs: {
      x: 0,
      y: 0,
      r: 20,
      fill: "#fff"
    }
  })
}


export const XmindNode: ShapeOptions = {
  afterDraw(model, group) {
    this.drawButton(model, group); 
  },
  drawButton(model: ModelConfig, group: IGroup) {
    const {children, collapsed} = model

    if (!children || !children.length) {
      return;
    }

    const buttonGroup = group.addGroup({
      name: collapsed ? UNFOLD_BUTTON_NAME : FOLD_BUTTON_NAME,
    })

    const [width, height] = this.getSize!(model)

    collapsed ? drawUnfoldButton(buttonGroup): drawFoldButton(buttonGroup)
    
    buttonGroup.translate(width, height / 2)
  }
}

G6.registerNode('xmindNode', XmindNode, 'subNode')