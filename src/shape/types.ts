import { ModelConfig, ShapeStyle } from "@antv/g6";
import { TextRendererConfig } from "./text";

export type LabelStyle = ShapeStyle & TextRendererConfig

export type NodeConfig = ModelConfig & {
  shapeType: 'line' | 'rect',
  labelStyle?: LabelStyle;
  wrapperStyle?: ShapeStyle;
  padding?: number | number[];
  render?: (model: ModelConfig) => ModelConfig
};
