import { ICommand } from "./../types";
import cloneDeep from "lodash/cloneDeep";
import Graph from "../graph";
import {
  EditorEvent,
  GraphCommonEvent,
  ItemState,
} from "../constants";
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
  private editorFocused = false

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

  /** 执行命令 */
  execute(name: string, params?: object) {
    const Command = this.command[name];

    if (!Command) {
      return;
    }

    const command = Object.create(Command);

    command.params = cloneDeep(Command.params);

    if (params) {
      command.params = {
        ...command.params,
        ...params,
      };
    }

    if (!command.canExecute()) {
      return;
    }

    command.init();

    if (command.shouldExecute && !command.shouldExecute()) {
      return;
    }

    this.graph.emit(EditorEvent.onBeforeExecuteCommand, command);

    command.execute();

    this.graph.emit(EditorEvent.onAfterExecuteCommand, command);

    this.enable()

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
    return this.editorFocused || !this.graph.isEditing
  }

  get container() {
    return this.el || this.graph.get('container');
  }

  private mousedownListener (e)  {
    let parentNode = e.target.parentNode;
    while (parentNode && parentNode.nodeName !== 'BODY') {
      if (parentNode === this.container) {
        this.editorFocused = true;
        return;
      } else {
        parentNode = parentNode.parentNode;
      }
    }
    this.editorFocused = false;
  };

  private bind() {
    const mousedownListener = this.mousedownListener.bind(this)

    window.addEventListener(GraphCommonEvent.onMouseDown, mousedownListener);

    this.graph.on(EditorEvent.onBeforeDestroy, () => {
      window.removeEventListener(
        GraphCommonEvent.onMouseDown,
        mousedownListener
      );
    });

    this.graph.on(GraphCommonEvent.onKeyDown, (e) => {
      if (!this.shouldTriggerShortcut()) return;
      // editing
      if (this.graph.findAllByState("node", ItemState.Editing).length) return;

      Object.values(this.command).some((command) => {
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
