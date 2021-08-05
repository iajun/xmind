import { ICommand } from './../types';
import cloneDeep from 'lodash/cloneDeep';

class CommandManager {
  command: {
    [propName: string]: ICommand;
  };
  commandQueue: ICommand[];
  commandIndex: number;

  constructor() {
    this.command = {};
    this.commandQueue = [];
    this.commandIndex = 0;
  }

  /** 注册命令 */
  register(command: ICommand) {
    this.command[command.name] = command;
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

    command.execute();

    if (command.canUndo()) {
      const { commandQueue, commandIndex } = this;

      commandQueue.splice(commandIndex, commandQueue.length - commandIndex, command);

      this.commandIndex += 1;
    }
  }

  canExecute(name: string) {
    return this.command[name].canExecute();
  }
}

export default CommandManager;
