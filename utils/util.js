import config from './config.js'
import api from './api.js'

const util = {},

  app = getApp();

util.goto = e => {
  if (!e.currentTarget.dataset.url) return;
  wx.navigateTo({
    url: e.currentTarget.dataset.url,
  })
}

util.post = (url, data, cb, extra, fail) => {

  util.ajax({
    method: 'post',
    url,
    data,
    cb,
    extra,
    fail
  })
}

util.get = (url, data, cb, extra, fail) => {
  util.ajax({
    method: 'get',
    url,
    data,
    cb,
    extra,
    fail
  })
}

util.ajax = obj => {
  let extra = Object.assign({
    key: false,
    formData: true,
    loading: false
  }, obj.extra);

  if (obj.extra.loading) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
  }

  let token = wx.getStorageSync('token');
  let url = config.ApiUrl;
  let application = 'application/json'
  if (extra.login == 'login') {
    url = config.ApiUrl2;
  }
  wx.request({
    url: url + obj.url,
    data: obj.data,
    method: obj.method,
    header: {
      'content-type': application, // 默认值,
      'access_token': token ? token : ''
    },
    success(res) {
      let data = res.data;
      if (res.statusCode && res.statusCode == '200') {
        if (data.errorCode && data.errorCode == '0000') {
          typeof obj.cb == 'function' && obj.cb(data);
        } else {
         
          if (data.errorMsg) {
            if (data.errorCode!=1030){
              wx.showToast({
                title: data.errorMsg,
                icon: 'none',
                duration: 1000
              })
            } else if (data.errorCode == 1030){
                wx.hideLoading();
            }
            
          }else{
           if (data.errorCode == '9998') {
            wx.showToast({
              title: '系统错误',
              icon: 'none',
              duration: 1000
            })
          }
          }
          typeof obj.fail == 'function' && obj.fail(data);
          return;
        }

      } else {
        if (data.errorMsg) {
          wx.showToast({
            title: data.errorMsg,
            icon: 'none',
            duration: 1000
          })
        }
        
        typeof obj.fail == 'function' && obj.fail(data);
        
        return;
      }
      if (extra.loading) {
        setTimeout(function () {
          wx.hideLoading();
        }, 100)
      }
    },
    fail(res) {
      wx.showModal({
        title: "网络超时",
        content: "请关闭刷新",
        confirmText: "知道了",
        showCancel: !1
      })
      typeof obj.fail == 'function' && obj.fail(res);
      if (extra.loading) {
        setTimeout(function () {
          wx.hideLoading();
        }, 100)}
    },
    complete() {
      if (extra.loading) {
        setTimeout(function () {
          wx.hideToast();
        }, 2000)
      }
    }
  })

}




export default util;