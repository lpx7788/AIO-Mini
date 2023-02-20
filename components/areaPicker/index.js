let list = [];

Component({
  data: {
    showPicker: false,
    firstShow: false,
    list: [],
    value:[],
    titList: []
  },
  properties: {
    chooseList: {
      type: Array
    },
    multiple: {
      type: Boolean
    },
    dataTit: {
      type: String
    },
    dataTitList: {
      type: Array
    }
  },
  ready: function () {
    let self = this;
    self.setData({
      titList: self.properties.dataTitList
    })
  },

  methods: {

    // 点击picker元素事件	
    chooseItem(e) {
      if (this.data.titList.indexOf(e.currentTarget.dataset.value)=='-1'){
        let arr = this.data.titList
        arr.push(e.currentTarget.dataset.value)
        this.setData({
          titList: arr
        })
      }else{
        let arr = this.data.titList
        arr.splice(this.data.titList.indexOf(e.currentTarget.dataset.value),1)
        this.setData({
          titList: arr
        })
      }
    },
    // 展示picker
    showPicker() {
      if (!this.data.firstShow) {
        this.setData({
          firstShow: true
        })
      }
      this.setData({
        showPicker: true,
      })
      // 加载时重新渲染已选择元素
      let arr = this.data.chooseList;
      let array = this.data.list;
      let flag = '';
      let index = null;
      for (let i = 0, len = arr.length; i < len; i++) {
        index = i;
        flag = `chooseList[${i}].flag`;
        if (!array.includes(arr[i].value)) {
          this.setData({
            [flag]: false
          })
        } else {
          this.setData({
            [flag]: true
          })
        }
      }
    },
    // 隐藏picker
    hidePicker() {
      this.setData({
        showPicker: false
      })
    },
    // 取消按钮事件
    cancal() {
      this.hidePicker();
    },
    // 确定按钮事件
    sure() {
      let dataTit = ''
      for (let item of this.data.chooseList) {
        if (this.data.titList.indexOf(item.value)!='-1') {
          dataTit += item.name+'、'
        }
      }

      dataTit = dataTit.slice(0, dataTit.length - 1)

      this.setData({
        dataTit: dataTit
      })

      this.hidePicker();
      
      this.triggerEvent('chooseEvent', {
        chooseValue: this.data.titList
      });
    }
  }
})
