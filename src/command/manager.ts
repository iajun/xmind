import { ICommand, Transaction, TransactionType } from "./../types";
import Graph from "../graph";
import { EditorEvent, GraphCommonEvent, ItemState } from "../constants";
import _ from "lodash";
import { isFired } from "../utils";

class CommandManager {
  command: {
    [propName: string]: ICommand;
  };
  commandQueue: ICommand[];
  commandIndex: number;
  private graph: Graph;
  private el: HTMLElement;
  private editorFocused = false;

  constructor(graph: Graph, commands?: Record<string, ICommand>) {
    this.graph = graph;
    this.command = commands || {};
    this.commandQueue = [];
    this.commandIndex = 0;

    this.bind();
  }

  /** 注册命令 */
  register(command: ICommand) {
    this.command[command.name] = command;
  }

  setWrapper(el: HTMLElement) {
    this.el = el;
  }

  disable() {
    this.editorFocused = false;
  }

  enable() {
    this.editorFocused = true;
  }

  handleTransactions(transactions: Transaction[]) {
    const graph = this.graph;

    graph.executeBatch(() => {
      transactions.forEach(transaction => {
        const {
          command,
          payload: { model, parentId, nextId }
        } = transaction;
        switch (command) {
          case TransactionType.REMOVE:
            graph.removeChild(model.id);
            break;
          case TransactionType.ADD:
            graph.placeNode(model, { parentId, nextId });
            graph.selectNode(model.id)
            break;
          case TransactionType.UPDATE:
            graph.updateItem(model.id, model);
            break;
        }
      });
    });
    graph.layout();
  }

  /** 执行命令 */
  execute(name: string, params?: object) {
    const Command = this.command[name];

    if (!Command) {
      return;
    }
    const Ctor = Command.constructor;

    const command = new (Ctor as any)(this.graph, this);

    if (!command.canExecute()) {
      return;
    }

    command.init(params);

    if (command.shouldExecute && !command.shouldExecute()) {
      return;
    }

    this.graph.emit(EditorEvent.onBeforeExecuteCommand, command);

    const transactions = command.execute();
    this.handleTransactions(transactions);

    this.graph.emit(EditorEvent.onAfterExecuteCommand, command);

    this.enable();

    if (command.canUndo()) {
      const { commandQueue, commandIndex } = this;

      commandQueue.splice(
        commandIndex,
        commandQueue.length - commandIndex,
        command
      );

      this.commandIndex += 1;
    }
  }

  private shouldTriggerShortcut(): Boolean {
    return this.editorFocused || !this.graph.isEditing;
  }

  get container() {
    return this.el || this.graph.get("container");
  }

  private mousedownListener(e: MouseEvent) {
    let parentNode = e.target.parentNode;
    while (parentNode && parentNode.nodeName !== "BODY") {
      if (parentNode === this.container) {
        this.editorFocused = true;
        return;
      } else {
        parentNode = parentNode.parentNode;
      }
    }
    this.editorFocused = false;
  }

  private bind() {
    const mousedownListener = this.mousedownListener.bind(this);

    window.addEventListener(GraphCommonEvent.onMouseDown, mousedownListener);

    this.graph.on(EditorEvent.onBeforeDestroy, () => {
      window.removeEventListener(
        GraphCommonEvent.onMouseDown,
        mousedownListener
      );
    });

    this.graph.on(GraphCommonEvent.onKeyDown, e => {
      if (!this.shouldTriggerShortcut()) return;
      // editing
      if (this.graph.findAllByState("node", ItemState.Editing).length) return;

      Object.values(this.command).some(command => {
        const { name, shortcuts } = command;

        if (isFired(shortcuts, e)) {
          e.preventDefault();

          this.execute(name);

          return true;
        }

        return false;
      });
    });
  }
}

export default CommandManager;
