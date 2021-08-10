import { BehaviorOption, INode, Util, Global } from "@antv/g6";
import { G6Event, IG6GraphEvent } from "@antv/g6-core";
import { BBox } from "@antv/g-base";
import Graph from "../graph";
import _, { each } from "lodash";
import { deepMix } from "@antv/util";

type NodePosition = {
  width: number;
  height: number;
  x: number;
  y: number;
  id: string;
  label: string;
};

const MAX_DISTANCE = 80;
console.log(Util);

const compute = {
  containerCenter: (graph: Graph, item: INode) => {
    const container = item.getContainer();
    const bBox: BBox = container.getBBox();
    const matrix = Util.applyMatrix(
      container.getBBox(),
      graph.getGroup().getMatrix()
    );
    return [matrix.x + bBox.width / 2, matrix.y + bBox.height / 2];
  },
  distance: ([x1, y1], [x2, y2]) => {
    return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
  },
  closeItem: (list: NodePosition[], x: number, y: number) => {
    list = list.filter((item) => item.x < x);

    let flag = false;
    const max = MAX_DISTANCE * MAX_DISTANCE;
    const leftList = list.filter((item) => item.y > y);
    const item = _.minBy(list, (bBox) => {
      const dis = compute.distance(
        [x, y],
        [bBox.x + bBox.width / 2, bBox.y + bBox.height / 2]
      );
      if (dis > max) {
        return Infinity;
      } else {
        flag = true;
        return dis;
      }
    });
    return flag ? item : null;
  },
  applyOffset: (
    point: { x: number; y: number },
    offset: { offsetX: number; offsetY: number }
  ) => {
    return {
      x: point.x - offset.offsetX,
      y: point.y - offset.offsetY,
    };
  },
};

const DragNodeBehavior: BehaviorOption = {
  getDefaultCfg(): object {
    return {};
  },

  getEvents(): { [key in G6Event]?: string } {
    return {
      "node:dragstart": "onDragStart",
    };
  },

  onDragStart(e: IG6GraphEvent) {
    if (!e.item) return;

    const graph = this.get("graph") as Graph,
      el = graph.get("container");

    Object.assign(this, { graph, el });
    this.onDraging = this.onDraging.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);

    el.addEventListener("mousemove", this.onDraging, {
      passive: false,
    });
    el.addEventListener("mouseup", this.onDragEnd);

    this.data = graph.get("data");
    this.nodePoints = [] as NodePosition[];
    const itemBBox = e.item.getBBox();

    this.itemPosition = {
      offsetX: e.x - itemBBox.x,
      offsetY: e.y - itemBBox.y,
      ..._.pick(itemBBox, ["width", "height"]),
    };
    this.model = e.item.getModel();

    graph.findAll("node", (node) => {
      const bBox = node.getContainer().getBBox();
      const matrix = node.getContainer().getMatrix();

      this.nodePoints.push({
        width: bBox.width,
        height: bBox.height,
        x: matrix[6],
        y: matrix[7],
        id: node.getID(),
        label: node.getModel().label,
      });
      return false;
    });
    graph.removeChild(this.model.id);
  },

  onDraging(e: MouseEvent) {
    const graph: Graph = this.graph;

    const point = compute.applyOffset(
      graph.getPointByClient(e.clientX, e.clientY),
      this.itemPosition
    );
    console.log(point);

    this.updateDelegate(point.x, point.y);
    const closestItem = compute.closeItem(this.nodePoints, point.x, point.y);
    this.closetItem = closestItem;
  },

  onDragEnd(e: MouseEvent) {
    const { el, graph, closetItem, model } = this;
    el.removeEventListener("mousemove", this.onDraging);
    el.removeEventListener("mouseup", this.onDragEnd);

    if (this.delegateRect) {
      this.delegateRect.remove();
      this.delegateRect = null;
    }

    if (!closetItem) {
      graph.addChild(model, model.parentId);
      return;
    }

    if (e.x - this.itemPosition.offsetX > closetItem.x + closetItem.width) {
      console.log(
        e.x - this.itemPosition.offsetX,
        closetItem.x + closetItem.width
      );

      graph.addChild(model, closetItem.id);
    } else if (e.y < closetItem.y) {
      const nextId = graph.findById(closetItem.id).getModel().nextId;
      graph.insertBefore(model, nextId);
    }
  },

  updateDelegate(x, y) {
    const { graph } = this;

    const newPoint = {
      x,
      y,
    };

    if (!this.delegateRect) {
      // 拖动多个
      const parent = graph.get("group");
      const attrs = deepMix({}, Global.delegateStyle, this.delegateStyle);

      // model上的x, y是相对于图形中心的，delegateShape是g实例，x,y是绝对坐标
      this.delegateRect = parent.addShape("rect", {
        attrs: {
          width: this.itemPosition.width,
          height: this.itemPosition.height,
          ...newPoint,
          ...attrs,
        },
        name: "rect-delegate-shape",
      });
      this.delegate = this.delegateRect;
      this.delegateRect.set("capture", false);
    } else {
      this.delegateRect.attr(newPoint);
    }
  },
};

export default DragNodeBehavior;
