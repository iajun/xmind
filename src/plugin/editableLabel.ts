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
  fittingLabelWidth,
  getLabelByModel,
  isFired,
  isLabelEqual,
  setBounds
} from "../utils";
import config, { PLACE_HOLDER } from "../config";
import { IG6GraphEvent, INode, Util } from "@antv/g6";
import Graph from "../graph";
import Quill from "./quill";

export type EditableLabelConfig = {
  shortcuts?: string[] | string[][];
  shouldBegin?: (item: INode) => boolean;
};

const formatEditorText = (text: string) => (text || "").replace(/\n$/, "");

export default class EditableLabel extends Base {
  private editorEl!: HTMLDivElement;
  private wrapperEl!: HTMLDivElement;
  private container!: HTMLDivElement;
  private event!: IG6GraphEvent;
  private editor!: Quill;
  private graph!: Graph;
  private item?: INode | null;
  private originalLabel: string = "";

  getDefaultCfgs() {
    return {
      shortcuts: [["metaKey", "Enter"]],
      shouldBegin() {
        return true;
      }
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
    const selectedNode = this.graph.getSelectedNodes()[0];
    if (
      !selectedNode ||
      selectedNode.hasState(ItemState.Editing) ||
      !isFired(this.get("shortcuts"), e)
    )
      return;
    this.onShow(selectedNode);
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

    modifyCSS(this.wrapperEl, {
      visibility: "hidden"
    });

    this.initRichTextEditor();
    this.container.appendChild(this.wrapperEl);
  }

  private initRichTextEditor() {
    const className = this.get("className");
    this.editorEl = createDom(
      `<div id="mindmap-quill" class=${className || "g6-editable-label"}></div>`
    );
    this.wrapperEl.appendChild(this.editorEl);
    const { maxWidth } = config.xmindNode.labelStyle;
    this.editor = new Quill(this.editorEl, {
      modules: {
        toolbar: []
      },
      formats: [],
      placeholder: "Compose an epic..."
    });
    this.editor.on("text-change", () => {
      this.adjustGraphSize();
    });
    this.editor.root.style.cssText = `max-width: ${maxWidth}px; width: 100%`;
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
    const text = formatEditorText(this.editor.getText());
    const { item } = this;
    item.update({
      label: text
    });
    const placeholderWidth = fittingLabelWidth(
      PLACE_HOLDER,
      config.xmindNode.labelStyle.fontSize
    );
    const textWidth = fittingLabelWidth(
      text,
      config.xmindNode.labelStyle.fontSize
    );
    if (textWidth > placeholderWidth) {
      this.editor.root.style.width = "auto";
    } else {
      this.editor.root.style.width = (textWidth || placeholderWidth) + "px";
    }
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
    const containerPoint = Util.applyMatrix(item.getBBox(), matrix);
    const labelBBox = labelShape.getBBox();

    const matrixString = [
      matrix[0],
      matrix[1],
      matrix[3],
      matrix[4],
      containerPoint.x,
      containerPoint.y
    ].join();

    const lineHeight = labelShape.attr("lineHeight");
    modifyCSS(this.wrapperEl, {
      font,
      transform: `matrix(${matrixString})`,
      lineHeight: `${lineHeight}px`
    });
    this.editor.root.style.margin = `${labelBBox.y / 2}px ${labelBBox.x}px`;
  }

  private onBlur() {
    const { item } = this;
    if (!item) return;

    const command = this.graph.get("command");
    const text = formatEditorText(this.editor.getText());

    if (isLabelEqual(text, this.originalLabel)) {
      return;
    }
    item.update({
      label: this.originalLabel
    });
    command.execute("update", {
      id: item.getID(),
      updateModel: {
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

    this.item = item as INode;

    const model = item.getModel();
    const originalLabel = (this.originalLabel = getLabelByModel(model));
    this.editor.setText(originalLabel, "silent");
    this.editor.focus();

    this.adjustPosition = this.adjustPosition.bind(this);

    this.graph.on("wheel", this.adjustPosition);

    this.adjustPosition();
    this.adjustGraphSize();

    this.unbindAllListeners();

    setBounds(this.event.clientX, this.event.clientY);

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
    this.unbindAllListeners();

    this.item.setState(ItemState.Editing, false);
    this.graph.off("wheel", this.adjustPosition);
    modifyCSS(this.wrapperEl, {
      visibility: "hidden"
    });
    this.item = null;
  }

  public destroy() {
    this.unbindAllListeners();
    this.container.removeChild(this.wrapperEl);
    this.editor = null;
  }
}
