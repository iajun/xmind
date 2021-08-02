import CommandManager from "./manager";
import FoldCommand from "./fold";
import UnFoldCommand from "./unfold";
import UpdateCommand from "./update";
import Graph from "../graph";
import UndoCommand from "./undo";
import RedoCommand from "./redo";
import CopyCommand from "./copy";
import PasteCommand from "./paste";
import CutCommand from "./cut";
import TopicCommand from "./topic";
import SubTopicCommand from "./subTopic";

export default function createCommandManager(graph: Graph) {
  const manager = new CommandManager();
  const foldCommand = new FoldCommand(graph);
  const unfoldCommand = new UnFoldCommand(graph);
  const updateCommand = new UpdateCommand(graph);
  const undoCommand = new UndoCommand(graph, manager);
  const redoCommand = new RedoCommand(graph, manager);
  const copyCommand = new CopyCommand(graph);
  const pasteCommand = new PasteCommand(graph);
  const cutCommand = new CutCommand(graph);
  const topicCommand = new TopicCommand(graph);
  const subTopicCommand = new SubTopicCommand(graph);
  
  manager.register(foldCommand.name, foldCommand);
  manager.register(unfoldCommand.name, unfoldCommand);
  manager.register(undoCommand.name, undoCommand);
  manager.register(updateCommand.name, updateCommand);
  manager.register(redoCommand.name, redoCommand);
  manager.register(copyCommand.name, copyCommand);
  manager.register(pasteCommand.name, pasteCommand);
  manager.register(cutCommand.name, cutCommand);
  manager.register(topicCommand.name, topicCommand);
  manager.register(subTopicCommand.name, subTopicCommand);

  return manager;
}
