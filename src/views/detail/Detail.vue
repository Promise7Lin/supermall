<template>
<div id="detail">
  <detail-nav-bar @titleClick="titleClick" class="detail-nav" ref="nav"></detail-nav-bar>
  <scroll class="content" ref="scroll" :probe-type="3" @scroll="contentScroll">
    <detail-swiper :top-images="topImages"></detail-swiper>
    <detail-base-info :goods="goods"></detail-base-info>
    <detail-shop-info :shop="shop"></detail-shop-info>
    <detail-goods-info :detail-info="detailInfo" @imageLoad="imageLoad"></detail-goods-info>
    <detail-param-info :param-info="paramInfo" ref="param"></detail-param-info>
    <detail-comment-info :comment-info="commentInfo" ref="comment"></detail-comment-info>
    <goods-list :goods="recommends" ref="recommend"></goods-list>
  </scroll>
  <detail-bottom-bar @addCart="addToCart"/>
  <back-top @click.native="backClick" v-show="isShowBackTop"/>
</div>
 
</template>


<script>
import DetailNavBar from './childComps/DetailNavBar'
import DetailSwiper from './childComps/DetailSwiper'
import DetailBaseInfo from './childComps/DetailBaseInfo'
import DetailShopInfo from './childComps/DetailShopInfo'
import DetailGoodsInfo from './childComps/DetailGoodsInfo'
import DetailParamInfo from './childComps/DetailParamInfo'
import DetailCommentInfo from './childComps/DetailCommentInfo'
import DetailBottomBar from './childComps/DetailBottomBar'

import Scroll from 'components/common/scroll/Scroll'
import GoodsList from 'components/content/goods/GoodsList'
import BackTop from 'components/content/backTop/BackTop';

import {getDetail,Goods,Shop,GoodsParam,getRecommend} from 'network/detail'

export default {
  components: {
    DetailNavBar,
    DetailSwiper,
    DetailBaseInfo,
    DetailShopInfo,
    DetailGoodsInfo,
    DetailParamInfo,
    DetailCommentInfo,
    DetailBottomBar,
    Scroll,
    GoodsList,
    BackTop
  },
  name: "Detail",
  data(){
    return{
      iid:null,
      topImages:[],
      goods:{},
      shop:{},
      detailInfo:{},
      paramInfo:{},
      commentInfo:{},
      recommends:[],
      themeTopYs:[0,1000,2000,3000],
      currentIndex:0,
      isShowBackTop: true
    }
  },
  created(){
    //console.log(this.$route.params);
    //1.保存传入的id
    this.iid = this.$route.params.iid

    //2.根据iid请求详情数据
    getDetail(this.iid).then(res => {
      //1.获取顶部的图片轮播数据
      //console.log(res);
      const data = res.result;
      this.topImages = data.itemInfo.topImages
      //2.获取商品信息
      this.goods = new Goods(data.itemInfo,data.columns,data.shopInfo.services)
      //3.创建店铺信息的对象
      this.shop = new Shop(data.shopInfo)
      //4.保存商品的详情数据
      this.detailInfo = data.detailInfo;
      //5.获取参数信息
      this.paramInfo = new GoodsParam(data.itemParams.info,data.itemParams.rule)
      //6.取出评论信息
      if(data.rate.cRate !== 0){
        this.commentInfo =data.rate.list[0]
      }
      // this.$nextTick(() => {
        
      // })
    //3.请求推荐数据
     getRecommend().then(res => {
      // console.log(res);
      this.recommends = res.data.list
     })
    })
  },
  methods:{
    imageLoad(){
      this.$refs.scroll.refresh();

      this.themeTopYs = []
        this.themeTopYs.push(0)
        this.themeTopYs.push(this.$refs.param.$el.offsetTop)
        this.themeTopYs.push(this.$refs.comment.$el.offsetTop)
        this.themeTopYs.push(this.$refs.recommend.$el.offsetTop)
        console.log(this.themeTopYs);
    },
    titleClick(index){
      // console.log(index);
      this.$refs.scroll.scrollTo(0,-this.themeTopYs[index],200)
    },
    contentScroll(position){
      //获取y值
      const positionY = -position.y
      //2.positionY和主题中的值进行对比
      let length = this.themeTopYs.length
      for(let i=0;i<length;i++){
        if(this.currentIndex !== i && ((i<length-1 && positionY>=this.themeTopYs[i] && positionY<this.themeTopYs[i+1]) || 
          (i===length-1 && positionY >=this.themeTopYs[i]))){
            this.currentIndex = i
            this.$refs.nav.currentIndex = this.currentIndex
          }
      }
      //3.判断BackTop是否显示
      this.isShowBackTop = (-position.y) > 1000
    },
    backClick(){
      this.$refs.scroll.scrollTo(0,0,500)
    },
    addToCart(){
      //1.获取购物车需要展示的商品信息
      const product = {}
      product.image = this.topImages[0];
      product.title = this.goods.title;
      product.desc = this.goods.desc;
      product.price = this.goods.newPrice;
      product.iid = this.iid
    }
  }
}

</script>


<style scoped>
#detail{
  position: relative;
  z-index: 9;
  background-color: #fff;
  height: 100vh;
}
.detail-nav{
  position: relative;
  z-index: 9;
  background-color: #fff;
}
.content{
  height: calc(100% - 44px - 58px);
}

</style>