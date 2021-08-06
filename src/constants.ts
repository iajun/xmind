export enum ItemState {
  Selected = 'selected',
  Editing = 'editing',
  ViewingRemark = 'view-remark'
}

export enum ItemType {
  Node = 'node',
  Edge = 'edge',
}

export enum NodeName {
  BaseNode = 'baseNode',
  BaseNodeText = 'baseNodeText',
  XmindNode = 'xmindNode',
  Remark = 'xmindNodeRemark',
}

export enum EditorEvent {
  /** 调用命令之前触发 */
  onBeforeExecuteCommand = 'onBeforeExecuteCommand',
  /** 调用命令之后触发 */
  onAfterExecuteCommand = 'onAfterExecuteCommand',
  /** 改变画面状态触发 */
  onGraphStateChange = 'onGraphStateChange',
  /** 改变标签状态触发 */
  onBeforeDestroy = 'onBeforeDestroy'
}

export enum GraphState {
  NodeSelected = 'nodeSelected',
  EdgeSelected = 'edgeSelected',
  MultiSelected = 'multiSelected',
  CanvasSelected = 'canvasSelected',
}

export enum GraphNodeEvent {
  /** 鼠标左键单击节点时触发 */
  onNodeClick = 'node:click',
  /** 鼠标双击左键节点时触发 */
  onNodeDoubleClick = 'node:dblclick',
  /** 鼠标移入节点时触发 */
  onNodeMouseEnter = 'node:mouseenter',
  /** 鼠标在节点内部移到时不断触发，不能通过键盘触发 */
  onNodeMouseMove = 'node:mousemove',
  /** 鼠标移出节点后触发 */
  onNodeMouseOut = 'node:mouseout',
  /** 鼠标移入节点上方时触发 */
  onNodeMouseOver = 'node:mouseover',
  /** 鼠标移出节点时触发 */
  onNodeMouseLeave = 'node:mouseleave',
  /** 鼠标按钮在节点上按下（左键或者右键）时触发，不能通过键盘触发 */
  onNodeMouseDown = 'node:mousedown',
  /** 节点上按下的鼠标按钮被释放弹起时触发，不能通过键盘触发 */
  onNodeMouseUp = 'node:mouseup',
  /** 用户在节点上右击鼠标时触发并打开右键菜单 */
  onNodeContextMenu = 'node:contextmenu',
  /** 当节点开始被拖拽的时候触发的事件，此事件作用在被拖曳节点上 */
  onNodeDragStart = 'node:dragstart',
  /** 当节点在拖动过程中时触发的事件，此事件作用于被拖拽节点上 */
  onNodeDrag = 'node:drag',
  /** 当拖拽完成后触发的事件，此事件作用在被拖曳节点上 */
  onNodeDragEnd = 'node:dragend',
  /** 当拖曳节点进入目标元素的时候触发的事件，此事件作用在目标元素上 */
  onNodeDragEnter = 'node:dragenter',
  /** 当拖曳节点离开目标元素的时候触发的事件，此事件作用在目标元素上 */
  onNodeDragLeave = 'node:dragleave',
  /** 被拖拽的节点在目标元素上同时鼠标放开触发的事件，此事件作用在目标元素上 */
  onNodeDrop = 'node:drop',
  onNodeEdit = 'node:edit'
}


export enum GraphCommonEvent {
  /** 单击鼠标左键或者按下回车键时触发 */
  onClick = 'click',
  /** 双击鼠标左键时触发 */
  onDoubleClick = 'dblclick',
  /** 鼠标移入元素范围内触发，该事件不冒泡，即鼠标移到其后代元素上时不会触发 */
  onMouseEnter = 'mouseenter',
  /** 鼠标在元素内部移到时不断触发，不能通过键盘触发 */
  onMouseMove = 'mousemove',
  /** 鼠标移出目标元素后触发 */
  onMouseOut = 'mouseout',
  /** 鼠标移入目标元素上方，鼠标移到其后代元素上时会触发 */
  onMouseOver = 'mouseover',
  /** 鼠标移出元素范围时触发，该事件不冒泡，即鼠标移到其后代元素时不会触发 */
  onMouseLeave = 'mouseleave',
  /** 鼠标按钮被按下（左键或者右键）时触发，不能通过键盘触发 */
  onMouseDown = 'mousedown',
  /** 鼠标按钮被释放弹起时触发，不能通过键盘触发 */
  onMouseUp = 'mouseup',
  /** 用户右击鼠标时触发并打开上下文菜单 */
  onContextMenu = 'contextmenu',
  /** 当拖拽元素开始被拖拽的时候触发的事件，此事件作用在被拖曳元素上 */
  onDragStart = 'dragstart',
  /** 当拖拽元素在拖动过程中时触发的事件，此事件作用于被拖拽元素上 */
  onDrag = 'drag',
  /** 当拖拽完成后触发的事件，此事件作用在被拖曳元素上 */
  onDragEnd = 'dragend',
  /** 当拖曳元素进入目标元素的时候触发的事件，此事件作用在目标元素上 */
  onDragEnter = 'dragenter',
  /** 当拖曳元素离开目标元素的时候触发的事件，此事件作用在目标元素上 */
  onDragLeave = 'dragleave',
  /** 被拖拽的元素在目标元素上同时鼠标放开触发的事件，此事件作用在目标元素上 */
  onDrop = 'drop',
  /** 按下键盘键触发该事件 */
  onKeyDown = 'keydown',
  /** 释放键盘键触发该事件 */
  onKeyUp = 'keyup',
  /** 当手指触摸屏幕时候触发，即使已经有一个手指放在屏幕上也会触发 */
  onTouchStart = 'touchstart',
  /** 当手指在屏幕上滑动的时候连续地触发。在这个事件发生期间，调用 preventDefault() 事件可以阻止滚动。 */
  onTouchMove = 'touchmove',
  /** 当手指从屏幕上离开的时候触发 */
  onTouchEnd = 'touchend',
}


export enum RendererType {
  Canvas = 'canvas',
  Svg = 'svg',
}
