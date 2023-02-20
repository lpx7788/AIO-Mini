const app = getApp()
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
import config from '../../../utils/config.js';
Page({

  data: {
    avatarUrl: 'https://aio.manytrader.net/preViewUploadFile/images/icon-mine-active.png',//用户头像
    token: '',
    downURl: '',
    modalHidden: true,
    userList:{},//用户信息
    isLogin: false,
    pageStatus: false,
    authorizationMsg:'',
    status:0,

  },

  onLoad: function(options) {

    let self = this
    let userInfo ={}
    let status = '';
    if (wx.getStorageSync('userInfo')){
      userInfo= JSON.parse(wx.getStorageSync('userInfo'));
    }
  
    if (userInfo.user) {
      status = userInfo.user.status;
      self.setData({
        status: status ? status : '',
      })
    }
    this.getUserData();
    let isLogin = wx.getStorageSync('isLogin') ? wx.getStorageSync('isLogin') : ''
    let authorizationMsg = wx.getStorageSync('authorizationMsg') ? wx.getStorageSync('authorizationMsg') : ''
    self.setData({
      isLogin: isLogin,
      authorizationMsg: authorizationMsg
    })

  },

  onReady: function() {
    this.setData({
      token: wx.getStorageSync('token')
    })
  },
  
  onShow: function () {
    let token = wx.getStorageSync('token')
    if (token) {
      this.setData({
        token: token 
      })
    }

    if (!this.data.pageStatus) {
      this.setData({
        pageStatus: true
      })
      return
    } else {
      this.getUserData();
    }
  },

  //下拉刷新
  onPullDownRefresh() {
    this.getUserData();
  },

  //获取用户信息
  getUserData() {
    let self = this;
    util.post(api.user_refresh_url, {},res => {
      self.data.token = res.returnObject.access_token;
      wx.setStorageSync('token', res.returnObject.access_token)
      wx.setStorageSync('userInfo', JSON.stringify(res.returnObject))
      self.setData({
        userList: res.returnObject.user,
        status: res.returnObject.user.status
      })
      
      wx.stopPullDownRefresh();

    }, {
        loading: true
      }, fail => {
        self.setData({
          userList: []
        })
      })
  },

  //关注公众号
  toQrcode(e){
    util.goto(e);
  },

  goto: function(e) {
    if (wx.getStorageSync('token') == '') {
      wx.navigateTo({
        url: '../../../pages/login/index/index',
      })
    }else{
      util.goto(e);
    }
  },

  gotoNew(e){

    wx.setStorageSync('webViewUrl', config.ApiUrl + '/xszy/index.html')
    util.goto(e);
    
  },

  openAPP(){
    app.isOpenAPP();
  },


  //切换公司
  changeCompany(){
    wx.navigateTo({
      url: '../changeCompany/changeCompany'
    })
  },

  //判断登陆
  loginBtn(){
    // 未登录
    if (wx.getStorageSync('token') == '') {
      wx.navigateTo({
        url: '../../../pages/login/index/index',
      })
    }
  }
})
