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
    orderStatus:false,
    sortTab:0 ,//筛选 1: 待处理优先,2: 时间排序, 3: 数量排序,4: 价格排序
    sortRule:1,
    itemList: [1, 2, 3],
    height:'',//设置scroll-view的高度
    queryLastDayNum:30,
    dayStatus:false,//用于判断是不是30天之外，默认是30天之内
    pageNum2:'',//30天之后
    pageSize:20,
    productListLength: 0,//记录30天之前的数据长度
    emptyPage:false,//没有数据
    filterStatus:false,//是不是筛选返回
    catchBottom:false,
    pageTop:'',
  
  },

  //下拉刷新
  onPullDownRefresh() {
    this.setData({
      curpage: 1,
      dataList: []
    })
    this.getDateList();
  },

  onReachBottom: function () {
    if (Number(this.data.curpage - 1) * Number(this.data.pageSize) <= totalpage) {
      this.getDateList();
    }else{
      if (this.data.queryLastDayNum == 30) {
        this.setData({
          dayStatus: true,
      
        })
      }else{
        this.setData({
          catchBottom: true
        })
      }
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
        wx.createSelectorQuery().select('.orderMainPage').boundingClientRect(function (rect) {
          var is_1_height = Number(rect.height) // 节点的宽度

          self.setData({
            pageTop: rect.top,
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
    if (this.data.type==2){
      wx.setNavigationBarTitle({
        title: '求购大厅订单'
      })
    }else{
      wx.setNavigationBarTitle({
        title: '商城采购订单'
      })
    }
    this.getDateList();

  },

  onShow: function (){
    let self=this;
    wx.getSystemInfo({
      success: function (res) {
        wx.createSelectorQuery().select('.orderMainPage').boundingClientRect(function (rect) {
          var is_1_height = Number(rect.height) // 节点的宽度
          self.setData({
            height: is_1_height
          });
        }).exec();
      }
    });

    if (!this.data.orderStatus){
      this.setData({
        orderStatus:true
      })
      return
    }else{
      this.setData({
        curpage: 1,
        dataList: [], 
        emptyPage: false,
      })
      this.getDateList()
    }

    // 筛选返回
    if (this.data.filterStatus==true){
     this.setData({
       queryLastDayNum:'',
       dayStatus:false
     })
   }

  },

  //搜索
  onMySearch(e) {
    let keyStyle = this.data.currentTab; //tab切换值
    wx.navigateTo({
      url: `../../../components/search/orderResult/index?keyStyle=${keyStyle}&type=${this.data.type}`,
    })
  },

  refresh() {
    let currentTab = this.data.currentTab;
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
          sortType: Number(self.data.sortTab)+1,
          sortRule: self.data.sortRule,
          queryLastDayNum: self.data.queryLastDayNum
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
          deliveryType:  self.data.type,
          sortType: Number(self.data.sortTab)+1,
          sortRule: self.data.sortRule,
          queryLastDayNum: self.data.queryLastDayNum
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
          deliveryType:  self.data.type,
          sortType: Number(self.data.sortTab)+1,
          sortRule: self.data.sortRule,
          queryLastDayNum: self.data.queryLastDayNum
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
          queryLastDayNum: self.data.queryLastDayNum
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
      // productList = [];

      let resData = res.returnObject.list 
      let curpage = self.data.curpage 
      let datas = self.data.dataList;

      if (self.data.queryLastDayNum !=''){
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


      if (resData.length != 0){
        self.setData({
          curpage: curpage + 1,
        })
     }
    
      if (self.data.dataList[1].length == 0){
       self.setData({
         emptyPage: true
       })
        if (self.data.dataList[1].length == 0 && this.data.queryLastDayNum == 30) {
          self.setData({
            dayStatus: true,
          })

        }
     }
  

      wx.stopPullDownRefresh()
    }, {
        loading: true
      }, fail => {
      })

  },


  checkMore(){
    let curpage 
    if (this.data.curpage<=1){
     curpage = this.data.curpage 
    }else{
      curpage = this.data.curpage - 1;
    }
 

    this.setData({
      dayStatus: false,
      queryLastDayNum:'',
      curpage: curpage,
      emptyPage:false
      
    })
    this.getDateList(); 
  },
 

  //排序
  sortClickTab(e){
    let self = this;
    let current = e.currentTarget.dataset.current;
 
    wx.pageScrollTo({
      scrollTop: self.data.pageTop ? self.data.pageTop : 0,
      duration:0
    })
    
    if (current==1){
      if (self.data.sortRule==1){
        self.setData({
          sortRule: 2
        })
      }
      else if(self.data.sortRule == 2){
        self.setData({
          sortRule: 1
        }) 
      }
     
    }
    else if (current == 2){
   
      if (self.data.sortRule == 1) {
        self.setData({
          sortRule: 2
        })
      }
      else if (self.data.sortRule == 2) {
        self.setData({
          sortRule: 1
        })
      }
    }

    self.data.curpage = 1;
    self.setData({
      dataList: [],
      sortTab: current,
      curpage: 1
    })
    app.globalData.filterData = ''
    self.getDateList();
  },
 
 //点击切换
  clickTab(e) {
    let self = this,
      current = e.currentTarget.dataset.current;
      wx.pageScrollTo({
        scrollTop: self.data.pageTop ? self.data.pageTop:0,
        duration: 0
      })
    self.setData({
      swiperStatus: true
    })
 
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
      curpage:1,
      dayStatus: false,
      queryLastDayNum:30,
      sortTab:'',
      filterStatus:false,
      emptyPage: false,
      catchBottom:false
      
    })

    app.globalData.filterData = ''
    self.getDateList();
  },

  goto(e) {
    util.goto(e);
  },


})