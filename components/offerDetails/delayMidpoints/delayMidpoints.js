//获取应用实例
const app = getApp()
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
let instuementId;
Page({
  // 
  /**
   * 页面的初始数据
   */
  data: {
    showModal: false,
    quotaData: '', //额度
    dataList: [],//数据列表
    defaultDateList: [],//数组的第一个数据
    availableQuotaNum: '',//预存款金额
    placeNum: '',//下单数量
    priceType: '',
    advancePayment: '',
    advancePaymentPrice: "",
    releaseCode: '',
    attributeCode: '',
    lastPrice: '',//最新价
    propList: [],
    quotaDataList: '',
    dataStatus: false,
    type: 1,
    selectIndex: 1,//传过来的时候是第几个商品

  },


  onLoad: function (options) {
    console.log('打印===');
    console.log(options);
    let selectIndex = ''
    if (wx.getStorageSync('selectIndex') || wx.getStorageSync('selectIndex') == 0) {
      selectIndex = wx.getStorageSync('selectIndex')
      this.setData({
        selectIndex: selectIndex
      })
    }

    let priceType = options.priceType
    let datas = app.globalData.delayMidpointsData;
    let attributeData = app.globalData.delayMidpointsData.attributeData[selectIndex];
    let dataQuery = '';
    if (options.data) {
      dataQuery = JSON.parse(options.data);
    }
    if (options.type) {
      this.setData({
        type: options.type
      })
    }
    this.setData({
      dataList: datas,
      defaultDateList: attributeData,
      priceType: priceType,
      advancePayment: datas.advancePayment,
      releaseCode: datas.releaseCode,
      attributeCode: datas.attributeData[selectIndex].attributeCode ? datas.attributeData[selectIndex].attributeCode : '',
      deliveryType: datas.deliveryType,
      lastPrice: options.lastPrice ? options.lastPrice : '',
      contractCode: options.contractCode ? options.contractCode : '',
      dataQuery: dataQuery ? dataQuery : ''
    })


    this.getMessageData();
    this.getSocket();

  },
  onShow() {
    let self = this;
    if (!self.data.dataStatus) {
      self.setData({
        dataStatus: true
      })
      return
    } else {
      self.getSocket()
      self.getMessageData();
      if (self.data.releaseCode) {
        self.updateDateList()
      }
    }

    getApp().watch(self.watchBack)
  },
  
  onReady() {
    let self = this;
    setTimeout(function () {
      self.getSocket()
    }, 500)
  },
  watchBack: function (socket1Status) {
    let self = this;
    if (socket1Status == 1) {
      self.getSocket()
    }
  },

  getSocket() {
    let self = this;
    //订单详情进来获取最新价
    if (this.data.contractCode && (this.data.page == 1 || this.data.page == 2)) {
      let data = {
        "instuementIds": [this.data.contractCode]
      }

      instuementId = [this.data.contractCode]
      let msg = JSON.stringify(data)
      app.sendSocketMessage(msg, 'socket1')
    }

    app.globalData.socket1.onMessage(function (res) {
      let socketData = JSON.parse(res.data);
      if (socketData) {
        if (socketData.instrumentId.toLowerCase() == instuementId[0].toLowerCase()) {
          if (socketData.lastPrice != self.data.lastPrice) {
            self.setData({
              lastPrice: socketData.lastPrice ? (isNaN(socketData.lastPrice) == true ? '' : socketData.lastPrice) : '--',
            })
          }
        }
      }

    })
  },


  //获取数据
  updateDateList() {
    let self = this;
    util.post(api.get_product_queryDetail_url, {
      releaseCode: self.data.releaseCode
    }, res => {
      self.setData({
        defaultDateList: res.returnObject.attributeData[self.data.selectIndex]
      })
    }, {
        loading: true
      }, fail => {
      })


  },

  //下单采购
  buyClick() {
    let self = this;
    let derection = '';
    if (self.data.dataList.deliveryType == 1) {
      derection = '采购';
    } else {
      derection = '销售'
    }
    self.setData({
      propList: [
        {
          title: '公司',
          name: self.data.dataList.companyName
        },
        {
          title: '商品',
          name: self.data.dataList.categoryName
        },
        {
          title: '合约',
          name: self.data.dataList.contractValues[0].contractName
        },
        {
          title: '方向',
          name: derection
        },
        {
          title: '数量',
          name: self.data.placeNum
        },
        {
          title: '预付款',
          name: self.data.advancePaymentPrice
        },
        {
          title: '',
          name: ''
        },
        {
          title: '注意',
          name: '若过了点价有效期，未点价部分将按照点价有效期最后一个工作日的该合约月的期货结算价确定结算价。'
        },

      ]
    })
    this.checkOrder()

  },

  checkOrder() {

    let self = this;
    util.post(api.check_BeforeSend_Order,
      {
        releaseCode: self.data.releaseCode,
        stockNum: self.data.placeNum,
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
    let self = this;
    let contractCode = '';

    // 取消的时候
    if (e.detail.status == "N") {
      this.setData({
        showModal: e.detail.showModal
      })
      return;
    }

    self.setData({
      showModal: e.detail.showModal
    })

    if (self.data.dataList.contractValues[0]) {
      contractCode = self.data.dataList.contractValues[0].contractCode
    }

    util.post(api.send_order_url,
      {
        releaseCode: self.data.releaseCode,
        stockNum: self.data.placeNum,
        attributeCode: self.data.attributeCode,
        contractCode: contractCode,
        deviceType: 'webchat',
        // shareUserCode: shareUserCode ? shareUserCode : ''

      }, res => {

        let orderCode = res.returnObject.orderCode
        //推送消息
        let pushData = {}
        let formId = wx.getStorageSync('formId');
        pushData = {
          formid: formId,//	是	string	formid
          orderCode: orderCode
        }

        // app.messagePush(pushData);

        // 1：报价，2：求购
        if (self.data.deliveryType == 2) {

          // try {
          //   wx.navigateBack({
          //     delta: 2
          //   })
          // }
          // catch (err) {
          setTimeout(function () {
            wx.switchTab({
              url: '/pages/home/index/index',
            });
          }, 1000)
          // }

        } else {
          wx.showToast({
            title: '下单成功',
          })

          setTimeout(function () {
            wx.navigateTo({
              url: '../../../pages/workBench/orderDetail/orderDetail?orderCode=' + orderCode + '&type=' + self.data.deliveryType + '&priceType=' + 2,
            })
          }, 1000)
        }


      }, {
        loading: true
      },
      fail => {
      })

  },

  //获取信息
  getMessageData() {

    let self = this;
    let token = wx.getStorageSync('token');

    let userInfo = JSON.parse(wx.getStorageSync('userInfo'));
    let companyCode = userInfo.user.auths.companyCode;
    let contractCode = '';
    if (self.data.dataList.contractValues[0]) {
      contractCode = self.data.dataList.contractValues[0].contractCode
    }
    let data = {}
    if (self.data.dataList.deliveryType == 2) {
      data = {
        // deliverytypeCode: self.data.priceType==1?2:1,
        // purchaseCompanyCode: companyCode,
        // contractCode: contractCode,
        // salesCompanyCode:self.data.dataList.companyCode
        contractCode: contractCode,
        deliverytypeCode: self.data.priceType == 1 ? '1' : '2',
        purchaseCompanyCode: self.data.dataList.companyCode,
        salesCompanyCode: companyCode,

      }
    } else {
      data = {
        // deliverytypeCode: self.data.priceType==1?2:1,
        // purchaseCompanyCode: companyCode,
        // contractCode: contractCode,
        // salesCompanyCode:self.data.dataList.companyCode
        contractCode: contractCode,
        deliverytypeCode: self.data.priceType == 1 ? '2' : '1',
        purchaseCompanyCode: companyCode,
        salesCompanyCode: self.data.dataList.companyCode,

      }
    }


    util.post(api.quota_url,
      data, res => {
        app.globalData.queryQuotaData = res
        let quotaData = ''
        let availableQuotaNum = ''

        if (res.returnObject != null) {
          quotaData = res.returnObject.availableQuotaNum ? res.returnObject.availableQuotaNum : 0;
          availableQuotaNum = res.returnObject.quotaNum ? res.returnObject.quotaNum : 0;
        }
        self.setData({
          quotaData: quotaData,
          availableQuotaNum: availableQuotaNum,
          quotaDataList: res.returnObject ? res.returnObject : ''
        })

      }, {
        loading: true
      },
      fail => {
      })
  },

  //获取下单数量
  getPlaceNum(e) {

    let self = this;
    let placeNum = e.detail.value;
    self.setData({
      placeNum: placeNum
    })

    let advancePayment = Number(this.data.advancePayment) * Number(placeNum)
    this.setData({
      advancePaymentPrice: advancePayment
    })



  },

  //采购
  placeOrder(e) {
    wx.setStorageSync('formId', e.detail.formId);
    let self = this;
    if (!self.data.placeNum) {
      wx.showToast({
        title: '请填写下单数量',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    else if (self.data.dataList.contractValues[0].contractCode == self.data.dataList.companyCode) {

      wx.showModal({
        title: "温馨提示",
        content: "这是自己发布的商品不能下单",
        confirmText: "知道了",
        showCancel: !1
      })
      return;
    } else if (self.data.quotaData == 0 || self.data.placeNum > self.data.quotaData) {
      wx.showModal({
        title: '温馨提示',
        content: '点价余额不足，请申请额度',
        success(res) {
          if (res.confirm) {

            wx.navigateTo({
              url: `../limit/limit?dataQuery=${JSON.stringify(self.data.dataQuery)}&quotaData=${JSON.stringify(self.data.quotaDataList)}&contractCode=${JSON.stringify(self.data.dataList.contractValues[0])}&deliveryType=${self.data.deliveryType}`
            })
          } else if (res.cancel) {
          }
        }
      })
    } else {
      self.buyClick()
    }

  },




})