import G6 from '@antv/g6';
import ClickItemBehavior from './click'
import ScrollCanvasBehavior from './scroll-canvas'

G6.registerBehavior('click-item', ClickItemBehavior);
G6.registerBehavior('scroll-canvas', ScrollCanvasBehavior);