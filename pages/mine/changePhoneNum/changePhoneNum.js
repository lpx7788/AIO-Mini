const app = getApp()
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
Page({


  data: {
    verification: true,
    inputType: true,
    second: null,
    userPhone: '',//电话
    userPassword: '',//密码
    verificationCode: ''//验证码
  },

  onLoad: function (options) {

  },



  

  //修改密码
  resetPassword() {
    let self = this;

    //验证手机号码
     
    
    if (!self.data.userPhone) {
      wx.showToast({
        title: '请输入手机号码！',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    else if (!(/^1(3|4|5|7|8)\d{9}$/.test(self.data.userPhone))) {
      wx.showToast({
        title: '请输入正确的11位手机号码',
        icon: 'none',
        duration: 1000
      })
      return;
    }
     else if (self.data.verificationCode == '') {
      wx.showToast({
        title: '请输入验证码！',
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
          title: '更换成功',
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
      
      })

  },

  //验证码
  vFInput(e) {
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

  //获取验证码
  getVerification() {
    let self = this;

    if (!self.data.userPhone) {
      wx.showToast({
        title: '请输入手机号码！',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    else if (!(/^1(3|4|5|7|8)\d{9}$/.test(self.data.userPhone))) {
      wx.showToast({
        title: '请输入正确的11位手机号码',
        icon: 'none',
        duration: 1000
      })
      return;
    }

  

    util.post(api.get_verificationCode_url, {
      userPhone: self.data.userPhone,
    },
      res => {
        self.setData({
          verification: false
        })
        setTimeout(function(){
          self.countdown(60)
        },1000)
      },
      {
        loading: true
      },
      fail => {
       
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

  changeInputType() {
    this.setData({
      inputType: !this.data.inputType
    })
  },


})