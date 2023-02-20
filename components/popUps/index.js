
  

Component({
  properties: {
    propnNme: {
      type: String,
      observer: function (newVal, oldVal, changedPath) {
      }
    }
  },

  properties: {
    dataList: {
      type: Array,
    },
    tit: {
      type: String,
    },
  },

  data: {
    showModal: true,
  },
  methods: {

    showDialogBtn: function () {
      this.setData({
        showModal: true
      })
    },
    preventTouchMove: function () {
    },
    
    // 确定
    onConfirm() {
      this.triggerEvent('onMyprop', {
        'showModal': false,
        'status': 'Y'
      }, {});

      this.setData({
        showModal: false
      });
    },


    onCancel() {
      this.triggerEvent('onMyprop', {
        'showModal': false,
        'status':'N'
      }, {});

      this.setData({
        showModal: false
      });
    },
    
    onKown() {
      this.triggerEvent('LKown', {
        'showModal': false,
        'status': 'N'
      }, {});

      this.setData({
        showModal: false
      });

    },
  },




  

})
