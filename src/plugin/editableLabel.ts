import { IElement } from "@antv/g-base";
import {
  GraphCommonEvent,
  GraphNodeEvent,
  ItemState,
  NodeName,
} from "./../constants";
import { modifyCSS, createDom } from "@antv/dom-util";
import { Item } from "@antv/g6-core";
import Base from "@antv/g6-plugin/lib/base";
import {
  getLabelByModel,
  isFired,
  isLabelEqual,
  parseContentEditableStringToPlainText,
  setCaretToEnd,
} from "../utils";
import config from "../config";
import { IG6GraphEvent, INode, Util } from "@antv/g6";
import Graph from "../graph";

export type EditableLabelConfig = {
  shortcuts?: string[] | string[][];
  shouldBegin?: (item: INode) => boolean;
};

export default class EditableLabel extends Base {
  private editorEl!: HTMLDivElement;
  private wrapperEl!: HTMLDivElement;
  private container!: HTMLDivElement;
  private originalTextRect: any;
  private graph!: Graph;
  private item?: INode | null;
  private originalLabel: string = "";

  getDefaultCfgs() {
    return {
      shortcuts: [["metaKey", "Enter"]],
      shouldBegin() {
        return true;
      },
    } as EditableLabelConfig;
  }

  public getEvents() {
    return {
      [GraphNodeEvent.onNodeDoubleClick]: "onNodeDoubleClick",
      [GraphCommonEvent.onKeyUp]: "onKeyUp",
    };
  }

  onNodeDoubleClick(e: IG6GraphEvent) {
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
    const className = this.get("className");
    this.editorEl = createDom(
      `<div class=${
        className || "g6-editable-label"
      } contenteditable='plaintext-only'></div>`
    );
    this.wrapperEl = createDom(`<div class='g6-editable' />`);
    this.wrapperEl.appendChild(this.editorEl);

    modifyCSS(this.wrapperEl, {
      visibility: "hidden",
      minWidth: `${config.xmindNode.minWidth}px`,
    });

    modifyCSS(this.editorEl, {
      "max-width": `${config.xmindNode.maxLabelWidth}px`,
    });

    this.container.appendChild(this.wrapperEl);
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

  private adjustNodeSize() {
    const { item } = this;
    if (!item) return;

    const labelShape = this.getLabelShape(item);
    if (!labelShape) return;

    const lineHeight = labelShape.attr("lineHeight");
    modifyCSS(this.editorEl, {
      "max-width": `${config.xmindNode.labelStyle.maxWidth}px`,
      height: "auto",
      "line-height": `${lineHeight}px`,
    });
  }

  private adjustGraphSize() {
    const { clientWidth: width, clientHeight: height } = this.editorEl;
    
    const html = this.editorEl.innerHTML
    const text = parseContentEditableStringToPlainText(html);
    
    const { item } = this;
    const { lastRect } = this.originalTextRect;
    if (lastRect && width === lastRect.width && height === lastRect.height) {
      return;
    }
    item.update({
      label: text,
    });
    this.graph.layout();
    this.adjustPosition();
    this.originalTextRect.lastRect = { width, height };
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
      containerPoint.x + labelBBox.x,
      containerPoint.y,
    ].join();

    modifyCSS(this.wrapperEl, {
      font,
      transform: `matrix(${matrixString})`,
      padding: Util.formatPadding(config.xmindNode.padding)
        .map((n: number) => `${n}px`)
        .join(" "),
      paddingLeft: 0,
      paddingRight: 0,
    });
  }

  private onBlur() {
    const { item } = this;
    if (!item) return;

    const command = this.graph.get("command");
    const text = parseContentEditableStringToPlainText(
      this.editorEl.innerHTML
    ).trim();
    
    if (isLabelEqual(text, this.originalLabel)) {
      return;
    }
    item.update({
      label: this.originalLabel,
    });
    command.execute("update", {
      id: item.getID(),
      updateModel: {
        label: text,
      },
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
      visibility: "visible",
    });

    this.item = item as INode;

    const model = item.getModel();
    const originalLabel = getLabelByModel(model);
    this.originalLabel = this.editorEl.innerText = originalLabel;

    this.adjustPosition = this.adjustPosition.bind(this);

    this.graph.on("wheel", this.adjustPosition);

    this.adjustPosition();
    this.adjustNodeSize();

    this.unbindAllListeners();

    const bBox = item.getBBox();
    this.originalTextRect = {
      itemWidth: bBox.width,
      itemHeight: bBox.height,
      lastRect: {
        width: this.editorEl.clientWidth,
        height: this.editorEl.clientHeight,
      },
    };

    setCaretToEnd(this.editorEl)

    this.bindListener(
      "inputBlur",
      this.editorEl,
      "blur",
      this.onBlur.bind(this)
    );

    this.bindListener(
      "inputInput",
      this.editorEl,
      "input",
      this.adjustGraphSize.bind(this)
    );

    this.bindListener(
      "outerClick",
      document as any,
      "click",
      this.outerClick.bind(this)
    );
  }

  private outerClick(e) {
    const el = this.editorEl;
    if (!e.target.contains(el)) {
      this.onHide();
    }
  }

  private onHide() {
    if (!this.item) return;
    this.unbindAllListeners();

    this.item.setState(ItemState.Editing, false);
    this.graph.off("wheel", this.adjustPosition);
    modifyCSS(this.wrapperEl, {
      visibility: "hidden",
    });
    this.item = null;
  }

  public destroy() {
    this.unbindAllListeners();
    this.container.removeChild(this.wrapperEl);
  }
}
