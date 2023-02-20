//获取应用实例
const app = getApp()
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
var totalpage;
var socketNewData;
var instuementId;

Page({
  data: {
    currentTab: 0,
    releaseCode: '', //商品发布编号
    dataList: '', //商品列表
    defaultDateList: [],
    //品牌数组
    brandList: [],
    specList: [],
    materialList: [],
    otherList: [],
    wareHouseList: [],
    //用于检测的数组
    brandCheckList: [],
    specCheckList: [],
    materialCheckList: [],
    otherCheckList: [],
    wareHouseCheckList: [],
    type: '', //类型
    releaseStatus: '', //当前商品的状态
    showDelayPricing: 'N', //是否显示延期点击按钮
    page: 2, //2首页1 我的求购
    procurementType: 2, //0自选 1 现货商城 2求购
    priceType: 2, //2确定价  1点价   3延期点价
    buyNum: '', //下单数量
    // 商品合约月列表
    contractCodeList: [],
    // 选中合约月下标
    contractCodeIdx: 0,
    lastPrice: 0, //最新价格
    categoryCode: '', //商品的编号
    socketData: {}, //socket数据
    releaseStatus: '',
    oneself: false, //自己公司的
    deliveryType: 1, //1报价 2求购
    showModal: false,
    pageStatus: false,
    propList: [],
    basePrice: '', //基价
    award: '',
    integral: '', //积分
    menuTop: '', //tab距离顶部的距离
    menuFixed: '', //是否吸顶
    tabHeight: '', //顶部浮动填补空缺
    pageTitle: '', //页面标题
    selectIndex: 0, //选择了那个商品

  },

  onLoad: function(options) {
    console.log('页面传过来的数据')
    console.log(options)
    let self = this;
    let contractCode = ''
    let releaseCode = options.releaseCode ? options.releaseCode : '';
    let procurementType = options.procurementType ? options.procurementType : '';
    wx.setStorageSync('type', procurementType)
    let priceType = options.priceType ? options.priceType : '';
    let attributeCode = options.attributeCode ? options.attributeCode : '';
    if (options.shareUserCode) {
      wx.setStorageSync('shareUserCode', options.shareUserCode)
    }
    this.setData({
      contractCode: options.contractCode ? options.contractCode : '',
      attributeCode: attributeCode
    })
    // page: 1我的求购  2首页
    //procurementType 1现货商城  2求购大厅
    let title = '';
    let page = options.page ? options.page : '';
    if (procurementType == 2) {
      title = '求购详情'
    } else {
      title = '报价详情'
    }
    this.setData({
      pageTitle: title
    })

    wx.setNavigationBarTitle({
      title: title
    })

    if (releaseCode) {
      self.setData({
        releaseCode: releaseCode,
        page: page,
        procurementType: procurementType,
        priceType: priceType
      })
    }
    this.getDateList();
    this.getSocket();

  },

  onShow: function() {
    var self = this;
    if (!self.data.pageStatus) {
      self.setData({
        pageStatus: true,
      })

      var query = wx.createSelectorQuery()
      query.select('.tab').boundingClientRect()
      query.exec(function(res) {
        console.log(res);
        self.setData({
          menuTop: res[0].top,
          tabHeight: res[0].height
        })
      });

    } else {
      self.getDateList()
      self.getSocket()
    }

    getApp().watch(self.watchBack)
  },

  watchBack: function(socket1Status) {
    let self = this;
    if (socket1Status == 1) {
      self.getSocket()
    }
  },

  onReady() {
    let self = this;
    setTimeout(function() {
      self.getSocket()
    }, 500)
  },

  getSocket() {
    let self = this;
    //订单详情进来获取最新价
    if (this.data.contractCode && (this.data.page == 1 || this.data.page == 2)) {
      let data = {
        "instuementIds": [this.data.contractCode]
      }
      instuementId = [this.data.contractCode]
      let msg = JSON.stringify(data)
      app.sendSocketMessage(msg, 'socket1')
    }

    app.globalData.socket1.onMessage(function(res) {
      let socketData = JSON.parse(res.data);
      if (socketData) {
        if (instuementId) {
          if (socketData.instrumentId.toLowerCase() == instuementId[0].toLowerCase()) {
            if (socketData.lastPrice != self.data.lastPrice) {

              self.setData({
                lastPrice: socketData.lastPrice ? (isNaN(socketData.lastPrice) == true ? '' : socketData.lastPrice) : '--',
              })

            }
          }
        }
      }

    })
  },

  onPullDownRefresh() {
    this.getDateList();
  },

  //检测页面滚动
  onPageScroll: function(scroll) {
    let self = this;
    console.log(self.data.menuTop);
    if (self.data.menuFixed === (scroll.scrollTop > self.data.menuTop)) return;
    self.setData({
      menuFixed: (scroll.scrollTop > self.data.menuTop)
    })
  },

  //获取数据
  getDateList() {
    let self = this;
    let userInfo = '';
    let roleCode = '';
    let userCode = '';
    let companyCode = '';

    if (wx.getStorageSync('userInfo')) {
      userInfo = JSON.parse(wx.getStorageSync('userInfo'));
      if (userInfo.user) {
        userCode = userInfo.user.userCode ? userInfo.user.userCode : '';
      }
      if (userInfo.user) {
        if (userInfo.user.auths) {
          roleCode = userInfo.user.auths.roleCode ? userInfo.user.auths.roleCode : '';
          companyCode = userInfo.user.auths.companyCode ? userInfo.user.auths.companyCode : '';
        }
      }

    }
    util.post(api.get_product_queryDetail_url, {
      releaseCode: self.data.releaseCode
    }, res => {
      wx.stopPullDownRefresh();
      let productList = res.returnObject;
      app.globalData.delayMidpointsData = productList;
      let defaultDateList;
      let instuementIds = '';
      let attributeData = res.returnObject.attributeData;

      if (attributeData) {
        attributeData.forEach(function(item, idx) {
          if (item.attributeCode == self.data.attributeCode) {
            defaultDateList = item;
          }
        })
      }
      //自己公司                                              
      if (res.returnObject.companyCode == companyCode) {
        self.setData({
          oneself: true
        })
      }

      let showDelayPricing = res.returnObject.showDelayPricing;
      let deliveryType = res.returnObject.deliveryType;
      let releaseStatus = '';
      if (this.data.defaultDateList == []) {
        releaseStatus = ''
      } else {
        releaseStatus = this.data.defaultDateList.releaseStatus ? this.data.defaultDateList.releaseStatus : ''
      }

      self.setData({
        contractCodeList: productList.contractValues,
        dataList: productList,
        defaultDateList: defaultDateList,
        releaseStatus: releaseStatus,
        showDelayPricing: showDelayPricing,
        deliveryType: deliveryType,
        integral: productList.integral ? productList.integral : ''
      })
      //获取对应的合约月
      if (self.data.contractCodeList.length != 0) {
        self.data.contractCodeList.forEach(function(item, index) {
          if (self.data.contractCode == item.contractCode) {
            self.setData({
              contractCodeIdx: index
            })
            wx.setStorageSync('contractCodeIdx', index)
          }
        })
      }

      let arr = res.returnObject.attributeData;

      //各品种数组
      let brandList = [];
      let specList = [];
      let materialList = [];
      let otherList = [];
      let wareHouseList = [];

      // 检测是否选中数组
      let brandCheckList = [];
      let specCheckList = [];
      let materialCheckList = [];
      let otherCheckList = [];
      let wareHouseCheckList = [];

      arr.forEach(function(item, idx) {
        otherList.push(item.other); //其他
        brandList.push(item.brand); //品牌
        wareHouseList.push(item.wareHouse); //仓库
        specList.push(item.spec); //规格
        materialList.push(item.material); //规格
        if (item.attributeCode == self.data.attributeCode) {
          wx.setStorageSync('selectIndex', idx)
          otherCheckList.push(item.other); //其他
          brandCheckList.push(item.brand); //品牌
          wareHouseCheckList.push(item.wareHouse); //仓库
          specCheckList.push(item.spec); //规格
          materialCheckList.push(item.material); //规格
        }
      })

      //数组去重
      otherList = Array.from(new Set(otherList));
      brandList = Array.from(new Set(brandList));
      wareHouseList = Array.from(new Set(wareHouseList));
      specList = Array.from(new Set(specList));
      materialList = Array.from(new Set(materialList));

      self.setData({
        otherList: otherList,
        brandList: brandList,
        wareHouseList: wareHouseList,
        specList: specList,
        materialList: materialList,

        otherCheckList: otherCheckList,
        brandCheckList: brandCheckList,
        wareHouseCheckList: wareHouseCheckList,
        specCheckList: specCheckList,
        materialCheckList: materialCheckList,
      })
      wx.stopPullDownRefresh()
    }, {
      loading: true
    }, fail => {})


  },

  // 点击选择
  changeOptions(e) {
    let self = this;
    let type = e.target.dataset.tips
    let itemname = e.target.dataset.itemname;
    let dataArr = self.data.dataList.attributeData;
    let defaultDateList = {};

    self.setData({
      otherCheckList: [],
      brandCheckList: [],
      wareHouseCheckList: [],
      specCheckList: [],
      materialCheckList: [],
    })

    self.setData({
      type: type,
    })

    dataArr.forEach(function(item, idx) {
      if (item[type].trim() == itemname.trim()) {
        defaultDateList = item;
        self.setData({
          defaultDateList: defaultDateList,
          otherCheckList: [item.other],
          brandCheckList: [item.brand],
          wareHouseCheckList: [item.wareHouse],
          specCheckList: [item.spec],
          materialCheckList: [item.material],
          releaseStatus: item.releaseStatus,
          attributeCode: item.attributeCode,
          basePrice: [item.basePrice],
          selectIndex: idx

        })
        wx.setStorageSync('selectIndex', idx)

      }
    })

  },

  // 点击切换
  clickTab(e) {
    let self = this,
      current = e.currentTarget.dataset.current;
    //切换数据页面滚动到最顶部
    if (self.data.menuFixed) {
      wx.pageScrollTo({
        scrollTop: self.data.menuTop
      })
    }
    if (self.data.currentTab === current) {
      return false;
    } else {
      self.setData({
        currentTab: current,
      })
    }
  },

  //点价操作
  operationClick() {
    if (this.data.deliveryType == 1 && this.data.oneself == true) {
      wx.showToast({
        title: '请登录网页端或者app操作',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    let self = this;
    let dataList = self.data.dataList;
    let categoryCode = dataList.categoryCode;
    let categoryName = dataList.categoryName;
    let releaseStatus = self.data.defaultDateList.releaseStatus ? self.data.defaultDateList.releaseStatus : ''
    let itemList = []

    //求购中   下架、编辑、调整库存、删除；
    if (releaseStatus == 1) {
      itemList = ['下架', '编辑', '调整库存', '调整升贴水', '删除']
      this.setData({
        releaseStatus: 3
      })
    }
    // 已完成   编辑、调整库存、删除。
    else if (releaseStatus == 2) {
      itemList = ['编辑', '调整库存', '调整升贴水', '删除']

    }
    //已下架    上架、编辑、调整库存、删除；
    else if (releaseStatus == 3) {
      itemList = ['上架', '编辑', '调整库存', '调整升贴水', '删除']
      this.setData({
        releaseStatus: 1
      })
    }

    wx.showActionSheet({
      itemList: itemList,
      success(res) {
        let tapIndex;
        if (releaseStatus == 2) {
          tapIndex = res.tapIndex + 1;
        } else {
          tapIndex = res.tapIndex
        }
        switch (tapIndex) {
          case 0:
            self.putaway();
            break;
          case 1:
            wx.navigateTo({
              url: '../../../pages/workBench/buying/buying?categoryCode=' + categoryCode + '&priceType=' + self.data.priceType + '&categoryName = ' + categoryName + '&page=edit' + '&editDate=' + JSON.stringify(self.data.dataList),
            })
            break;
          case 2:
            self.repertory('repertory');
            break;
          case 3:
            self.repertory('floatingPrice');
            break;
          case 4:
            self.delectProduct();
            break;
        }
      },
      fail(res) {}
    })
  },

  //删除商品
  delectProduct() {
    let self = this;
    wx.showModal({
      title: '温馨提示',
      content: '是否删除该商品',
      success(res) {
        if (res.confirm) {
          deldet();

          if (self.data.page == 1) {
            setTimeout(function() {
              wx.navigateBack({
                delta: 1
              })
            }, 1000)
          } else {
            //分享的时候返回工作台
            setTimeout(function() {
              wx.switchTab({
                url: "/pages/workBench/index/index",
              });
            }, 1000)
          }
        } else if (res.cancel) {}
      }
    })

    function deldet() {
      util.post(api.update_product_url, {
        releaseCode: self.data.releaseCode,
        releaseStatus: 4
      }, res => {}, {
        loading: true
      })
    }

  },

  //上架
  putaway() {
    let self = this;
    let dataList = self.data.dataList;
    let date = new Date();
    let currentTime = date.getTime()
    let endTime = dataList.endDate;
    let categoryCode = dataList.categoryCode;
    let categoryName = dataList.categoryName;

    self.setData({
      categoryCode: categoryCode
    })


    if (endTime < currentTime) {
      wx.showModal({
        title: '温馨提示',
        confirmText: '重新修改',
        content: '求购的截止时间大于当前时间，请重新编辑求购单',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../../../pages/workBench/buying/buying?categoryCode=' + categoryCode + '&priceType=' + self.data.priceType + '&categoryName = ' + categoryName + '&page=edit',
            })
          } else if (res.cancel) {}
        }
      })

    } else {
      util.post(api.update_product_url, {
        releaseCode: self.data.releaseCode,
        releaseStatus: self.data.releaseStatus
      }, res => {
        wx.showToast({
          title: '操作成功',
        })

        self.data.defaultDateList.releaseStatus = 1
        setTimeout(function() {
          self.getDateList();
        }, 1000)
      }, {
        loading: true
      })
    }

  },


  //调整库存
  repertory(pageType) {
    let dataList = this.data.dataList
    wx.navigateTo({
      url: `../../../pages/workBench/inventory/inventory?dataList=${JSON.stringify(dataList.attributeData)}&releaseCode=${dataList.releaseCode}&categoryCode=${dataList.categoryCode}&categoryName=${dataList.categoryName}&pageType=${pageType}`,
    })
  },

  //获取下单数量
  getNumInput(e) {
    this.setData({
      buyNum: e.detail.value
    })
  },

  //下单采购
  buyClick(e) {

    wx.setStorageSync('formId', e.detail.formId);
    let self = this;
    let token = wx.getStorageSync('token');
    this.loginBtn();

    let userInfo = '';
    let identityStatus = ''

    if (wx.getStorageSync('userInfo')) {
      userInfo = JSON.parse(wx.getStorageSync('userInfo'));
      identityStatus = userInfo.user.status;
    }

    if (token && identityStatus != 2) {
      return;
    }

    if (!this.data.buyNum) {
      wx.showToast({
        title: '请输入下单数量',
        icon: "none"
      })
      return;
    }

    wx.setStorageSync('brandSelectData', this.data.brandCheckList[0]);
    wx.setStorageSync('specSelectData', this.data.specCheckList[0]);
    wx.setStorageSync('materialSelectData', this.data.materialCheckList[0]);
    wx.setStorageSync('otherSelectData', this.data.otherCheckList[0]);
    wx.setStorageSync('wareHouseSelectData', this.data.wareHouseCheckList[0]);

    let derection = ''
    if (self.data.deliveryType == 1) {
      derection = '采购';

    } else {
      derection = '销售'
    }

    let propList = [{
        title: '公司',
        name: self.data.dataList.companyName
      },
      {
        title: '商品',
        name: self.data.dataList.categoryName
      },
      {
        title: '方向',
        name: derection
      },
      {
        title: '价格',
        name: self.data.defaultDateList.basePrice
      },
      {
        title: '数量',
        name: self.data.buyNum,

      }
    ]

    let integral = this.data.integral;
    let integralGuidePrice = ''
    let integralNum = ''
    if (integral) {
      integralGuidePrice = integral.integralGuidePrice
      integralNum = integral.integralNum
    }

    if (self.data.defaultDateList.basePrice >= integralGuidePrice) {
      let award = integralNum * self.data.buyNum
      self.setData({
        award: award ? award : ''
      })
      propList.push({
        num: self.data.award
      })
    }

    self.setData({
      propList: propList
    })
    self.checkOrder()


  },


  checkOrder() {

    let self = this;
    util.post(api.check_BeforeSend_Order, {
        releaseCode: self.data.releaseCode,
        stockNum: self.data.buyNum,
        attributeCode: self.data.attributeCode
      }, res => {
        self.setData({
          showModal: true,
        })

      }, {
        loading: true
      },
      fail => {})
  },

  //prop弹窗
  onMyprop(e) {

    // 取消的时候
    if (e.detail.status == "N") {
      this.setData({
        showModal: e.detail.showModal,
      })
      return;
    }
    //  确定的时候
    this.setData({
      showModal: e.detail.showModal,
    })
    this.submit();
  },

  //确定之后提交的内容
  submit() {
    let self = this;
    // let shareUserCode = wx.getStorageSync('shareUserCode') ? wx.getStorageSync('shareUserCode'):'';
    // console.log('shareUserCode===', shareUserCode);
    util.post(api.send_order_url, {
        releaseCode: self.data.releaseCode,
        stockNum: self.data.buyNum,
        attributeCode: self.data.attributeCode,
        deviceType: 'webchat',
      //  shareUserCode: shareUserCode ? shareUserCode:''
     
      }, res => {

        let orderCode = res.returnObject.orderCode
        //推送消息
        let pushData = {}
        let formId = wx.getStorageSync('formId');
        pushData = {
          formid: formId, //	是	string	formid
          orderCode: orderCode,
        }
        // app.messagePush(pushData);
        // 1：报价，2：求购
        if (self.data.deliveryType == 2) {
          wx.showToast({
            title: '下单成功',
          })
          // try {
          //   wx.navigateBack({
          //     delta:2
          //   })
          // }
          // catch (err) {
          setTimeout(function() {
            wx.switchTab({
              url: '/pages/home/index/index',
            });
          }, 1000)
          // }

        } else {
          wx.navigateTo({
            url: '../../../pages/workBench/orderDetail/orderDetail?orderCode=' + orderCode + '&type=' + self.data.procurementType + '&priceType=' + self.data.priceType,
          })
        }
      }, {
        loading: true
      },
      fail => {})
  },

  goto(e) {

    let token = wx.getStorageSync('token');
    let userInfo = '';
    let identityStatus = ''
    if (wx.getStorageSync('userInfo')) {
      userInfo = JSON.parse(wx.getStorageSync('userInfo'));
      identityStatus = userInfo.user.status;
    }

    this.loginBtn();

    if (token && identityStatus == 2) {
      util.goto(e);
    }
  },

  //判断登陆
  loginBtn() {

    let token = wx.getStorageSync('token');
    let userInfo = '';
    let identityStatus = ''
    if (wx.getStorageSync('userInfo')) {
      userInfo = JSON.parse(wx.getStorageSync('userInfo'));
      identityStatus = userInfo.user.status;
    }

    if (token == '') {
      wx.navigateTo({
        url: '../../../pages/login/index/index',
      })
    }
    // 已登录
    else if (token) {
      // 认证不通过
      if (identityStatus == 3) {
        wx.showModal({
          title: '温馨提示',
          content: '您的身份认证不通过',
          confirmText: "知道了",
          showCancel: !1
        })
        return;
      }
      // 认证中
      else if (identityStatus == 1) {
        wx.showModal({
          title: '温馨提示',
          content: '您的身份认证还在审核中，不能进行此操作，请耐心等候。',
          confirmText: "知道了",
          showCancel: !1
        })
        return;
      }
      // 未认证
      else if (identityStatus == 0) {
        wx.showModal({
          title: '温馨提示',
          content: '您还没有身份认证，不能进行此操作，请先申请身份认证！',
          confirmText: "去认证",
          success(res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '../../../pages/mine/identity/identity',
              })
            } else if (res.cancel) {}
          }
        })
        return;
      }
    }
  },

  // 选择合约月
  changeContractCode(e) {
    let instuementIds = []
    this.setData({
      contractCodeIdx: e.currentTarget.dataset.idx,
      contractCode: e.currentTarget.dataset.code,

    })
    wx.setStorageSync('contractCodeIdx', e.currentTarget.dataset.idx)

    instuementIds = [e.currentTarget.dataset.code]
    let data = {};
    data = {
      "instuementIds": instuementIds
    }

    instuementId = instuementIds

    let msg = JSON.stringify(data)
    app.sendSocketMessage(msg, 'socket1')
  },

  //分享点价详情
  onShareAppMessage: function(res) {

    let self = this;
    let userCode = wx.getStorageSync('userCode');
    console.log(userCode);
    let param = `?shareUserCode=${userCode}&page=2&releaseCode=${this.data.releaseCode}&priceType=${this.data.priceType}&attributeCode=${this.data.attributeCode}&contractCode=${this.data.contractCode}&procurementType=${this.data.procurementType}`;

    // 分享参数  contractCode
    // releaseCode: 'f960cf211094416d9cea7a87ba355fb8', //报价（求购）详情编号
    // priceType: 2,  //2确定价  1点价   3延期点价
    // attributeCode:  'f960cf211094416d9cea7a87ba355fb8',   //具体商品编码
    //contractCode:''//合约月
    // procurementType:2, //0自选 1 现货商城 2求购
    // page = 2 写死

    console.log('/components/offerDetails/index/index' + param);
    return {
      title: self.data.pageTitle,
      path: `/components/offerDetails/index/index${param}`,
    }
  },

})