
Component({

  properties: {
    keyword: {
      type: String,
      observer: function(newVal, oldVal, changedPath) {
      }
    }
  },

  ready() {
    if(this.data.keyword){
       this.onSearch();
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    searchInput(e) {
      this.setData({
        keyword: e.detail.value
      })
      this.onSearch()
    },
    onSearch() {
      let keyword = this.data.keyword;

      this.triggerEvent('mysearch', {
        keyword: keyword
      }, {});
    }
  }
})
