// pages/mine/changeCompany/changeCompany.js
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';

Page({

  data: {
    companyList: [],
    status:'',
    userCompanyStatus:'',
    filterDataStatus:false
  },

  onLoad: function (options) {
    let self = this;
    let status = '';
    let userInfo = {};
    if (wx.getStorageSync('userInfo')) {
      userInfo = JSON.parse(wx.getStorageSync('userInfo'));
    }
    if (userInfo.user) {
      status = userInfo.user.status;
      self.setData({
        status: status ? status : '',
      })
    }
    this.getUserCompanyList();
  },

  onShow(){
    if (!this.data.filterDataStatus) {
      this.setData({
        filterDataStatus: true
      })
      return
    } else {
       this.getUserCompanyList();
    }
  },

  // 获取可切换公司列表
  getUserCompanyList(){
    util.post(api.company_list_url, {
    }, res => {
      this.setData({
        companyList: res.returnObject,
        userCompanyStatus: res.returnObject[0].userCompanyStatus
      })
      
    }, {
      loading: true
    },
    fail => {

    })
  },

  goto(e) {
    util.goto(e);
  },

  //切换公司
  changeCompany(e){
    let self= this;
    let item =  e.currentTarget.dataset.listitem;
    let companyCode = e.currentTarget.dataset.companycode;

    if (item.userCompanyStatus!=2){
      return;
    }
    this.setData({
      userCompanyStatus:2
    })
    
    util.post(api.change_company_url, {
      companyCode: companyCode
    }, res => {
      wx.setStorageSync('token', '')
      wx.setStorageSync('token', res.returnObject.access_token)
      wx.setStorageSync('userInfo', '')
      wx.setStorageSync('userInfo', JSON.stringify(res.returnObject))

      self.data.companyList.forEach(function(item,idx){
          item.selected = "N";
        if (item.companyCode == companyCode){
          item.selected = "Y";
        }
      })
      self.setData({
        companyList: self.data.companyList
      })

        wx.showToast({
          title: '切换成功',
          icon: 'success',
          duration: 2000
        })
      setTimeout(function(){
        wx.navigateBack()
      },1000)
    }, {
        loading: true
      },
      fail => {

      })
  }
})