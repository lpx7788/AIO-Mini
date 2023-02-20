const app = getApp()
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
let totalpage;
let roleCode;
Page({
  data: {
    contractDetail: [], //合同列表
    imageFilePaths:[],//合同图片列表
    purSalesContractDetail:{},//合同詳情
    currentTab:0,
    current:0,
    autoplay: false,
    menuFixed: '',
    tabHeight:'',
    menuTop:'',
    generateOrderList:[],
    

  },

  onLoad: function (options) {
    // 分享进入的时候登录验证
    let token = wx.getStorageSync('token');
    if (token=='') {
      wx.showModal({
        title: '提示',
        content: '当前处于未登录状态',
        confirmText:'立即登陆',
        cancelText:'返回首页',
        success(res) {
          if (res.confirm) {
              wx.navigateTo({
                url: '../../../pages/login/index/index',
              })
          } else if (res.cancel) {
            wx.navigateTo({
              url: '../../../pages/home/index/index',
            })
          }
        }
      })
    }
    
    let self = this;
    let purSalesContractId = '';
    if (options.purSalesContractId) {
      purSalesContractId = options.purSalesContractId
    }
    this.setData({
      purSalesContractId: purSalesContractId,
    })
    this.setData({
      childList: [],
      dataList: []
    })
    this.getDetailList();
    console.log();
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo){
      userInfo = JSON.parse(wx.getStorageSync('userInfo'))
      if (userInfo.user){
        if (userInfo.user.auths){
          roleCode = userInfo.user.auths.roleCode
        }
      }
    }
  },

  onShow: function () {
    let self = this;
    wx.getSystemInfo({
      success(systemMsg) {
        var query = wx.createSelectorQuery()
        query.select('.swiperTab').boundingClientRect()
        query.exec(function (res) {

          self.setData({
            menuTop: res[0].top,
            tabHeight: res[0].height,
            pageHeight: systemMsg.windowHeight + res[0].top,
            windowHeight: systemMsg.windowHeight - 2*Number(res[0].height)
          })
        });
      }
    })

  },
  

  //检测页面滚动
  onPageScroll: function (scroll) {
    let self = this;
    if (self.data.menuFixed === (scroll.scrollTop > self.data.menuTop)) return;
    self.setData({
      menuFixed: (scroll.scrollTop > self.data.menuTop)
    })

  },

  //获取高亮
  intervalChange(e){
    let current = e.detail.current? e.detail.current:0
    this.setData({
      current: current
    })
  },
  

  // 点击切换
  clickTab(e) {
    let self = this,
      current = e.currentTarget.dataset.current;
    if (self.data.currentTab === current) {
      return false;
    } else {
      self.setData({
        currentTab: current,
      })
    }
  },

  //下载合同
  approveDown() {
    var that = this
    console.log(that.data.imageFilePaths[that.data.current]);
    wx.downloadFile({
      url: that.data.imageFilePaths[that.data.current],
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
            console.log(result);
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

  //操作按钮
  operationBtn(){
    let self = this;
    let itemList = []
    if (roleCode==2){
      //业务员
      if (self.data.purSalesContractDetail.status==1){
        //双方未签署
        itemList = ['合同签署','下载合同','合同编辑','合同撤销']
      }
      if (self.data.purSalesContractDetail.status == 2){
        // 买家未签署
        itemList = ['合同签署', '下载合同', '合同打回']
      }
      if (self.data.purSalesContractDetail.status == 3){
       //卖家未签署
        itemList = ['下载合同', '合同打回']
      }
      if (self.data.purSalesContractDetail.status == 4){
        //已签署
        itemList = ['下载合同']
      }

    }else{
     //管理员
      if (self.data.purSalesContractDetail.status == 1) {
        //双方未签署
        itemList = ['下载合同', '合同编辑', '合同撤销']
      }else{
        itemList = ['下载合同']
      }
    }

   
    wx.showActionSheet({
      itemList: itemList,
      success(res) {
        console.log(res.tapIndex)
        
        if (res.tapIndex==0){
          //下载合同
          self.approveDown()
        }
        if (res.tapIndex == 0){
          // 合同签署
          wx.showModal({
            title: '温馨提示',
            confirmText:'去下载',
            content: '没有合同章和骑缝章，请登录聚点商城APP或者网页端：www.manytrader.net进行操作。',
            success(res) {
              if (res.confirm) {
                //上传合同章
                 wx.navigateTo({
                   url: '../../mine/toAPP/toAPP',
                 })
              } else if (res.cancel) {
                //已经有合同，进行签署合同
                // self.XXXXX()
              }
            }
          })

        }
        if (res.tapIndex == 0){
         //合同编辑
          
          wx.showModal({
            title: '温馨提示',
            confirmText: '去下载',
            content: '请登录聚点商城APP或者网页端：www.manytrader.net进行操作。',
            success(res) {
              if (res.confirm) {
                //上传合同章
                wx.navigateTo({
                  url: '../../mine/toAPP/toAPP',
                })
              } else if (res.cancel) {
              }
            }
          })
        }
        if (res.tapIndex == 0){
          //合同撤销
        }
        if (res.tapIndex == 0){
          //合同打回
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },

//预览长按保存
  previewImage: function (e) {
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接 
      urls: this.data.imageFilePaths // 需要预览的图片http链接列表 
    })
  },
  
  //获取页面数据
  getDetailList() {
    let self = this;
    let purSalesContractId = this.data.purSalesContractId
    util.post(api.contract_detail, {
      purSalesContractId: purSalesContractId
    }, res => {
      let data = res.returnObject
      console.log(data.generateOrderList); 
      self.setData({
        imageFilePaths: data.imageFilePaths,
        purSalesContractDetail:data.purSalesContractDetail,
        generateOrderList: data.generateOrderList ? data.generateOrderList:[]
      })
    }, {
      loading: true
    })
  },

  goto(e) {
    util.goto(e);
  },


  //分享合同详情页面
  // onShareAppMessage: function (res) {
  //   let self = this;
  //   let param = `?purSalesContractId=${this.data.purSalesContractId}`;

    //  分享参数  
    // purSalesContractId: 'f960cf211094416d9cea7a87ba355fb8', //	string	合同编码
  
  //   return {
  //     title: self.data.pageTitle,
  //     path: `/pages/workBench/contractDetail/contractDetail${param}`,
  //   }
  // },

})