// pages/workBench/modifyGoods/modifyGoods.js
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
const app = getApp()

Page({

  data: {
    modifyDataList: {},
    spec: '',
    brand: '',
    other: '',
    wareHouse: '',
    floatingPrice: '',
    deliveryPattern: '',
    material: '',
    invoicedateType: '',
    settleAccountsType: '',
    remark: '',
    modalShow:true,//自定义弹窗
  },

  onLoad: function(options) {
    if (options.modifyDataList) {
      this.setData({
        modifyDataList: JSON.parse(options.modifyDataList),
        floatingPrice: JSON.parse(options.modifyDataList).floatingPrice
      })
    }
  },

// 获取各input值
  inputClick(e) {
    let name = e.currentTarget.dataset.name
    let value = e.detail.value
 
    if (value) {
      if (name == "spec") {
        this.setData({
          spec: e.detail.value
        })

      } else if (name == "brand") {
        this.setData({
          brand: e.detail.value
        })

      } else if (name == "other") {
        this.setData({
          other: e.detail.value
        })

      } else if (name == "deliveryPattern") {
        this.setData({
          deliveryPattern: e.detail.value
        })

      } else if (name == "wareHouse") {
        this.setData({
          wareHouse: e.detail.value
        })

      } else if (name == "floatingPrice") {
        this.setData({
          floatingPrice: e.detail.value
        })

      } else if (name == "material") {
        this.setData({
          material: e.detail.value
        })

      } else if (name == "invoicedateType") {
        this.setData({
          invoicedateType: e.detail.value
        })

      } else if (name == "settleAccountsType") {
        this.setData({
          settleAccountsType: e.detail.value
        })

      } else if (name == "remark") {
        this.setData({
          remark: e.detail.value
        })

      }
    }


  },

  // 验证升贴水
  confirmBtn(){
    let self = this;
    let url = api.verify_floatingPrice;
    let data = {
      orderCode: self.data.modifyDataList.orderCode ? self.data.modifyDataList.orderCode : '',
      spec: self.data.spec ? self.data.spec : self.data.modifyDataList.spec,
      brand: self.data.brand ? self.data.brand : self.data.modifyDataList.brand,
      material: self.data.material ? self.data.material : self.data.modifyDataList.material,
      other: self.data.other ? self.data.other : self.data.modifyDataList.other,
      wareHouse: self.data.wareHouse ? self.data.wareHouse : self.data.modifyDataList.wareHouse,
      floatingPrice: self.data.floatingPrice ? self.data.floatingPrice : self.data.modifyDataList.floatingPrice,
      remark: self.data.remark ? self.data.remark : self.data.modifyDataList.remark,
      deliveryPattern: self.data.deliveryPattern ? self.data.deliveryPattern : self.data.modifyDataList.deliveryPattern,
      invoicedateType: self.data.invoicedateType ? self.data.invoicedateType : self.data.modifyDataList.invoicedateType,
      settleAccountsType: self.data.settleAccountsType ? self.data.settleAccountsType : self.data.modifyDataList.settleAccountsType
    }
    
    util.post(url, data, res => {
      if (self.data.modifyDataList.floatingPrice != self.data.floatingPrice) {
        self.setData({
          modalShow: false
        })
      }else{
        self.submit();
      }
      
    }, {
        loading: true
      }, fail => {
        if (fail.errorCode==6040){

          wx.showModal({
            title: '提示',
            content: fail.returnObject ,
              success(res) {
                if (res.confirm) {
                 self.setData({
                   modalShow:false
                 })
                } else if (res.cancel) {}
              }
            })
        }
      
      })
  },


  modalConfirm(){
    this.submit();
  },
//  提交修改商品
  submit() {
    let self = this;
    let url = api.edit_Order_Product;
    let data = {
      orderCode: self.data.modifyDataList.orderCode ? self.data.modifyDataList.orderCode : '',
      spec: self.data.spec ? self.data.spec : self.data.modifyDataList.spec,
      brand: self.data.brand ? self.data.brand : self.data.modifyDataList.brand,
      material: self.data.material ? self.data.material : self.data.modifyDataList.material,
      other: self.data.other ? self.data.other : self.data.modifyDataList.other,
      wareHouse: self.data.wareHouse ? self.data.wareHouse : self.data.modifyDataList.wareHouse,
      floatingPrice: self.data.floatingPrice ? self.data.floatingPrice : self.data.modifyDataList.floatingPrice,
      remark: self.data.remark ? self.data.remark : self.data.modifyDataList.remark,
      deliveryPattern: self.data.deliveryPattern ? self.data.deliveryPattern : self.data.modifyDataList.deliveryPattern,
      invoicedateType: self.data.invoicedateType ? self.data.invoicedateType : self.data.modifyDataList.invoicedateType,
      settleAccountsType: self.data.settleAccountsType ? self.data.settleAccountsType : self.data.modifyDataList.settleAccountsType

    }
    util.post(url, data, res => {
      wx.showToast({
        title: '修改成功',
      })
      wx.navigateBack({})
    }, {
      loading: true
    })
  },

})