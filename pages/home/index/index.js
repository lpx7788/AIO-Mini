//index.js
//获取应用实例
const app = getApp()
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
import config from '../../../utils/config.js';
var totalpage;
let instuementIds1 = []
let instuementIds2 = []
let resultMap = new Map();
Page({
  data: {

    sortType: 1, // 价格排序
    currentTab: 0, // tab切换的的索引值   0自选 1现货 2求购
    hotType: '', //热门商品
    hotCarouselList: [], //轮播图数组
    productList: [], //商品数组
    typeFixed: false, //是否吸顶0
    loginStatus: false, //是否已登陆
    curpage: 1, //当前页面
    selectProductList: [], //自选商品列表
    hotCategoryList: [], //热门品种列表
    socketData: [],
    emptyPage: false, //有无商品
    emptyPageselct: false, //有无商品
    swiperStatus: false,
    selectCategory: [],
    selectDeliveryType: [],
    // 所有品种
    allCategory: [],
    contentList: [1, 2, 3],
    filterDataStatus: false,
    height: '', //scroll-view的高度
    latitude: '', //经纬度
    longitude: '',
    authorizationShow: true,
    isLogin: false,
    authorizationMsg: '',
    appdata: '',//
    page: '',//当前是否分享进入
    isfirstIn: 1,//第一次进入
    userchose: false,
    loginPage: false,
    instuementId: [],
    menuTop: '',//tab导航到顶部的距离
    tabHeight: '',
    socketStatus: true,
    socketObj: {},
    catchBottom: false,//没有更多数据
    pageSize: 10,
    pageHeight:''
  },

  onLoad: function (options) {
    console.log(options);
   
    let self = this;
    if (options.locationJson && options.locationJson != "''" && options.locationJson != "null") {
      
      let locationJson = JSON.parse(options.locationJson)
      self.setData({
        latitude: locationJson.latitude,
        longitude: locationJson.longitude,
      })

    }
    else if (!options.locationJson) {
      self.getLocaltion();
      if (this.data.latitude == '') {
        if (wx.getStorageSync('locationJson')) {
          let locationJson = JSON.parse(wx.getStorageSync('locationJson'))
          if (locationJson) {
            self.setData({
              latitude: locationJson.latitude,
              longitude: locationJson.longitude,
            })
          }
        }
      }
    }

    let isLogin = wx.getStorageSync('isLogin') ? wx.getStorageSync('isLogin') : ''
    let authorizationMsg = wx.getStorageSync('authorizationMsg') ? wx.getStorageSync('authorizationMsg') : ''

    //分享页面数据
    let currentTab = this.data.currentTab;
    let contentList = this.data.contentList;
    let isfirstIn = this.data.isfirstIn;
    let appdata = this.data.appdata;
    let page = this.data.page;
    let hotType = this.data.hotType;
    let sortType = this.data.sortType;

    // if (options.shareUserCode) {
    //   wx.setStorageSync('shareUserCode', options.shareUserCode)
    // }
    if (options.sortType) {
      sortType = options.sortType
    }

    if (options.categoryCode) {
      hotType = options.categoryCode
    }

    if (options.currentTab) {
      currentTab = options.currentTab
    }

    if (options.isfirstIn) {
      isfirstIn = options.isfirstIn
    }

    if (options.shareFrom && options.shareFrom != "''" && options.shareFrom!="null") {
      appdata = JSON.parse(options.shareFrom)
    }

    if (options.contentList) {
      if (options.contentList == 1) {
        contentList = [1, 2, 3]
      }
    }

    if (options.page) {
      page = options.page
    }

    self.setData({
      isLogin: isLogin,
      authorizationMsg: authorizationMsg,
      currentTab: currentTab,
      appdata: appdata,
      contentList: contentList,
      page: page,
      isfirstIn: isfirstIn,
      sortType: sortType,
      hotType: hotType
    })

    let loginStatus = wx.getStorageSync('token')
    this.setData({
      loginStatus: loginStatus == '' ? false : true
    })

    if (this.data.currentTab == 0) {
      this.getCustomizeProduct();
    } else {
      this.getProduct();
    }
    this.getBannerData();
    this.getHotCategory();
    this.getUserSelection();
    this.getCategoryList()

    //把帅选数据清空
    app.globalData.filterData = ''

    //获取socket的数据
    self.setTimer();
    if (self.data.instuementId != '') {
      self.getSockect()
    }
  
  },

  onShow: function (options) {
    console.log('-----onshow------')
    let self = this;
    let appdata = app.globalData.filterData;

    // 分享页面
    if (self.data.page == "share") {
      appdata = app.globalData.filterData ? app.globalData.filterData : self.data.appdata
    }

    let categoryCode = ''
    if (appdata.categoryCode != undefined) {
      categoryCode = appdata.categoryCode
    } else {
      categoryCode = self.data.hotType
    }
    self.setData({
      hotType: categoryCode ? categoryCode : self.data.hotType,
      appdata: appdata
    })

    let token = wx.getStorageSync('token')
    self.setData({
      loginStatus: token == '' ? false : true
    })

    if (!self.data.filterDataStatus) {
      self.setData({
        filterDataStatus: true
      })
      wx.getSystemInfo({
        success(systemMsg) {
        var query = wx.createSelectorQuery()
        query.select('.swiperTabWrap').boundingClientRect()
        query.exec(function (res) {

          self.setData({
            menuTop: res[0].top,
            tabHeight: res[0].height,
            pageHeight: systemMsg.windowHeight + res[0].top
          })
       
          wx.setStorageSync('menuTop', res[0].top)
         
        });
        }
      })

    } else {
      console.log('-----onshow2------')
    
        let data = {}
        data = {
          "instuementIds": this.data.instuementId
        }
        let msg = JSON.stringify(data)

        this.sendSocket(msg);
        this.getSockect()
      
    
      
      //是否设置了自选
      if (self.data.userchose == true) {
        self.setData({
          curpage: 1,
          selectProductList: [],
        })
        self.getUserSelection()
        self.getCustomizeProduct()
      } else if (self.data.loginPage == true || wx.getStorageSync('loginPage') == true) {
        // 登陆返回
        self.setData({
          curpage: 1,
          selectProductList: [],
        })
        self.getCustomizeProduct();
      }

      // 筛选返回
      if (appdata) {
        self.initGetData();
        self.setData({
          curpage: 1,
          selectProductList: [],
          productList: [],
        })
      }
    }

    getApp().watch(self.watchBack)
   
  },
  
  // 监听socket的变化
  watchBack: function (socket1Status) {
    let data = {}
    data = {
      "instuementIds": this.data.instuementId
    }
    let msg = JSON.stringify(data)
    this.sendSocket(msg);
    this.getSockect()
    
  },

  getSockect() {
    // 获取socket的数据
    let self = this;
    let instrumentIds = self.data.instuementId;
    let contractPriceArray = instrumentIds.map( function (item, index, arr ) {
      let obj = Object.create(null);
      let contractCode = item.toLowerCase();
      obj['contractCode'] = contractCode;
      obj['lastPrice'] = self.data.socketObj[contractCode.toUpperCase()];
      return obj;
    })
    app.globalData.socket1.onMessage(function (res) {
      let contractCode = JSON.parse(res.data).instrumentId;
      let lastPrice = JSON.parse(res.data).lastPrice;
      let findContractObj = contractPriceArray.find((item, index, arr) => {
        if (item['contractCode'].toUpperCase() == contractCode.toUpperCase()) {
          return item;
        } else {
          return undefined;
        }
      })
      if (findContractObj != undefined) {
        let upperContractCode = findContractObj['contractCode'].toUpperCase();
        let contractObjFromResultMap = resultMap.get(upperContractCode);
        let isFirst = contractObjFromResultMap == undefined ? true : false;
        let valueObj = Object.create(null);
        valueObj['lastPrice'] = lastPrice;
        valueObj['isNew'] = true;
        if (!self.data.socketObj[upperContractCode]) {
          let socketObj = self.data.socketObj;
          socketObj[upperContractCode] = lastPrice;
          self.setData({ 'socketObj': socketObj })
        } else {
          if (isFirst || !contractObjFromResultMap['isNew']) {
            if (findContractObj['lastPrice'] != lastPrice) {
              resultMap = resultMap.set(upperContractCode, valueObj);
            }
          }
        }

      }

    })
  },

  setTimer() {
    let self = this
    setInterval(function () {
      if (resultMap.size >= 1) {
        for (let [key, value] of resultMap.entries()) {
          let isNew = value['isNew'];
          if (isNew) {
            let upperContractCode = key.toUpperCase();
            let lastPrice = value['lastPrice']
            let socketObj = self.data.socketObj;
            socketObj[upperContractCode] = lastPrice;
            self.setData({ 'socketObj': socketObj })
            value['isNew'] = false;
            resultMap.set(key, value);
          }
        }
      }
    }, 3000)
  },


  onPageScroll: function (scroll) {
    let self = this;
    let menuTop = self.data.menuTop ? self.data.menuTop : wx.getStorageSync('menuTop')
    if (self.data.menuFixed === (scroll.scrollTop > menuTop)) {
      return
    };
    self.setData({
      menuFixed: (scroll.scrollTop > menuTop)
    })
  
  },

  //下拉刷新
  onPullDownRefresh() {
    this.initGetData();
  },

  onReachBottom: function () {
    if (Number(this.data.curpage - 1) * Number(this.data.pageSize) <= totalpage) {
      // 自选的下拉加载
      if (this.data.currentTab == 0) {
        this.getCustomizeProduct();
      } else {
        this.getProduct();
      }
      this.setData({
        socketData: []
      })
    } else {
      this.setData({
        catchBottom: true
      })
    }
  },

  // 获取地理位置
  getLocaltion() {
    let self = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let latitude = res.latitude
        let longitude = res.longitude
        self.setData({
          latitude: latitude,
          longitude: longitude,
        })

        let data = {
          longitude: self.data.longitude + '',
          latitude: self.data.latitude + ''
        }

        let locationJson = JSON.stringify(data)
        wx.setStorageSync('locationJson', locationJson);
      }
    })
  },


  //获取轮播图数据
  getBannerData() {
    let self = this;
    util.post(api.banner_list_url, {
      type: 1
    }, res => {
      self.data.hotCarouselList = res.returnObject;
      self.setData({
        hotCarouselList: res.returnObject
      })
    }, '', fail => {
    })

  },

  //获取自选商品数据
  getCustomizeProduct() {
    let self = this;
    util.post(api.customizeProduct_list_url, {
      sortType: self.data.sortType,
      pageNum: self.data.curpage,
      pageSize: self.data.pageSize,
      searchKeyword: '',
      locationJson: {
        longitude: self.data.longitude + '',
        latitude: self.data.latitude + ''
      }
    }, res => {
      wx.stopPullDownRefresh();
      let productList = res.returnObject.products;

      let datas = self.data.selectProductList
      totalpage = res.returnObject.total;
      self.setData({
        ['selectProductList[' + self.data.curpage + ']']: productList,
      })

      if (productList.length == 0) {
        self.setData({
          emptyPageselct: true
        })
      } else {
        self.setData({
          emptyPageselct: false
        })
      }

      if (self.data.selectProductList.length != 0) {
        self.data.selectProductList.forEach(function (itemM, idx) {
          itemM.forEach(function (item, idx) {
            if (item.contractCode) {
              instuementIds1.push(item.contractCode);
            }
          })
        })
      }
      instuementIds1 = Array.from(new Set(instuementIds1))
      self.setData({
        instuementId: instuementIds1
      })

      let data = {};
      data = {
        "instuementIds": instuementIds1
      }

      let msg = JSON.stringify(data)
      self.sendSocket(msg);
      self.setData({
        curpage: self.data.curpage + 1,
      })

      if (self.data.instuementId != '') {
        self.getSockect()
      }

    }, {
        loading: true
      }, fail => {
      })
  },

  //获取热门品种
  getHotCategory() {
    let self = this;
    let data = {};
    util.post(api.get_hot_category_url, data, res => {
      let hotCategoryList = res.returnObject;
      hotCategoryList.forEach(function (item) {
        if (item.categoryCode == 'all') {
          item.categoryCode = ''
        }
      })
      self.setData({
        hotCategoryList: hotCategoryList
      })

    }, {
        loading: true
      }, fail => {
      })
  },

  //获取商品数据（除自选）
  getProduct() {
    let categoryCode = this.data.hotType;
    let appData = ''
    let releaseStatus = ''
    if (this.data.appdata) {
      appData = this.data.appdata
      releaseStatus = appData.releaseStatus
    }

    let self = this;
    let data = {};

    data = {
      sortType: self.data.sortType, //排序规则: 1:智能排序,2:价格排序,3:数量排序
      deliveryType: self.data.currentTab, //1现货商城，2求购大厅
      categoryCode: categoryCode ? categoryCode : appData.categoryCode, //热门商品
      pageNum: self.data.curpage,
      pageSize: self.data.pageSize,
      releaseStatus: releaseStatus != [] ? releaseStatus : ['1', '2'], //求购中
      source: appData.source ? appData.source : 1,
      brandList: appData.brandList ? appData.brandList : [],
      materialList: appData.materialList ? appData.materialList : [],
      specList: appData.specList ? appData.specList : [],
      areaCode: appData.areaCode ? appData.areaCode : '',
      wareHouseList: appData.wareHouseList ? appData.wareHouseList : [],
      locationJson: {
        longitude: self.data.longitude + '',
        latitude: self.data.latitude + ''
      }
    }
    util.post(api.product_list_url, data, res => {
      wx.stopPullDownRefresh();
      let productList = res.returnObject.products;
      let datas = self.data.productList
      totalpage = res.returnObject.total;

      self.setData({
        ['productList[' + self.data.curpage + ']']: productList,
      })

      if (productList.length == 0) {
        self.setData({
          emptyPage: true
        })
      } else {
        self.setData({
          emptyPage: false
        })
      }

      instuementIds2 = [];
      if (self.data.productList.length != 0) {
        self.data.productList.forEach(function (itemM, idx) {
          itemM.forEach(function (item, idx) {
            if (item.contractCode) {
              instuementIds2.push(item.contractCode);
            }
          })
        })
      }

      let data = {};
      instuementIds2 = Array.from(new Set(instuementIds2))
      self.setData({
        instuementId: instuementIds2
      })
      data = {
        "instuementIds": instuementIds2
      }
      let msg = JSON.stringify(data)
      self.sendSocket(msg);

      if (self.data.instuementId != '') {
        self.getSockect()
      }
      self.setData({
        curpage: self.data.curpage + 1
      })

    }, {
        loading: true
      }, fail => {
      })
  },

  sendSocket(msg) {
    app.sendSocketMessage(msg, 'socket1')
  },

  toBannerDetail(e) {
    wx.setStorageSync('webViewUrl', e.currentTarget.dataset.outlinkurl)
    util.goto(e);
  },


  //搜索
  onMySearch(e) {
    let keyword = e.detail.keyword;
    wx.navigateTo({
      url: `../../../components/search/searchResult/index?keyword=${keyword}`,
    })
  },


  refresh() {
    let currentTab = this.data.currentTab;
  },

  //价格排序
  clicksortTab(e) {

    let self = this,
      sort = e.currentTarget.dataset.sort;
    
    //切换数据页面滚动到最顶部
    if (self.data.menuFixed) {
      wx.pageScrollTo({
        scrollTop: self.data.menuTop
      })
    }

    if (self.data.sortType === sort) {
      return false;
    } else {
      self.setData({
        sortType: sort
      })
    }
    self.setData({
      productList: [],
      socketData: [],
      curpage: 1,
    })

    if (this.data.currentTab == 0) {
      this.getCustomizeProduct();
    } else {
      this.getProduct();
    }
  },

  //热门商品
  clickHotTab(e) {
    let self = this,
      hot = e.currentTarget.dataset.hot;

    //切换数据页面滚动到最顶部
    if (self.data.menuFixed) {
      wx.pageScrollTo({
        scrollTop: self.data.menuTop
      })
    }
  
    if (self.data.hotType === hot) {
      return false;
    } else {
      self.setData({
        hotType: hot == 'all' ? '' : hot
      })
    }
    self.setData({
      productList: [],
      curpage: 1,
      socketData: [],
      appdata: ''
    })
    self.getProduct();
  },

  //点击
  clickTab(e) {
  
    let self = this,
      current = e.currentTarget.dataset.current;

    //切换数据页面滚动到最顶部
    if(self.data.menuFixed){
      wx.pageScrollTo({
        scrollTop: self.data.menuTop
      })
    }
    
    //收集formID
    let formIdList = wx.getStorageSync('formIdList');
    if (formIdList) {
      formIdList = formIdList + ',' + e.detail.formId;
    } else {
      formIdList = e.detail.formId;
    }
    wx.setStorageSync('formIdList', formIdList)

    this.setData({
      swiperStatus: true
    })
    self.setData({
      currentTab: current,
      appdata: "",
      hotType: "",
      sortType: 1,
    })

    self.initGetData();
    this.getLocaltion()

    //超过10条的时候向后台发送formIdList
    let saveFormIdList = wx.getStorageSync('formIdList');
    saveFormIdList = saveFormIdList.split(',')
    if (saveFormIdList.length >= 10) {
      let data = saveFormIdList.join(',');
      app.saveFormId(data);
    }
  },

  //初始化数据
  initGetData() {
    let self = this;
    self.setData({
      curpage: 1
    })
    if (self.data.currentTab == 0) {
      self.setData({
        selectProductList: [],
        socketData: [],
      })

      self.getCustomizeProduct();
    } else {

      self.setData({
        productList: [],
        socketData: [],
      })
      self.getProduct();
    }
  },


  goLogin() {
    wx.navigateTo({
      url: '../../../pages/login/index/index',
    })
  },

  goto(e) {
    this.setData({
      userchose: false,
      loginPage: false
    })
    util.goto(e);
  },

  // 获取自选条件内容
  getUserSelection() {
    let self = this;
    util.post(api.get_user_selection_url, {
      sortType: self.data.sortType
    }, res => {
      this.setData({
        selectDeliveryType: res.returnObject.deliveryType,
      })

      let arr = []
      this.data.allCategory.forEach(item => {
        res.returnObject.categoryData.forEach(i => {
          if (item.categoryCode == i) {
            arr.push(item)
          }
        })
      })
      this.setData({
        selectCategory: arr
      })

    }, {
        loading: true
      }, fail => {

      })

  },

  // 获取所有品种
  getCategoryList() {
    util.post(api.category_tree_url, {}, res => {
      let arr = []
      res.returnObject.forEach(item => {
        item.childs.forEach(i => {
          i.childs.forEach(j => {
            arr.push(j)
          })
        })
      })
      this.setData({
        allCategory: arr
      })
      this.getUserSelection()
    }, {
        loading: true
      },
      fail => {

      })
  },

  onHide() {
    app.globalData.filterData = ''
  },

  //分享
  onShareAppMessage: function () {

    
    let data = this.data.appdata;
    let datas = JSON.stringify(data);
    let locationJson = {
      longitude: this.data.longitude ,
      latitude: this.data.latitude 
    }
    locationJson = JSON.stringify(locationJson)
    let userCode = wx.getStorageSync('userCode') ? wx.getStorageSync('userCode'):''
    let param = `?shareUserCode=${userCode}&currentTab=${this.data.currentTab}&shareFrom=${datas}&sortType=${this.data.sortType}&categoryCode=${this.data.hotType}&page=share&contentList=1&isfirstIn=1&locationJson=${locationJson}`;

    //  分享参数
    // categoryCode:  '',//商品种类一级分类
    // sortType:  1,   //排序类型: 1: 待处理优先,2: 时间排序, 3: 数量排序,4: 价格排序
    // currentTab:2, //0自选 1 现货商城 2求购
    // shareFrom = {
    //   areaCode: "4", //区域code列表,
    //   brandList: ["沙钢", "沙钢2号"],//品牌列表
    //   categoryCode: "col1801010101",// 商品种类编号,
    //   dealStatus: "1",//订单成交状态
    //   materialList: ["符合国标GB/T3952-1008","MH009",],//材质列表
    //   orderStatus: "1",//订单状态
    //   releaseStatus: ["1", "2"], //发布状态，1：已发布，2：已售完/已完成，3：已下架，4：已删除 如：”releaseStatus”:[“1”,”2”]
    //   source: 1,//来源: 1: 全部 2: 供应商报价/客户求购 3: 非供应商报价/非客户求购
    //   specList: ["1.0","2.0"],//规格列表
    //   tradeCompanyCode: "",//交易公司code
    //   wareHouseList: ["百钢汇"]//仓库列表
    // }
    // locationJson: {
    //   longitude:'',
    //   latitude:''
    // }
    // &page=share&contentList=1&isfirstIn=1`  //写死

    console.log(`/pages/home/index/index${param}`);

    return {
      title: '聚点商城',
      path: `/pages/home/index/index${param}`,
    }

  },


})