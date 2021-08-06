import list from './data'
import Model from "./model";
import createGraph from './index'

createGraph({
  data: new Model(list as any).data,
  container: 'xmind',
  width: 1000,
  height: 400,
})