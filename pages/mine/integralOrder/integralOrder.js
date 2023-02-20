//index.js
//获取应用实例
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
const app = getApp()

var totalpage;
Page({
  data: {
    currentTab: 0,
    dataList: [],//数据列表
    curpage: 1,
    type: 1,//1订单是商城采购2求购大厅
    swiperStatus:false,
    filterDataStatus:false,
    sortTab:0 ,//筛选 1: 待处理优先,2: 时间排序, 3: 数量排序,4: 价格排序
    sortRule:1,
    itemList: [1, 2, 3,4,5],
    height:'',//设置scroll-view的高度
    emptyPage:false,//空页面的时候显示
    pageSize:20
    // allShow:'',//全部显示

  },

  

  //下拉刷新
  onReachBottom() {

    if (Number(this.data.curpage - 1) * Number(this.data.pageSize) <= totalpage) {
      this.getDateList();
    } 
  },


  onLoad: function (options) {
    app.globalData.filterData=''
    console.log('订单页面====');
    console.log(options);
    let self = this;
    // 动态获取scroll-view的高度
    
    wx.getSystemInfo({
      success: function (res) {
        wx.createSelectorQuery().select('.swiper-tab').boundingClientRect(function (rect) {
          var is_1_height = Number(rect.height) // 节点的宽度
          self.setData({
            height: is_1_height
          });
        }).exec();
      }
    });

    this.getDateList();
  },

  onShow: function (){
    if (!this.data.filterDataStatus){
      this.setData({
        filterDataStatus:true
      })
      return
    }else{
      this.setData({
        curpage: 1,
        dataList:[]
      })
      this.getDateList()
    }
  },


  //获取数据
  getDateList() {
    let self = this;
    let userInfo = JSON.parse(wx.getStorageSync('userInfo'));
    let roleCode = userInfo.user.auths.roleCode;
    let userCode = userInfo.user.userCode;
    let companyCode = userInfo.user.auths.companyCode;
    let data = {};
    data={
      pageNum: self.data.curpage,
      pageSize: self.data.pageSize,
      state: Number(this.data.currentTab) == 0 ? '':Number(this.data.currentTab)
    }
    
    util.post(api.integral_order_list, data, res => {
      
      let productList = res.returnObject.list;
      let datas = self.data.dataList

      productList.forEach(function (item) {
        item.more = false
      })

      totalpage = res.returnObject.total;

      self.setData({
        ['dataList[' + self.data.curpage + ']']: productList,
        curpage: self.data.curpage + 1
      })

      if (self.data.dataList[1].length == 0) {
        self.setData({
          emptyPage: true
        })
      }

      wx.stopPullDownRefresh()
    }, {
        loading: true
      }, fail => {
      })

  },

  clickTab(e) {
    let self = this,
      current = e.currentTarget.dataset.current;
    
      // wx.pageScrollTo({
      //   scrollTop: 0
      // })
  

    if (self.data.currentTab === current) {
      return false;
    } else {
      self.setData({
        currentTab: current,
      })
    }
    self.initGetData();
  },


  //初始化数据
  initGetData() {
    let self = this;
    app.globalData.filterData = ''
    self.data.curpage = 1;
    self.setData({
      dataList: [],
      emptyPage:false
    })
    self.getDateList();
  },

//  展示全部内容
 showBtn(e){
   let self = this;
   let listidx = e.currentTarget.dataset.listidx;
   let dataList = this.data.dataList

   if (dataList[self.data.curpage-1][listidx].more == true) {
     dataList[self.data.curpage-1][listidx].more =false
     this.setData({
       dataList: dataList
     })
   } else {
     dataList[self.data.curpage-1][listidx].more = true
     this.setData({
       dataList: dataList
     })
   }

 },

  goto(e) {
    // util.goto(e);
  },

})