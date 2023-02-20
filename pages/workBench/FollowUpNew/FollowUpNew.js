const app = getApp()
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
var totalpage;

Page({

  data: {
    userMsgList: [],//员工列表
    chooseEegionList: [],//选择列表
    multiple: true,  //多选
    dataTit: '选择商品类型',
    dataTitList: [],
    categoryTit: '选择跟进地区',
    type: 1, //1是新增2是编辑
    number: '',
    itemData: {},
    category: [],
    categoryList: [[], []],
  },

  onLoad: function (options) {
    let userCode = '';
    let type = '';
    let itemData = {};
    if (options.userCode) {
      userCode = options.userCode
    }

    if (options.type) {
      type = options.type
    }

    if (options.itemData) {
      itemData = JSON.parse(options.itemData) ? JSON.parse(options.itemData) : {}
      let adress = ''
      let dataTitList = []
      itemData.areas.forEach(function (item) {

        adress += item.areaName + '、'
        // item['flag'] = true

      })

      // dataTitList = JSON.parse(JSON.stringify(itemData.areas).replace(/areaName/g, 'name').replace(/areaCode/g, 'value'))

      itemData.areas.forEach(function (item) {
        dataTitList.push(item.areaCode)
      })

      adress = adress.slice(0, adress.length - 1)

      this.setData({
        dataTit: adress,
        dataTitList: dataTitList
      })



    }

    this.setData({
      userCode: userCode,
      type: type,
      itemData: itemData
    })



    this.getUserMsg();
    this.getCategoryList()
  },
  onShow: function () {
    if (!this.data.filterDataStatus) {
      this.setData({
        filterDataStatus: true
      })
      return
    } else {
      this.getUserMsg();
      this.getCategoryList()
    }

  },
  bindCategoryChange() {

  },

  bindMultiPickerColumnChange() {

  },

  //获取信息列表数据
  getUserMsg() {
    let self = this;
    util.post(api.get_areaList_url, {}, res => {

      let chooseEegionList = res.returnObject;
      chooseEegionList = JSON.parse(JSON.stringify(chooseEegionList).replace(/areaName/g, 'name').replace(/areaCode/g, 'value'))
      self.setData({
        chooseEegionList: chooseEegionList,
      });

    }, {
        loading: true
      })
  },

  // 获取品种列表
  getCategoryList() {
    util.post(api.follow_up_category_list, {
      userCode: this.data.userCode
    }, res => {
      let categoryList = []
      let categoryChildList = []
      res.returnObject.forEach(item => {
        let obj = {}
        obj.categoryCode = item.categoryCode
        obj.categoryName = item.categoryName
        categoryList.push(obj)
      })
      res.returnObject[0].childs.forEach(item => {
        item.childs.forEach(items => {
          categoryChildList.push(items)
        })
      })
      // 初始化picker数据
      this.setData({
        "categoryList[0]": categoryList,
        "categoryList[1]": categoryChildList
      })

      let arr = []
      res.returnObject.forEach((item, idx) => {
        let obj = {}
        obj.categoryCode = item.categoryCode
        obj.categoryName = item.categoryName
        obj.id = idx
        arr.push(obj)
      })
      res.returnObject.forEach((item, idx) => {
        item.childs.forEach(items => {
          items.childs.forEach(i => {
            i.ids = idx
          })
          arr = arr.concat(items.childs)
        })
      })
      this.setData({
        objectMultiArray: arr
      })

    }, {
        loading: true
      })
  },

  // 保存数据
  saveBtn() {

    let self = this;
    let byUserCode = self.data.userCode;
    let data = {};
    let url = ''
    let idx = this.data.category[1];

    if (self.data.type == 1) {
      data = {
        categoryCode: self.data.categoryList[1][idx].categoryCode,	//是	string	跟进品种code
        byUserCode: byUserCode,	//是	string	当前所要维护业务跟进对象的业务经理code
        areas: self.data.number,//	是	string[]	地区数组
      }
      url = api.save_businessFollowUp_url
    } else if (self.data.type == 2) {
      data = {
        categoryCode: self.data.itemData.categoryCode,	//是	string	跟进品种code
        byUserCode: self.data.userCode,	//是	string	当前所要维护业务跟进对象的业务经理code
        areas: self.data.number,//	是	string[]	地区数组
      }
      url = api.update_businessFollowUp_url
    }

    util.post(url, data, res => {
      let listByUserList = res.returnObject;
      wx.showToast({
        title: '操作成功',
      })
      setTimeout(function () {
        wx.navigateBack()
      }, 1000)

    }, {})
  },

  //刪除
  delBtn() {
    let self = this;
    let url = api.delete_businessFollowUp_url;
    let data = {
      categoryCode: self.data.itemData.categoryCode,	//是	string	跟进品种code
      byUserCode: self.data.userCode,	//是	string	当前所要维护业务跟进对象的业务经理code
    }
    util.post(url, data, res => {
      let listByUserList = res.returnObject;
      wx.showToast({
        title: '操作成功',
      })
      setTimeout(function () {
        wx.navigateBack()
      }, 1000)

    }, {})
  },

  // 点击确定事件
  choose(e) {

    this.setData({
      number: e.detail.chooseValue
    })



  },

  // 选择交易品种
  bindCategoryChange: function (e) {
    this.setData({
      "category[0]": e.detail.value[0],
      "category[1]": e.detail.value[1] ? e.detail.value[1] : 0
    })
  },

  // 获取对应的品种选项
  bindMultiPickerColumnChange: function (e) {
    switch (e.detail.column) {
      case 0:
        let list = []
        for (var i = 0; i < this.data.objectMultiArray.length; i++) {
          if (this.data.objectMultiArray[i].ids == this.data.objectMultiArray[e.detail.value].id) {
            list.push(this.data.objectMultiArray[i])
          }
        }
        this.setData({
          "categoryList[1]": list,
          // "category[0]": e.detail.value,
          // "category[1]": 0
        })
    }
  },

  goto(e) {
    util.goto(e);
  },
})