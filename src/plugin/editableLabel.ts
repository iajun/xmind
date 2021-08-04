import { IElement } from "@antv/g-base";
import { GraphNodeEvent, NodeName } from "./../constants";
import { modifyCSS, createDom } from "@antv/dom-util";
import { IG6GraphEvent, Item } from "@antv/g6-core";
import Base from "@antv/g6-plugin/lib/base";
import { getLabelByModel, getPositionByPoint, isLabelEqual } from "../utils";
import config from "../config";
import { INode, Util } from "@antv/g6";
import Graph from "../graph";
import { ModelNode } from "../types";

export default class Menu extends Base {
  private editorEl: HTMLDivElement;
  private wrapperEl: HTMLDivElement;

  public getEvents() {
    return {
      [GraphNodeEvent.onNodeDoubleClick]: "onShow",
    };
  }

  private getLabelShape(target: Item): IElement | null {
    return (
      target.getContainer().findAllByName(NodeName.BaseNodeText)[0] || null
    );
  }

  get container() {
    return this.get("graph").get("container");
  }

  public init() {
    const className = this.get("className");
    this.editorEl = createDom(
      `<div class=${
        className || "g6-editable-label"
      } contenteditable='true'></div>`
    );
    this.wrapperEl = createDom(`<div />`)
    this.wrapperEl.appendChild(this.editorEl)

    modifyCSS(this.wrapperEl, {
      "font-size": "14px",
      "border-radius": "4px",
      color: "#333",
      "word-break": "break-all",
      position: "absolute",
      visibility: "hidden",
      width: "auto",
      'transform-origin': 'top left',
      minWidth: `${config.subNode.minWidth}px`,
      "will-change": "transform",
      top: 0,
      left: 0,
      minHeight: "20px",
      background: "#E2F0FE",
    });
    modifyCSS(this.editorEl, {
      'max-width': `${config.subNode.maxLabelWidth  }px`,
      outline: 0,
      height: 'auto',
    })

    const graph = this.get('graph')
    this.container.appendChild(this.wrapperEl);
    graph.on(GraphNodeEvent.onNodeEdit, this.onShow.bind(this));
  }

  private unbindAllListeners() {
    const listeners = this.get("listeners") || {};
    Object.keys(listeners).forEach((key) => {
      const { el, eventName, listener } = listeners[key];
      el.removeEventListener(eventName, listener);
      delete listeners[key];
    });
  }

  private bindListener(
    key: string,
    el: HTMLElement,
    eventName: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    let listeners = this.get("listeners");
    if (!listeners) {
      listeners = {};
      this.set("listeners", listeners);
    }
    listeners[key] = {
      el,
      eventName,
      listener,
    };

    el.addEventListener(eventName, listener, options);
  }

  adjustNodeSize(item) {
    const labelShape = this.getLabelShape(item);
    if (!labelShape) return;
    const lineHeight = labelShape.attr("lineHeight");
    modifyCSS(this.editorEl, {
      'max-width': `${config.subNode.maxLabelWidth}px`,
      height: 'auto',
      'line-height': `${lineHeight}px`
    })
  }

  adjustPosition(item: INode) {
    const labelShape = this.getLabelShape(item);
    if (!labelShape) return;
    const graph: Graph = this.get("graph");
    const font = labelShape.attr("font");

    const matrix = graph.getGroup().getMatrix();
    const containerPoint = Util.applyMatrix(item.getBBox(), matrix);
    const matrixString = [matrix[0], matrix[1],matrix[3], matrix[4],  containerPoint.x, containerPoint.y].join()

    modifyCSS(this.wrapperEl, {
      font,
      transform: `matrix(${matrixString})`,
      padding: Util.formatPadding(config.subNode.padding).map(( n: number ) => `${n}px`).join(' '),
      visibility: "visible",
    });
  }

  protected onShow(e: IG6GraphEvent) {
    e.preventDefault();
    e.stopPropagation();

    const item = e.item;

    if (!item) return;

    const model = item.getModel();
    const labelShape = this.getLabelShape(item);
    if (!labelShape) return;

    this.adjustPosition = this.adjustPosition.bind(this, item)
    this.get('graph').on('wheel', this.adjustPosition)

    const editorElDom = this.editorEl;
    const originalLabel = getLabelByModel(model);
    editorElDom.innerText = originalLabel;

    this.adjustPosition(item);
    this.adjustNodeSize(item);

    const command = this.get("graph").get("command");
    const onBlur = () => {
      const text = editorElDom.innerText.trimEnd();
      if (isLabelEqual(text, originalLabel)) {
        return;
      }
      command.execute("update", {
        id: model.id,
        updateModel: {
          label: text,
        },
        forceLayout: true,
      });
    };

    this.unbindAllListeners();

    this.bindListener("inputBlur", editorElDom, "blur", onBlur);

    this.bindListener(
      "outerClick",
      document,
      "click",
      this.outerClick.bind(this)
    );

    this.setCaret(e)
  }


  setCaret(e: IG6GraphEvent) {

    const graph: Graph = this.get('graph')
    const point = graph.getPointByClient(e.clientX, e.clientY)
    const model = e.item?.getModel() as ModelNode;
    
    let {x, y} = Util.invertMatrix(point, e.item?.getContainer().getMatrix())
    const nodeConfig = config[model.type];
    const padding = Util.formatPadding(nodeConfig.padding)
    x-=padding[3], y-=padding[1];
    const pos = getPositionByPoint(model.label, {x, y}, nodeConfig.fontSize, nodeConfig.lineHeight)
    
    
    const el = this.editorEl,
    selection = window.getSelection(),
    range = document.createRange();
    
    range.setStart(el.childNodes[0], pos);
    range.collapse()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }



  outerClick(e) {
    const el = this.editorEl;
    if (!e.target.contains(el)) {
      this.onHide();
    }
  }

  onHide() {
    this.unbindAllListeners();
    this.get('graph').off('wheel', this.adjustPosition)
    modifyCSS(this.wrapperEl, {
      visibility: "hidden",
    });
  }

  public destroy() {
    const menu = this.get("menu");
    this.unbindAllListeners();
    this.container.removeChild(menu);
  }
}
