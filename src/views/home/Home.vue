<template>
  <div id="home">
    <nav-bar class="home-nav">
      <div slot="center">购物街</div>
    </nav-bar>
    <tab-control 
    :titles="['流行', '新款', '精选']"
    @tabClick="tabClick"
    ref="tabControl1"
    class="tab-control"
    v-show = isTabFixed />
    <scroll class="content" 
    ref="scroll" 
    :probe-type="3" 
    @scroll="contentScroll"
    :pull-up-load="true"
    @pullingUp="loadMore">
      <home-swiper :banners="banners" @swiperImageLoad="swiperImageLoad"></home-swiper>
    <recommend-view :recommends="recommends"></recommend-view>
    <feature-view />
    <tab-control 
    :titles="['流行', '新款', '精选']"
    @tabClick="tabClick"
    ref="tabControl2" />
    <goods-list :goods="showGoods"/>
    </scroll>
    <back-top @click.native="backClick" v-show="isShowBackTop"/>
  </div>
</template>

<script>
import NavBar from 'components/common/navbar/NavBar';
import Scroll from 'components/common/scroll/Scroll';
import TabControl from 'components/content/tabControl/TabControl';
import GoodsList from 'components/content/goods/GoodsList';
import BackTop from 'components/content/backTop/BackTop';

import HomeSwiper from './childComps/HomeSwiper';
import RecommendView from './childComps/RecommendView';
import FeatureView from './childComps/FeatureView.vue';


import { getHomeMultidata, getHomeGoods } from "network/home";

import { debounce } from '@/components/common/utils';

export default {
  name: "Home",
  components: {
    NavBar,
    Scroll,
    TabControl,
    GoodsList,
    BackTop,
    HomeSwiper,
    RecommendView,
    FeatureView

  },
  data() {
    return {
      //result : null
      banners: [],
      recommends: [],
      goods: {
        'pop': { page: 0, list: [] },
        'new': { page: 0, list: [] },
        'sell': { page: 0, list: [] },
      },
      currentType: 'pop',
      isShowBackTop: true,
      tabOffsetTop: 0,
      isTabFixed: false,
      saveY: 0
    }
  },
  computed:{
    showGoods(){
      return this.goods[this.currentType].list
    },
    activated(){
      this.$refs.scroll.scrollTo(0,this.saveY,0)
      this.$refs.scroll.refresh()

      this.iid = this.$route.query.iid
    },
    deactivated(){
      this.saveY = this.$refs.scroll.getScrollY()
    }
  },
  created() {
    //1.请求多个数据
    this.getHomeMultidata();
    //2.请求商品数据
    this.getHomeGoods('pop');
    this.getHomeGoods('new');
    this.getHomeGoods('sell');
  },
  mounted(){
    //1.监听item中图片加载完成
    const refresh = debounce(this.$refs.scroll && this.$refs.scroll.refresh)
    this.$bus.$on('itemImageLoad',() => {
      refresh()
    })
    //2.获取tabControl的offsetTop
    
  },
  methods: {
    //事件监听方法
    tabClick(index){
      switch (index) {
        case 0:
          this.currentType = 'pop'
          break
        case 1:
          this.currentType = 'new'
          break
        case 2:
          this.currentType = 'sell'
          break
      }
      this.$refs.tabControl1.currentIndex = index;
      this.$refs.tabControl2.currentIndex = index;
    },
    backClick(){
      this.$refs.scroll.scrollTo(0,0,500)
    },
    contentScroll(position){
      // console.log(position);
      //1.判断BackTop是否显示
      this.isShowBackTop = (-position.y) > 1000
      //2.决定tabControl是否吸顶（position：fixed）
      this.isTabFixed = (-position.y) > this.tabOffsetTop
    },
    loadMore(){
      //console.log('上拉加载更多');
      this.getHomeGoods(this.currentType)
      
    },
    swiperImageLoad(){
      this.tabOffsetTop = this.$refs.tabControl2.$el.offsetTop; 
    },
    //网络请求方法
    getHomeMultidata() {
      getHomeMultidata().then(res => {
        //console.log(res);
        //this.result = res;
        this.banners = res.data.banner.list;
        this.recommends = res.data.recommend.list;
      })
    },
    getHomeGoods(type) {
      const page = this.goods[type].page + 1
      getHomeGoods(type, page).then(res => {
        //console.log(res);
        this.goods[type].list.push(...res.data.list);
        this.goods[type].page += 1;

        //this.$refs.scroll.finishPullUp()
      })
    }
  }
}

</script>

<style scoped>
.home-nav {
  background-color: var(--color-tint);
  color: #fff;
  /* 在使用浏览器原生滚动，为了不让导航跟随着一起滚动才设置的样式 */
  /* position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 9; */
}

#home {
  /* padding-top: 44px; */
  height: 100vh;
  position: relative;
}


.content{
  overflow: hidden;
  height: calc(100% - 93px);
  /* margin-top: 44px; */
}


.tab-control{
  position: relative;
  z-index: 9;
}
</style>
