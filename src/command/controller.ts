import { RendererType } from "./../constants";
import Graph from "../graph";
import CommandManager from "./manager";
import createCommandManager from "./create-manager";
import { GraphCommonEvent } from "../constants";
import _ from "lodash";

class CommandController {
  private graph: Graph;
  private manager: CommandManager;
  private lastMouseDownTarget: HTMLElement | null;

  constructor(graph: Graph) {
    this.graph = graph;
    this.manager = createCommandManager(graph);
    this.lastMouseDownTarget = null;
    this.bind();
  }

  execute(name: string, params: any) {
    this.manager.execute(name, params)
  }

  private shouldTriggerShortcut(): Boolean {
    const { lastMouseDownTarget: target, graph } = this;
    const renderer: RendererType = graph.get("renderer");
    const canvasElement = graph.get("canvas").get("el");

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
    }

    return false
  }

  private bind() {
    const { manager } = this;
    window.addEventListener(GraphCommonEvent.onMouseDown, (e) => {
      this.lastMouseDownTarget = e.target as HTMLElement;
    });

    this.graph.on(GraphCommonEvent.onKeyDown, (e) => {
      if (!this.shouldTriggerShortcut()) return;
      

      Object.values(manager.command).some((command) => {
        const { name, shortcuts } = command;

        const flag = shortcuts.some((shortcut: string | string[]) => {
          const { key } = e;
          
          if (!Array.isArray(shortcut)) {
            return shortcut === key;
          }

          const isMatched =  shortcut.every((item, index) => {
            if (index === shortcut.length - 1) {
              return item === key;
            }

            return e[item];
          });

          // 不要按下其他按键
          if (isMatched) {
            return _.difference(['metaKey', 'shiftKey', 'ctrlKey', 'altKey'],  shortcut).every(item => !e[item])
          }
          return false;
        });


        if (flag) {
          if (manager.canExecute(name)) {
            // Prevent default
            e.preventDefault();

            // Execute command
            this.manager.execute(name);

            return true;
          }
        }

        return false;
      });
    });
  }
}

export default CommandController