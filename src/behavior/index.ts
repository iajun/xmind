import G6 from '@antv/g6';
import ClickItemBehavior from './click'
import DragNodeBehavior from './drag-node'
import ScrollCanvasBehavior from './scroll-canvas'

G6.registerBehavior('click-item', ClickItemBehavior);
G6.registerBehavior('drag-node', DragNodeBehavior);
G6.registerBehavior('scroll-canvas', ScrollCanvasBehavior);