import "./style.css";
import { createGraph } from "./createGraph";
import Model from "./model";

export {createGraph, setGlobalOptions} from './createGraph'
export default createGraph
import list from './data'

createGraph({
  data: new Model(list).data,
  container: 'xmind',
  width: 1000,
  height: 400
})