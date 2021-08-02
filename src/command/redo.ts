import Graph from '../graph';
import { ICommand } from '../types';
import CommandManager from './manager';

class redoCommand implements ICommand<{}> {
  private manager: CommandManager;
  private graph: Graph;

  name = 'redo'

  params= {}

  shortcuts= [
    ['metaKey', 'shiftKey', 'z'],
    ['ctrlKey', 'shiftKey', 'z'],
  ]

  constructor(graph: Graph, manager: CommandManager) {
    this.manager = manager;
    this.graph = graph;
  }

  init(): void {
  }

  canExecute() {
    const { commandIndex, commandQueue } = this.manager;

    return commandIndex < commandQueue.length ;
  }

  shouldExecute() {
    return true;
  }

  canUndo() {
    return false;
  }


  execute() {
    const {manager} = this;
    const { commandQueue, commandIndex } = manager;

    const command  = commandQueue[commandIndex];
    
    if (command && command.params.id) {
      const id = command.params.id;
      this.graph.setSelectedItems([id])
      this.graph.focusItem(id, true);
    }

    command.execute();

    manager.commandIndex += 1;
  }

  undo() {}

};

export default redoCommand;
