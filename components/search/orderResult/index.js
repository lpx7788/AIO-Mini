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
    type: '',//1订单是商城采购2求购大厅
    swiperStatus:false,
    pageStatus:false,
    sortTab:0 ,//筛选 1: 待处理优先,2: 时间排序, 3: 数量排序,4: 价格排序
    sortRule:1,
    itemList: [1, 2, 3],
    tabHeight:'',//设置scroll-view的高度,
  
  },

  


  //下拉刷新
  onPullDownRefresh() {
    this.setData({
      curpage: 1,
      dataList: []
    })
    this.getDateList();
  },

  onLoad: function (options) {
    app.globalData.filterData=''
    console.log('订单页面====');
    console.log(options);
    let self = this;
    // 动态获取scroll-view的高度
    wx.getSystemInfo({
      success: function (res) {
        wx.createSelectorQuery().select('.orderMainPage').boundingClientRect(function (rect) {
          var is_1_height = Number(rect.height) // 节点的宽度
          self.setData({
            height: Number(res.windowHeight) - is_1_height
          });
        }).exec();
      }
    });

    if (options.type){
      this.setData({
        type: options.type
      })
    }
    
    if (options.keyStyle){
      this.setData({
        currentTab: options.keyStyle
      })
    }

    wx.setNavigationBarTitle({
      title: '订单搜索'
    })
    let keyword = this.data.keyword
    if (!keyword) {
      return
    }

  },

  onShow: function (){
    let self = this;
    if (!self.data.pageStatus){
      self.setData({
        pageStatus:true
      })

      var query = wx.createSelectorQuery()
      query.select('.orderSearch ').boundingClientRect()
      query.exec(function (res) {
        self.setData({
          tabHeight: res[0].height
        })

      


      });
      return
    }else{

    }
  },

  refresh() {
    let currentTab = this.data.currentTab;
  },

  //搜索
  onMySearch(e) {

    let self = this;
    let keyword = e.detail.keyword;
    self.setData({
      keyword: keyword,
      dataList: [], //商品数组
      curpage: 1
    })

    if (!keyword) {
      return
    }
     self.getDateList();
  },


  //获取数据
  getDateList() {
    let self = this;
    let userInfo = JSON.parse(wx.getStorageSync('userInfo'));
    let roleCode = userInfo.user.auths.roleCode;
    let userCode = userInfo.user.userCode;
    let companyCode = userInfo.user.auths.companyCode;
    let data = {};

    // 角色编号 0：系统管理员 1：企业管理员 2：企业业务员
    if (roleCode == 2) {
      if (self.data.type == 1) {
        // 买家中心—商城采购订单—业务员
        data = {
          priceType: Number(self.data.currentTab) + 1,
          createUserCode: userCode,
          pageNum: self.data.curpage,
          pageSize: self.data.pageSize,
          deliveryType: self.data.type,
          sortType: Number(self.data.sortTab) + 1,
          sortRule: self.data.sortRule,
          queryLastDayNum: '',
          searchKey: self.data.keyword,
         
        }
      }
      // [1：点价；2：确定价；3：延期点价]
      else {
        // 买家中心—求购大厅订单—业务员
        data = {
          priceType: Number(self.data.currentTab) + 1,
          releaseUserCode: userCode,
          pageNum: self.data.curpage,
          pageSize: self.data.pageSize,
          deliveryType: self.data.type,
          sortType: Number(self.data.sortTab) + 1,
          sortRule: self.data.sortRule,
          queryLastDayNum: '',
          searchKey: self.data.keyword,
         
        }
      }

    }
    else if (roleCode == 1 || roleCode == 0) {

      // 买家中心—商城采购订单—管理员
      if (self.data.type == 2) {
        data = {
          priceType: Number(self.data.currentTab) + 1,
          releaseCompanyCode: companyCode,
          pageNum: self.data.curpage,
          pageSize: self.data.pageSize,
          deliveryType: self.data.type,
          sortType: Number(self.data.sortTab) + 1,
          sortRule: self.data.sortRule,
          searchKey: self.data.keyword,
          queryLastDayNum: ''
        }
      }
      // 买家中心—求购大厅订单—管理员
      else {
        data = {
          priceType: Number(self.data.currentTab) + 1,
          createCompanyCode: companyCode,
          pageNum: self.data.curpage,
          pageSize: self.data.pageSize,
          deliveryType: self.data.type,
          sortType: Number(self.data.sortTab) + 1,
          sortRule: self.data.sortRule,
           searchKey: self.data.keyword,
          queryLastDayNum: ''
        }
      }
    }

    data.categoryCode = app.globalData.filterData.categoryCode ? app.globalData.filterData.categoryCode : ''
    data.brandList = app.globalData.filterData.brandList ? app.globalData.filterData.brandList : []
    data.specList = app.globalData.filterData.specList ? app.globalData.filterData.specList : []
    data.materialList = app.globalData.filterData.materialList ? app.globalData.filterData.materialList : []
    data.wareHouseList = app.globalData.filterData.wareHouseList ? app.globalData.filterData.wareHouseList : []
    data.orderStatus = app.globalData.filterData.orderStatus ? app.globalData.filterData.orderStatus : ''
    data.dealStatus = app.globalData.filterData.dealStatus ? app.globalData.filterData.dealStatus : ''
    data.areaCode = app.globalData.filterData.areaCode ? app.globalData.filterData.areaCode : ''
    data.tradeCompanyCode = app.globalData.filterData.tradeCompanyCode ? app.globalData.filterData.tradeCompanyCode : ''


    util.post(api.get_orderList_url, data, res => {
      let productList = res.returnObject.list;
      let resData = res.returnObject.list
      let curpage = self.data.curpage
      let datas = self.data.dataList;
 
      if (self.data.queryLastDayNum != '') {
        self.setData({
          productListLength: productList.length
        })
      }


      if (this.data.queryLastDayNum == '' && datas[self.data.curpage]) {
        let productListLength = this.data.productListLength
        datas[self.data.curpage].splice(-Number(productListLength), productListLength)
      }

      totalpage = res.returnObject.total;

      self.setData({
        ['dataList[' + self.data.curpage + ']']: productList,
      })


      if (resData.length != 0) {
        self.setData({
          curpage: curpage + 1,
        })
      }

      if (self.data.dataList[1].length == 0 && this.data.queryLastDayNum == 30) {
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


  goto(e) {
    util.goto(e);
  },


})