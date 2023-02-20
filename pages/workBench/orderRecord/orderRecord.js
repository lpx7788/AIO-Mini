
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
const app = getApp()

Page({

  data: {
    orderCode:'',//订单编号
    dataList:'',//订单列表
  },

  onLoad: function (options) {
    let orderCode = options.orderCode
    if (options.orderCode){
      this.setData({
        orderCode:orderCode
      })
    }
    this.getDateList();
  },

  //获取页面数据
  getDateList() {
    let self = this;
    util.post(api.get_order_flow_url, {
      orderCode: self.data.orderCode
    }, res => {
      let dataList = res.returnObject
      self.setData({
        dataList: dataList
      })
    }, {
        loading: true
      })
  },


})