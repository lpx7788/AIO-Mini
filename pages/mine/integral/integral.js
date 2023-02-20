// pages/mine/integral/integral.js
const app = getApp()
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
let totalpage;
Page({

  data: {
    swiperList:[1,2],
    currentTab:0,//0全部  1可兑换
    curpage:1,//当前页面
    itegralList:[],//数据列表
    swiperStatus:false,
    aboutToIntegral:'',//即将获得积分
    availableIntegral:'',//可用积分
    beenusedIntegral:'',//已用积分
    menuFixed:'',//导航吸顶
    menuTop:'',//导航到顶部的距离
    emptyPage:false,
    tabHeight:'',//顶部浮动填补空缺
    pageSize:20,
    pageHeight:''
  },

  onLoad: function (options) {
    let self = this;
    this.getItegralList(); 
  },

  onShow(){
    var self = this;
    wx.getSystemInfo({
      success(systemMsg) {
        var query = wx.createSelectorQuery()
        query.select('.swiperTab').boundingClientRect()
          query.exec(function (res) { 
            self.setData({
              menuTop: res[0].top,
              tabHeight: res[0].height,
              pageHeight: systemMsg.windowHeight + res[0].top 
            })
        });
      }
    })
  },

//检测页面滚动
  onPageScroll: function (scroll) {
    let self = this;
    if (self.data.menuFixed === (scroll.scrollTop > self.data.menuTop)) return;
    self.setData({
      menuFixed: (scroll.scrollTop > self.data.menuTop)
    })
  },


  // 点击
  clickTab(e) {
    let self = this,
      current = e.currentTarget.dataset.current;
    this.setData({
      swiperStatus: true,
      emptyPage: false
    })
    //切换数据页面滚动到最顶部
    if (self.data.menuFixed) {
      wx.pageScrollTo({
        scrollTop: self.data.menuTop
      })
    }
   
    if (self.data.currentTab === current) {
      return false;
    } else {
      self.setData({
        currentTab: current,
        curpage: 1,
        itegralList: []
      })
      this.getItegralList();
    }
  },

  //触底
  onReachBottom: function () {
    if (Number(this.data.curpage - 1) * Number(this.data.pageSize) <= totalpage) {
      this.getItegralList();
    }
  },


 //获取兑换列表
  getItegralList(){
    let self = this;
    util.post(api.integral_exchange_list, {
      pageNum: self.data.curpage,
      pageSize: self.data.pageSize,
      state: Number(self.data.currentTab) +1
    }, res => {
    
      let productList = res.returnObject.list;
      let datas = self.data.itegralList
      totalpage = res.returnObject.total;

      self.setData({
        ['itegralList[' + self.data.curpage + ']']: productList,
        aboutToIntegral: res.returnObject.aboutToIntegral,//即将获得积分
        availableIntegral: res.returnObject.availableIntegral,//可用积分
        beenusedIntegral: res.returnObject.beenusedIntegral,//已用积分
        curpage: self.data.curpage + 1
      })
     //没有数据的时候
      if (this.data.itegralList[1].length==0) {
        self.setData({
          emptyPage: true
        })
      }
   
    }, {
        loading: true
      }, fail => {
        self.setData({
          itegralList: []
        })
      })

  },

  goto: function (e) {
    util.goto(e);
  },

 
})