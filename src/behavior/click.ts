import { BehaviorOption } from '@antv/g6';
import { ItemState } from '../constants';
import Graph from '../graph';
import { Item } from '../types';

const ClickItemBehavior: BehaviorOption  = {
  getDefaultCfg () {
    return {
      multiple: true,
      keydown: false,
      keyCode: 17,
  } },

  getEvents() {
    return {
      'node:click': 'handleItemClick',
      'canvas:click': 'handleCanvasClick',
    };
  },

  handleItemClick({ item }: {item: Item}) {
    const graph = this.graph as Graph;

    const isSelected = item.hasState(ItemState.Selected);
    graph.clearSelectedState(selectedItem => selectedItem !== item)

    if (!isSelected) {
      graph.setItemState(item, ItemState.Selected, true)
    }
  },

  handleCanvasClick() {
    const graph = this.graph as Graph;
    graph.clearSelectedState();
  },
};

export default ClickItemBehavior;