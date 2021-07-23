class Node {
  public id: string;
  public type: string;
  public label: string;
  public level: number;
  public nextId: string | null;
  public parentId: string | null;

  constructor(
    id: string,
    type: string,
    label: string,
    level: number,
    nextId: string | null,
    parentId: string | null
  ) {
    this.id = id;
    this.type = type;
    this.label = label;
    this.level = level;
    this.nextId = nextId;
    this.parentId = parentId;
  }
}

export default Node;
