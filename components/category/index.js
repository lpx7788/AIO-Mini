// pages/mine/identity/identity.js
import util from '../../utils/util.js';
import api from '../../utils/api.js';

Component({
  properties: {
    placeholder: {
      type: String,
    },
    required: {
      type: Boolean,
    },
    multiple: {
      type: Boolean,
    }
  },
  data: {
    // 交易品种
    category: [],
    // 品种列表
    categoryList: [[], []],
    objectMultiArray: [],
    placeholderData: '请选择',
    categoryNameList: [], //多选时品种名
    categoryCodeList: [], //多选时品种code
  },
  ready(){
    this.getCategoryList()
    if(this.properties.placeholder!=''){
      this.setData({
        placeholderData: this.properties.placeholder
      })
    }
  },
  methods: {
    // 获取所有品种
    getCategoryList() {
      util.post(api.category_tree_url, {
      }, res => {
        let categoryList = []
        let categoryChildList = []
        res.returnObject.forEach(item => {
          let obj = {}
          obj.categoryCode = item.categoryCode
          obj.categoryName = item.categoryName
          categoryList.push(obj)
        })
        if (this.data.required){
          res.returnObject[0].childs.forEach(item => {
            item.childs.forEach(items => {
              categoryChildList.push(items)
            })
          })
        }else{
          categoryList.unshift({ categoryCode: '', categoryName: '不限' })
          categoryChildList.push({ categoryCode: '', categoryName: '不限', ids: 0 })
        }
        // 初始化picker数据
        this.setData({
          "categoryList[0]": categoryList,
          "categoryList[1]": categoryChildList
        })
        
        let arr = []
        if (!this.data.required) {
          arr.push({ categoryCode: '', categoryName: '不限', id: 0 })
        }
        res.returnObject.forEach((item, idx) => {
          let obj = {}
          obj.categoryCode = item.categoryCode
          obj.categoryName = item.categoryName
          if (!this.data.required) {
            obj.id = idx+1
          }else{
            obj.id = idx
          }
          arr.push(obj)
        })
        if(!this.data.required){
          arr.push({ categoryCode: '', categoryName: '不限', ids: 0 })
        }
        res.returnObject.forEach((item, idx) => {
          item.childs.forEach(items => {
            items.childs.forEach(i => {
              if (!this.data.required){
                i.ids = idx+1
              }else{
                i.ids = idx 
              }
            })
            arr = arr.concat(items.childs)
          })
        })
        this.setData({
          objectMultiArray: arr
        })
        },{
          loading: true
        },
        fail => {

        })
    },

    // 选择交易品种
    bindCategoryChange: function (e) {
      this.setData({
        "category[0]": e.detail.value[0],
        "category[1]": e.detail.value[1] ? e.detail.value[1]:0
      })
      // 传值到父级
      let categoryCode
      let idx = this.data.category[1];
      categoryCode = this.data.categoryList[1][idx].categoryCode
      if (this.properties.multiple){
        if (this.data.categoryCodeList.indexOf(categoryCode)==-1){
          let categoryCodeList = this.data.categoryCodeList
          let categoryNameList = this.data.categoryNameList
          categoryCodeList.push(categoryCode)
          categoryNameList.push(this.data.categoryList[1][idx].categoryName)
          this.setData({
            categoryCodeList: categoryCodeList,
            categoryNameList: categoryNameList
          })
        }
        let categoryCodeList = this.data.categoryCodeList
        this.triggerEvent('categoryValue', {
          categoryCodeList
        }, {})
      }else{
        this.triggerEvent('categoryValue', {
          categoryCode
        }, {})
      }
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
        })
      }
    },

    // 重置
    reset(){
      this.setData({
        category: []
      })
    },

    // 清空
    clear(){
      this.setData({
        category: [],
        categoryCodeList: [],
        categoryNameList: []
      })
      let categoryCodeList = []
      this.triggerEvent('categoryValue', {
        categoryCodeList
      }, {})
    }
  }
})