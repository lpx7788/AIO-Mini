import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
let attributes = [];
Page({
  data: {
    swiperCurrent: 0,//当前高亮
    num:'',//输入的数量
    categoryCode:'',//合约月
    releaseCode:'',//商品编号
    attributes:[],//商品信息
    categoryName:'',//商品种类
    page: '',//floatingPrice升贴水  "repertory"库存
    currentTab: 1//1仅限于该报价、2该报价和未成交订单
  },

  onLoad: function (options) {
    let self = this
    let dataList = JSON.parse(options.dataList);
    let categoryCode;
    let releaseCode;
    let categoryName;
    let page='';

    if (options.pageType){
      page = options.pageType
    }
    if (options.categoryCode){
      categoryCode = options.categoryCode
    }
    if (options.categoryName){
      categoryName = options.categoryName
    }
   if (options.releaseCode){
      releaseCode = options.releaseCode
    }
    for (let i = 0; i < dataList.length; i++) {
      attributes.push({})
    }
    
   dataList.forEach(function (item, index) {
      attributes[index]['attributeCode'] = item.attributeCode
      attributes[index]['editStockNum'] = ''
    })
    self.setData({
      dataList: dataList,
      categoryCode: categoryCode,
      releaseCode: releaseCode,
      categoryName:categoryName,
      attributes: attributes,
      page: page
    })
    this.getPorderNumber();
  },

  selectTab(e){
    let self = this,
    current = e.currentTarget.dataset.current;
    self.setData({
      currentTab: current,
    })

},

  inputNum(e){
    let self = this;
    let editStockNum = e.detail.value
    let dataList = self.data.dataList
    if (e.target.dataset.name == "floatingPrice"){
      attributes[self.data.swiperCurrent]['newFloatPrice'] = editStockNum
    }else{
      attributes[self.data.swiperCurrent]['editStockNum'] = editStockNum
    }
  
    self.setData({
      attributes: attributes
    })
  },

  //滑动
  swiperTab(e) {
    let self = this;
    self.setData({
      swiperCurrent: e.detail.current
    })
  },

  //点击商品切换
  clickTab(e) {
    let self = this,
      current = e.currentTarget.dataset.current;
    self.setData({
      swiperCurrent: current,
    })
  },
  
  // 修改升贴水
  confirmBtn(){
    this.setData({
      showModal: false,
      propList: []
    })

    let self = this;
    let data = {}
    data = {
      isUpdateOrder: self.data.currentTab,
      releaseCode: self.data.releaseCode ? self.data.releaseCode : '',
      attributes: self.data.attributes,
    }
    util.post(api.update_product_floatingPrice, data, res => {
      wx.showToast({
        title: '操作成功',
        icon: 'none'
      })
     
    }, {
        loading: true
      },fail=>{
        if (fail.errorCode==6038){
          let arr = fail.returnObject;
          let propList = []
          arr.forEach(function (item, index) {

            propList.push({
              title: '',
              name: item
            }, {
                title: '',
                name: ''
              })
          })
          this.setData({
            showModal: true,
            propList: propList
          })
      }
     
      })
  },

  // 获取额度消息
  modify() {
    let dataList = this.data.dataList
    let self = this;
   this.data.attributes.forEach(function(item,index){
      if(!item.editStockNum) {
        wx.showToast({
          title: '商品' + (index + 1) + '未输入数量',
          icon: 'none'
        })
        return;
      }else{
        self.modifyAjax();
      }
    })
  },
  
  //确定修改升贴水
  confirmPriceAjax(){
    let self = this;
    let data = {}
    data = {
      isUpdateOrder: self.data.currentTab,
      releaseCode: self.data.releaseCode ? self.data.releaseCode:'',
      attributes: self.data.attributes
    }
    util.post(api.confirm_update_floatingPrice, data, res => {
      wx.showToast({
        title: '修改成功',
      })
      setTimeout(function(){
        wx.navigateBack({})
      },1000)
    }, {
        loading: true
      })
  },


  modifyAjax(){
    let self = this;
    let data = {}
    data = {
      categoryCode: self.data.categoryCode,
      releaseCode: self.data.releaseCode ? self.data.releaseCode:'',
      attributes: self.data.attributes
    }
    util.post(api.update_product_stock, data, res => {
      wx.showToast({
        title: '修改成功',
      })
      setTimeout(function(){
        wx.navigateBack({})
      },1000)
    }, {
        loading: true
      })
  },
 
  // 获取未成交订单数
  getPorderNumber(){
    let self = this;
    let data = {}
    data = {
      releaseCode: self.data.releaseCode ? self.data.releaseCode:'',
    }
    util.post(api.pending_order_number, data, res => {
      self.setData({
        orderNumList: res.returnObject
      })
    }, {
        loading: true
      })
  }
})

