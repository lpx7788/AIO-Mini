// pages/workBench/placeOrder/placeOrder.js
const app = getApp()
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
var socketObj;

var formId = '';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    socketOrder: '',
    showModal: false,
    dataList: [], //数据列表
    mssageList: {
      lastPrice: null,
      bidPrice1: null,
      askPrice1: null,
      openInterest: null,
      bidVolumn1: null,
      askVolumn1: null

    },
    //socket数据
    lastPrice: '', //输入的对手价
    num: '', //输入的数量
    contractCode: '',
    // 输入价格
    price: 0,
    // 输入数量
    amount: 0,
    // 额度
    quotaData: {},
    deliveryType: null,
    salesCompanyCode: null,
    salesCompanyName: null,
    userCompanyCode: '',
    dataQuery: {},
    page: '', //8详情页跳转过来
    instuementIds: '',
    orderCode: '',
    sellCompanyName: '',
    floatingPrice: '',
    contractName: '',
    type: 1, //1采购 2求购,
    priceType: '', //0 1 2,
    propList: [],
    priceMethod: 1,//含税单价
    tit: '温馨提示',
    award: '',//交易成功之后可以获得的积分
    dataStatus: false,
    formId: '',
    selectIndex: 0,//商品详细选择了的哪个商品
    firstInpage: true
  },

  onLoad: function (options) {
    console.log('页面传过来的数据===');
    console.log(options);

    let self = this
    let page = ''
    let type = ''
    let selectIndex = ''
    let attributeCode = ''
    if (options.type) {
      type = options.type
    }
    if (options.attributeCode) {
      attributeCode = options.attributeCode
    }
    if (options.page) {
      page = options.page
    }
    if (wx.getStorageSync('selectIndex') || wx.getStorageSync('selectIndex') == 0) {
      this.setData({
        selectIndex: wx.getStorageSync('selectIndex')
      })
    }

    wx.setNavigationBarTitle({
      title: "点价"
    })

    let procurementType = ''
    if (options.procurementType) {
      procurementType = options.procurementType
    }

    this.setData({
      procurementType: procurementType,
      userCompanyCode: JSON.parse(wx.getStorageSync('userInfo')) ? JSON.parse(wx.getStorageSync('userInfo')).user.auths.companyCode : '',
      page: page,
      type: type,
      attributeCode: attributeCode
    })

    if (this.data.page == 8) {
      app.globalData.delayMidpointsData = ''
    }

    let dataList = app.globalData.delayMidpointsData ? app.globalData.delayMidpointsData : JSON.parse(options.data);
    let contractCode = ''
    let orderCode = ''
    if (options.contractCode) {
      contractCode = options.contractCode
    }
    if (JSON.parse(options.data)) {
      orderCode = JSON.parse(options.data).orderCode ? JSON.parse(options.data).orderCode : ''
    }


    this.setData({
      contractCode: dataList.contractValues ? dataList.contractValues[contractCode] : '',
      priceType: dataList.priceType,
      orderCode: orderCode,
      contractName: JSON.parse(options.data).contractName ? JSON.parse(options.data).contractName : '',
    })

    if (this.data.page == 8) {
      this.setData({
        contractCode: contractCode,
        priceType: options.priceType ? options.priceType : '',
        sellCompanyName: JSON.parse(options.data).sellCompanyName ? JSON.parse(options.data).sellCompanyName : '',
        floatingPrice: JSON.parse(options.data).floatingPrice ? JSON.parse(options.data).floatingPrice : '',

      })
    }

    let arr = dataList.contractValues ? dataList.contractValues : [];
    let instuementIds = [];
    if (arr.length == 0) {
      instuementIds.push(contractCode)
    } else {
      let contractCodeIdx = wx.getStorageSync('contractCodeIdx')
      instuementIds.push(arr[contractCodeIdx].contractCode)
    }

    self.setData({
      dataList: dataList,
      instuementIds: instuementIds,
      priceMethod: dataList.priceMethod ? dataList.priceMethod : 1
    })


    if (this.data.priceMethod == 2) {
      this.setData({
        hintShowModal: true
      })
    }

    let userInfo = JSON.parse(wx.getStorageSync('userInfo'));
    let userCode = userInfo.user.userCode;
    this.getLastPriceSocket()
    let integralGuidePrice = '';
    let integralNum = '';
    if (JSON.parse(options.data)) {
      if (JSON.parse(options.data).integral) {
        integralGuidePrice = JSON.parse(options.data).integral.integralGuidePrice ? JSON.parse(options.data).integral.integralGuidePrice : ''
        integralNum = JSON.parse(options.data).integral.integralNum ? JSON.parse(options.data).integral.integralNum : ''
      }
    }
    let dataQuery = JSON.parse(options.data);

    this.setData({
      deliveryType: dataQuery.deliveryType,
      salesCompanyCode: dataQuery.companyCode ? dataQuery.companyCode : dataQuery.createCompanyCode,
      salesCompanyName: dataQuery.companyName ? dataQuery.companyName : dataQuery.createCompanyName,
      dataQuery: dataQuery,
      integralGuidePrice: integralGuidePrice,
      integralNum: integralNum ? integralNum : '',

    })

    this.queryQuota()
    this.setTimer();
  },

  onShow: function () {
    let self = this;
    self.setData({
      socketOrder: ''
    })

    if (!self.data.dataStatus) {
      self.setData({
        dataStatus: true
      })
      return
    } else {
      self.queryQuota();
      self.getSocket()
      self.getLastPriceSocket()
      if (self.data.orderCode) {
        self.getOrderData();
      }
    }

    getApp().watch(self.watchBack)
  },

  watchBack: function (socket1Status) {
    let self = this
    if (socket1Status == 1) {
      self.getSocket()
      self.getLastPriceSocket()
    }
  },

  onReady() {
    let self = this;
    setTimeout(function () {
      self.getSocket()
      self.getLastPriceSocket()
    }, 500)
  },

  onPullDownRefresh() {
    this.getOrderData();
  },

  //获取订单详情页面数据
  getOrderData() {
    let self = this;
    util.post(api.get_order_details_url, {
      orderCode: self.data.orderCode
    }, res => {
      let dataList = res.returnObject;
      let childList = res.returnObject.childList;
      let cancelStatus = res.returnObject.cancelStatus;

      self.setData({
        dataList: dataList,
      })

      let userInfo = {}
      let companyCode = ''
      if (wx.getStorageSync('userInfo')) {
        userInfo = JSON.parse(wx.getStorageSync('userInfo'));
        if (userInfo.user.auths) {
          companyCode = userInfo.user.auths.companyCode ? userInfo.user.auths.companyCode : '';
        }
      }

      //自己公司                                              
      if (res.returnObject.releaseCompanyCode == companyCode) {
        self.setData({
          oneself: true
        })
      }
      wx.stopPullDownRefresh()
    }, {
        loading: true
      })
  },

  getLastPriceSocket() {
    let self = this;
    let data = {
      instuementIds: self.data.instuementIds
    }

    let msg = JSON.stringify(data)
    if (self.data.instuementIds.length > 0) {
      app.sendSocketMessage(msg, 'socket1')
    }
    app.globalData.socket1.onMessage(function (res) {
      let mssageList = JSON.parse(res.data);
      if (mssageList) {
        if (mssageList.instrumentId.toLowerCase() == self.data.instuementIds[0].toLowerCase()) {


          socketObj = self.data.mssageList
          socketObj.lastPrice = mssageList.lastPrice
          socketObj.bidPrice1 = mssageList.bidPrice1
          socketObj.askPrice1 = mssageList.askPrice1
          socketObj.openInterest = mssageList.openInterest
          socketObj.bidVolumn1 = mssageList.bidVolumn1
          socketObj.askVolumn1 = mssageList.askVolumn1


          if (self.data.firstInpage) {
            self.setData({
              mssageList: socketObj,
              firstInpage: false,
              price: self.data.priceMethod == 1 ? mssageList.lastPrice : Number(mssageList.lastPrice) + Number(self.data.dataList.attributeData[0].floatingPrice),
            })
          }

        }
      }
    })
  },

  setTimer() {
    let self = this
    setInterval(function () {
      self.setData({
        mssageList: socketObj
      })
    }, 1000)
  },

  getSocket() {
    let self = this
    //当socket接收到的请求是两个不同的时候，加收到的数据会叠加（解决叠加问题）
    if (!app.globalData.friendGameMath) {
      app.globalData.friendGameMath = 1
      app.globalData.socket2.onMessage(function (res) {
        if (JSON.parse(res.data).type == 'sendPricingOrder') {
          let datas = JSON.parse(res.data)
          let orderCode = ''
          if (datas.errorCode != '0000') {
            wx.showToast({
              title: datas.errorMsg,
              icon: 'none',
              duration: 1000
            })
            return;
          }
          orderCode = JSON.parse(res.data).returnObject.orderCode;
          self.setData({
            socketOrder: JSON.parse(res.data).returnObject.orderCode
          })
          if (datas.errorCode == '0000') {
            wx.showToast({
              title: '下单成功',
              duration: 1000
            })
            // let formId = wx.getStorageSync('formId')
            // let attributeCode = self.data.dataList.attributeCode
            // let buyUserName = self.data.dataList.buyUserName
            // let selectIndex = wx.getStorageSync('selectIndex')
            // if(self.data.page==''){
            //   //现货商城进入的时候
            //   attributeCode = self.data.dataList.attributeData[selectIndex].attributeCode;
            //   buyUserName = self.data.dataList.userName
            // }

            // let pushData = {
            //   formid: formId,//	是	string	formid
            //   orderCode:orderCode
            // }
            // app.messagePush(pushData);
            let priceType;
            if (self.data.priceType == 1) {
              priceType = 0
            } else if (self.data.priceType == 2) {
              priceType = 1
            } else if (self.data.priceType == 3) {
              priceType = 2
            }

            let type = wx.getStorageSync('type')
            if (type == 1) {
              wx.navigateTo({
                url: '../../../pages/workBench/orderDetail/orderDetail?orderCode=' + orderCode + '&type=' + self.data.deliveryType + '&priceType=' + priceType,
              })

            } else {
              setTimeout(function () {
                wx.switchTab({
                  url: '/pages/home/index/index',
                });
              }, 1000)
            }
          }
        }
      })
    }
  },

  //输入的数量
  numInput(e) {
    this.setData({
      num: e.detail.value
    })
  },

  //输入的对手价
  lastPriceInput(e) {
    this.setData({
      price: e.detail.value
    })
  },

  //采购
  toPrice(e) {
    this.setData({
      formId: e.detail.formId
    })

    wx.setStorageSync('formId', e.detail.formId)

    let _this = this
    if (!this.data.num) {
      wx.showToast({
        title: '请输入数量',
        icon: 'none'
      })
      return;
    }



    if ((this.data.amount > this.data.quotaData.availableQuotaNum || this.data.quotaData.availableQuotaNum == 0 || this.data.num > this.data.quotaData.availableQuotaNum) && this.data.page != 8) {
      wx.showModal({
        title: '温馨提示',
        content: '点价余额不足，请申请额度',
        success(res) {
          if (res.confirm) {

            let dataQuery = JSON.stringify(_this.data.dataQuery)
            let quotaData = JSON.stringify(_this.data.quotaData)
            let contractCode = JSON.stringify(_this.data.contractCode)
            wx.navigateTo({
              url: `../limit/limit?dataQuery=${dataQuery}&quotaData=${quotaData}&contractCode=${contractCode}&deliveryType=${_this.data.deliveryType}`
            })
          } else if (res.cancel) {
          }
        }
      })
      return;
    } else {

      let data = {}
      // let shareUserCode = wx.getStorageSync('shareUserCode') ? wx.getStorageSync('shareUserCode'):'';
      // console.log('shareUserCode===', shareUserCode);
      // 延期点价
      if (_this.data.priceType == 3) {
        data = {
          action: "sendPricingOrder",
          access_token: wx.getStorageSync('token'),
          releaseCode: _this.data.dataQuery.releaseCode,
          stockNum: _this.data.num,
          pricingPrice: _this.data.price,
          contractCode: _this.data.contractCode,
          orderCode: _this.data.orderCode,
          attributeCode: _this.data.attributeCode,
          deviceType: 'webchat',
          // shareUserCode: shareUserCode ? shareUserCode:''
          
        }
        this.setData({
          parameter: data
        })
      } else {
        data = {
          action: "sendPricingOrder",
          access_token: wx.getStorageSync('token'),
          releaseCode: _this.data.dataQuery.releaseCode,
          stockNum: _this.data.num,
          pricingPrice: _this.data.price,
          contractCode: _this.data.contractCode.contractCode,
          attributeCode: _this.data.attributeCode,
          deviceType: 'webchat',
          // shareUserCode: shareUserCode ? shareUserCode : ''
        }
        this.setData({
          parameter: data
        })
      }

      let companyName = '';
      let derection = '';
      if (_this.data.type == 1) {
        companyName = _this.data.dataList.companyName
      } else if (_this.data.type == 2) {
        companyName = _this.data.dataList.companyName
      }
      let contractCode = ''
      let contractName = ''
      if (_this.data.page == 8) {
        companyName = _this.data.sellCompanyName
        contractName = _this.data.dataList.contractName
      } else {
        contractName = _this.data.contractCode.contractName
      }


      if (_this.data.deliveryType == 1) {
        derection = '采购';

      } else {
        derection = '销售'
      }

      let propList = [{
        title: '公司',
        name: companyName
      },
      {
        title: '商品',
        name: _this.data.dataList.categoryName
      },
      {
        title: '合约',
        name: contractName
      },
      {
        title: '方向',
        name: derection
      },
      {
        title: '价格',
        name: _this.data.price
      },
      {
        title: '数量',
        name: _this.data.num,

      }]

      // 积分赠送判断
      let award = '';
      let integralGuidePrice = _this.data.integralGuidePrice;
      let integralNum = _this.data.integralNum;
      let price = _this.data.price

      if (_this.data.page != 8 && _this.data.priceMethod == 1) {
        price = Number(price) + Number(_this.data.dataList.attributeData[0].floatingPrice)
      } else if (_this.data.page == 8 && _this.data.priceMethod == 1) {
        price = Number(price) + Number(_this.data.floatingPrice)
      }

      if (price >= _this.data.integralGuidePrice) {
        award = integralNum * _this.data.num
        _this.setData({
          award: award ? award : ''
        })
        propList.push({
          num: _this.data.award
        })
      }

      _this.setData({
        // showModal: true,
        propList: propList
      })

      this.checkOrder();

    }
  },

  checkOrder() {
    let self = this;
    util.post(api.check_BeforeSend_Order,
      {
        releaseCode: self.data.dataQuery.releaseCode,
        stockNum: self.data.num,
        attributeCode: self.data.attributeCode

      }, res => {
        self.setData({
          showModal: true,

        })

      }, {
        loading: true
      },
      fail => {
      })
  },

  onMyprop(e) {
    // 取消的时候
    if (e.detail.status == "N") {
      this.setData({
        showModal: e.detail.showModal,
        hintShowModal: e.detail.showModal,
      })
      return;
    }
    //  确定的时候
    this.setData({
      showModal: e.detail.showModal,
      hintShowModal: e.detail.showModal,
    })
    let self = this

    let msg = JSON.stringify(this.data.parameter)
    app.sendSocketMessage(msg, 'socket2');

    //获取socket
    if (wx.getStorageSync('readyState') == 1) {
      this.getSocket()
    }


  },

  // 查询额度
  queryQuota() {
    util.post(api.quota_url, {
      deliverytypeCode: this.data.deliveryType == 1 ? '2' : '1',
      purchaseCompanyCode: this.data.deliveryType == 1 ? this.data.userCompanyCode : this.data.salesCompanyCode,
      salesCompanyCode: this.data.deliveryType == 2 ? this.data.userCompanyCode : this.data.salesCompanyCode,
      contractCode: this.data.contractCode.contractCode
    }, res => {
      if (res.returnObject) {
        this.setData({
          quotaData: res.returnObject
        })
      } else {
        this.setData({
          quotaData: {
            availableQuotaNum: 0
          }
        })
      }
    }, {
        loading: true
      })
  }
})