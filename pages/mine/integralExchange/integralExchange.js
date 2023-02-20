// pages/mine/integralExchange/integralExchange.js
const app = getApp()
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
Page({

  data: {

    aboutToIntegral: '',//即将获得积分
    availableIntegral: '',//可用积分
    beenusedIntegral: '',//积分
    cashingIntegral: '',//当前积分
    remainingStock: '',//剩余库存
    deductNumber:'',//扣除的积分
    number:1,//兑换数量
    consigneeName:'',//收货人全名
    consigneePhone:'',//收货人电话
    commodityCode:'',//商品的编号
    commodityPhoto:'',//图片
    goodsId:'',//商品的i
    address: '',
    region: []

  },

  onLoad: function (options) {

      // 获取页面传过来的值
       let aboutToIntegral='';
       let  availableIntegral='';
       let  beenusedIntegral='';
       let commodityPhoto='';
       let  cashingIntegral='';
       let deductNumber='';
       let  remainingStock='';
       let goodsId='';
       let commodityCode='';

      if (options.aboutToIntegral){
        aboutToIntegral = options.aboutToIntegral
      }
      if (options.availableIntegral){
        availableIntegral = options.availableIntegral
      }
      if (options.commodityPhoto){
        commodityPhoto = options.commodityPhoto
      }
      if (options.beenusedIntegral){
        beenusedIntegral = options.beenusedIntegral
      }
      if (options.cashingIntegral){
        cashingIntegral = options.cashingIntegral
        deductNumber = options.cashingIntegral
      }

      if (options.remainingStock){
        remainingStock = options.remainingStock
      }
      if (options.id){
        goodsId = options.id
      }
    if (options.commodityCode){
        commodityCode = options.commodityCode
      }
 

    // 获取默认收货人名和电话
    let consigneePhone = '';
    let consigneeName = '';
    let userInfo = '';
    if (wx.getStorageSync('userInfo')) {
      userInfo = JSON.parse(wx.getStorageSync('userInfo'));
    }

    if (userInfo) {
      consigneePhone = userInfo.user.userPhone ? userInfo.user.userPhone : '',
      consigneeName = userInfo.user.userName ? userInfo.user.userName : ''
    }

    this.setData({
      aboutToIntegral: aboutToIntegral,
      availableIntegral: availableIntegral,
      beenusedIntegral: beenusedIntegral,
      commodityPhoto: commodityPhoto,
      cashingIntegral: cashingIntegral,
      remainingStock: remainingStock,
      deductNumber: deductNumber,
      commodityCode: commodityCode,
      goodsId: goodsId,
      consigneePhone: consigneePhone,
      consigneeName: consigneeName
    })

  },

  // 加
  plus(){
    let number = Number(this.data.number) + 1
    let deductNumber = Number(this.data.cashingIntegral) * number
    this.setData({
      number: number,
      deductNumber: deductNumber
    })
  },

  // 减
  subtract(){
    if (this.data.number<=1){
      return;
    }
    let number = Number(this.data.number) - 1
    let deductNumber = Number(this.data.cashingIntegral) * number
    this.setData({
      number: number,
      deductNumber: deductNumber
    })
  },

  //获取当前的数量
  getValue(e){
    let deductNumber = ''
    if(e.target.dataset.name == 'num'){
      deductNumber = Number(this.data.cashingIntegral) * Number(e.detail.value)
      this.setData({
        number: e.detail.value,
        deductNumber: deductNumber
      })
      return;
    }
    if (e.target.dataset.name == 'name'){
      this.setData({
        consigneeName: e.detail.value,
      })
      return;
    }
    if (e.target.dataset.name == 'userphone'){
      this.setData({
        consigneePhone: e.detail.value,
      })
      return;
    }
    if (e.target.dataset.name == 'address'){
      this.setData({
        address: e.detail.value,
      })
      return;
    }
  },


  //确定兑换
  confirmBtn() {
    let self = this;
  
    if (self.data.consigneePhone) {
     
    }

    let data = {}
    data = {
      id:self.data.goodsId,//是	string	兑换商品id
      commodityCode: self.data.commodityCode,//	是	string	兑换商品编号
      cashingNum: self.data.number,//	是	string	兑换商品数量

      province: self.data.region[0],// 是 string 省
      city: self.data.region[1],// 是 string 市
      area: self.data.region[2],// 是 string 区

      address: self.data.address,//	是	string	详细地址
      consigneeName: self.data.consigneeName,//	是	string	收货人姓名
      consigneePhone: self.data.consigneePhone,//	是	string	收货人电话
      integralTotal: self.data.deductNumber,//	是	string	兑换商品的总积分数
    }

    util.post(api.integral_exchange,data, res => {
      wx.showToast({
        title: '提交成功',
      })
      setTimeout(function(){
       wx.navigateBack()
      },1000)
    }, {
        loading: true
      }, fail => {
        // console.log('失败')
      })
  },

 //取消兑换
  cancelBtn(){
    wx.navigateBack()
  },

  //获取地区
  bindRegionChange(e) {
    this.setData({
      region: e.detail.value
    })
  },
})