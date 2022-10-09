import { IElement } from "@antv/g-base";
import {
  GraphCommonEvent,
  GraphNodeEvent,
  ItemState,
  NodeName
} from "./../constants";
import { modifyCSS, createDom } from "@antv/dom-util";
import { Item } from "@antv/g6-core";
import Base from "@antv/g6-plugin/lib/base";
import {
  getLabelByModel,
  getNodeLabelStyle,
  isFired,
  isLabelEqual,
  setBounds
} from "../utils";
import C from "../config";
import { IG6GraphEvent, INode, Util } from "@antv/g6";
import Graph from "../graph";
import getTextRenderer from "../shape/text";

export type EditableLabelConfig = {
  shortcuts?: string[] | string[][];
  shouldBegin?: (item: INode) => boolean;
};

const formatEditorText = (text: string) => (text || "").replace(/\n$/, "");

let lastShowTime = 0;

export default class EditableLabel extends Base {
  private editorEl!: HTMLDivElement;
  private wrapperEl!: HTMLDivElement;
  private container!: HTMLDivElement;
  private event?: IG6GraphEvent;
  private graph!: Graph;
  private item?: INode | null;
  private originalLabel: string = "";

  getDefaultCfgs() {
    return {
      shortcuts: [" ", "Enter"],
      shouldBegin() {
        return true;
      },

    } as EditableLabelConfig;
  }

  public getEvents() {
    return {
      [GraphNodeEvent.onNodeDoubleClick]: "onNodeDoubleClick",
      [GraphCommonEvent.onKeyUp]: "onKeyUp"
    };
  }

  onNodeDoubleClick(e: IG6GraphEvent) {
    this.event = e;
    if (!e.item) return;
    this.onShow(e.item as INode);
  }

  onKeyUp(e: IG6GraphEvent) {
    const isSelected = this.graph.hasState(ItemState.Selected);
    const isEditing = this.graph.hasState(ItemState.Editing);
    if (isSelected && !isEditing && isFired([this.get("shortcuts")[0]], e)) {
      this.onShow(this.graph.getSelectedNodes()[0]);
    }

    if (isEditing && isFired([this.get("shortcuts")[1]], e)) {
      this.onHide();
    }
  }

  private getLabelShape(target: Item): IElement | null {
    return (
      target.getContainer().findAllByName(NodeName.BaseNodeText)[0] || null
    );
  }

  init() {
    const graph = (this.graph = this.get("graph"));
    this.container = graph.get("container");
    this.wrapperEl = createDom(`<div class='g6-editable' />`);

    graph.on("afteritemstatechange", ({ enabled, item, state }) => {
      if (state === ItemState.Editing && enabled) {
        this.onShow(item);
        lastShowTime = Date.now();
      }
    });

    modifyCSS(this.wrapperEl, {
      visibility: "hidden",
    });

    this.initRichTextEditor();
    this.container.appendChild(this.wrapperEl);
  }

  private initRichTextEditor() {
    const className = this.get("className");
    this.editorEl = createDom(
      `<div contenteditable="plaintext-only" class=${className || "g6-editable-label"}></div>`
    );
    this.wrapperEl.appendChild(this.editorEl);
    this.editorEl.addEventListener("input", () => {
      this.adjustGraphSize();
    });
  }

  private showEditor() {
    if (!this.item) return;
    const nodeConfig = C.node[this.item.getModel().type?.toString() || '']
    if (!nodeConfig) return;
    const { labelStyle } = nodeConfig
    const { maxWidth } = labelStyle
    const labelShape = this.getLabelShape(this.item);
    const keyShape = this.item.getKeyShape();
    modifyCSS(this.wrapperEl, {
      background: keyShape.attr('fill')
    });
    this.editorEl.style.cssText = `max-width: ${maxWidth}px; width: 100%; color: ${labelShape.attr('fill')}; outline: none;`;
  }

  private unbindAllListeners() {
    const listeners = this.get("listeners") || {};
    Object.keys(listeners).forEach(key => {
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
      listener
    };

    el.addEventListener(eventName, listener, options);
  }

  private adjustGraphSize() {
    const text = formatEditorText(this.editorEl.innerHTML);
    const { item } = this;
    item.update({
      label: text
    });
    const model = item.getModel();
    const nodeLabelConfig = getNodeLabelStyle(model)
    if (!nodeLabelConfig) return;
    // const { width: placeholderWidth } = getTextRenderer(nodeLabelConfig).render(C.textPlaceholder?.(model) || '');
    const { width: textWidth } = getTextRenderer(nodeLabelConfig).render(text);
    this.editorEl.style.width = textWidth + "px";
    this.graph.layout();
    this.adjustPosition();
  }

  private adjustPosition() {
    const { item } = this;
    if (!item) return;
    const labelShape = this.getLabelShape(item);
    if (!labelShape) return;
    const { graph } = this;
    const font = labelShape.attr("font");

    const matrix = graph.getGroup().getMatrix();
    const itemBBox = item.getBBox();
    const labelBBox = labelShape.getBBox();
    const containerPoint = Util.applyMatrix({
      x: itemBBox.x + labelBBox.x,
      y: itemBBox.y,
    }, matrix);

    const matrixString = [
      matrix[0],
      matrix[1],
      matrix[3],
      matrix[4],
      containerPoint.x,
      containerPoint.y + 2
    ].join();

    const lineHeight = labelShape.attr("lineHeight");
    modifyCSS(this.wrapperEl, {
      font,
      transform: `matrix(${matrixString})`,
      lineHeight: `${lineHeight}px`,
      padding: `${labelShape.attr("y") - (labelShape.attr("lineHeight") - labelShape.attr("fontSize")) / 2 - 1}px 1px`
    });
  }

  private onBlur() {
    const { item } = this;
    if (!item) return;

    const command = this.graph.get("command");
    const text = formatEditorText(this.editorEl.innerHTML);

    if (isLabelEqual(text, this.originalLabel)) {
      return;
    }
    item.update({
      label: this.originalLabel
    });
    command.execute("update", {
      updateModel: {
        id: item.getID(),
        label: text
      }
    });
  }

  private onShow(item: INode) {
    const shouldBegin = this.get("shouldBegin");
    if (!shouldBegin(item)) return;
    this.item = item;

    item.setState(ItemState.Editing, true);

    const labelShape = this.getLabelShape(item);
    if (!labelShape) return;

    modifyCSS(this.wrapperEl, {
      visibility: "visible"
    });
    this.showEditor()

    this.item = item as INode;

    const model = item.getModel();
    const originalLabel = (this.originalLabel = getLabelByModel(model));
    this.editorEl.innerHTML = originalLabel;
    setTimeout(() => this.editorEl.focus())

    this.adjustPosition = this.adjustPosition.bind(this);

    this.graph.on("wheel", this.adjustPosition);

    this.adjustPosition();
    this.adjustGraphSize();

    this.unbindAllListeners();

    if (this.event) {
      setBounds(this.event.clientX, this.event.clientY);
    }

    this.bindListener(
      "outerClick",
      document as any,
      "click",
      this.outerClick.bind(this)
    );
  }

  private outerClick(e) {
    const isInside = node => {
      while (node !== document.body) {
        if (node === this.editorEl) return true;
        node = node.parentNode;
      }
      return false;
    };
    if (!isInside(e.target)) {
      this.onBlur();
      this.onHide();
    }
  }

  private onHide() {
    if (!this.item) return;
    if (Date.now() - lastShowTime < 500) return;
    this.unbindAllListeners();

    this.graph.setItemState(this.item, ItemState.Editing, false);
    this.graph.setItemState(this.item, ItemState.Selected, true);
    this.graph.off("wheel", this.adjustPosition);
    modifyCSS(this.wrapperEl, {
      visibility: "hidden"
    });
    this.item = null;
  }

  public destroy() {
    this.unbindAllListeners();
    this.container.removeChild(this.wrapperEl);
    this.editorEl = null;
  }
}
