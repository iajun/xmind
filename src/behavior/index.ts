import G6 from "@antv/g6";
import ClickItemBehavior from "./click";
import ScrollCanvasBehavior from "./scroll-canvas";
import DragNodeBehavior from "./drag-node";

G6.registerBehavior("click-item", ClickItemBehavior);
G6.registerBehavior("scroll-canvas", ScrollCanvasBehavior);
G6.registerBehavior("drag-node", DragNodeBehavior);
