import { ModelConfig, ShapeStyle } from "@antv/g6";

export type LabelStyle = ShapeStyle & {
  lineHeight: number;
  maxWidth: number
  fontFamily?: string
}

export type NodeConfig = ModelConfig & {
  shapeType: 'line' | 'rect',
  labelStyle?: LabelStyle;
  wrapperStyle?: ShapeStyle;
  padding?: number | number[];
};
