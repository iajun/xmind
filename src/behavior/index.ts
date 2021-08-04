import G6 from '@antv/g6';
import ClickItemBehavior from './click'
import DragNodeBehavior from './drag-node'


G6.registerBehavior('click-item', ClickItemBehavior);
G6.registerBehavior('drag-node', DragNodeBehavior);