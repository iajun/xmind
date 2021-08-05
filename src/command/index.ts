import CommandController from "./controller";
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
import DragCommand from "./drag";
import DeleteCommand from "./remove";
import Graph from "../graph";

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
  DragCommand,
  DeleteCommand,
};

function createCommandManager(graph: Graph, keys?: string[]) {
  const manager = new CommandManager();

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
    new DragCommand(graph),
    new DeleteCommand(graph),
  ];
  if (keys) {
    commands = commands.filter((command) => keys.includes(command.name));
  }

  commands.forEach((command) => {
    manager.register(command);
  });

  return manager;
}

export { CommandController, CommandManager, createCommandManager };

export default commands;
