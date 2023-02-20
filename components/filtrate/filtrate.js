// components/filtrate/filtrate.js
const app = getApp()
import util from '../../utils/util.js';
import api from '../../utils/api.js';
let checkHeight;
Page({

  data: {
    categoryCode: '',
    filtrateType: null,
    priceType: null,
    deliveryType: null,
    brandOptionList: [],
    specOptionList: [],
    materialOptionList: [],
    areaList: [],
    warehouseList: [],
    sourceList: [
      {
        value: 1,
        name: '所有'
      },
      {
        value: 2,
        name: '供应商报价'
      },
      {
        value: 3,
        name: '非供应商报价'
      }],
    statusList: [
      {
        value: ['1', '2'],
        name: '所有'
      },
      {
        value: ['1'],
        name: '在售中'
      },
      {
        value: ['2'],
        name: '已售完'
      }],
    orderStatusList: [
      {
        value: '',
        name: '全部'
      },
      {
        value: '1',
        name: '待挂单'
      },
      {
        value: '4',
        name: '已挂单'
      },
      {
        value: '5',
        name: '待生成合同'
      },
      {
        value: '6',
        name: '已生成合同'
      },
      {
        value: '3',
        name: '已取消'
      }],

    dealStatusList: [
      {
        value: '',
        name: '全部'
      },
      {
        value: '1',
        name: '未成交'
      },
      {
        value: '2',
        name: '部分成交'
      },
      {
        value: '3',
        name: '全部成交'
      }],

    checkAreaList: [],
    checkWarehouseList: [],
    checkSourceList: [0],
    checkStatusList: [0],
    checkBrandList: [],
    checkSpecList: [],
    checkMaterialList: [],
    checkOrderStatusList: [0],
    checkDealStatusList: [0],
    suppliers: [],
    indexSuppliers: 0,
    height: '',//元素的高度
    warehouseShow: false,//仓库是否显示全部
    materialShow: false,//材质是否显示全部
    specShow: false,//规格是否显示全部
    brandShow: false,//品牌是否显示全部
    warehouseBtnShow: false,//按钮否显示
    materialBtnShow: false,//按钮否显示
    specBtnShow: false,//按钮否显示
    brandBtnShow: false,//按钮否显示

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    console.log('筛选===');
    console.log(options);
    let arr = [
      {
        value: 1,
        name: '所有'
      },
      {
        value: 2,
        name: '客户求购'
      },
      {
        value: 3,
        name: '非客户求购'
      }]
    let statusListArr = [
      {
        value: ['1', '2'],
        name: '所有'
      },
      {
        value: ['1'],
        name: '求购中'
      },
      {
        value: ['2'],
        name: '已完成'
      }]

    if (options.deliveryType && options.deliveryType == 2) {
      this.setData({
        sourceList: arr,
        statusList: statusListArr
      })
    }

    this.setData({
      filtrateType: options.filtrateType ? options.filtrateType : null,
      deliveryType: options.deliveryType ? options.deliveryType : null,
      priceType: (!options.priceType ? null : (options.priceType == 0 ? 1 : (options.priceType == 1 ? 2 : (options.priceType == 2 ? 3 : null))))
    })
    this.getAreaList()
    this.getWarehouseList()
    if (options.filtrateType == 1) {
      this.getDealCompanyList()
    }
    if (options.priceType == 1 || options.priceType == 2) {
      this.setData({
        orderStatusList: [
          {
            value: '',
            name: '全部'
          },
          {
            value: '1',
            name: '待确认'
          },
          {
            value: '2',
            name: '待生成合同'
          },
          {
            value: '6',
            name: '已生成合同'
          },
          {
            value: '3',
            name: '已取消'
          },
        ]
      })
    }
    if (options.priceType == 2) {
      this.setData({
        dealStatusList: [
          {
            value: '',
            name: '全部'
          },
          {
            value: '1',
            name: '待点价'
          },
          {
            value: '2',
            name: '未点完，已过期'
          },
          {
            value: '3',
            name: '已点完'
          }]
      })
    }
  },

  onShow() {
    let self = this
    let warehouseBtnShow = false;
    let materialBtnShow = false;
    let specBtnShow = false;
    let brandBtnShow = false;
    var query = wx.createSelectorQuery()
    query.select('.listContentHeight').boundingClientRect()
    query.selectAll('.listContent').boundingClientRect()
    query.exec(function (res) {
      checkHeight = res[0].height
      res[1].forEach(function (item, index) {
        if (index == 0) {
          if (item.height > checkHeight) {
            brandBtnShow = true
          }
        }
        if (index == 1) {
          if (item.height > checkHeight) {
            specBtnShow = true
          }
        }
        if (index == 2) {
          if (item.height > checkHeight) {
            materialBtnShow = true
          }
        }
        if (index == 3) {
          if (item.height > checkHeight) {
            warehouseBtnShow = true
          }
        }

      })

      self.setData({
        warehouseShow: true,
        materialShow: true,
        specShow: true,
        brandShow: true,
        brandBtnShow: brandBtnShow,
        specBtnShow: specBtnShow,
        warehouseBtnShow: warehouseBtnShow,
        materialBtnShow: materialBtnShow
      })

    });

  },
  showBtn(e) {
    let warehouseShow = true;
    let materialShow = true;
    let specShow = true;
    let brandShow = true;
    if (e.currentTarget.dataset.name == 'wareHouse') {
      if (this.data.warehouseShow == true) {
        warehouseShow = false;
      } else {
        warehouseShow = true;
      }
    }
    else if (e.currentTarget.dataset.name == 'material') {
      if (this.data.materialShow == true) {
        materialShow = false
      } else {
        materialShow = true
      }
    }
    else if (e.currentTarget.dataset.name == 'spec') {
      if (this.data.specShow == true) {
        specShow = false
      } else {
        specShow = true
      }
    }
    else if (e.currentTarget.dataset.name == 'brand') {
      if (this.data.brandShow == true) {
        brandShow = false
      } else {
        brandShow = true
      }
    }

    this.setData({
      brandShow: brandShow,
      specShow: specShow,
      warehouseShow: warehouseShow,
      materialShow: materialShow
    })
  },

  // 获取选中品种
  getCategoryCode(e) {

    this.data.categoryCode = e.detail.categoryCode
    let url
    let params = {
      categoryCode: this.data.categoryCode
    }
    // 判断该筛选是在首页还是订单，调用不同接口、传不同参数
    if (this.data.filtrateType == 0) {
      url = api.product_attr_forsearch
      params.deliveryType = this.data.deliveryType
    } else {
      url = api.order_select_bsmw
    }
    util.post(url, params, res => {
      let result = res.returnObject
      this.setData({
        brandOptionList: result.brandList,
        specOptionList: result.specList,
        materialOptionList: result.materialList
      })
    }, {
        loading: true
      })
  },

  // 获取地区
  getAreaList() {
    util.post(api.get_area_list, {}, res => {
      this.setData({
        areaList: res.returnObject
      })
    }, {
        loading: true
      })
  },

  // 获取仓库
  getWarehouseList() {
    util.post(api.warehouse_by_area_query, {
      deliveryType: this.data.deliveryType,
      areaCode: this.data.checkAreaList[0] || ''
    }, res => {
      this.setData({
        warehouseList: res.returnObject
      })
    }, {})
  },

  // 选择地区
  checkArea(e) {
    let checkAreaList = this.data.checkAreaList
    if (this.data.checkAreaList.indexOf(e.currentTarget.dataset.idx) == -1) {
      checkAreaList =  [e.currentTarget.dataset.idx]
    } else {
      checkAreaList = []
    }
    
    this.setData({
      checkWarehouseList: [],
      checkAreaList: checkAreaList
    })

    this.getWarehouseList()
  },

  // 不限地区
  allArea() {
    this.setData({
      checkAreaList: []
    })
    this.getWarehouseList()
  },

  // 选择仓库
  checkWarehouse(e) {
    let warehouseArr = this.data.checkWarehouseList
    let res = this.data.checkWarehouseList.indexOf(e.currentTarget.dataset.idx)
    if (res == -1) {
      warehouseArr.push(e.currentTarget.dataset.idx)
    } else {
      warehouseArr.splice(res, 1)
    }
    this.setData({
      checkWarehouseList: warehouseArr
    })
  },

  // 不限仓库
  allWarehouse() {
    this.setData({
      checkWarehouseList: []
    })
  },

  // 选择来源
  checkSource(e) {
    this.setData({
      checkSourceList: [e.currentTarget.dataset.idx]
    })
  },

  // 选择状态
  checkStatus(e) {
    this.setData({
      checkStatusList: [e.currentTarget.dataset.idx]
    })
  },

  // 选择品牌
  checkBrand(e) {
    let brandArr = this.data.checkBrandList
    let res = this.data.checkBrandList.indexOf(e.currentTarget.dataset.idx)
    if (res == -1) {
      brandArr.push(e.currentTarget.dataset.idx)
    } else {
      brandArr.splice(res, 1)
    }
    this.setData({
      checkBrandList: brandArr
    })
  },

  // 不限品牌
  allBrand() {
    this.setData({
      checkBrandList: []
    })
  },

  // 选择规格
  checkSpec(e) {
    let specArr = this.data.checkSpecList
    let res = this.data.checkSpecList.indexOf(e.currentTarget.dataset.idx)
    if (res == -1) {
      specArr.push(e.currentTarget.dataset.idx)
    } else {
      specArr.splice(res, 1)
    }
    this.setData({
      checkSpecList: specArr
    })
  },

  // 不限规格
  allSpec() {
    this.setData({
      checkSpecList: []
    })
  },

  // 选择材质
  checkMaterial(e) {
    let materialArr = this.data.checkMaterialList
    let res = this.data.checkMaterialList.indexOf(e.currentTarget.dataset.idx)
    if (res == -1) {
      materialArr.push(e.currentTarget.dataset.idx)
    } else {
      materialArr.splice(res, 1)
    }
    this.setData({
      checkMaterialList: materialArr
    })
  },

  // 不限材质
  allMaterial() {
    this.setData({
      checkMaterialList: []
    })
  },

  // 选择订单状态
  checkOrderStatus(e) {
    this.setData({
      checkOrderStatusList: [e.currentTarget.dataset.idx]
    })
  },

  // 选择成交状态
  checkDealStatus(e) {
    this.setData({
      checkDealStatusList: [e.currentTarget.dataset.idx]
    })
  },

  // 获取交易公司
  getDealCompanyList() {
    let companyCode = ''
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      companyCode = JSON.parse(wx.getStorageSync('userInfo')).user.auths.companyCode ? JSON.parse(wx.getStorageSync('userInfo')).user.auths.companyCode : ''
    }

    util.post(api.suppliers_company_query, {
      companyCode: companyCode
    }, res => {
      let arr = [{
        companyName: '不限',
        companyCode: ''
      }]
      arr = arr.concat(res.returnObject.suppliers)
      this.setData({
        suppliers: arr
      })
    }, {
        loading: true
      },
      fail => {

      })
  },

  // 选择交易公司
  bindPickerSuppliersChange(e) {
    this.setData({
      indexSuppliers: e.detail.value
    })
  },

  // 重置
  reset() {
    this.setData({
      brandOptionList: [],
      specOptionList: [],
      materialOptionList: [],
      areaList: [],
      checkAreaList: [],
      checkWarehouseList: [],
      checkSourceList: [0],
      checkStatusList: [0],
      checkBrandList: [],
      checkSpecList: [],
      checkMaterialList: [],
      checkOrderStatusList: [0],
      checkDealStatusList: [0],
      categoryCode: '',
      indexSuppliers: 0
    })
    // 重置品种
    this.selectComponent('#category').reset();
  },

  // 确定
  doFilter() {
    let brandList = []
    let specList = []
    let materialList = []
    let warehouseList = []
    this.data.checkBrandList.forEach(i => {
      brandList.push(this.data.brandOptionList[i])
    })
    this.data.checkSpecList.forEach(i => {
      specList.push(this.data.specOptionList[i])
    })
    this.data.checkMaterialList.forEach(i => {
      materialList.push(this.data.materialOptionList[i])
    })
    this.data.checkWarehouseList.forEach(i => {
      warehouseList.push(this.data.warehouseList[i].wareHouse)
    })

    let data = {}
    data = {
      categoryCode: this.data.categoryCode,
      brandList: brandList,
      specList: specList,
      materialList: materialList,
      areaCode: this.data.checkAreaList[0] || '',
      wareHouseList: warehouseList,
      orderStatus: this.data.orderStatusList[this.data.checkOrderStatusList[0]].value,
      dealStatus: this.data.dealStatusList[this.data.checkDealStatusList[0]].value,
    }

    if (this.data.filtrateType == 0) {
      data.tradeCompanyCode = null;
      data.source = this.data.sourceList[this.data.checkSourceList[0]].value;
      data.releaseStatus = this.data.statusList[this.data.checkStatusList[0]].value;

    } else {
      data.tradeCompanyCode = this.data.suppliers[this.data.indexSuppliers].companyCode ? this.data.suppliers[this.data.indexSuppliers].companyCode : ''

    }

    app.globalData.filterData = data

    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    prevPage.setData({
      filterStatus: true
    });
    setTimeout(function () {
      wx.navigateBack()
    }, 1000)


  }
})