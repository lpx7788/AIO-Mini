// pages/mine/identityRes/identityRes.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceType: null,
  },

  onLoad: function (options) {
    this.setData({
      deviceType: options.deviceType? options.deviceType:'null'
    })
  },


})