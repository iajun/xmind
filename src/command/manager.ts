import { ICommand } from "./../types";
import cloneDeep from "lodash/cloneDeep";
import Graph from "../graph";
import {
  EditorEvent,
  GraphCommonEvent,
  ItemState,
  RendererType,
} from "../constants";
import _ from "lodash";

class CommandManager {
  command: {
    [propName: string]: ICommand;
  };
  commandQueue: ICommand[];
  commandIndex: number;
  private graph: Graph;
  private el: HTMLElement;
  private lastMouseDownTarget: HTMLElement | null;

  constructor(graph: Graph, commands?: Record<string, ICommand>) {
    this.graph = graph;
    this.lastMouseDownTarget = null;
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
    const { lastMouseDownTarget: target, graph } = this;
    const renderer: RendererType = graph.get("renderer");
    const canvasElement = this.el || graph.get("canvas").get("el");

    if (!target) {
      return false;
    }

    if (target === canvasElement) {
      return true;
    }

    if (renderer === RendererType.Svg) {
      if (target.nodeName === "svg") {
        return true;
      }

      let parentNode = target.parentNode;

      while (parentNode && parentNode.nodeName !== "BODY") {
        if (parentNode.nodeName === "svg") {
          return true;
        } else {
          parentNode = parentNode.parentNode;
        }
      }
      return false;
    } else {
      let parentNode = target.parentNode;
      while (parentNode && parentNode.nodeName !== "BODY") {
        if (parentNode === canvasElement) {
          return true;
        } else {
          parentNode = parentNode.parentNode;
        }
      }

      return false;
    }
  }

  private bind() {
    const mousedownListener = (e) => {
      this.lastMouseDownTarget = e.target as HTMLElement;
    };
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

        const flag = shortcuts.some((shortcut: string | string[]) => {
          const { key } = e;

          if (!Array.isArray(shortcut)) {
            return shortcut === key;
          }

          const isMatched = shortcut.every((item, index) => {
            if (index === shortcut.length - 1) {
              return item === key;
            }

            return e[item];
          });

          // 不要按下其他按键
          if (isMatched) {
            return _.difference(
              ["metaKey", "shiftKey", "ctrlKey", "altKey"],
              shortcut
            ).every((item) => !e[item]);
          }
          return false;
        });

        if (flag) {
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
