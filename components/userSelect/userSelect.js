// components/userSelect/userSelect.js
const app = getApp()
import util from '../../utils/util.js';
import api from '../../utils/api.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectType: [],
    checkSelectTypeList: [],
    selectTypeList: [{
        value: '1',
        name: '报价'
      },
      {
        value: '2',
        name: '求购'
      }
    ],
    areaList: [],
    checkAreaList: [],
    colouredList: [],
    blackList: [],
    agricultureList: [],
    chemicalList: [],
    energyList: [],
    otherList: [],
    // 选中的idx
    checkColouredList: [],
    checkBlackList: [],
    checkAgricultureList: [],
    checkChemicalList: [],
    checkEnergyList: [],
    checkOtherList: [],
    // 选中的选项
    checkAreaVal: [],
    checkColouredVal: [],
    checkBlackVal: [],
    checkAgricultureVal: [],
    checkChemicalVal: [],
    checkEnergyVal: [],
    checkOtherVal: [],
    showBtn:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getCategoryList()
    this.getAreaList();

  },

  // 选择关注类型
  checkSelectType(e) {
    let typeArr = this.data.checkSelectTypeList
    let res = this.data.checkSelectTypeList.indexOf(e.currentTarget.dataset.idx)
    if (res == -1) {
      typeArr.push(e.currentTarget.dataset.idx)
    } else {
      typeArr.splice(res, 1)
    }
    let arr = []
    this.data.checkSelectTypeList.forEach((item) => {
      this.data.selectTypeList.forEach((i, idx) => {
        if (idx == item) {
          arr.push(i.value)
        }
      })
    })
    this.setData({
      selectType: arr,
      checkSelectTypeList: typeArr
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
      },
      fail => {

      })
  },

  // 选择地区
  checkArea(e) {
    let checkArr = this.data.checkAreaList
    let res = this.data.checkAreaList.indexOf(e.currentTarget.dataset.idx)
    if (res == -1) {
      checkArr.push(e.currentTarget.dataset.idx)
    } else {
      checkArr.splice(res, 1)
    }

    let arr = []
    checkArr.forEach((item) => {
      this.data.areaList.forEach((i, idx) => {
        if (idx == item) {
          arr.push(i.areaCode)
        }
      })
    })
    this.setData({
      checkAreaVal: arr,
      checkAreaList: checkArr
    })
  },

  // 获取所有品种
  getCategoryList() {
    util.post(api.category_tree_url, {}, res => {
        res.returnObject.forEach(item => {
          switch (item.categoryName) {
            case '有色':
              this.getChilds('colouredList', item.childs)
              break;
            case '黑色':
              this.getChilds('blackList', item.childs)
              break;
            case '农产品':
              this.getChilds('agricultureList', item.childs)
              break;
            case '化工':
              this.getChilds('chemicalList', item.childs)
              break;
            case '能源':
              this.getChilds('energyList', item.childs)
              break;
            case '其他':
              this.getChilds('otherList', item.childs)
              break;
          }
        })
        this.getUserSelection()
      }, {
        loading: true
      },
      fail => {

      })
  },

  getChilds(name, val) {
    let arr = []
    val.forEach(item => {
      arr = arr.concat(item.childs)
    })
    this.setData({
      [name]: arr
    })
  },

  checkName(e) {
    let listArr = this.data[e.currentTarget.dataset.list]
    let res = this.data[e.currentTarget.dataset.list].indexOf(e.currentTarget.dataset.idx)
    if (res == -1) {
      listArr.push(e.currentTarget.dataset.idx)
    } else {
      listArr.splice(res, 1)
    }
    let arr = []
    this.data[e.currentTarget.dataset.list].forEach((item) => {
      this.data[e.currentTarget.dataset.checklist].forEach((i, idx) => {
        if (idx == item) {
          arr.push(i.categoryCode)
        }
      })
    })
    this.setData({
      [e.currentTarget.dataset.list]: listArr,
      [e.currentTarget.dataset.val]: arr
    })
  },

  // 设置自选
  setUserSelection() {

    let arr = this.data.checkColouredVal.concat(this.data.checkBlackVal, this.data.checkAgricultureVal, this.data.checkChemicalVal, this.data.checkEnergyVal, this.data.checkOtherVal)
    let data = {}
    data = {
      categoryData: arr,
      deliveryType: this.data.selectType,
      areaCodeList: this.data.checkAreaVal
    }
    util.post(api.setting_user_selection_url, data, res => {

        let pages = getCurrentPages(); 
        let prevPage = pages[pages.length - 2]; 
        prevPage.setData({
          userchose: true
        });

        setTimeout(function() {
          wx.navigateBack()
        }, 1000)

      }, {
        loading: true
      },
      fail => {

      })
  },

  // 获取自选内容
  getUserSelection() {
    util.post(api.get_user_selection_url, {}, res => {
      // 获取类型
      let arrType = []
      this.data.selectTypeList.forEach((item, index) => {
        res.returnObject.deliveryType.forEach(i => {
          if (i == item.value) {
            arrType.push(index)
          }
        })
      })

      let arrType2 = []
      this.data.checkSelectTypeList.forEach((item) => {
        this.data.selectTypeList.forEach((i, idx) => {
          if (idx == item) {
            arrType2.push(i.value)
          }
        })
      })

      // 获取地区
      let arrArea = []
      this.data.areaList.forEach((item, index) => {
        res.returnObject.areaCodeList.forEach(i => {
          if (i == item.areaCode) {
            arrArea.push(index)
          }
        })
      })

      let arrArea2 = []
      this.data.checkAreaList.forEach((item) => {
        this.data.areaList.forEach((i, idx) => {
          if (idx == item) {
            arrArea2.push(i.areaCode)
          }
        })
      })

      this.setData({
        checkAreaVal: arrArea2,
        checkSelectTypeList: arrType,
        selectType: arrType2,
        checkAreaList: arrArea,
        showBtn:true
      })



      res.returnObject.categoryData.forEach(item => {
        if (item.indexOf('col') != -1) {
          this.getSelectCategory('colouredList', 'checkColouredList', 'checkColouredVal', item)
        }
        if (item.indexOf('bak') != -1) {
          this.getSelectCategory('blackList', 'checkBlackList', 'checkBlackVal', item)
        }
        if (item.indexOf('agr') != -1) {
          this.getSelectCategory('agricultureList', 'checkAgricultureList', 'checkAgricultureVal', item)
        }
        if (item.indexOf('che') != -1) {
          this.getSelectCategory('chemicalList', 'checkChemicalList', 'checkChemicalVal', item)
        }
        if (item.indexOf('ene') != -1) {
          this.getSelectCategory('energyList', 'checkEnergyList', 'checkEnergyVal', item)
        }
        if (item.indexOf('oth') != -1) {
          this.getSelectCategory('otherList', 'checkOtherList', 'checkOtherVal', item)
        }
      })

     

    }, {
      loading: true
    }, fail => {

    })
  },

  // 获取关注品种
  getSelectCategory(list, checkList, val, item) {
    // 数据回写
    let checkArr = this.data[checkList]
    this.data[list].forEach((i, idx) => {
      if (item == i.categoryCode) {
        checkArr.push(idx)
      }
    })
  
    // 设置传参数据
    let arr = []
    checkArr.forEach((item) => {
      this.data[list].forEach((i, idx) => {
        if (idx == item) {
          arr.push(i.categoryCode)
        }
      })
    })
    this.setData({
      [val]: arr,
      [checkList]: checkArr,
      
    })
  }



})