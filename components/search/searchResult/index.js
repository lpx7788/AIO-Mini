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
    deliveryType: 1, // tab切换的的索引值
    hotType: 'all', //热门商品
    hotCarouselList: [], //轮播图数组
    productList: [], //商品数组
    typeFixed: false, //是否吸顶
    loginStatus: wx.getStorageSync('token') ? true : false, //是否已登陆
    curpage: 1, //当前页面
    selectProductList: [], //自选商品列表
    hotCategoryList: [], //热门品种列表
    emptyPage: false, //有无商品
    swiperStatus: false,
    searchKeyword: '',
    keyTitle: '现货商城',
    socketData: [],//socket数据
    tabHeightL:'',
    instuementId: [],
    socketObj:{}

  },

  onLoad: function (options) {
    let self = this;
   
    //获取socket的数据
    self.setTimer();
    if (self.data.instuementId != '') {
      self.getSockect()
    }

  },

  onShow: function (options) {
  
    let self = this;
    if (!this.data.filterDataStatus) {
      this.setData({
        filterDataStatus: true
      })
      var query = wx.createSelectorQuery()
      query.select('.section ').boundingClientRect()
      query.exec(function (res) {
        self.setData({
          tabHeight: res[0].height
        })

      });
      return
    } else {
      let data = {}
      data = {
        "instuementIds": this.data.instuementId
      }
      let msg = JSON.stringify(data)
    
        this.sendSocket(msg);
        this.getSockect()
      
    }
    getApp().watch(self.watchBack)
  },

  watchBack: function (socket1Status) {
    let data = {}
    data = {
      "instuementIds": this.data.instuementId
    }
    let msg = JSON.stringify(data)
    if (socket1Status == 1) {
      this.sendSocket(msg);
      this.getSockect()
    }
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
        if (item['contractCode'].toUpperCase() == contractCode.toUpperCase() ) {
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

  onReachBottom: function () {
    if (this.data.curpage <= totalpage) {
      // 自选的下拉加载
      if (this.data.currentTab == 0) {
        this.getCustomizeProduct();
      } else {
        this.getProduct();
      }

      this.setData({
        socketData: []
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

  //获取自选商品数据
  getCustomizeProduct() {

    let self = this;
    util.post(api.customizeProduct_list_url, {
      sortType: self.data.sortType,
      pageNum: self.data.curpage,
      pageSize: 10,
      searchKeyword: self.data.keyword,
    }, res => {

      let productList = res.returnObject.products;
      let datas = self.data.selectProductList
      totalpage = res.returnObject.total;
      self.setData({
        ['productList[' + self.data.curpage + ']']: productList,
      })
 
      if (self.data.productList[1].length == 0) {
        self.setData({
          emptyPageselct: true
        })
      } else {
        self.setData({
          emptyPageselct: false
        })
      }



      if (self.data.productList.length != 0) {
        self.data.productList.forEach(function (itemM, idx) {
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
     
      if (self.data.instuementId != '') {
        self.sendSocket(msg)
        self.getSockect()
      }
      self.setData({
        curpage: self.data.curpage + 1,
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
      deliveryType: self.data.deliveryType, //1现货商城，2求购大厅
      releaseStatus: ['1', '2'], //求购中
      categoryCode: self.data.hotType == 'all' ? '' : self.data.hotType, //热门商品
      pageNum: self.data.curpage,
      pageSize: 10,
      searchKeyword: self.data.keyword,
    }


    util.post(api.product_list_url, data, res => {
      let productList = res.returnObject.products;
      let datas = self.data.productList
      totalpage = res.returnObject.total;

      self.setData({
        ['productList[' + self.data.curpage + ']']: productList,
      })


      if (self.data.productList[1].length == 0) {
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
     
      if (self.data.instuementId != '') {
        self.sendSocket(msg)
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
  //搜索

  onMySearch(e) {
    let self = this;
    let keyword = e.detail.keyword;
    self.setData({
      keyword: keyword,
      hotCarouselList: [], //轮播图数组
      productList: [], //商品数组
      curpage: 1
    })
    if (!keyword) {
      return
    }
    if (self.data.deliveryType == 1 || self.data.deliveryType == 2) {
      self.getProduct();
    } else {
      self.getCustomizeProduct();
    }
    if (self.data.instuementId != '') {
      self.getSockect()
    }
  },

  //选择自选、现货商城
  selectClick() {
    let self = this;
    wx.showActionSheet({
      itemList: ['现货商城', '求购大厅', '自选'],
      success(res) {
        console.log(self.data.currentTab)
        let keyTitle = '';
        if (res.tapIndex == 0 || res.tapIndex == 1) {

          if (res.tapIndex == 1) {
            keyTitle = '求购大厅'
          } else {
            keyTitle = '现货商城'
          }
          self.setData({
            deliveryType: res.tapIndex == 0 ? 1 : 2, //1现货商城，2求购大厅
            keyTitle: keyTitle,
            currentTab: Number(res.tapIndex) == 0 ? 1 : 2,
          })

          if (self.data.keyword) {
            self.setData({
              productList: [],
              curpage: 1
            })
        
            self.getProduct();
            wx.pageScrollTo({
              scrollTop: self.data.menuTop
            })
          }
        } else if (res.tapIndex == 2) {
          self.setData({
            keyTitle: '自选'
          })
          self.setData({
            deliveryType: 3, //1现货商城，2求购大厅
            currentTab: 0
          })
          if (self.data.keyword) {
            self.setData({
              productList: [],
              curpage: 1
            })
           
            self.getCustomizeProduct();
            wx.pageScrollTo({
              scrollTop: self.data.menuTop
            })
          }
        }
      },
      fail(res) {
      }
    })
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
    }, {
        loading: true
      }, fail => {

      })

  },



  onHide() {
    app.globalData.filterData = ''
  },



})