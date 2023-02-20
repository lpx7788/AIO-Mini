


var util = require('./utils/util.js');
var api = require('./utils/api.js');
var config = require('./utils/config.js');
let userInfo = wx.getStorageSync('userInfo');
let userCode;
let self = this;

App(

  {
    globalData: {
      queryQuotaData: null, //商品额度
      delayMidpointsData: null, //商品详情页的数据
      userInfo: null,
      token: '',
      filterData: {},
      socket1Status: null,
      _socket1Status: null,
      socket1: {},
      socket2: {},
      callback: function () { },
      companyNameSelect: [],
      companyCodeSelect: [],
      friendGameMath:'',
      name:null,
      _name: null,
      userCode:null
    },
    onLaunch: function () {
     
      wx.setStorageSync('readyState', '');
      // 测试未登录状态
      let token = wx.getStorageSync('token');
      let userInfo =wx.getStorageSync('userInfo');

      if (token) {
        if (userInfo){
          userInfo = JSON.parse(wx.getStorageSync('userInfo'))
          if (userInfo.user){
            this.globalData.userCode = userInfo.user.userCode;
            wx.setStorageSync('userCode', this.globalData.userCode)
          }
        }
      } else {
        this.globalData.userCode = (Math.random() * 1000 + 1)
      }

      //检测版本更新
      this.versionUpdating();
    },

    onShow: function () {
      let self = this
      //socket的链接
      self.initSocket('socket1', config.default.WebSocketUrl + api.default.webSk_md_url + '?userCode=' + self.globalData.userCode)
      self.initSocket('socket2', config.default.WebSocketUrl + api.default.webSk_service_url)

    },

    // 监听socket是否打开
    watch: function (method) {
      var obj = this.globalData;
      Object.defineProperty(obj, "socket1Status", {
        configurable: true,
        enumerable: true,
        set: function (value) {
          this._socket1Status = value;
          method(value);
        },
        get: function () {
          // 可以在这里打印一些东西，然后在其他界面调用getApp().globalData.name的时候，这里就会执行。
          return this._socket1Status
        }
      })
    },
   
    versionUpdating(){
      const updateManager = wx.getUpdateManager()

      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
      })

      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: function (res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate()
            }
          }
        })
      })

      updateManager.onUpdateFailed(function () {
        // 新版本下载失败
      })
    

   },

   //初始化scoket
    initSocket(socket, url) {
      let self = this;
      if (self.globalData[socket].readyState == 0 || self.globalData[socket].readyState == 1) {
        return;
      }

      // socket创建连接
      self.globalData[socket] = wx.connectSocket({
        url: url,
        success: function (res) {
        }
      })

      // socket连接已打开
      self.globalData[socket].onOpen(function (res) {

        console.log('连接已打开', socket);
        if (socket == 'socket1'){
          self.globalData.socket1Status = self.globalData[socket].readyState
        }
        wx.setStorageSync('readyState', self.globalData[socket].readyState)
       
      })

      // socket发生错误
      self.globalData[socket].onError(function (res) {
        if (!self.globalData[socket]){
          return;
        }
        if (self.globalData[socket].readyState == 0 || self.globalData[socket].readyState == 1) {
          return;
        }
        self.globalData.friendGameMath = ''
        
        if (socket == 'socket1') {
          self.initSocket('socket1', config.default.WebSocketUrl + api.default.webSk_md_url + '?userCode=' + self.globalData.userCode)
          self.globalData.socket1Status = self.globalData[socket].readyState
        } else if (socket == 'socket2'){
          self.initSocket('socket2', config.default.WebSocketUrl + api.default.webSk_service_url)
        }
      })

      // socket已关闭
      self.globalData[socket].onClose(function (res) {
        console.log('连接已关闭', socket);
        self.globalData.friendGameMath =''

        if (socket == 'socket1') {
          self.initSocket('socket1', config.default.WebSocketUrl + api.default.webSk_md_url + '?userCode=' + self.globalData.userCode)
          self.globalData.socket1Status = self.globalData[socket].readyState
        } else if (socket == 'socket2'){
          self.initSocket('socket2', config.default.WebSocketUrl + api.default.webSk_service_url)
        }
       
      })

    },

    //socket发送消息
    sendSocketMessage: function (msg, socket) {
      console.log('socket发送的参数====',msg);
      let that = this
      return new Promise((resolve, reject) => {
        if (this.globalData[socket].readyState === 1) {
          this.globalData[socket].send({
            data: msg,
            success: function (res) {
              console.log('发送成功');
              resolve(res)
            },
            fail: function (e) {
              reject(e)
            }
          })
        } else {
        }
      })
    },

    // //打开app
    isOpenAPP() {
      wx.getSystemInfo({
        success: function (res) {
          wx.navigateTo({
            url: '/pages/mine/toAPP/toAPP?deviceType=' + res.platform ,
          })
        }
      })
    },

    //消息推送
    messagePush(pushData) {
      // util.default.post(api.default.push_orderPush, pushData, res => {
      // }, {
      //     loading: true
      //   })

    },
    
    //保存formId
    saveFormId(data){
      let formIdData ={
        formId: data
      }
      util.default.post(api.default.push_savaFormId, formIdData, res => {
          wx.setStorageSync('formIdList','')
      }, {
          loading: true
        })
    }

  

  })