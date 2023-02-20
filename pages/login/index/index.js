// pages/login/index.js
import common from '../../../utils/util.js';
import api from '../../../utils/api.js';
const app = getApp();
Page({

  data: {
    name:'聚点商城',
    bg:'https://aio.manytrader.net/preViewUploadFile/images/login-bg.png',
    isLogin:false,
  },

  onLoad: function(options) {
    wx.setStorageSync('loginPage', false)
    let isLogin = wx.getStorageSync('isLogin')
    var page = getCurrentPages(),
      options = page[page.length - 2].options,
      router = `/${page[page.length - 2].route}`;
    this.setData({
      options,
      router,
      isLogin: isLogin
    })
  },

  //获取手机号
  getPhoneNumber(e) {
    
    var _this = this;
    var code = ''; //承接login api拿到的code 用来换取实时的openId
    var encryptData = e.detail.encryptedData; //传给后台解析用户手机授权信息 下同
    var iv = e.detail.iv;
    //不允许情况
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      return;
    }


    // let res = { "errorCode": "0000", "errorMsg": "请求成功", "returnObject": { "access_token": "b6b89d28ef6b4f568a5696ce5f208395_39055c4433fc41919480566a9d853cf1", "user": { "qq": null, "auths": { "companyCode": "39055c4433fc41919480566a9d853cf1", "userCompanyStatus": "2", "companyIdentity": "3", "userCompanyStatusExp": "已认证", "autoHedgeSwitch": "1", "companyName": "广州星星实业有限公司", "roleCode": "0", "companyIdentityExp": "买家与卖家", "roleCodeExp": "超级管理员", "signAutoHedgeProtocol": "1" }, "userPhone": "18620669013", "userIdentity": "431103199801010126", "userName": "胡眉佳", "isBuyer": "1", "allowPricing": "1", "userCode": "b6b89d28ef6b4f568a5696ce5f208395", "userWechat": null, "openNewsPopup": null, "availableIntegral": "31556", "aboutToIntegral": "115000", "businessDirection": "3", "beenusedIntegral": "57332", "userEmail": null, "id": 2107, "status": "2" } }, "type": null, "requestId": null }

    // wx.setStorageSync('token', res.returnObject.access_token)
    // wx.setStorageSync('userInfo', JSON.stringify(res.returnObject))
    // return



    // let res = { "errorCode": "0000", "errorMsg": "请求成功", "returnObject": { "access_token": "92587a2bfe824c0381889ae55a704fcb_d1308fb8e29043038369dbb6b484147c", "user": { "qq": null, "auths": { "companyCode": "d1308fb8e29043038369dbb6b484147c", "userCompanyStatus": "2", "companyIdentity": "3", "userCompanyStatusExp": "已认证", "autoHedgeSwitch": "0", "companyName": "广州卓业有限公司", "roleCode": "0", "companyIdentityExp": "买家与卖家", "roleCodeExp": "超级管理员", "signAutoHedgeProtocol": "1" }, "userPhone": "15207625843", "userIdentity": "441621199604046412", "userName": "叶晓强", "isBuyer": "1", "allowPricing": "1", "userCode": "92587a2bfe824c0381889ae55a704fcb", "userWechat": null, "openNewsPopup": "1", "availableIntegral": "0", "aboutToIntegral": "5000", "businessDirection": "3", "beenusedIntegral": "0", "userEmail": null, "id": 2009, "status": "2" } }, "type": null, "requestId": null }

    // wx.setStorageSync('token', res.returnObject.access_token)
    // wx.setStorageSync('userInfo', JSON.stringify(res.returnObject))
    // return


// let res ={"errorCode":"0000","errorMsg":"请求成功","returnObject":{"access_token":"6a4e4460b2474fe08459acf0de130a6f_f79829575291436bb2083308fe9f5f43","user":{"qq":null,"auths":{"companyCode":"f79829575291436bb2083308fe9f5f43","userCompanyStatus":"2","companyIdentity":"3","userCompanyStatusExp":"已认证","autoHedgeSwitch":"0","companyName":"广州尊鑫实业有限公司","roleCode":"1","companyIdentityExp":"买家与卖家","roleCodeExp":"管理员","signAutoHedgeProtocol":"0"},"userPhone":"13430319375","userIdentity":"441621199604046412","userName":"王老板","isBuyer":"1","allowPricing":"1","userCode":"6a4e4460b2474fe08459acf0de130a6f","userWechat":null,"openNewsPopup":null,"availableIntegral":"0","aboutToIntegral":"2000","businessDirection":"3","beenusedIntegral":"0","userEmail":null,"id":2054,"status":"2"}},"type":null,"requestId":null}

//     wx.setStorageSync('token', res.returnObject.access_token)
//     wx.setStorageSync('userInfo', JSON.stringify(res.returnObject))
//     return;

    wx.login({
      success: function(res) {
        code = res.code;
        // 用户通过微信授权 手机号码授权
        common.post(api.login_url, {
          code: code,
          encryptData: encryptData,
          iv: iv,
          authorizationMsg: wx.getStorageSync('authorizationMsg')
        },
         res => {

            app.globalData.user_info = res.returnObject;
            app.globalData.token = res.returnObject.access_token;
      
            wx.setStorageSync('token', res.returnObject.access_token)
            wx.setStorageSync('userInfo', JSON.stringify(res.returnObject))

            let options = _this.data.options;
            let router = _this.data.router;
            let str = '';
            for (let k in options) {
              str += `${k}=${options[k]}&` //拼接参数
            }
            str = (str.substring(str.length - 1) == '&') ? str.substring(0, str.length - 1) : str; //去除最后一个&符号


           let pages = getCurrentPages();
           let prevPage = pages[pages.length - 2];
           prevPage.setData({
             loginPage: true
           });
           wx.setStorageSync('loginPage', true)

            setTimeout(function () {
              wx.navigateBack({
                url: `${router}?${str}`
              })
            }, 1000);
        
          }, 
          {
            loading: true,
            login:'login'
          },
          fail=>{
            if (fail.errorCode == 2021 && fail.errorMsg=='解密失败'){
             return;
            }
            if (fail.errorCode == 2021 && fail.errorMsg == '该用户未注册'){
              wx.setStorageSync('openId', fail.returnObject.openId)
              wx.setStorageSync('phone', fail.returnObject.phone)
              wx.navigateTo({
                url: '../../mine/setPW/setPW',
              })
            }
          }
        )
      }
    })

  },
  
})

