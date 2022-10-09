import { modifyCSS } from "@antv/dom-util";
import Base from "@antv/g6-plugin/lib/base";
import { IG6GraphEvent, INode, Util } from "@antv/g6";
import Graph from "../graph";
import { GraphNodeEvent } from "../constants";
import BuiltInPlacements from './buildInPlacements'
import alignPoint from 'dom-align';
import { throttle } from "lodash";

export type DomAlignConfig = {
  shouldBegin?: (e: IG6GraphEvent) => boolean;
  onHide?: (item: INode) => void;
  placement?: keyof typeof BuiltInPlacements
  align?: any;
  trigger?: "click" | "hover";
  persistent?: boolean;
};

const isPointInside = (sourcePoint: { x: number, y: number }, targetRect: { x: number, y: number, width: number, height: number }) => {
  return (sourcePoint.x >= targetRect.x && sourcePoint.x <= targetRect.x + targetRect.width) && (sourcePoint.y >= targetRect.y && sourcePoint.y <= targetRect.y + targetRect.height)
}

export default class DomAlign extends Base {
  protected el!: HTMLDivElement;
  protected placeholderEl!: HTMLDivElement;
  protected container!: HTMLDivElement;
  protected graph!: Graph;
  protected item?: INode | null;
  protected currentEvent!: IG6GraphEvent

  getDefaultCfgs() {
    return {
      trigger: "click",
      persistent: false,
      shouldBegin() {
        return true;
      },
      onHide() {
      },
      placement: 'top'
    } as DomAlignConfig;
  }

  getEvents() {
    const events = {}
    const isTriggerClick = this.get("trigger") === "click";
    const showEventName = isTriggerClick
      ? GraphNodeEvent.onNodeClick
      : GraphNodeEvent.onNodeMouseEnter;
    events[showEventName] = 'onShow'
    if (!isTriggerClick) {
      events[GraphNodeEvent.onNodeMouseOut] = 'onHide'
    }

    return events;
  }

  init() {
    const graph = (this.graph = this.get("graph"));
    this.container = graph.get("container");
    this.outerClick = this.outerClick.bind(this)
    this.placeholderEl = document.createElement('div')
    this.container.appendChild(this.placeholderEl);

    if (this.get('trigger') === 'click') {
      window.addEventListener('click', this.outerClick)
    }
  }

  private adjustPosition() {
    const { item } = this;
    if (!item) { return; }
    const { graph } = this;
    const bBox = item.getBBox();
    console.log(item, bBox)
    const graphMatrix = graph.getGroup().getMatrix();
    const containerPoint = Util.applyMatrix({
      x: bBox.x,
      y: bBox.y
    }, graphMatrix)

    const matrix = [
      graphMatrix[0],
      graphMatrix[1],
      graphMatrix[3],
      graphMatrix[4],
      containerPoint.x,
      containerPoint.y
    ]
    const elMatrix = [
      graphMatrix[0],
      graphMatrix[1],
      graphMatrix[3],
      graphMatrix[4],
      0,
      0
    ]

    this.placeholderEl.style.cssText = `position: absolute; z-index: -1000; transform: matrix(${matrix.join()}); left: 0; top: 0; transform-origin: top left; width: ${bBox.width}px; height: ${bBox.height}px`
    modifyCSS(this.el, {
      transform: `matrix(${elMatrix.join()})`,
    });
    const alignConfig = Object.assign({}, BuiltInPlacements[this.get('placement')], { ignoreShake: true });
    setTimeout(() => {
      alignPoint(this.el, this.placeholderEl, alignConfig);
    })
  }

  stopClickPropagation() {
    const cb = (e: MouseEvent) => {
      e.stopPropagation()
    };
    this.container.addEventListener('click', cb, {
      passive: false
    })
    setTimeout(() => {
      this.container.removeEventListener('click', cb)
    })
  }

  onShow(e: IG6GraphEvent) {
    const item = e.item;
    if (!e.item || e.item === this.item) return;

    const shouldBegin = this.get("shouldBegin");
    if (!shouldBegin(e)) return;

    Object.assign(this, {
      currentEvent: e,
      item: e.item
    })

    e.stopPropagation()
    if (this.el) {
      this.el.remove()
    }

    this.el = document.createElement('div');
    this.el.style.cssText = 'width: fit-content;';
    this.el.appendChild(this.get('getContent')(item));
    this.container.appendChild(this.el);
    this.item = item as INode;

    this.adjustPosition = throttle(this.adjustPosition, 40, { trailing: true }).bind(this);

    this.graph.on("wheel", this.adjustPosition);

    this.adjustPosition();
    this.stopClickPropagation()
  }

  private outerClick(e: MouseEvent) {
    if (!this.item) return;
    const bBox = this.item.getBBox();
    const sourcePoint = { x: e.clientX, y: e.clientY };
    const targetPoint = this.graph.getClientByPoint(bBox.x, bBox.y);
    const matrix = this.graph.getGroup().getMatrix();
    if (isPointInside(sourcePoint, { ...targetPoint, width: bBox.width * matrix[0], height: bBox.height * matrix[4] })) {
      return;
    }
    if (this.get('persistent') && e.target instanceof Element && this.el.contains(e.target)) return;
    setTimeout(() => {
      this.onHide();
    }, 100)
  }

  private onHide() {
    this.get('onHide')(this.item)

    this.graph.off("wheel", this.adjustPosition);

    this.item = null;
    this.el.remove()
    this.el = null;
    this.currentEvent = null;
  }

  public destroy() {
    window.removeEventListener('click', this.outerClick)
  }
}
