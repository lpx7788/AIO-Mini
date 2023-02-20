// pages/mine/changePW/changePW.js
const app = getApp()
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
Page({

  data: {
    inputType: true,
    userPhone:'',//用户手机
    userPassword:''//用户密码
  },
  onLoad(){
    wx.setStorageSync('loginPage', false)
  },

  //验证码
  vInput(e) {

    if (e.currentTarget.dataset.name =='psw'){
      this.setData({
        userPassword:e.detail.value
      })
    }
    if (e.currentTarget.dataset.name == 'phone'){
      this.setData({
        userPhone: e.detail.value
      })
    }
 
  },

  //修改密码
  resetPassword() {
    let self = this;

    let userPhone = wx.getStorageSync('phone') ? wx.getStorageSync('phone'):''
    let openId = wx.getStorageSync('openId') ? wx.getStorageSync('openId'):''
    if (self.data.userPassword   == '') {
      wx.showToast({
        title: '请输入密码！',
        icon: 'none',
        duration: 1000
      })
      return;
    } 
    if (self.data.userPassword.length < 6) {
      wx.showToast({
        title: '密码至少6位',
        icon: 'none',
        duration: 1000
      })
      return;
    }

    if (self.data.userPhone){
      if (!(/^1(3|4|5|7|8)\d{9}$/.test(self.data.userPhone))) {
        wx.showToast({
          title: '手机号码错误',
          icon: 'none',
          duration: 1000
        })
        return;
      } 
    }
  
    util.post(api.weChatRegister_url, {
      refereePhone: self.data.userPhone,
      userPassword: self.data.userPassword,
      userPhone: userPhone,
      openId: openId
    
    },
      res => {
        wx.showToast({
          title: '设置成功',
          duration: 1000
        })
        console.log('res====注册返回的数据');
        console.log(res);
        //登陆返回刷新首页
        wx.setStorageSync('loginPage', true)
        wx.setStorageSync('token', res.returnObject.access_token)
        wx.setStorageSync('userInfo', JSON.stringify(res.returnObject))
        setTimeout(function(){
          wx.navigateBack({
            delta: 2
          })
        },2000)
      },
      {
        loading: true,
        login: 'login'
      },
      fail => {
        wx.showModal({
          title: '提示信息',
          content: fail.errorMsg,
          showCancel: false
        })
      })
  },

  // 获取输入值
  changeInputType() {
    this.setData({
      inputType: !this.data.inputType
    })
  },


})