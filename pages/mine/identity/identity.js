// pages/mine/identity/identity.js
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
import config from '../../../utils/config.js';
const app = getApp()


Page({

  data: {
    companyName:'',//企业名称
    userName: '',//用户名称
    userIdentity: '',//用户身份证
    userIdentityCheck: '',
    userNameCheck: '',
  },
 
  onLoad: function (options) {

    if (options.companyName){
     this.setData({
       companyName: options.companyName 
     })
    }

    // let code = 441621199604046412  
    // let company = 广州尊鑫实业有限公司
    let userIdentity = '';
    let userIdentityCheck = '';
    let userName = '';
    let userNameCheck = '';
    let userInfo = '';
    if (wx.getStorageSync('userInfo')){
      userInfo = JSON.parse(wx.getStorageSync('userInfo'));
    }

    if (userInfo){
      if (userInfo.user){
      userIdentityCheck = userInfo.user.userIdentity?userInfo.user.userIdentity:'',
      userIdentity = userInfo.user.userIdentity?userInfo.user.userIdentity:'',
      userName = userInfo.user.userName?userInfo.user.userName:''
      userNameCheck = userInfo.user.userName?userInfo.user.userName:''
      }
    }

    this.setData({
      userIdentity: userIdentity,
      userIdentityCheck: userIdentityCheck,
      userName: userName,
      userNameCheck: userNameCheck,
    })
  },

  //企业申请
  validationBtn() {
    let self = this;
    if(self.data.userName == '') {
      wx.showToast({
        title: '请输入用户名称！',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    else if (self.data.userIdentity == '') {
      wx.showToast({
        title: '请输入用户身份证！',
        icon: 'none',
        duration: 1000
      })
      return;
    }

    else if (self.data.companyName == '') {
      wx.showToast({
        title: '请输入企业全称！',
        icon: 'none',
        duration: 1000
      })
      return;
    } 
    wx.showModal({
      title: '温馨提示',
      content: '确定提交认证？',
      success(res) {
        if (res.confirm) {
          self.toValidation()
        } else if (res.cancel) {
        }
      }
    })

  },

  toValidation(){
    let self = this;
    util.post(api.userCompany_join_url, {
      companyName: self.data.companyName,
      userName: self.data.userName,
      userIdentity: self.data.userIdentity
    },
    res => {
      wx.showToast({
        title: '提交成功!',
        duration: 1000
      })
      setTimeout(function () {
        wx.navigateBack({
          delta: 2
        })
      }, 1000)
    },
    {
      loading: true
    },
    fail => {
      if (fail.errorCode==1030){
        wx.showModal({
          title: '温馨提示',
          content: self.data.companyName+'未入驻平台，是否申请入驻平台？',
          success(res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '../companyCertification/companyCertification?companyName=' + self.data.companyName,
              })
            }
          }
        })
      }
    })
  },

//获取企业名称
  companyNameInput(e) {
    this.setData({
      companyName: e.detail.value
    })
  },

  //获取身份证号
  userIdentityInput(e) {
    this.setData({
      userIdentity: e.detail.value
    })
  },

//获取真实姓名
  userNameInput(e) {
    this.setData({
      userName: e.detail.value
     
    })
  },

})