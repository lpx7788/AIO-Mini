import util from '../../../utils/util.js';
import api from '../../../utils/api.js';

const app = getApp()
Page({

  data: {
    currentCompany: '',//当前公司
    mssagObj: {},//消息列表
    isLogin:false,//检测是否登录
    authorizationMsg:'',
    status:0,//认证状态  0是未认证
    filterDataStatus:false,//页面返回
    roleCode:''//員工身份

  },

  onLoad: function (options) {
    let self = this
    let userInfo ={};
    if (wx.getStorageSync('userInfo')){
      userInfo= JSON.parse(wx.getStorageSync('userInfo'));
    }
    let status = '';
    if (userInfo.user) {
      status = userInfo.user.status;
      self.setData({
        status: status ? status : '',
      })
    }

    let isLogin = wx.getStorageSync('isLogin') ? wx.getStorageSync('isLogin') : ''
    let authorizationMsg = wx.getStorageSync('authorizationMsg') ? wx.getStorageSync('authorizationMsg') : ''

    self.setData({
      isLogin: isLogin,
      authorizationMsg: authorizationMsg
    })

    this.getSocket();
    self.getMessageData();
    self.getUserData();
  },



  onShow: function () {
    if (!this.data.filterDataStatus) {
      this.setData({
        filterDataStatus: true
      })
      return
    } else {
      this.getUserData();
      this.getMessageData();
      this.getSocket();
    }

  },

  onReady() {
    if (!this.data.filterDataStatus) {
      this.setData({
        filterDataStatus: true
      })
      return
    } else {

    if (wx.getStorageSync('readyState') == 1) {

      this.getMessageData();
      this.getSocket()
    }
    }
  },

  getSocket() {
    let self = this;
    let mssageList = [];
    let mssagObj = {};
    app.globalData.socket2.onMessage(function (res) {
      mssageList = JSON.parse(res.data).returnObject;
      if (Array.isArray(mssageList) == true) {
        mssageList.forEach(function (item) {
          mssagObj[item.type] = item.count
        })

        self.setData({
          mssagObj: mssagObj
        })

      }
    })
  },

  onPullDownRefresh() {
    this.getUserData();
    this.getMessageData();
  },

  //获取用户信息
  getUserData() {
    let self = this;
    let token = wx.getStorageSync('token');
    if (!token){
      return;
    }
    util.post(api.user_refresh_url, {}, res => {
      wx.stopPullDownRefresh();
      let data = res.returnObject;
      let token = '';
      if (data) {
        if (data.user) {
          if (data.user.auths){
            this.setData({
              currentCompany: data.user.auths.companyName ? data.user.auths.companyName : '',
              roleCode: data.user.auths.roleCode ? data.user.auths.roleCode : '',
              status: data.user.status ? data.user.status : '',
            })
          }
        }
        if (data.access_token){
          token = data.access_token;
          wx.setStorageSync('token', token);
          wx.setStorageSync('userInfo', JSON.stringify(data))
        }
      }
     
    }, {
        loading: true
      }, fail => {
        self.setData({
          userList: []
        })
      })
  },

  //获取信息
  getMessageData() {
    let self = this;
    let token = wx.getStorageSync('token');
    let data = {
      access_token: token,
      action: "getInfoCount"
    }

    let msg = JSON.stringify(data)
    app.sendSocketMessage(msg, 'socket2')


  },

  goto(e) {
    // 未登录
    app.globalData.delayMidpointsData = ''
    let token = wx.getStorageSync('token');
    if (wx.getStorageSync('token') == '') {
      wx.navigateTo({
        url: '../../../pages/login/index/index',
      })
    }
    else if (this.data.status==0){
      wx.showModal({
        title: '温馨提示',
        content: '用户未认证',
        confirmText:'去认证',
        success(res) {
          if (res.confirm) {
              wx.navigateTo({
                url: '../../../pages/mine/identity/identity',
              })
            } else if (res.cancel) {
          }
        }
      })
    } else if (this.data.status == 1){
      wx.showModal({
        title: '温馨提示',
        content: '用户审核中,请耐心等待审核',
        confirmText: '确定',
      })
    }
   else {
      util.goto(e);
    }
  },
  
  openAPP() {
    app.isOpenAPP();
  },

  

})