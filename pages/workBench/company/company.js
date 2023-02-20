const app = getApp()
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
let searchKeyword;
Page({

  data: {
    isActive: 0,
    listMain: [],
    listTitles: [],
    // fixedTitle: 'A',
    toView: 'inToView0',
    viewPosition: [],
    scroolHeight: 0,
    dataList: [],
    emptyPage:false,
    companyCodeList: [],
    checkcompanyCodeList: [],
    selectComanyNameList: []
  },

  onLoad: function(options) {

    let userInfo = wx.getStorageSync('userInfo');
    let companyCode = JSON.parse(userInfo).user.auths.companyCode;
    this.setData({
      companyCode: companyCode,
       checkcompanyCodeList: app.globalData.companyCodeSelect,
      selectComanyNameList: app.globalData.companyNameSelect
    })
    this.getDateList()

  },

  //获取页面数据
  getDateList() {
    let self = this;
    util.post(api.company_suppliers_query, {
      companyCode: self.data.companyCode,
      pageNum: 1,
      pageSize: '',
      searchKeyword: searchKeyword ? searchKeyword:''
    }, res => {
      let dataList = res.returnObject.suppliers;
      if (dataList.length==0){
       self.setData({
         emptyPage:true
       })
      }
      let alphabet = [];
      let msgList = [];
      let companyCodeList = [];
      dataList.forEach(function(item, index) {
        alphabet.push(item.fpy)
      })
      alphabet = Array.from(new Set(alphabet));

      alphabet.forEach(function(item, index) {
        msgList.push({
          'id': index,
          'region': item,
           items: []
        })
      })
      dataList.forEach(function(item, index) {
        companyCodeList.push(item.companyCode)
        msgList.forEach(function(i, idx) {
          if (item.fpy == i.region) {
            i.items.push(item)
          }
        })
      })
      self.setData({
        dataList: dataList,
        listMain: msgList,
        // fixedTitle: alphabet[0],
        companyCodeList: companyCodeList
      })
      var that = this;
      var num = 0;
      for (let i = 0; i < that.data.listMain.length; i++) {
        wx.createSelectorQuery().select('#inToView' + that.data.listMain[i].id).boundingClientRect(function (rect) {
          num = num + rect.height; //元素高度+该元素先前元素高度 ， 可理解为元素底部至可滚动视图区域顶部高度
          var _array = [{
            'height': num,
            'key': rect.dataset.id,
            'companyName': that.data.listMain[i].region
          }];
         
          that.setData({
            viewPosition: that.data.viewPosition.concat(_array) //合并数组
          });
        }).exec()
      };
    }, {
      loading: true
    })
  },

  //选择公司
  selectComany(e) {
    let companyCode = e.currentTarget.dataset.code
    let companyName = e.currentTarget.dataset.name
    let companyCodeList = this.data.companyCodeList;
    let chect = this.data.checkcompanyCodeList.indexOf(companyCode)
    let checkList = this.data.checkcompanyCodeList;
    if (chect == -1) {
      checkList.push(companyCode);
      this.data.selectComanyNameList.push(companyName)
    } else {
      checkList.splice(chect, 1)
      this.data.selectComanyNameList.splice(chect, 1)
    }
    this.setData({
      checkcompanyCodeList: checkList,
      selectComanyNameList: this.data.selectComanyNameList,
    })
  },

  //确定
  companyConfirmClick(){
    app.globalData.companyCodeSelect = [];
    app.globalData.companyNameSelect = [];
    app.globalData.companyCodeSelect = this.data.checkcompanyCodeList;
    app.globalData.companyNameSelect = this.data.selectComanyNameList
    wx.showToast({
      title: '操作成功',
      icon:'none'
    })
    setTimeout(function(){
      wx.navigateBack()
    },1000)
  },

  // 可滚动视图区域滑动函数触发
  onPageScroll: function(e) {
    this.setData({
      scroolHeight: e.detail.scrollTop //获取滚动条滚动位置
    });
    for (let i in this.data.viewPosition) {
      if (e.detail.scrollTop < this.data.viewPosition[i].height) { //判断滚动条位置是否在元素内
        this.setData({
          isActive: this.data.viewPosition[i].key,
          // fixedTitle: this.data.viewPosition[i].companyName
        });
        return false;
      }
    }
  },

  //点击右侧字母导航定位触发
  scrollToViewFn: function(e) {
    var that = this;
    var _id = e.target.dataset.id;
    for (var i = 0; i < that.data.listMain.length; ++i) {
      if (that.data.listMain[i].id === _id) {
        that.setData({
          isActive: _id,
          toView: 'inToView' + _id //滚动条to指定view
        })
        break
      }
    }
  },

  getsearchKeyword(e){
   searchKeyword =  e.detail.value;
    this.setData({
      dataList: [],
      listMain: [],
      companyCodeList: [],
      emptyPage:false
    })
      this.getDateList();
  }
})