export type Node = {
  id: string;
  label: string;
  nextId: string | null;
  parentId: string | null;
  [key: string]: any;
};

export type NodeType = "root" | "sub" | "leaf";
