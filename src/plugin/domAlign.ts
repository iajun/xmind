import { modifyCSS, createDom } from "@antv/dom-util";
import Base from "@antv/g6-plugin/lib/base";
import { IG6GraphEvent, INode } from "@antv/g6";
import Graph from "../graph";
import { GraphNodeEvent } from "../constants";
import BuiltInPlacements from './buildInPlacements'

export type Align = "topLeft" | "topRight" | "topMiddle";

export type DomAlignConfig = {
  shouldBegin?: (e: IG6GraphEvent) => boolean;
  onHide?: (item: INode) => void;
  alignConfig?: (e: IG6GraphEvent) => Align;
  placement?: keyof typeof BuiltInPlacements
  trigger?: "click" | "hover";
};

export default class DomAlign extends Base {
  protected el!: HTMLDivElement;
  protected wrapperEl!: HTMLDivElement;
  protected container!: HTMLDivElement;
  protected graph!: Graph;
  protected item?: INode | null;
  protected currentEvent!: IG6GraphEvent

  getDefaultCfgs() {
    return {
      trigger: "click",
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
    const isTriggerClick =       this.get("trigger") === "click";
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
    const cls = this.get("className");

    this.wrapperEl = createDom(`<div class=${cls || "g6-dom-align"} />`);
    this.el = createDom('<div />')
    this.wrapperEl.appendChild(this.el)

    modifyCSS(this.wrapperEl, {
      visibility: "hidden",
    });

    this.container.appendChild(this.wrapperEl);
    
    this.outerClick = this.outerClick.bind(this)
    if (this.get('trigger') === 'click') {
      window.addEventListener('click', this.outerClick)
    }
  }

  private adjustPosition() {
    const { item } = this;
    if (!item) { return; }
    const { graph } = this;
    const bBox = item.getBBox();
    const matrix = graph.getGroup().getMatrix();
    const offset = graph.getCanvasByPoint(bBox.x, bBox.y);

    const matrixString = [
      matrix[0],
      matrix[1],
      matrix[3],
      matrix[4],
      offset.x,
      offset.y
    ].join();

    modifyCSS(this.wrapperEl, {
      transform: `matrix(${matrixString})`,
      width: `${bBox.width}px`,
      height: `${bBox.height}px`
    });
  }

  stopClickPropagation() {
    const cb = (e: MouseEvent) => {
      e.stopPropagation()
    };
    this.container.addEventListener('click',cb, {
      passive: false
    })
    setTimeout(() => {
      this.container.removeEventListener('click', cb)
    })
  }

  onShow(e: IG6GraphEvent) {
    const item = e.item;
    if (!e.item) return;

    const shouldBegin = this.get("shouldBegin");
    if (!shouldBegin(e)) return;

    Object.assign(this, {
      currentEvent: e,
      item: e.item
    })

    e.stopPropagation()

    this.get('getContent')(this.el, this.graph.getGroup().getMatrix()[0], item);
    this.item = item as INode;

    modifyCSS(this.wrapperEl, {
      visibility: "visible",
      width: 'fit-content'
    });

    this.adjustPosition = this.adjustPosition.bind(this);

    this.graph.on("wheel", this.adjustPosition);

    this.adjustPosition();
    this.stopClickPropagation()
  }

  private outerClick(e) {
    const el = this.wrapperEl;
    
    if (!e.target.contains(el) && this.item) {
      this.onHide();
    }
  }

  private onHide() {
    this.get('onHide')(this.item)

    this.graph.off("wheel", this.adjustPosition);

    modifyCSS(this.wrapperEl, {
      visibility: "hidden",
    });
    this.item = null;
    this.currentEvent = null;
  }

  public destroy() {
    this.container.removeChild(this.wrapperEl);
    window.removeEventListener('click', this.outerClick)
  }
}
