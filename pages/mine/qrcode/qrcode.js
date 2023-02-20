// pages/mine/qrcode/qrcode.js
Page({

  data: {
    imgalist: ['https://aio.manytrader.net/preViewUploadFile/images/qrcode.jpg'],
    // imgalist: ['https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1558675865413&di=7ac24683fa31278053665e217b74be64&imgtype=0&src=http%3A%2F%2Fi2.sinaimg.cn%2Fdy%2Fc%2F2014-07-18%2F1405623657_VbFlfN.jpg', ],
    
  },

  //长按图片
  previewImage: function (e) {
    wx.previewImage({
      current: this.data.imgalist, // 当前显示图片的http链接   
      urls: this.data.imgalist // 需要预览的图片http链接列表   
    })
  },

  onShareAppMessage: function () {}
})