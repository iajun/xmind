import { BehaviorOption, INode, Util, Global } from "@antv/g6";
import { G6Event, IG6GraphEvent } from "@antv/g6-core";
import { BBox } from "@antv/g-base";
import Graph from "../graph";
import _ from "lodash";
import { deepMix } from "@antv/util";

type NodePosition = {
  width: number;
  height: number;
  x: number;
  y: number;
  id: string;
  label: string;
  depth: number;
};

const MAX_THRESHOLD = 100;

const getPlaceholderModel = () => ({
  id: "dragPlaceholderNode",
  type: "dragPlaceholderNode",
  label: "",
});

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
    let closetParent: NodePosition | null = null;
    let lastMin = Number.MAX_SAFE_INTEGER;
    list.forEach((item) => {
      if (x <= item.x + item.width) return;
      if (closetParent && closetParent.depth > item.depth) return;
      const xDis = x - (item.x + item.width);
      if (xDis > MAX_THRESHOLD) return;
      if (xDis < lastMin) {
        closetParent = item;
        lastMin = xDis;
      }
    });

    if (!closetParent) return { parent: null, sibling: null };

    const siblingList = list.filter(
      (item) => item.depth === closetParent.depth + 1
    );

    let closetSibling = null;
    lastMin = Number.MAX_SAFE_INTEGER;
    siblingList.forEach((item) => {
      const dis = compute.distance([item.x, item.y], [x, y]);
      if (dis > MAX_THRESHOLD * MAX_THRESHOLD || dis >= lastMin) return;
      lastMin = dis;
      closetSibling = item;
    });

    return {
      parent: closetParent,
      sibling: closetSibling,
    };
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
    this.onDragging = this.onDragging.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);

    el.addEventListener("mousemove", this.onDragging, {
      passive: false,
    });
    el.addEventListener("mouseup", this.onDragEnd);

    this.data = graph.get("data");
    this.nodePoints = [] as NodePosition[];
    const itemBBox = e.item.getBBox();
    const model = e.item.getModel();
    this.model = model;

    this.itemPosition = {
      offsetX: e.x - itemBBox.x,
      offsetY: e.y - itemBBox.y,
      ..._.pick(itemBBox, ["width", "height"]),
    };

    this.placeholderModel = getPlaceholderModel();
    graph.removeChild(this.model.id);
  },

  cacheAllPoints() {
    this.get("graph").findAll("node", (node) => {
      const bBox = node.getContainer().getBBox();
      const matrix = node.getContainer().getMatrix();
      const model = node.getModel();

      if (model.id === this.model.id || model.id === this.placeholderModel.id)
        return false;
      this.nodePoints.push({
        width: bBox.width,
        height: bBox.height,
        x: matrix[6],
        y: matrix[7],
        id: node.getID(),
        label: node.getModel().label,
        depth: model.depth,
      });
      return false;
    });
  },

  onDragging: _.throttle(
    function (e: MouseEvent) {
      const graph: Graph = this.graph;
      this.cacheAllPoints();

      const point = compute.applyOffset(
        graph.getPointByClient(e.clientX, e.clientY),
        this.itemPosition
      );

      this.closetItem = compute.closeItem(this.nodePoints, point.x, point.y);

      const isEqual = (item1, item2) => {
        return item1
          ? item2
            ? item1.id === item2.id
            : false
          : item2
          ? false
          : true;
      };

      if (
        this.lastClosetItem &&
        isEqual(this.closestItem.parent, this.lastClosetItem.parent) &&
        isEqual(this.closestItem.sibling, this.lastClosetItem.sibling)
      )
        return;

      this.updateDelegate(point.x, point.y);

      this.lastClosetItem = this.closestItem;
      this.placeChildren(e, this.placeholderModel);
      // console.log(this.delegateRect);
    },
    30,
    {
      leading: true,
    }
  ),

  placeChildren: function placeChildren(e: MouseEvent, model) {
    const { graph, closetItem } = this;
    const { parent, sibling } = closetItem;

    const hasChildren = (id) => {
      const model = graph.findById(id).getModel();
      return model.children && model.children.length;
    };

    const point = compute.applyOffset(
      graph.getPointByClient(e.clientX, e.clientY),
      this.itemPosition
    );

    if (graph.findById(model.id)) {
      graph.removeChild(model.id);
    }

    if (!parent) {
      graph.addChild(model, model.parentId);
    } else if (!sibling) {
      if (hasChildren(parent.id)) {
        graph.addChild(model, model.parentId);
      } else {
        graph.addChild(model, parent.id);
      }
    } else {
      let nextId = sibling.y > point.y ? sibling.id : sibling.nextId;
      if (!nextId) {
        graph.addChild(model, parent.id);
      } else {
        graph.insertBefore(model, sibling.id);
      }
    }
  },

  onDragEnd(e: MouseEvent) {
    const { el, model, graph } = this;
    el.removeEventListener("mousemove", this.onDragging);
    el.removeEventListener("mouseup", this.onDragEnd);

    console.log("end");

    if (this.delegateRect) {
      this.delegateRect.remove();
      this.delegateRect = null;
    }

    if (graph.findById(this.placeholderModel.id)) {
      graph.removeChild(this.placeholderModel.id);
    }

    this.placeChildren(e, model);
  },

  updateDelegate(x, y) {
    const { graph } = this;

    const newPoint = {
      x,
      y,
    };

    if (!this.delegateRect || this.delegateRect.destroyed) {
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
      this.delegateRect.set("capture", false);
    } else {
      this.delegateRect.attr(newPoint);
    }
  },
};

export default DragNodeBehavior;
