// pages/mine/identity/identity.js
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
import config from '../../../utils/config.js';
const app = getApp()


Page({

  data: {
    companyList: [],
    companyexist: false,
    // 所在城市
    region: [],
    // 企业身份
    identity: ['买家','卖家','买家和卖家'],
    indexIdentity: 0,
    companyName:'',//企业名称
    userName: '',//用户名称
    userIdentity: '',//用户身份证
    tradingCategoryCode: null, // 选中的品种
    // joinMsg:false , //入驻信息
    tempFilePaths: '',
    authorizationFile:'',
    imageId:'',
    imageFile:'',
    greedChecked:true,
    userIdentityCheck: '',
    userNameCheck: '',
    
  },
 
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '公司认证'
    })

    if (options.companyName){
     this.setData({
       companyName: options.companyName 
     })
    }
 
    // let code = 441621199604046412  
    // let company = 广州尊鑫实业有限公司
    let userIdentity = '';
    let userIdentityCheck = '';
    let userName = '';
    let userNameCheck = '';
    let userInfo = '';
    if (wx.getStorageSync('userInfo')){
      userInfo = JSON.parse(wx.getStorageSync('userInfo'));
    }

    if (userInfo){
      if (userInfo.user){
      userIdentityCheck = userInfo.user.userIdentity?userInfo.user.userIdentity:'',
      userIdentity = userInfo.user.userIdentity?userInfo.user.userIdentity:'',
      userName = userInfo.user.userName?userInfo.user.userName:''
      userNameCheck = userInfo.user.userName?userInfo.user.userName:''
      }
    }

    this.setData({
      userIdentity: userIdentity,
      userIdentityCheck: userIdentityCheck,
      userName: userName,
      userNameCheck: userNameCheck,
    
    })

  },

  // 是否同意
  changeChecked(){
    if (this.data.greedChecked===true){
      this.setData({
        greedChecked:false,
      })
   }else{
      this.setData({
        greedChecked: true,
      })
   }
  },
  // 选择企业所在城市
  bindRegionChange(e){
    this.setData({
      region: e.detail.value
    })
    
  },

  // 选择企业身份
  bindIdentityChange(e){
    this.setData({
      indexIdentity: e.detail.value
    })
  },


  //企业申请
  // validationBtn() {
  //   let self = this;
  //   if(self.data.userName == '') {
  //     wx.showToast({
  //       title: '请输入用户名称！',
  //       icon: 'none',
  //       duration: 1000
  //     })
  //     return;
  //   }
  //   else if (self.data.userIdentity == '') {
  //     wx.showToast({
  //       title: '请输入用户身份证！',
  //       icon: 'none',
  //       duration: 1000
  //     })
  //     return;
  //   }

  //   else if (self.data.companyName == '') {
  //     wx.showToast({
  //       title: '请输入企业全称！',
  //       icon: 'none',
  //       duration: 1000
  //     })
  //     return;
  //   } 
  //   wx.showModal({
  //     title: '温馨提示',
  //     content: '确定提交认证？',
  //     success(res) {
  //       if (res.confirm) {
  //         self.toValidation()
  //       } else if (res.cancel) {
  //       }
  //     }
  //   })

  // },

  // toValidation(){
  //   let self = this;
  //   util.post(api.userCompany_join_url, {
  //     companyName: self.data.companyName,
  //     userName: self.data.userName,
  //     userIdentity: self.data.userIdentity
  //   },
  //   res => {
  //     wx.showToast({
  //       title: '提交成功!',
  //       duration: 1000
  //     })
  //     setTimeout(function () {
  //       wx.navigateBack({
  //         delta: 2
  //       })
  //     }, 1000)
  //   },
  //   {
  //     loading: true
  //   },
  //   fail => {
  //     if (fail.errorCode==1030){
  //       self.data.joinMsg = true;
  //       self.setData({
  //         joinMsg:true
  //       })
  //     }
  //   })
  // },

 

//获取input框的值
  companyNameInput(e) {
    this.setData({
      companyName: e.detail.value
    })
  },


  userIdentityInput(e) {
    this.setData({
      userIdentity: e.detail.value
    })
  },

  userNameInput(e) {
    this.setData({
      userName: e.detail.value
     
    })
  },

  registeredCapitalInput(e){
    this.setData({
      registeredCapital: e.detail.value
    })
  },

  creditNumInput(e){
    this.setData({
      creditNum: e.detail.value
    })
  },

  //上传营业执照
  uploadLicense(e) {
    let id = e.currentTarget.id;
    let self = this;
    this.setData({
      imageId: id
    })
    wx.chooseImage({
      success(res) {
        self.setData({
          tempFilePaths: res.tempFilePaths[0]
        })

        self.submitJoinMsg(res.tempFilePaths[0], self.data.imageId)
      },
    })
 
  },

  //上传图片或者视屏到服务器
  submitJoinMsg(imgUrl, id) {
    // wx.getImageInfo({
    //   src: this.data.tempFilePaths,
    //   success: function (res) {
    //     console.log(res);
    //   }
    // });
    let self = this
    let data ={}
    let token = wx.getStorageSync('token');
    wx.showLoading({
      title: '提交中',
    })
    // for (var i = 0; i < this.data.tempFilePaths.length; i++) {   
      wx.uploadFile({
        url: config.ApiUrl + api.upload_picture,
        filePath: self.data.tempFilePaths,
        name: 'file',
        // formData:data,
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'access_token': token ? token : ''
        },
        success(res) {
      
          let fullUrl = JSON.parse(res.data).url;
          let url = JSON.parse(res.data).url;
          if (url.indexOf("/") > 0) {//如果包含有"/"号 从最后一个"/"号+1的位置开始截取字符串
            url = url.substring(url.lastIndexOf("/") + 1, url.length);
          } else {
            url = url;
          }
          if (self.data.imageId==1){
            self.setData({
              imageFile: url,
              fillImageFile:fullUrl
            })
          } else if (self.data.imageId == 2){
            self.setData({
              authorizationFile: url,
              fillAuthorizationFile: fullUrl
            })
          }
          wx.hideLoading()
        },
        fail(error) {
        }
      })
    // }
  },

  submitBtn(){
    let data = {};
    let self = this;
    if (!this.data.greedChecked){
      wx.showToast({
        title: '请同意相关协议',
        icon:'none'
      })
      return
    }
    if (!this.data.creditNum){
      wx.showToast({
        title: '请输入社会信用代码',
        icon:'none'
      })
      return
    }
    if (!this.data.imageFile){
      wx.showToast({
        title: '请上传营业执照',
        icon:'none'
      })
      return
    }
    if (!this.data.authorizationFile){
      wx.showToast({
        title: '请上认证授权书',
        icon:'none'
      })
      return
    }

    data = {
      companyName: self.data.companyName,
      userName: self.data.userName,
      userIdentity: self.data.userIdentity,
      companyIdentity: Number(self.data.indexIdentity)+1,// 企业入驻类型 1：买家，2：卖家，3：买家与卖家
      creditNum: self.data.creditNum,//信用代码
      imageFile: self.data.imageFile,//营业执照文件
      authorizationFile: self.data.authorizationFile,//认证授权书
      address: self.data.address,//企业地址
      tradingCategoryCode: self.data.tradingCategoryCode,
      registeredCapital: self.data.registeredCapital,//企业注册资本
    }

    util.post(api.company_join_url, data,
        res => {
          wx.showToast({
            title: '提交成功',
            duration: 1000
          })
          setTimeout(function(){
            wx.navigateBack()
          },1000)
        }, 
          {
            loading: true,
            login:'authentication'
          },
        fail => { })
  
  },


  // 获取选中品种
  getCategoryCode(e){
    let tradingCategoryCode = e.detail.categoryCodeList.join(',')
    this.setData({
      tradingCategoryCode: tradingCategoryCode
    })
  },
  // 模板下载
  approveDown() {

    var that = this
    wx.downloadFile({
      url: 'https://aio.manytrader.net/preViewUploadFile/images/template.jpg',
      success: function (ret) {
        var path = ret.tempFilePath;
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success(result) {
            wx.showToast({
              title: '保存成功,请到相册查看',
              icon: 'success',
              duration: 1000
            });

          },
          fail: function (result) {
            wx.openSetting({
              success(settingdata) {
                if (settingdata.authSetting["scope.writePhotosAlbum"]) {
                  wx.showToast({
                    title: '获取权限成功，再次点击图片保存到相册',
                  })

                } else {
                  wx.showToast({
                    title: '保存图片失败！',
                  })
                }
              }
            })
          }
        })
      }
    })
  },
  // 获取选中城市
  getRegionCode(e){
    this.data.address = e.detail.regionCode;
    this.setData({
      address: e.detail.regionCode
    })

  },
})