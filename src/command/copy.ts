import { TreeGraphData } from "../types";
import {
  Clipboard,
  createClipboardItem,
  CTRL_KEY,
} from "../utils";
import BaseCommand from "./base";

export interface CutCommandParams {
  id: string;
  parentId: string;
  nextId: string | null;
  model: TreeGraphData;
}

class CopyCommand extends BaseCommand {
  name = "copy";
  shortcuts = [[CTRL_KEY, "c"]];

  init() {}

  canUndo() {
    return false;
  }

  execute() {
    Clipboard.set(createClipboardItem(this.target));
    return super.execute();
  }
}

export default CopyCommand;
