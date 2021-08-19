import CommandManager from "./manager";
import FoldCommand from "./fold";
import UnFoldCommand from "./unfold";
import UpdateCommand from "./update";
import UndoCommand from "./undo";
import RedoCommand from "./redo";
import CopyCommand from "./copy";
import PasteCommand from "./paste";
import CutCommand from "./cut";
import TopicCommand from "./topic";
import SubTopicCommand from "./subTopic";
import DeleteCommand from "./remove";
import MoveUpCommand from './moveUp'
import MoveDownCommand from './moveDown'
import MoveLeftCommand from './moveLeft'
import MoveRightCommand from './moveRight'
import DragCommand from './dragNode'
import Graph from "../graph";
import { ICommand } from "../types";

const commands = {
  FoldCommand,
  UnFoldCommand,
  UpdateCommand,
  UndoCommand,
  RedoCommand,
  CopyCommand,
  PasteCommand,
  CutCommand,
  TopicCommand,
  SubTopicCommand,
  DeleteCommand,
};

export type CommandOption = {
  name: string;
  enabled?: boolean;
  shouldExecute?: (item: Node) => void;
};

function createCommandManager(graph: Graph, commandOptions?: CommandOption[]) {
  const manager = new CommandManager(graph);

  let commands = [
    new FoldCommand(graph),
    new UnFoldCommand(graph),
    new UpdateCommand(graph),
    new UndoCommand(graph, manager),
    new RedoCommand(graph, manager),
    new CopyCommand(graph),
    new PasteCommand(graph),
    new CutCommand(graph),
    new TopicCommand(graph),
    new SubTopicCommand(graph),
    new DeleteCommand(graph),
    new MoveUpCommand(graph),
    new MoveDownCommand(graph),
    new MoveLeftCommand(graph),
    new MoveRightCommand(graph),
    new DragCommand(graph),
  ];

  let resolvedCommands: ICommand<any>[] = [];

  if (!commandOptions) {
    resolvedCommands = commands;
  } else {
    commands.forEach(command => {
      const option = commandOptions.find(option => option.name === command.name);
      if (!option) {
        resolvedCommands.push(command)
      } else {
        if (option.enabled ===  false) return;
        (command as any).shouldExecute = option.shouldExecute.bind(command);
        resolvedCommands.push(command)
      }
    })
  }

  resolvedCommands.forEach((command) => {
    manager.register(command);
  });

  return manager;
}

export { CommandManager, createCommandManager };

export default commands;
