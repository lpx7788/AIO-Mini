//index.js
//获取应用实例
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
const app = getApp()

Page({
  data: {
    modifyDataList: [], //
    dataList: [], //数据列表
    childList: [], //子列表
    orderCode: '', //订单编号
    orderRemark: '', //订单备注内容
    childListstatus: true,
    cancelStatus: null,
    addtellHidden: true, //弹出框显示/隐藏
    type: 1, //1是采购  2是求购
    showBtn: 1,
    currentTab: 0, //0是点价 1确定价 2延期点价
    priceBtnShow: false,
    quantity: '', //数量
    spread: '', //输入值不得大于数量
    orderDetailCode: '', //子订单orderCode
    oStatus: '',
    delay: '',
    showDetailBtn: '',
    init: false,
    baseP: '', //子订单基价
    filterDataStatus: false, //返回页面的时候页面数据的重新加载
    modalName: '' ,//弹窗的名称
    uhide:-1,
    oneself:false,
    saveNUm:'',
    modifyNUm:'',

  },

  onLoad: function(options) {
    console.log('订单详情打印===');
    console.log(options);

    let currentTab = ''
    let priceType = ''
    let self = this;
    if (options.currentTab) {
      self.setData({
        currentTab: options.currentTab ? options.currentTab : priceType,
      })
    } else if (options.priceType) {
      self.setData({
        currentTab: options.priceType
      })
    }

    self.setData({
      orderCode: options.orderCode,
      type: options.type ? options.type:'',
      showBtn: options.type == 1 ? 1 : 2
    })

    self.getDateList();
  },


  onShow: function() {
    if (!this.data.filterDataStatus) {
      this.setData({
        filterDataStatus: true
      })
      return
    } else {
      //页面返回刷新页面
      this.getDateList();

    }



  },

  

  //下拉刷新
  onPullDownRefresh() {
    this.getDateList();
  },

  //上拉刷新
  onReachBottom: function() {
    this.getDateList();
  },

  //获取页面数据
  getDateList() {
    let self = this;
    util.post(api.get_order_details_url, {
      orderCode: self.data.orderCode
    }, res => {
      let dataList = res.returnObject;
      let childList = res.returnObject.childList;
      let cancelStatus = res.returnObject.cancelStatus;
 
      self.setData({
        dataList: dataList,
        type: dataList.deliveryType,
        showBtn: dataList.deliveryType,
        currentTab: Number(dataList.priceType)-1,
        childList: childList,
        childListstatus: childList.length == 0 ? false : true,
        cancelStatus: cancelStatus,
        modifyDataList: JSON.stringify(dataList),
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

  goto(e) {
    if(e.currentTarget.dataset.name=='goToPrice'){
      wx.setStorageSync('type', this.data.type)
    }
    util.goto(e);
  },

  // 订单备注
  addOrderNote() {
    this.setData({
      addtellHidden: false,
      modalName: "note"
    })

  },

  //获取备注内容
  saveOrderRemark(e) {
    let orderRemark = e.detail.value
    this.setData({
      orderRemark: orderRemark
    })
  },
  //获取备部分、全部
  saveNUm(e) {
    let saveNUm = e.detail.value
    this.setData({
      saveNUm: saveNUm
    })
  },

  //获取改价
  modifyNUm(e) {
    let modifyNUm = e.detail.value
    this.setData({
      modifyNUm: modifyNUm
    })
  },

  //确定保存订单备注
  modalConfirm() {
    let self = this;
    let orderCode = self.data.orderCode
    let orderRemark = self.data.orderRemark
    let saveNUm = self.data.saveNUm


    //订单备注
    if (self.data.modalName == "note") {
      util.post(api.savet_order_remark, {
        orderCode: orderCode,
        orderRemark: orderRemark
      }, res => {
        wx.showToast({
          title: '保存成功',
        })
        self.getDateList();
        self.setData({
          addtellHidden: true,
          orderRemark: ''
        })

      }, {
        loading: true
      })

      return;
    }

    // 部分成交 延期子订单
    if (self.data.modalName == "suborder") {
      if (!saveNUm) {
        wx.showToast({
          title: '请输入数量',
          icon: 'none'
        })
        return
      }
      self.toTransaction(saveNUm,'');
      return;
    }

    // 部分成交  主订单
    if (self.data.modalName == "portion") {
      if (!saveNUm) {
        wx.showToast({
          title: '请输入数量',
          icon: 'none'
        })
        return
      }
      self.toTransaction(saveNUm,'');
      return;
    }

    // 点价修改
    if (self.data.modalName == "modifyPrice") {
      let orderCode = self.data.orderCode
      let basePrice = self.data.modifyNUm
      if (!self.data.modifyNUm) {
        wx.showToast({
          title: '请输入数量',
          icon: 'none'
        })
        return
      }
      let data = {}
      if (self.data.orderDetailCode) {
        data = {
          orderCode: orderCode,
          basePrice: basePrice,
          orderDetailCode: self.data.orderDetailCode
        }
      } else {
        data = {
          orderCode: orderCode,
          basePrice: basePrice,
        }
      }
      util.post(api.edit_pending_pricing, data, res => {
        wx.showToast({
          title: '修改成功',
        })
        self.setData({
          addtellHidden: true,
          // saveNUm: ''
        })
        self.getDateList();

      }, {
        loading: true
      })
      return;
    }


  },

  // 点价修改
  modifyClick(e) {
    let self = this;
    let code = e.currentTarget.dataset.code;
    let basep = e.currentTarget.dataset.basep;
    let orderDetailCode = '';

    self.setData({
      addtellHidden: false,
      modalName: "modifyPrice"
    })

    if (code) {
      orderDetailCode = code
      this.setData({
        orderDetailCode: orderDetailCode
      })
    }
    if (basep) {
      this.setData({
        basep: basep,
      })
    }

  },

  // 取消
  modalCancel() {
    this.setData({
      addtellHidden: true,
      // orderRemark :'',
    })
  },
  emptyClick(){

  },
  // 撤销
  cancelClick(e) {
    wx.setStorageSync('formId', e.detail.formId);
    let code = e.currentTarget.dataset.code;
    let status = e.currentTarget.dataset.status;

    let orderDetailCode = '';
    let oStatus = '';
    let self = this;

    if (code) {
      orderDetailCode = code
      this.setData({
        orderDetailCode: orderDetailCode
      })
    }

    if (status) {
      this.setData({
        oStatus: status
      })
    }

    if (this.data.cancelClick != null) {
      return;
    }
    wx.showModal({
      title: '温馨提示',
      content: '是否确认撤销该订单，确认撤销之后不可恢复',
      success(res) {
        if (res.confirm) {
          self.cancelSendAjax();
        } else if (res.cancel) {
        }
      }
    })
  },

  // 撤销请求
  cancelSendAjax() {
    let self = this;
    let url = ''

    //点价
    if (self.data.currentTab == 0) {
      if (self.data.dataList.orderStatus == 1 || self.data.dataList.orderStatus == null) {
        url = api.future_order_cancel
      } else if (self.data.dataList.orderStatus == 4) {
        url = api.future_order_apply
      }
    }

    //延期子订单
    else if (self.data.currentTab == 2 && self.data.orderDetailCode) {
      if (self.data.oStatus == 1 || self.data.oStatus == null) {
        url = api.future_order_cancel
      } else if (self.data.oStatus == 4) {
        url = api.future_order_apply
      }
    }

    //确定价/延期主订单
    else {
      url = api.cancel_order_url
    }
    let data = {}
    if (self.data.currentTab == 2) {
      data = {
        orderCode: self.data.orderCode,
        orderDetailCode: self.data.orderDetailCode
      }
    } else {
      data = {
        orderCode: self.data.orderCode
      }
    }
    util.post(url, data, res => {
      wx.showToast({
        title: '撤销成功',
      })
      this.getDateList();

      //推送消息
      let pushData = {}
      let formId = wx.getStorageSync('formId');
      pushData = {
        formid: formId,//	是	string	formid
        orderCode: self.data.orderCode
      }
      // app.messagePush(pushData);

    }, {
      loading: true
    })
  },

  // 拒单
  rejectOrder(e) {
    wx.setStorageSync('formId', e.detail.formId);
  
    let self = this;
    let code = e.currentTarget.dataset.code;
    let orderDetailCode = '';
    if (code) {
      orderDetailCode = code
      this.setData({
        orderDetailCode: orderDetailCode
      })
    }

    let data = {}
    if (self.data.currentTab == 2 && code) {
      data = {
        orderCode: self.data.orderCode,
        orderDetailCode: self.data.orderDetailCode
      }
    } else {

      data = {
        orderCode: self.data.orderCode
      }
    }


    let url = '';
    // 确定价拒单/延期主订单
    if ((this.data.currentTab == 1 || this.data.currentTab == 2) && !this.data.orderDetailCode) {
      url = api.order_reject
    }
    // 延期子订单
    else if (this.data.currentTab == 2 && this.data.orderDetailCode) {
      url = api.reject_Pricing_order
    }
    // 点价拒单
    else {
      url = api.reject_Pricing_order
    }
    util.post(url, data, res => {
      wx.showToast({
        title: '拒单成功',
      })
      self.setData({
        priceBtnShow: false
      })
      this.getDateList();

      //推送消息
      let pushData = {}
      let formId = wx.getStorageSync('formId');
      pushData = {
        formid: formId,//	是	string	formid
        orderCode: self.data.orderCode
      }

      // app.messagePush(pushData);

    }, {
      loading: true
    })
  },

  //确定订单
  confirmOrder(e) {

    wx.setStorageSync('formId', e.detail.formId);
    let self = this;
    let code = e.currentTarget.dataset.code;
    let orderDetailCode = '';
    let url = '';
    if (code) {
      orderDetailCode = code
      this.setData({
        orderDetailCode: orderDetailCode
      })
    }

    let data = {}
    if (self.data.currentTab == 2 && code) {
      data = {
        orderCode: self.data.orderCode,
        orderDetailCode: self.data.orderDetailCode
      }
    } else {

      data = {
        orderCode: self.data.orderCode
      }
    }
    // 确定价拒单/延期主订单
    if ((this.data.currentTab == 1 || this.data.currentTab == 2) && !this.data.orderDetailCode) {
      url = api.confirm_order
    }
    // 延期子订单
    else if (this.data.currentTab == 2 && this.data.orderDetailCode) {
      url = api.confirmed_Pricing_order
    }
    // 点价拒单
    else {
      url = api.confirmed_Pricing_order
    }

    util.post(url, data, res => {
      wx.showToast({
        title: '订单已确认',
      })
      self.setData({
        priceBtnShow: false
      })
      this.getDateList();

      //推送消息
      let pushData = {}
      let formId = wx.getStorageSync('formId');
      pushData = {
        formid: formId,//	是	string	formid
        orderCode: self.data.orderCode
      }

      // app.messagePush(pushData);
    }, {
      loading: true
    })
  },

  //结单
  cOrder(e) {

    wx.setStorageSync('formId', e.detail.formId);
    let self = this;
    let url = api.examine_cancel_pricing_order;
    let code = e.currentTarget.dataset.code;
    let orderDetailCode = '';
    let ext1 = ''
    // ext1	String	审批状态	4.2 同意 4.3 拒绝
    if (e.currentTarget.dataset.status == "N") {
      ext1 = "4.3"
    } else {
      ext1 = "4.2"
    }
    if (code) {
      orderDetailCode = code
      this.setData({
        orderDetailCode: orderDetailCode
      })
    }

    let data = {}
    if (self.data.currentTab == 2 && code) {
      data = {
        orderCode: self.data.orderCode,
        orderDetailCode: self.data.orderDetailCode,
        cancelStatus: ext1
      }
    } else {
      data = {
        orderCode: self.data.orderCode,
        cancelStatus: ext1
      }
    }
    util.post(url, data, res => {
      wx.showToast({
        title: '操作成功',
      })
      self.setData({
        priceBtnShow: false
      })
      this.getDateList();

      //推送消息
      let pushData = {}
      let formId = wx.getStorageSync('formId');
      pushData = {
        formid: formId,//	是	string	formid
        orderCode: self.data.orderCode
      }


      // app.messagePush(pushData);
    }, {
      loading: true
    })
  },

  // 点价结单
  statementAccount(e) {

    wx.setStorageSync('formId', e.detail.formId);

    let self = this;
    let code = e.currentTarget.dataset.code;
    let orderDetailCode = '';
    if (code) {
      orderDetailCode = code
      this.setData({
        orderDetailCode: orderDetailCode
      })
    }
    let data = {}
    if (self.data.currentTab == 2 && code) {
      data = {
        orderCode: self.data.orderCode,
        orderDetailCode: self.data.orderDetailCode
      }
    } else {
      data = {
        orderCode: self.data.orderCode
      }
    }
    let url = api.statement_of_account;
    util.post(url, data, res => {
      wx.showToast({
        title: '结单成功',
      })
      self.setData({
        priceBtnShow: false
      })
      this.getDateList();

      //推送消息
      let pushData = {}
      let formId = wx.getStorageSync('formId');
      pushData = {
        formid: formId,//	是	string	formid
        orderCode: self.data.orderCode
      }

      // app.messagePush(pushData);
    }, {
      loading: true
    })
  },

  //订单成交(部分/全部)
  transactionPrice(e) {
    wx.setStorageSync('formId', e.detail.formId);

    let self = this;
    let quantity = self.data.dataList.quantity
    let code = e.currentTarget.dataset.code;
    let num = e.currentTarget.dataset.quantity;
    let dealQuantity = e.currentTarget.dataset.deal;
    let orderDetailCode = '';
    if (code) {
      orderDetailCode = code
      this.setData({
        orderDetailCode: orderDetailCode
      })
    }
    if (num) {
      this.setData({ 
        spread: Number(num) - Number(dealQuantity)
      })
      quantity = num
    }

    // 1部分完成 全部完成
    if (e.currentTarget.dataset.type == 1) {
      // 主订单部分成交
      this.setData({
        addtellHidden: false,
        modalName: "portion",

      })

      // 延期子订单部分成交
      if (code) {
        this.setData({
          addtellHidden: false,
          modalName: "suborder",
        })
      }
    } else {
      this.setData({
        quantity: quantity
      })

      if (dealQuantity) {
    
        quantity = Number(quantity) - Number(dealQuantity)
      }
      
      self.toTransaction(quantity,'all')
    }
  },


  // 部分、全部成交
  toTransaction(quantity,type) {
    let self = this;
    let basePrice =''
    if(type=='all'){
      basePrice= quantity
    }else{
      basePrice=self.data.saveNUm 
    }

    let data = {}
    let orderCode = self.data.orderCode
  
    if (self.data.orderDetailCode) {

      data = {
        orderCode: orderCode,
        quantity: basePrice,
        orderDetailCode: self.data.orderDetailCode
      }
    } else {
 
      data = {
        orderCode: orderCode,
        quantity: basePrice,
      }
    }

    let url = api.transaction_pricing_order;
    util.post(url, data, res => {
      wx.showToast({
        title: '已成交',
      })
      this.setData({
        // orderRemark: '',
        // basep:''
      })


      this.getDateList();
      this.setData({
        addtellHidden: true
      })

      //推送消息
      let pushData = {}
      let formId = wx.getStorageSync('formId');
      pushData = {
        formid: formId,//	是	string	formid
        orderCode: self.data.orderCode
      }
      // app.messagePush(pushData);
    }, {
      loading: true
    })
  },

  // 点价取消
  cancelPrice(e) {

    wx.setStorageSync('formId', e.detail.formId);

    let self = this;
    let url = api.cancel_pricing_order;
    let code = e.currentTarget.dataset.code;
    let orderDetailCode = '';
    let data = {}

    if (code) {
      orderDetailCode = code
      this.setData({
        orderDetailCode: orderDetailCode
      })
    }
    if (code && self.data.currentTab == 2) {
      data = {
        orderCode: self.data.orderCode,
        orderDetailCode: self.data.orderDetailCode
      }
    } else {
      data = {
        orderCode: self.data.orderCode,
      }
    }
    util.post(url, data, res => {
      wx.showToast({
        title: '取消成功',
      })
      self.setData({
        priceBtnShow: false
      })
      this.getDateList();

      //推送消息
      let pushData = {}
      let formId = wx.getStorageSync('formId');
      pushData = {
        formid: formId,//	是	string	formid
        orderCode: self.data.orderCode
      }

      // app.messagePush(pushData);
    }, {
      loading: true
    })
  },

  //显示子菜单按钮
  toggleDetailBtn(e) {

    let time = e.currentTarget.dataset.time
    let index = e.currentTarget.dataset.listidx

    let that = this;
    let toggleBtnVal = that.data.uhide;

    if (toggleBtnVal == index) {
      that.setData({
        uhide: '-1'
      })
    } else {
      that.setData({
        uhide: index
      })
    }
  },


  // onUnload(){
  //   wx.switchTab({
  //     url: "/pages/workBench/index/index",
  //   });
  // },
  // onUnload: function () {
  //   wx.reLaunch({
  //     url: "/pages/workBench/index/index",
  //   })
  // }

  // onUnload(){
  //   wx.redirectTo({
  //     url: "/pages/workBench/index/index",
  //   })
  // }

})