const app = getApp()
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    verification: true,
    inputType: true,
    second: null,
    userPhone: '',//电话
    userPassword: '',//密码
    verificationCode: ''//验证码
  },

  //修改密码
  resetPassword() {
    let self = this;
    if (self.data.userPhone == '') {
      wx.showToast({
        title: '请输入手机号码！',
        icon: 'none',
        duration: 1000
      })
      return;
    } else if (self.data.verificationCode == ''){
      wx.showToast({
        title: '请输入验证码！',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    else if (self.data.userPassword == '') {
      wx.showToast({
        title: '请输入密码！',
        icon: 'none',
        duration: 1000
      })
      return;
    } 
    util.post(api.reset_password_url, {
      userPhone: self.data.userPhone,
      userPassword: self.data.userPassword,
      verificationCode: self.data.verificationCode
    }, 
    res => {
      wx.showToast({
        title: '修改成功',
        duration: 1000
      })
      //返回上一级页面
      setInterval(function () {
        wx.navigateBack()
      }, 2000)
    }, 
    {
        loading: true
    }, 
    fail => {
        wx.showModal({
          title: '提示信息',
          content: fail.data.errorMsg,
          showCancel: false
        })
      })

  },
 
 //验证码
  vFInput(e){
    this.setData({
      verificationCode: e.detail.value 
    })
  },

  //电话
  phoneInput(e) {
    this.setData({
      userPhone: e.detail.value 
    })
  },

  //密码
  pWInput(e) {
    this.setData({
      userPassword: e.detail.value 
    })
  },
  
  //获取验证码
  getVerification() {
    let self = this;
  
    if (self.data.userPhone==''){
      wx.showToast({
        title: '请输入手机号码！',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    self.setData({
      verification: false
    })
    self.countdown(60)

    util.post(api.get_verificationCode_url, {
      userPhone: self.data.userPhone,
    },
      res => {
      
      },
      {
        loading: true
      },
      fail => {
        wx.showModal({
          title: '提示信息',
          content: fail.data.errorMsg,
          showCancel: false
        })
      })
  },


  userNameInput: function (e) {
    this.setData({
      userName: e.detail.value
    })
  },

  countdown(s) {
    setTimeout(() => {
      this.setData({
        verification: true
      })
    }, s * 1000);
    this.setData({
      second: s
    })
    this.refreshText()
  },

  refreshText() {
    let timer = setTimeout(() => {
      this.setData({
        second: this.data.second - 1
      })
      if (this.data.second <= 0) {
        clearTimeout(timer)
      } else {
        this.refreshText()
      }
    }, 1000);
  },

  changeInputType(){
    this.setData({
      inputType: !this.data.inputType
    })
  },


})