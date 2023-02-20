const app = getApp()
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';

var totalpage;
Page({
  data: {
    contractList: [], //合同列表
    curpage: 1,
    categoryCode: '', //商品种类
    endTime: '',
    startTime: '', 
    // contractStatus: ['双方未签署','买家未签署','卖家未签署','已签署','已取消'], //1.1版本
    contractStatus: ['全部','待签署','已签署','已取消',], //状态
    contractIdx: 0,
    supplierList: [], //供应商
    supplierIdx: 0,
    startDate: '请选择开始日期',
    endDate: '请选择结束日期',
    emptyPage: false,//是否没有数据
    showTimeQuantum: false,
    endTimeQuantum: null,
    height:'',
    catchBottom:false
  },

  onLoad: function (options) {
    this.getDateList();
    this.getSupplierList()
    // 获取当前日期
    let myDate = new Date()
    let today = myDate.toLocaleDateString()
    var reg = new RegExp('/', "g")
    today = today.replace(reg,'-')
    this.setData({
      endTimeQuantum: today
    })
  },

  onReachBottom: function () {
    if (Number(this.data.curpage - 1) * Number(this.data.pageSize) <= totalpage) {
      this.getDateList();
    }else{
      this.setData({
        catchBottom: true
      })
    }
  },
 
  //获取页面数据
  getDateList() {
    let self = this;
    util.post(api.query_contract, {
      pageSize: "20",
      tradingCompanyCode: self.data.supplierList[self.data.supplierIdx]?self.data.supplierList[self.data.supplierIdx].companyCode:'',
      categoryCode: self.data.categoryCode,
      status: self.data.contractIdx == 0 ? '' : self.data.contractIdx,
      endTime: self.data.endTime,
      contractType: "2",
      startTime: self.data.startTime,
      pageNum: self.data.curpage
    }, res => {
  
      totalpage = res.returnObject.total;
      let productList = res.returnObject.contracts;
      // productList=[];
      
      let datas = self.data.contractList
      // productList = datas.concat(productList);

      self.setData({
        // contractList: productList,
        curpage: self.data.curpage + 1
      });


      self.setData({
        ['contractList[' + self.data.curpage + ']']: productList,
      })

      if (self.data.contractList[self.data.curpage].length==0){
       self.setData({
         emptyPage:true
       })
      }

    }, {
        loading: true
      })
  },

  goto(e) {
    util.goto(e);
  },

  // 获取选中品种
  getCategoryCode(e) {
    let categoryCode = e.detail.categoryCode;
    this.setData({
      categoryCode: categoryCode
    })
    this.setData({
      curpage: 1,
      contractList: []
    })
    this.getDateList()
  },
  // 选择状态
  bindStatusChange(e) {
    this.setData({
      contractIdx: e.detail.value
    })
    this.setData({
      curpage: 1,
      contractList: []
    })
    this.getDateList()
  },
  // 获取供应商
  getSupplierList(){
    
    let companyCode = JSON.parse(wx.getStorageSync('userInfo')).user.auths.companyCode
    util.post(api.company_suppliers_query, {
      companyCode: companyCode
    }, res => {
      let suppliers = res.returnObject.suppliers
      suppliers.unshift({ companyName: '不限', companyCode: ''})
      this.setData({
        supplierList: suppliers
      })
    }, {
        loading: true
      })
  },
  // 选择供应商
  bindSupplierChange(e){
    this.setData({
      supplierIdx: e.detail.value
    })
    this.setData({
      curpage: 1,
      contractList: []
    })
    this.getDateList()
  },
  // 选择日期
  bindDateChange(e){
  },

  changeTimeQuantum(){
    this.setData({
      showTimeQuantum: !this.data.showTimeQuantum
    })
  },
  closeTimeQuantum(){
    this.setData({
      showTimeQuantum: false
    })
  },
  bindStartDateChange(e) {
    let startTime = ((new Date(e.detail.value)).getTime())/1000;
    this.setData({
      startDate: e.detail.value,
      startTime: startTime,
    })
    if (this.data.endDate !='请选择结束日期'){
      if ((this.data.endTime-this.data.startTime)>=0){
        this.setData({
          showTimeQuantum: false,
          curpage: 1,
          contractList: []
        })
        this.getDateList()
      }else{
        wx.showToast({
          title: '结束时间不能早于开始时间',
          icon: 'none',
          duration: 2000
        })
      }
    }
  },
  bindEndDateChange(e) {
    let endTime = ((new Date(e.detail.value)).getTime())/1000;
    this.setData({
      endDate: e.detail.value,
      endTime: endTime,
    })
    if (this.data.startDate != '请选择开始日期') {
      if ((this.data.endTime - this.data.startTime) >= 0) {
        this.setData({
          showTimeQuantum: false,
          curpage: 1,
          contractList: []
        })
        this.getDateList()
      } else {
        wx.showToast({
          title: '结束时间不能早于开始时间',
          icon: 'none',
          duration: 2000
        })
      }
    }
  },
  // 不限日期
  allDate(){
    this.setData({
      showTimeQuantum: false,
      startDate: '请选择开始日期',
      endDate: '请选择结束日期',
      startTime: '',
      endTime: '',
      curpage: 1,
      contractList: []
    })
    this.getDateList()
  },
})