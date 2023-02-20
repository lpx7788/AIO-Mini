// pages/mine/integral/integral.js
const app = getApp()
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
let totalpage;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperList:[1,2,3],
    currentTab:0,//0全部  1可兑换
    curpage:1,//当前页面
    itegralList:[],//数据列表
    swiperStatus:false,
    aboutToIntegral:'',//即将获得积分
    availableIntegral:'',//可用积分
    beenusedIntegral:'',//已用积分
    menuFixed: '',//导航吸顶
    menuTop: '',//导航到顶部的距离
    emptyPage:false,
    width:'', 
    pageSize:10, 
    pageHeight:''
  },

  onLoad: function (options) {
    console.log('傳過來的数据==');
    console.log(options);
    let self = this;
    let aboutToIntegral=  '';//即将获得积分
    let availableIntegral='';//可用积分
    let beenusedIntegral= '';//已用积分

    if (options.beenusedIntegral){
      beenusedIntegral = options.beenusedIntegral
    }
    if (options.availableIntegral){
      availableIntegral = options.availableIntegral
    }
    if (options.aboutToIntegral){
      aboutToIntegral = options.aboutToIntegral
    }

   self.setData({
     beenusedIntegral: beenusedIntegral, 
     availableIntegral: availableIntegral, 
     aboutToIntegral: aboutToIntegral, 
   })
    this.getItegralDetail(); 

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
      this.getItegralDetail();
    }
  },

  onShow() {
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

  //触底
  onReachBottom: function () {
    if (Number(this.data.curpage - 1) * Number(this.data.pageSize) <= totalpage) {
      this.getItegralDetail();
    }
  },

//  用户积分明细
  getItegralDetail(){
    let self = this;
    util.post(api.integral_detail, {
      pageNum: self.data.curpage,
      pageSize: self.data.pageSize,
      state: Number(self.data.currentTab) +1
    }, res => {
      let productList = res.returnObject.integrals;
      let datas = self.data.itegralList
      totalpage = res.returnObject.total;

      self.setData({
        ['itegralList[' + self.data.curpage + ']']: productList,
        curpage: self.data.curpage + 1
      })

      if (this.data.itegralList[1].length == 0){
        self.setData({
          emptyPage:true
        })
      }
    }, {
        loading: true
      }, fail => {

      })

  },


  goto: function (e) {
    util.goto(e);
  },

  // 分享
  onShareAppMessage: function () {}
})