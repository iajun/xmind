export enum ItemState {
  Active = 'active',
  ActiveAnchorPoints = 'activeAnchorPoints',
  Selected = 'selected',
  HighLight = 'highLight',
  Error = 'error',
}

export enum ItemType {
  Node = 'node',
  Edge = 'edge',
}

export enum NodeName {
  BaseNode = 'baseNode',
  XmindNode = 'xmindNode',
}

export enum EditorEvent {
  /** 调用命令之前触发 */
  onBeforeExecuteCommand = 'onBeforeExecuteCommand',
  /** 调用命令之后触发 */
  onAfterExecuteCommand = 'onAfterExecuteCommand',
  /** 改变画面状态触发 */
  onGraphStateChange = 'onGraphStateChange',
  /** 改变标签状态触发 */
  onLabelStateChange = 'onLabelStateChange',
}

export enum GraphState {
  NodeSelected = 'nodeSelected',
  EdgeSelected = 'edgeSelected',
  MultiSelected = 'multiSelected',
  CanvasSelected = 'canvasSelected',
}

export enum LabelState {
  Hide = 'hide',
  Show = 'show',
}