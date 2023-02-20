// pages/workBench/warehouse/warehouse.js

import util from '../../../utils/util.js';
import api from '../../../utils/api.js';

const app = getApp()
Page({


  data: {
    dataTit:'请选择省份和城市',
    dataList:{},
    warehouseList: [],//仓库列表
    address:''//地址
  },

  onLoad: function (options) { 
    let self =this
    let datas ='';
    if (options.data){
      datas = JSON.parse(options.data) 
    }
    let attributes = []
    attributes = datas.attributes ? datas.attributes:'';
    this.setData({
      dataList: datas,
      attributes:attributes
    })

    let warehouseList =[] ;
    for (let i = 0; i<attributes.length;i++){
      warehouseList.push({
        name: "",
        shortName: "",
        province: "",
        city: "",
        address: ""
      })
      this.setData({
        warehouseList: warehouseList
      })
    }
  },

  // 获取商品的值
  inputValue(e) {
    let itemname = e.currentTarget.dataset.name;
    let idx = e.currentTarget.dataset.listindex;
    let warehouseList = this.data.warehouseList;
    warehouseList[idx][itemname] = e.detail.value
    this.setData({
      warehouseList: warehouseList
    })
  },

  // 获取选中城市
  getRegionCode(e) {

    let idx = e.currentTarget.dataset.listindex;
    let regionCode = e.detail.regionCode
    let address = regionCode.trim().split(" ");
    let warehouseList = this.data.warehouseList
    warehouseList[idx].province = address[0]
    warehouseList[idx].city = address[1]

    this.setData({
      warehouseList: warehouseList
    })
  },

//确认提交（新增仓库）
  submitBtn(){
   let self = this;
    this.data.attributes.forEach(function(item,index){
       self.data.warehouseList[index].shortName = item.wareHouse
    })
   let data = {
     categoryCode: self.data.dataList.categoryCode,
     warehouse: self.data.warehouseList
   }
    util.post(api.warehouse_save,data, res => {
      wx.showToast({
        title: '新增成功',
      })
      wx.showModal({
        title: '温馨提示',
        content: '是否发布商品',
        success(res) {
          if (res.confirm) {
            // 发布求购
            self.issueBtn()
          } else if (res.cancel) {
          }
        }
      })
    }, {
        loading: true
      })
  },


  //发布求购
  issueBtn() {
    let self =this;
    let data = {}
    // 发布请求
    util.post(api.product_release, this.data.dataList, res => {
      wx.showToast({
        title: '发布成功',
      })
      setTimeout(function () {
        wx.navigateBack()
      }, 2000)
    }, {
        loading: true
      }, fail => {
      })
  },

})