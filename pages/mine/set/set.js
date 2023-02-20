const app = getApp()
import util from '../../../utils/util.js';


Page({

  data: {
    
  },

  onLoad: function (options) {

  },

  goto: function (e) {
    util.goto(e);
  },

  // 退出登录
  loginOut(){
    wx.showModal({
      title: '温馨提示',
      content: '您确定要退出吗？',
      success(res) {
        if (res.confirm) {
          wx.showToast({
            title: '退出成功',
          })
          wx.clearStorage();
          setTimeout(function(){
            wx.navigateBack()
          },1000)
        } else if (res.cancel) {
        }
      }
    })
    
  },

  // 更换手机
  changePhone(){
    wx.showModal({
      title: '温馨提示',
      content: '是否更换手机？',
      success(res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '../changePhoneNum/changePhoneNum',
          })
        } else if (res.cancel) {
          // console.log('用户点击取消')
        }
      }
    })
  }
})