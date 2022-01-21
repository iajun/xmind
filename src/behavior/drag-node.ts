import { BehaviorOption, INode, Util, Global } from "@antv/g6";
import { G6Event, IG6GraphEvent } from "@antv/g6-core";
import { BBox } from "@antv/g-base";
import Graph from "../graph";
import _ from "lodash";
import { deepMix } from "@antv/util";
import { getNextId, getParentId } from "../utils";

type NodePosition = {
  width: number;
  height: number;
  x: number;
  y: number;
  id: string;
  parentId: number;
  label: string;
};

const getPlaceholderModel = () => ({
  id: "dragPlaceholderNode",
  type: "dragPlaceholderNode",
  label: "        "
});

const compute = {
  applyOffset: (
    point: { x: number; y: number },
    offset: { offsetX: number; offsetY: number }
  ) => {
    return {
      x: point.x - offset.offsetX,
      y: point.y - offset.offsetY
    };
  },
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
  closeItem: (
    list: NodePosition[],
    x: number,
    y: number,
    maxThreshold?: number
  ) => {
    let closestParent: NodePosition | null = null;
    let lastMin = Number.MAX_SAFE_INTEGER;
    const map = _.keyBy(list, "id");

    list.forEach(item => {
      if (x <= item.x + item.width) {
        return;
      }
      const dis = compute.distance(
        [x, y],
        [item.x + item.width, item.y + item.height / 2]
      );
      if (dis < lastMin) {
        closestParent = item;
        lastMin = dis;
      }
    });

    if (!closestParent) return { parent: null, sibling: null };

    const siblingList = list.filter(
      item => item.x < x && item.x + item.width > x
    );

    let closestNext = null,
      closestPrev = null,
      lastNextMin = Number.MAX_SAFE_INTEGER,
      lastPrevMin = lastNextMin;
    siblingList.forEach(item => {
      let dis = y - item.y;
      // cursor under the item
      if (dis > 0) {
        if (dis >= lastPrevMin) return;
        lastPrevMin = dis;
        closestPrev = item;
        // cursor above the item
      } else {
        dis = -dis;
        if (dis >= lastNextMin) return;
        lastNextMin = dis;
        closestNext = item;
      }
    });

    if (
      lastPrevMin < lastNextMin &&
      closestPrev &&
      closestPrev.parentId !== closestParent.id
    ) {
      closestParent = map[closestPrev.parentId];
      closestNext = null;
    }
    if (closestNext && closestNext.parentId !== closestParent.id) {
      closestNext = null;
    }

    if (maxThreshold) {
      if (x - closestParent.x - closestParent.width > maxThreshold) {
        closestParent = null;
      }
      if (closestNext && y - closestNext.y > maxThreshold) {
        closestNext = null;
      }
    }

    return {
      parent: closestParent,
      sibling: closestNext
    };
  }
};

const DragNodeBehavior: BehaviorOption = {
  getDefaultCfg(): object {
    return {
      maxThreshold: 300,
      shouldDragTo() {
        return true;
      },
      shouldDragFrom() {
        return true;
      }
    };
  },

  getEvents(): { [key in G6Event]?: string } {
    return {
      "node:dragstart": "onDragStart"
    };
  },

  onDragStart(e: IG6GraphEvent) {
    if (!e.item) return;
    if (!this.get("shouldDragFrom")(e.item)) return;

    const graph = this.get("graph") as Graph,
      el = graph.get("container");
    if (graph.isRootNode(e.item.getID())) return;

    graph.setEditState(true);

    Object.assign(this, { graph, el });
    this.onDragging = this.onDragging.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);

    el.addEventListener("mousemove", this.onDragging, {
      passive: false
    });
    el.addEventListener("mouseup", this.onDragEnd);

    this.data = graph.get("data");
    this.nodePoints = [] as NodePosition[];
    const itemBBox = e.item.getBBox();
    const model = e.item.getModel();
    this.model = model;
    this.originalPosition = {
      parentId: getParentId(e.item),
      nextId: getNextId(e.item)
    };

    this.itemPosition = {
      offsetX: e.x - itemBBox.x,
      offsetY: e.y - itemBBox.y,
      ..._.pick(itemBBox, ["width", "height"])
    };

    this.placeholderModel = getPlaceholderModel();
    graph.removeChild(model.id);
  },

  cacheAllPoints() {
    this.nodePoints = [];

    this.get("graph").findAll("node", node => {
      const bBox = node.getContainer().getBBox();
      const matrix = node.getContainer().getMatrix();
      const model = node.getModel();

      if (model.id === this.model.id || model.id === this.placeholderModel.id)
        return false;
      this.nodePoints.push({
        // node width
        width: bBox.width,
        // node height
        height: bBox.height,
        // node left x
        x: matrix[6],
        // node top y
        y: matrix[7],
        // node id
        id: model.id,
        // node parent id
        parentId: getParentId(node),
        nextId: getNextId(node),
        // node label
        label: model.label
      });
      return false;
    });
  },

  onDragging: _.throttle(
    function(e: MouseEvent) {
      const graph: Graph = this.graph;
      if (!this.nodePoints) {
        this.cacheAllPoints();
      }

      const point = graph.getPointByClient(e.clientX, e.clientY);

      const placeholderItem = graph.findById(this.placeholderModel.id);

      const delegatePoint = compute.applyOffset(point, this.itemPosition);
      this.updateDelegate(delegatePoint.x, delegatePoint.y);

      if (placeholderItem) {
        const bBox = placeholderItem.getBBox();
        if (
          point.x >= bBox.x &&
          point.x <= bBox.x + bBox.width &&
          point.y >= bBox.y &&
          point.y <= bBox.y + bBox.height
        )
          return;
      }

      this.closestItem = compute.closeItem(
        this.nodePoints,
        point.x,
        point.y,
        this.get("maxThreshold")
      );

      const isEqual = (item1, item2) => {
        if (+!!item1 ^ +!!item2) return false;
        if (!item1 && !item2) return true;

        return item1.id === item2.id;
      };

      if (
        this.lastClosetItem &&
        this.closestItem.parent !== null &&
        this.lastClosetItem.parent !== null &&
        isEqual(this.closestItem.parent, this.lastClosetItem.parent) &&
        isEqual(this.closestItem.sibling, this.lastClosetItem.sibling)
      ) {
        return;
      }

      this.cacheAllPoints();

      this.lastClosetItem = this.closestItem;
      this.placeChildren(this.placeholderModel);
    },
    30,
    {
      leading: true,
      trailing: false
    }
  ),

  computePlacePosition() {
    const shouldDragTo = this.get("shouldDragTo");
    const { graph, closestItem, originalPosition } = this;
    const { parent, sibling } = closestItem;

    if (!parent || (parent && !shouldDragTo(graph.findById(parent.id)))) {
      return {
        nextId: originalPosition.nextId,
        parentId: originalPosition.parentId
      };
    } else {
      return {
        parentId: parent.id,
        nextId: sibling?.id || null
      };
    }
  },

  placeChildren: function placeChildren(model) {
    const { graph } = this;

    if (graph.findById(model.id)) {
      graph.removeChild(model.id);
    }

    graph.placeNode(model, this.computePlacePosition());
  },

  onDragEnd() {
    const { el, graph } = this;
    el.removeEventListener("mousemove", this.onDragging);
    el.removeEventListener("mouseup", this.onDragEnd);

    if (this.delegateRect) {
      this.delegateRect.remove();
      this.delegateRect = null;
    }

    if (graph.findById(this.placeholderModel.id)) {
      graph.removeChild(this.placeholderModel.id);
    }

    this.executeDragCommand();
    this.nodePoints = [];

    graph.setEditState(false);
  },

  executeDragCommand() {
    const { nextId, parentId } = this.computePlacePosition();
    const { model, graph } = this;
    const originalPosition =  {
        nextId: this.originalPosition.nextId,
        parentId: this.originalPosition.parentId
    }
    const nextPosition = {
      nextId,
      parentId
    }
    graph.executeBatch(() => {
      graph.placeNode(model, originalPosition);
      graph.get("command").execute("drag-node", {
        model,
        nextPosition,
        originalPosition
      });
    });
  },

  updateDelegate(x, y) {
    const { graph } = this;

    const newPoint = {
      x,
      y
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
          ...attrs
        },
        name: "rect-delegate-shape"
      });
      this.delegateRect.set("capture", false);
    } else {
      this.delegateRect.attr(newPoint);
    }
  }
};

export default DragNodeBehavior;
