//index.js
//获取应用实例
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';

const app = getApp()
let socketArr = []
let instuementIds = [];
let resultMap = new Map();
// let isFirstLoad = true

var totalpage;
Page({
  data: {
    currentTab: 0,
    dataList: [],//数据列表
    curpage: 1,
    type: '',//1订单是商城采购2求购大厅
    socketData:[],//socket数据
    userCode: '', 
    swiperStatus:false,
    itemList:[1,2,3,4],
    init: false,
    emptyPage: false,
    instuementId: [],
    socketObj: {},
    catchBottom: false,
    pageSize:10
  },

  // 触底
  onReachBottom: function () {
    if (Number(this.data.curpage - 1) * Number(this.data.pageSize) <= totalpage) {
      this.getDateList();
      this.setData({
        socketData: []
      })
    } else {
      this.setData({
        catchBottom: true
      })
    }
  },

  onLoad: function (options) {
 
    let self = this;
    if (options.type) {
      this.setData({
        type: options.type
      })
    }

    this.getDateList();
   
    //获取socket的数据
    this.setTimer();
    if (self.data.instuementId != '') {
      self.getSocket()
    }

  },

  onShow() {
    // 动态获取scroll-view的高度
    this.setData({
      socketObj:{}
    })
    let self = this;
    wx.getSystemInfo({
      success: function (res) {
        wx.createSelectorQuery().select('.buyTab').boundingClientRect(function (rect) {
          var is_1_height = Number(rect.height) // 节点的宽度
          self.setData({
            height:is_1_height
          });
        }).exec();
      }
    });
    if (!self.data.init) {
      self.setData({
        init: true
      })

    }else{
      self.setData({
        curpage: 1,
        dataList: []
      })
      self.getDateList();
    }

    if (self.data.instuementId.length!=0){
 
      this.sendSocket();
      this.getSocket()
    }
    
  
    getApp().watch(self.watchBack)
  },

  watchBack: function (socket1Status) {
    if (socket1Status == 1) {

      this.sendSocket();
      this.getSocket()
    }
  },

  onReady() {
    let self = this;
    setTimeout(function () {
      if (self.data.socketObj=={}){
        self.sendSocket();
        self.getSocket()
      }
     
    }, 500)

  },
  getSocket() {
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
        }else{
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

  //获取数据
  getDateList() {
    let self = this;
    let userInfo = '';
    let roleCode = '';
    let userCode = '';
    let companyCode = '';
    if (wx.getStorageSync('userInfo')) {
      userInfo = JSON.parse(wx.getStorageSync('userInfo'));
      roleCode = userInfo.user.auths.roleCode;
      userCode = userInfo.user.userCode;
      companyCode = userInfo.user.auths.companyCode;
      self.setData({
        userCode: userCode ? userCode:'',
      })
    }

    let data = {};
    let releaseStatus = [];
  
    if (self.data.currentTab==0){
      releaseStatus = ["1", "2", "3"];
    } else if (self.data.currentTab == 1){
      releaseStatus = ["1"];
    } else if (self.data.currentTab == 2){
      releaseStatus = ["2"];
    } else if (self.data.currentTab == 3){
      releaseStatus = ["3"];
    }

    data = {
      deliveryType:2,
      releaseStatus: releaseStatus,//1：已发布，2：已售完/已完成，3：已下架，4：已删除 
      companyCode: companyCode,
      pageNum: self.data.curpage,
      pageSize: self.data.pageSize
    }

    util.post(api.get_product_url, data, res => {
      let productList = res.returnObject.products;
      let datas = self.data.dataList
      totalpage = res.returnObject.total;
      self.setData({
        ['dataList[' + self.data.curpage + ']']: productList,
      })
      if (self.data.dataList[1].length==0){
        self.setData({
          emptyPage: true
        })
      }

      instuementIds = []
      if (self.data.dataList.length != 0) {
        self.data.dataList.forEach(function (itemM, idx) {
          itemM.forEach(function (item, idx) {
            if (item.contractCode) {
              instuementIds.push(item.contractCode);
            }
          })
        })
      }

      instuementIds = Array.from(new Set(instuementIds));
      self.setData({
        instuementId: instuementIds
      })
      
      if (self.data.instuementId != '') {
        self.sendSocket();
        self.getSocket()
      }
      wx.stopPullDownRefresh()
      self.setData({
        curpage: self.data.curpage + 1,
      })
    }, {
        loading: true
      }, fail => {
      })
  },

  sendSocket(){
    let data = {};
    data = {
      "instuementIds": this.data.instuementId
    }
    let msg = JSON.stringify(data)
    app.sendSocketMessage(msg, 'socket1')
  },

  clickTab(e) {
    this.setData({
      swiperStatus: true
    })
    let self = this,
      current = e.currentTarget.dataset.current;

    if (self.data.currentTab === current) {
      return false;
    } else {
      self.setData({
        currentTab: current,
        catchBottom:false

      })
    }
    self.initGetData();
    if (self.data.instuementId.length!=0) {
      self.getSocket()
      self.sendSocket();
     
    }
  },

  onPullDownRefresh() {
    this.getDateList();
  },

  //初始化数据
  initGetData() {
    let self = this;
    self.data.curpage = 1;
    self.setData({
      dataList: [],
      socketData: [],
      emptyPage:false
    })
    self.getDateList();

  },

  goto(e) {
    util.goto(e);
  },
  

})