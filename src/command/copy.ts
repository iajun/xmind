import {
  Clipboard,
  createClipboardItem,
  CTRL_KEY,
} from "../utils";
import BaseCommand from "./base";

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
