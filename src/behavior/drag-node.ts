import { deepMix } from "@antv/util";
import {
  IBBox,
  IG6GraphEvent,
  Global,
  NodeConfig,
  Util,
  INode,
} from "@antv/g6";
import { ItemState } from "./../constants";
import { BehaviorOption } from "@antv/g6";
import Graph from "../graph";
import _  from "lodash";

const DELEGATE_PLACEHOLDER_ID = 'DELEGATE_PLACEHOLDER_ID'

type Point = { x: number; y: number };
type StoreListItem = { model: NodeConfig; box: IBBox };
type StoreData = { list: StoreListItem[]; box: IBBox; point: Point };

const getClosestItem = (list: StoreListItem[], point: Point) => {
  let target = list[0];
  let dis = Number.MAX_SAFE_INTEGER;
  list.forEach((item) => {
    const { box } = item;
    const distance =
      Math.pow(Math.abs(point.x - (box.x + box.width)), 2) +
      Math.pow(Math.abs(point.y - (box.y + box.height / 2)), 2);

    if (distance < dis) {
      dis = distance;
      target = item;
    }
  });

  return target;
};

const DragNodeBehavior: BehaviorOption = {
  getDefaultCfg(): object {
    return {};
  },
  getEvents() {
    return {
      'node:dragstart': "onDragStart",
      'node:drag': "onDrag",
      'node:dragend': "onDragEnd",
    };
  },
  onDragStart(this: any, e: IG6GraphEvent) {
    const { item } = e;
    if (!item) return;
    
    const graph: Graph = this.get("graph");
    
    const itemId = item.getID();
    const originalModel = item.getModel()
    const list: StoreListItem[] = [];

    graph.findAll("node", (nodeItem) => {
      const model = nodeItem.getModel() as NodeConfig;
      if (model.id === itemId) return false;
      list.push({
        model,
        box: nodeItem.getBBox(),
      });
      return false;
    });
    const box = item.getBBox();
    // offset x,y of item in container
    const point = Util.invertMatrix(
      { x: e.x, y: e.y },
      item.getContainer().getMatrix()
    );

    this.dragData = {
      list: _.cloneDeep(list),
      box,
      point,
      originalModel
    };

    graph.setItemState(item, ItemState.Placeholder, true)

    graph.recursiveExec(item => {
      if (item.getID() === itemId) return;
      graph.hideItem(item)
    }, itemId)

    this.hasStarted = true;

    this.origin = {
      x: e.x,
      y: e.y,
    };
  },
  onDrag: function onDrag(this: any, e: IG6GraphEvent) {
    if (!e.item || e.item.destroyed || e.item.getType() !== 'node' || !this.hasStarted) return;

    this.updateDelegate(e);
    this.updatePosition(e)

    const data: StoreData = this.dragData;
    const { list, box, point } = data;
    const itemLeftCenteredPoint = {
      x: e.x - point.x,
      y: e.y - point.y + box.height / 2,
    };

    const leftList = list.filter(
      ({ box }) => box.x + box.width < itemLeftCenteredPoint.x
    );
    const lastDepth = _.maxBy(leftList, (item) => item.model.depth)?.model
      .depth;
    const lastDepthList = leftList.filter(
      (item) => item.model.depth === lastDepth
    );

    const parent = getClosestItem(lastDepthList, itemLeftCenteredPoint);
    if (!parent) return;
    const bottomSiblings = list.filter(
      (item) => item.model.parentId === parent.model.id && item.box.y > e.y
    );
    const bottomSibling = getClosestItem(bottomSiblings, { x: e.x, y: e.y });
    
    this.dragData = { ...data, parent, bottomSibling };
  },
  onDragEnd: function onDragEnd(this: any) {
    if (!this.hasStarted) return;
    const graph: Graph = this.get("graph");
    const { parent, bottomSibling, originalModel } = this.dragData;
    if (!parent) return;
    const command = graph.get("command");

    command.execute("drag", {
      id: originalModel.id,
      model: originalModel,
      newParentId: parent.model.id,
      newNextId: bottomSibling?.model.id || null,
    });
    

    if (this.delegateRect) {
      this.delegateRect.remove();
      this.delegateRect = null;
    }
    graph.removeChild(DELEGATE_PLACEHOLDER_ID)
    this.origin = null;
    this.dragData = null;
    this.lastPlaceholder = null;
    this.hasStarted = false
  },
  updatePosition(this: any, e: IG6GraphEvent) {
    if (!this.dragData) return;
    
    const { parent, bottomSibling } = this.dragData;
    
    if (this.lastPlaceholder) {
      const { lastParentId, lastSiblingId } = this.lastPlaceholder; 
      
      if ((parent?.model.id || null) === lastParentId && (bottomSibling?.model.id || null) === lastSiblingId) {
        return;
      }
    }

    this.lastPlaceholder = {
      lastParentId: parent?.model.id || null,
      lastSiblingId: bottomSibling?.model.id || null
    }

  },
  updateDelegate(this: any, e: IG6GraphEvent) {
    const { graph } = this;
    const parent = graph.get("group");
    if (!this.delegateRect) {
      const attrs = deepMix({}, Global.delegateStyle, this.delegateStyle);
      const {
        x: cx,
        y: cy,
        width,
        height,
        minX,
        minY,
      } = this.calculationGroupPosition(e);
      this.originPoint = { x: cx, y: cy, width, height, minX, minY };
      this.delegateRect = parent.addShape("rect", {
        attrs: {
          width,
          height,
          x: cx,
          y: cy,
          ...attrs,
        },
        name: "rect-delegate-shape",
      });
      this.delegate = this.delegateRect;
      this.delegateRect.set("capture", false);
    } else {
      const clientX = e.x - this.origin.x + this.originPoint.minX;
      const clientY = e.y - this.origin.y + this.originPoint.minY;
      this.delegateRect.attr({
        x: clientX,
        y: clientY,
      });
    }
  },
  calculationGroupPosition(evt: IG6GraphEvent) {
    if (!evt.item) return;
    const nodes = [evt.item as INode]

    let minx = Infinity;
    let maxx = -Infinity;
    let miny = Infinity;
    let maxy = -Infinity;

    // 获取已节点的所有最大最小x y值
    for (let i = 0; i < nodes.length; i++) {
      const element = nodes[i];
      const bbox = element.getBBox();
      const { minX, minY, maxX, maxY } = bbox;
      if (minX < minx) {
        minx = minX;
      }

      if (minY < miny) {
        miny = minY;
      }

      if (maxX > maxx) {
        maxx = maxX;
      }

      if (maxY > maxy) {
        maxy = maxY;
      }
    }

    const x = Math.floor(minx);
    const y = Math.floor(miny);
    const width = Math.ceil(maxx) - Math.floor(minx);
    const height = Math.ceil(maxy) - Math.floor(miny);

    return {
      x,
      y,
      width,
      height,
      minX: minx,
      minY: miny,
    };
  },
};

export default DragNodeBehavior;
