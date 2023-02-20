// pages/mine/identity/identity.js
import util from '../../utils/util.js';
import api from '../../utils/api.js';

Component({
  properties: {
    dataTit: {
      type: String
    }
  },
  data: {
    // 选中城市
    region: [],
    // 城市列表
    regionList: [[], []],
    objectMultiArray: [],
  },
  ready() {
    this.getCompanyList()
  },
  methods: {
    // 获取所有城市
    getCompanyList() {
      util.post(api.level2_city_list_url, {
      }, res => {
        console.log(res)
        let regionList = []
        let regionChildList = []
        res.returnObject.forEach(item => {
          let obj = {}
          obj.provinceName = item.provinceName
          obj.shortName = item.shortName
          regionList.push(obj)
        })
        res.returnObject[0].childs.forEach(item => {
          regionChildList.push(item)
        })
        // 初始化picker数据
        this.setData({
          "regionList[0]": regionList,
          "regionList[1]": regionChildList
        })
        let arr = []
        res.returnObject.forEach((item, idx) => {
          let obj = {}
          obj.provinceName = item.provinceName
          obj.shortName = item.shortName
          obj.id = idx
          arr.push(obj)
        })
        res.returnObject.forEach((item, idx) => {
          item.childs.forEach(i => {
            i.ids = idx
          })
          arr = arr.concat(item.childs)
        })
        this.setData({
          objectMultiArray: arr
        })
      }, {
          loading: true
        }, fail => {
          // console.log(fail)
        })
    },

    // 选择交易品种
    bindRegionChange: function (e) {
      this.setData({
        "region[0]": e.detail.value[0],
        "region[1]": e.detail.value[1]
      })

      // 传值到父级
      let regionCode
      let idxProvince = e.detail.value[0]
      let idxCity = e.detail.value[1]
      regionCode = this.data.regionList[0][idxProvince].provinceName + ' ' + this.data.regionList[1][idxCity].cityName
      this.triggerEvent('regionValue', {
        regionCode
      }, {})
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
            "regionList[1]": list,
          })
      }
    },
  }
})
