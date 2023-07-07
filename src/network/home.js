import {request} from "./request";

export function getHomeMultidata(){
  return request({
    url : '/home/multidata'
  })
}
export function getHomeGoods(type,page){
  return request({
    url : 'http://123.207.32.32:7888/api/hy66/home/data',
    params :{
      type,
      page
    }
  })
}