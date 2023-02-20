// pages/workBench/buying/buying.js
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
import dateTimePicker from '../../../utils/dateTimePicker.js';
const app = getApp();
Page({
  data: {

    categoryCode: '', // 选中的品种
    // 作价方式
    priceType: ['点价', '确定价'],
    priceTypeIdx: 0,
    multiple: true,  //多选
    showAppointCompany: false,
    floatingPriceRadioList: [],
    floatingPriceRadio: true,
    productList: [1],
    indicatorDots: true,
    autoplay: false,
    duration: 1000,
    showMultiple: false,
    swiperCurrent: 0,
    contractNameList: '',
    date: '',
    isScroll: true,
    priceTypeName: '',
    contractCode: '',//合约月
    chooseArray: [],
    dataTit: '选择商品类型',
    chooseEegionList: [],//选择列表
    contractNameArr: [],//合约名字
    attributes: [],
    currentTab: 0,
    endDate: '',//截止时间
    pricingPeriod: 1,//点价期限
    page: 'issue',
    purchaseMultiplier: '',
    showCompanyName: '',//选择的公司名称
    basePrice: '',//基价
    delayPricingValidDate: '',//有效天数
    delayPricingEndDate: '',//指定日期
    endTimeQuantum: '',//指定日期
    endTimeQuantum: '',//指定日期
    delayDisable:false,
    priceMethod: '1',//价格方式：1为基价点价 ; 2为含税单价
  },

  onLoad: function (options) {

    let page = options.page ? options.page : this.data.page;
    let delayMidpointsData = ''
    if (options.editDate) {
      delayMidpointsData = JSON.parse(options.editDate) ? JSON.parse(options.editDate) : ''
    }

    let priceType = this.data.priceType;
    let categoryCode = '';
    let categoryName = '';
    let contractValues = '';
    let attributes = this.data.attributes
    let pricingPeriod = this.data.pricingPeriod
    let remark = ''
    let deliveryPattern = ''
    let settleAccountsType = ''
    let showMultiple = false
    let showDelay = false
    let showFloatingPrice = false;
    let showAppointCompany = false;
    let endDate = '';
    let showCompanyName = '';
    let date = '';
    let delayPricingEndDate = '';
    let purchaseMultiplier = '';
    let title = '';
    // 获取当前日期
    let _date = new Date();
    let today = _date.toLocaleDateString()
    let reg = new RegExp('/', "g")
    today = today.replace(reg, '-')

    if (page == "issue") {
      //动态标题                    
      title = '发布求购'

      // 默认选择当天下午三点，如果过了这个时间，默认选择第二天下午三点
      const year = _date.getFullYear();
      const month = _date.getMonth() + 1;
      const day = _date.getDate();
      const todays = new Date(`${year}/${month}/${day} 15:00:00`).getTime();
      const nextdays = todays + 1000 * 60 * 60 * 24;
      const currentTime = new Date().getTime()
      if (currentTime > todays) {                                                       
        endDate = nextdays
      } else if (currentTime < todays) {
        endDate = todays
      }

      //设置商品初始化值
      attributes = [{
        wareHouse: "",
        floatingPrice: "",
        material: "",
        other: "",
        spec: "",
        brand: "",
        stockNum: ""
      }]
    } else {
      title = '修改求购'
    }

    if (delayMidpointsData) {
      priceType = delayMidpointsData.priceType ? delayMidpointsData.priceType : '';
      categoryCode = delayMidpointsData.categoryCode ? delayMidpointsData.categoryCode : '';
      categoryCode = delayMidpointsData.categoryCode ? delayMidpointsData.categoryCode : '';
      purchaseMultiplier = delayMidpointsData.purchaseMultiplier ? delayMidpointsData.purchaseMultiplier : '';
      contractValues = delayMidpointsData.contractValues ? delayMidpointsData.contractValues : '';
      attributes = delayMidpointsData.attributeData != null ? delayMidpointsData.attributeData : this.data.attributes;
      pricingPeriod = delayMidpointsData.pricingPeriod ? delayMidpointsData.pricingPeriod : '';
      remark = delayMidpointsData.remark ? delayMidpointsData.remark : '';
      deliveryPattern = delayMidpointsData.deliveryPattern ? delayMidpointsData.deliveryPattern : '';
      settleAccountsType = delayMidpointsData.settleAccountsType ? delayMidpointsData.settleAccountsType : '';
      showMultiple = delayMidpointsData.showPurchaseMultiplier == "Y" ? true : false;
      showDelay = delayMidpointsData.showDelayPricing == "Y" ? true : false;
      showFloatingPrice = delayMidpointsData.showFloatingPrice == "Y" ? true : false;
      endDate = delayMidpointsData.endDate;
      delayPricingEndDate = delayMidpointsData.delayPricingEndDate;
      date = dateTimePicker.format(delayMidpointsData.delayPricingEndDate, 'year');
      showAppointCompany = delayMidpointsData.showCompany == "Y" ? true : false;

      //获取编辑公司名字
      if (delayMidpointsData.showCompanyValues.length > 0) {
        let companyList = [];
        delayMidpointsData.showCompanyValues.forEach(function (item, idx) {
          companyList.push(item.companyName)
        })
        showCompanyName = companyList.join(',')
      }
    }

    let contractNameArr = [];
    let contractArr = [];
    let priceTypeName = '';
    if (priceType == '') {
      priceTypeName == ''
    } else if (priceType == 1) {
      priceTypeName = '点价'
      this.setData({
        priceTypeIdx: '0'
      })
    } else if (priceType == 2) {
      priceTypeName = '确定价'
      this.setData({
        priceTypeIdx: '1'
      })
    } else if (priceType == 3) {
      priceTypeName = '点价'
      this.setData({
        priceTypeIdx: '0'
      })
    }
    let basePricingList = [
      { name: 1, value: '基价', checked: true },
      { name: 2, value: '含税单价(结算价)', checked: false }
    ]
    let floatingPriceRadioList = [
      { name: true, value: '显示', checked: true },
      { name: false, value: '隐藏', checked: false }
    ]

    if (contractValues.length != 0) {
      contractValues.forEach(function (item) {
        contractArr.push(item.contractCode)
        contractNameArr.push(item.contractName)
      })
    }

    this.setData({
      delayMidpointsData: delayMidpointsData,
      priceTypeName: priceTypeName,
      floatingPriceRadioList: floatingPriceRadioList,
      basePricingList: basePricingList,
      contractCode: contractArr,
      contractNameArr: contractNameArr.join(' '),
      categoryCode: categoryCode,
      attributes: attributes,
      endDate: endDate,
      date: date,
      pricingPeriod: pricingPeriod,
      remark: remark,
      deliveryPattern: deliveryPattern,
      showMultiple: showMultiple,
      page: page,
      endTimeQuantum: today,
      showDelay: showDelay ? showDelay : false,
      showAppointCompany: showAppointCompany,
      showCompanyName: showCompanyName
    })

    //动态标题
    wx.setNavigationBarTitle({
      title: title
    })

    this.getData();
    if (this.data.categoryCode) {
      this.getContract();
    }

  },

  onShow() {
    if (this.data.page == 'edit') {
      this.setData({
        showCompanyName: this.data.showCompanyName
      })
    } else {
      this.setData({
        showCompanyName: app.globalData.companyNameSelect.join(',')
      })
    }
  },
  


  getData() {
    let self = this;
    util.post(api.category_attribute, {
      categoryCode: self.data.categoryCode,
    }, res => {
    }, {
        loading: true
      })
  },

  // 指定公司开关
  switchCompanyChange(e) {
    this.setData({
      showAppointCompany: e.detail.value
    })
  },

  // 获取选中品种
  getCategoryCode(e) {
    let categoryCode = e.detail.categoryCode;
    this.setData({
      categoryCode: categoryCode
    })
    this.getContract();
  },

  // 更改点价方式
  bindPriceTypeChange(e) {
    this.setData({
      priceTypeIdx: e.detail.value
    })
  },

  // 是否显示升贴水
  showFloatingPrice(e) {
    this.setData({
      floatingPriceRadio: e.detail.value
    })
  },
  
  // 输入价格
  showPrice(e) {
    let delayDisable = false
    let basePricingList = this.data.basePricingList;
    basePricingList.forEach(function(item,index){
      if (e.detail.value - 1 == index){
        item.checked = true;
        if (index == 1) {
          if (item.checked) {
            delayDisable = true
          } else {
            delayDisable = false
          }
        }
      }else{
        item.checked = false;
      }
    })

    this.setData({
      priceMethod: e.detail.value,
      delayDisable: delayDisable,
      basePricingList: basePricingList
    })

  },

  // 获取商品的值
  inputValue(e) {
    let name = e.currentTarget.dataset.name;
    let index = e.currentTarget.dataset.listindex;
    let attributes = this.data.attributes;
    attributes[index][name] = e.detail.value
    this.setData({
      attributes: attributes
    })
  },

  //获取备注的值
  getInputValue(e) {
    let name = e.currentTarget.dataset.name;
    let advancePayment = '';
    let remark = ''
    let invoicedateType = ''
    let deliveryPattern = ''
    let settleAccountsType = ''
    let purchaseMultiplier = ''
    let basePrice = ''
    let delayPricingValidDate = ''

    if (name == 'prepay') {
      advancePayment = e.detail.value;
      this.setData({
        advancePayment: advancePayment,
      })
    }
    else if (name == 'mark') {
      remark = e.detail.value
      this.setData({
        remark: remark,
      })
    }
    else if (name == 'deliveryPattern') {
      deliveryPattern = e.detail.value;
      this.setData({
        deliveryPattern: deliveryPattern,
      })
    }
    else if (name == 'invoicedateType') {
      invoicedateType = e.detail.value,
        this.setData({
          invoicedateType: invoicedateType,
        })
    }
    else if (name == 'settleAccountsType') {
      settleAccountsType = e.detail.value
      this.setData({
        settleAccountsType: settleAccountsType,
      })
    }
    else if (name == 'purchaseMultiplier') {
      purchaseMultiplier = e.detail.value
      this.setData({
        purchaseMultiplier: purchaseMultiplier
      })
    }
    else if (name == 'basePrice') {
      basePrice = e.detail.value
      this.setData({
        basePrice: basePrice
      })
    }

    else if (name == 'delayPricingValidDate') {
      delayPricingValidDate = e.detail.value
      this.setData({
        delayPricingValidDate: delayPricingValidDate
      })
    }
  },

  //获取修改后的截止时间
  getModifyTime(e) {
    let modifyEndDate = e.detail.dateTime1
    modifyEndDate =  modifyEndDate.replace(/-/g, "/")
    let mTime = (new Date(modifyEndDate)).getTime();
    if (e.target.dataset.name == "endDate") {
      this.setData({
        endDate: mTime
      })
    }
  },

  //获取指定时间
  bindDateChange(e) {
    let delayPricingEndDate = (new Date(e.detail.value)).getTime();
    this.setData({
      delayPricingEndDate: delayPricingEndDate,
      date: e.detail.value
    })

  },



  //滑动
  swiperTab(e) {
    let self = this;
    self.setData({
      swiperCurrent: e.detail.current
    })
  },

  // 添加商品
  addProduct(e) {
    let self = this;
    let obj = e.currentTarget.dataset.list;
    let attributes = this.data.attributes;
    wx.showActionSheet({
      itemList: ['复制当前商品信息', '新增一条商品信息',],
      success(res) {
        //复制
        if (res.tapIndex == 0) {
          attributes.push(obj)
        }
        //新增
        else if (res.tapIndex == 1) {
          for (let key in obj) {
            obj[key] = ''
          }
          attributes.push(obj)
        }
        self.setData({
          attributes: attributes,
          swiperCurrent: Number(attributes.length) - 1,
        })

      },
      fail(res) {}
    })
  },

  //删除商品
  delectProduct(e) {
    let attributes = this.data.attributes;
    let index = e.currentTarget.dataset.list;
    //第一个不能点击删除
    if (this.data.attributes.length <= 1) {
      return
    }
    attributes.splice(index, 1);
    this.setData({
      attributes: attributes,
      swiperCurrent: Number(attributes.length) - 1
    })

  },

  //点击商品切换
  clickTab(e) {
    let self = this,
      current = e.currentTarget.dataset.current;
    self.setData({
      swiperCurrent: current,
    })
  },


  // 是否开启延期点价
  switchDelayChange(e) {
    this.setData({
      showDelay: e.detail.value
    })
    let basePricingList;
    if (e.detail.value==true){
      basePricingList = [
        { name: 1, value: '基价', checked: true }
      ]
  
    }else{
      basePricingList = [
        { name: 1, value: '基价', checked: true },
        { name: 2, value: '含税单价(结算价)', checked: false }
      ]
    }
    this.setData({
      basePricingList: basePricingList
    })

  
  },

  // 是否开启下单倍数
  switchMultipleChange(e) {
    this.setData({
      showMultiple: e.detail.value
    })
    
  },



  //获取下拉框状态
  getSelectShow(e) {
    this.setData({
      isScroll: !e.detail.selectShow
    })
  },

  //获取合约月
  getContract() {
    let self = this;
    util.post(api.contract_tree, {
      categoryCode: self.data.categoryCode
    }, res => {
      let chooseEegionList;
      if (res.returnObject[0]) {
        chooseEegionList = res.returnObject[0].contracts;
        chooseEegionList = JSON.parse(JSON.stringify(chooseEegionList).replace(/contractName/g, 'name').replace(/contractCode/g, 'value'))
      }
      self.setData({
        chooseEegionList: chooseEegionList ? chooseEegionList : '',
      });
    }, {
        loading: true
      })
  },

  //点价期限
  deadlineTap() {
    let self = this;
    wx.showActionSheet({
      itemList: ['合约月结束', '自下单日起，指定有效天数（工作日）', '指定日期结束'],
      success(res) {
        self.setData({
          pricingPeriod: res.tapIndex + 1
        })
      },
      fail(res) {
      }
    })
  },

  //发布求购
  issueBtn() {
    
    if (this.data.page == 'edit') {
      return;
    }
    let time = Date.now();
    let nowTime = new Date(time).getTime();
    let self = this;
    let data = {};
    if (self.data.contractCode.length==0){
     wx.showToast({
       title: '请填写合约月',
       icon:'none'
     })
    }
    if (this.data.pricingPeriod == 1) {
      data = {
        contractCode: self.data.contractCode,//合约月
        categoryCode: self.data.categoryCode,//商品
        deliveryType: 2,//1采购 2求购
        priceType: Number(self.data.priceTypeIdx) + 1,
        showCompany: (self.data.showAppointCompany == 'true' || self.data.showAppointCompany == true) ? "Y" : "N",//是否显示公司，
        showCompanyCode: app.globalData.companyCodeSelect,//指定公司编号
        remark: self.data.remark,//留言
        advancePayment: self.data.advancePayment, //预付金额
        pricingPeriod: self.data.pricingPeriod,
        endDate: self.data.endDate ? self.data.endDate : nowTime,//截止时间
        purchaseMultiplier: self.data.purchaseMultiplier,//最小倍数
        showPurchaseMultiplier: (self.data.showMultiple == 'true' || self.data.showMultiple == true) ? "Y" : "N",//下单倍数
        showDelayPricing: (self.data.showDelay == 'true' || self.data.showDelay == true) ? "Y" : "N",
        showFloatingPrice: (self.data.floatingPriceRadio == 'true' || self.data.floatingPriceRadio == true) ? "Y" : "N",
        priceMethod:self.data.priceMethod ,//含税单价
        settleAccountsType: self.data.settleAccountsType,
        invoicedateType: self.data.invoicedateType,
        deliveryPattern: self.data.deliveryPattern,
        attributes: self.data.attributes,//商品
      }
    }
    else if (this.data.pricingPeriod == 2) {
      data = {
        contractCode: self.data.contractCode,//合约月
        categoryCode: self.data.categoryCode,//商品
        deliveryType: 2,//1采购 2求购
        priceType: Number(self.data.priceTypeIdx) + 1,
        showCompany: (self.data.showAppointCompany == 'true' || self.data.showAppointCompany == true) ? "Y" : "N",//是否显示公司，
        showCompanyCode: app.globalData.companyCodeSelect,//指定公司编号
        remark: self.data.remark,//留言
        advancePayment: self.data.advancePayment, //预付金额
        pricingPeriod: self.data.pricingPeriod,
        endDate: self.data.endDate ? self.data.endDate : nowTime,//截止时间
        purchaseMultiplier: self.data.purchaseMultiplier,//最小倍数
        showPurchaseMultiplier: (self.data.showMultiple == 'true' || self.data.showMultiple == true) ? "Y" : "N",//下单倍数
        showDelayPricing: (self.data.showDelay == 'true' || self.data.showDelay == true) ? "Y" : "N",
        showFloatingPrice: (self.data.floatingPriceRadio == 'true' || self.data.floatingPriceRadio == true) ? "Y" : "N",
        settleAccountsType: self.data.settleAccountsType,
        invoicedateType: self.data.invoicedateType,
        deliveryPattern: self.data.deliveryPattern,
        attributes: self.data.attributes,//商品
        priceMethod: self.data.priceMethod,//含税单价
        delayPricingValidDate: self.data.delayPricingValidDate,//有效期限
      }
    } else if (this.data.pricingPeriod == 3) {
      data = {
        contractCode: self.data.contractCode,//合约月
        categoryCode: self.data.categoryCode,//商品
        deliveryType: 2,//1采购 2求购
        priceType: Number(self.data.priceTypeIdx) + 1,
        showCompany: (self.data.showAppointCompany == 'true' || self.data.showAppointCompany == true) ? "Y" : "N",//是否显示公司，
        showCompanyCode: app.globalData.companyCodeSelect,//指定公司编号
        remark: self.data.remark,//留言
        advancePayment: self.data.advancePayment, //预付金额
        pricingPeriod: self.data.pricingPeriod,
        endDate: self.data.endDate ? self.data.endDate : nowTime,//截止时间
        purchaseMultiplier: self.data.purchaseMultiplier,//最小倍数
        showPurchaseMultiplier: (self.data.showMultiple == 'true' || self.data.showMultiple == true) ? "Y" : "N",//下单倍数
        showDelayPricing: (self.data.showDelay == 'true' || self.data.showDelay == true) ? "Y" : "N",
        showFloatingPrice: (self.data.floatingPriceRadio == 'true' || self.data.floatingPriceRadio == true) ? "Y" : "N",
        settleAccountsType: self.data.settleAccountsType,
        invoicedateType: self.data.invoicedateType,
        deliveryPattern: self.data.deliveryPattern,
        priceMethod: self.data.priceMethod,//含税单价
        attributes: self.data.attributes,//商品
        delayPricingEndDate: self.data.delayPricingEndDate//指定期限

      }
    }

    console.log(data);
return;

    // 发布请求
    util.post(api.product_release, data, res => {
      wx.showToast({
        title: '发布成功',
      })
      setTimeout(function () {
        wx.navigateBack()
      }, 2000)
    }, {
        loading: true
      }, fail => {

        if (fail.errorCode == 6037) {
          wx.showToast({
            title: fail.errorMsg,
            icon: 'none',
            duration: 3000
          })

          setTimeout(function () {
            wx.hideToast();
            wx.navigateTo({
              url: '../../workBench/warehouse/warehouse?data=' + JSON.stringify(data),
            })
          }, 1000)
        }
      })
  },


  //编辑发布



  
  issueProduct() {
    if (this.data.page == 'issue') {
      return;
    }

    let self = this;
    let data = {}
    if (this.data.pricingPeriod == 1) {
      data = {

        contractCode: self.data.contractCode,//合约月
        categoryCode: self.data.categoryCode,
        deliveryType: self.data.delayMidpointsData.deliveryType,
        priceType: Number(self.data.priceTypeIdx) + 1,
        showCompany: (self.data.showAppointCompany == 'true' || self.data.showAppointCompany == true) ? "Y" : "N",//是否显示公司，
        showCompanyCode: app.globalData.companyCodeSelect,
        endDate: self.data.endDate,//截止时间
        remark: self.data.remark,
        pricingPeriod: self.data.pricingPeriod,
        advancePayment: self.data.advancePayment, //预付金额
        purchaseMultiplier: self.data.purchaseMultiplier,
        showPurchaseMultiplier: (self.data.showMultiple == 'true' || self.data.showMultiple == true) ? "Y" : "N",//下单倍数
        showDelayPricing: (self.data.showDelay == 'true' || self.data.showDelay == true) ? "Y" : "N",
        showFloatingPrice: (self.data.floatingPriceRadio == 'true' || self.data.floatingPriceRadio == true) ? "Y" : "N",
        releaseCode: self.data.delayMidpointsData.releaseCode,
        invoicedateType: self.data.invoicedateType,
        settleAccountsType: self.data.settleAccountsType,
        deliveryPattern: self.data.deliveryPattern, //交货方式
        attributes: self.data.attributes,//商品
        priceMethod: self.data.priceMethod,//含税单价

      }
    }

    else if (this.data.pricingPeriod == 2) {
      data = {

        contractCode: self.data.contractCode,//合约月
        categoryCode: self.data.categoryCode,
        deliveryType: self.data.delayMidpointsData.deliveryType,
        priceType: Number(self.data.priceTypeIdx) + 1,
        showCompany: (self.data.showAppointCompany == 'true' || self.data.showAppointCompany == true) ? "Y" : "N",//是否显示公司，
        showCompanyCode: app.globalData.companyCodeSelect,
        endDate: self.data.endDate,//截止时间
        remark: self.data.remark,
        pricingPeriod: self.data.pricingPeriod,
        advancePayment: self.data.advancePayment, //预付金额
        purchaseMultiplier: self.data.purchaseMultiplier,
        showPurchaseMultiplier: (self.data.showMultiple == 'true' || self.data.showMultiple == true) ? "Y" : "N",//下单倍数
        showDelayPricing: (self.data.showDelay == 'true' || self.data.showDelay == true) ? "Y" : "N",
        showFloatingPrice: (self.data.floatingPriceRadio == 'true' || self.data.floatingPriceRadio == true) ? "Y" : "N",
        releaseCode: self.data.delayMidpointsData.releaseCode,
        invoicedateType: self.data.invoicedateType,
        settleAccountsType: self.data.settleAccountsType,
        deliveryPattern: self.data.deliveryPattern, //交货方式
        attributes: self.data.attributes,//商品
        delayPricingValidDate: self.data.delayPricingValidDate,//有效期限
        priceMethod: self.data.priceMethod,//含税单价

      }
    }
    else if (this.data.pricingPeriod == 2) {
      data = {

        contractCode: self.data.contractCode,//合约月
        categoryCode: self.data.categoryCode,
        deliveryType: self.data.delayMidpointsData.deliveryType,
        priceType: Number(self.data.priceTypeIdx) + 1,
        showCompany: (self.data.showAppointCompany == 'true' || self.data.showAppointCompany == true) ? "Y" : "N",//是否显示公司，
        showCompanyCode: app.globalData.companyCodeSelect,
        endDate: self.data.endDate,//截止时间
        remark: self.data.remark,
        pricingPeriod: self.data.pricingPeriod,
        advancePayment: self.data.advancePayment, //预付金额
        purchaseMultiplier: self.data.purchaseMultiplier,
        showPurchaseMultiplier: (self.data.showMultiple == 'true' || self.data.showMultiple == true) ? "Y" : "N",//下单倍数
        showDelayPricing: (self.data.showDelay == 'true' || self.data.showDelay == true) ? "Y" : "N",
        showFloatingPrice: (self.data.floatingPriceRadio == 'true' || self.data.floatingPriceRadio == true) ? "Y" : "N",
        releaseCode: self.data.delayMidpointsData.releaseCode,
        invoicedateType: self.data.invoicedateType,
        settleAccountsType: self.data.settleAccountsType,
        deliveryPattern: self.data.deliveryPattern, //交货方式
        attributes: self.data.attributes,//商品
        delayPricingEndDate: self.data.delayPricingEndDate,//指定期限,
        priceMethod: self.data.priceMethod,//含税单价

      }
    }


    // 发布请求
    util.post(api.product_update_release, data, res => {
      wx.showToast({
        title: '发布成功',
      })
      setTimeout(function () {
        wx.navigateBack()
      }, 2000)
    }, {
        loading: true
      })
  },

  // 点击确定事件
  choose(e) {
    console.log(e.detail);
    this.setData({
      contractCode: e.detail.chooseValue,
      contractNameList: e.detail.chooseArray
    })

  },
  categoryCodeBtn() {

    if (!this.data.categoryCode) {
      wx.showToast({
        title: '请选择商品种类',
        icon: 'none'
      })
    }
  },
  goto(e) {
    util.goto(e);
  }
})