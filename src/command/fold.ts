import { getSelectedNodes } from '@/utils';
import { baseCommand, BaseCommand } from './base';

export interface FoldCommandParams {
  id: string;
}

const foldCommand: BaseCommand<FoldCommandParams> = {
  ...baseCommand,

  params: {
    id: ''
  },

  canExecute(graph) {
    const selectedNodes = this.getSelectedNodes()
  }
}