
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
var totalpage;

Page({

  data: {
    userMsgList: [],//员工列表
    curpage: 1,//当前页面
    pageSize:20,
    type:1,
    userCompanyStatus:2,
    filterDataStatus:false
  },

  onLoad: function (options) {
   
    // 员工申请
    let type = this.data.type;
    let title = ''
    if (options.type == 1) {
      type=1;
      title = '员工申请'
    } 
    // 员工管理
    if (options.type == 2) {
      type = 2
      title = '员工管理'
    } 
    wx.setNavigationBarTitle({
      title: title
    })
    this.setData({
      type: type
    })
    this.getUserMsgList();
  },

 onShow:function(){
   if (!this.data.filterDataStatus) {
     this.setData({
       filterDataStatus: true
     })
     return
   }else{
      this.setData({
        userMsgList:[]
      })
     this.getUserMsgList();
   }
 },

  //下拉加载下一页
  onReachBottom: function () {
    if (this.data.curpage <= totalpage) {
      this.getUserMsgList();
    }
  },

  //获取信息列表数据
  getUserMsgList() {
    let self = this;
    let userInfo =   wx.getStorageSync('userInfo');
    let companyCode = JSON.parse(userInfo).user.auths.companyCode;  
    let data = {}  
    if (this.data.type==2){
      data = {
        pageNum: self.data.curpage,
        companyCode: companyCode,
        pageSize: self.data.pageSize,
        userCompanyStatus:2
      }
    } else{
      data = {
        pageNum: self.data.curpage ,
        companyCode: companyCode,
        pageSize: self.data.pageSize,
      }
    }  
    util.post(api.get_userCompany_url,data, res => {
      let userMsgList = res.returnObject;
      totalpage = res.returnObject.total ? res.returnObject.total:1;
      userMsgList = userMsgList.concat(self.data.userMsgList);
      self.setData({
        userMsgList: userMsgList,
        curpage: self.data.curpage + 1
      });
    }, {
        loading: true
      })

  },
   
  //拒绝/同意
  agreeOrNot(e) {
    let self = this;
    let type = e.currentTarget.dataset.type
    let item = e.currentTarget.dataset.item;
    let itemIndex = e.currentTarget.dataset.index;

    let userCode = item.userCode; 
    let companyCode;
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo){
      companyCode = JSON.parse(userInfo).user.auths.companyCode;
    }
    let isPass;
    if (type == "Y") {
      isPass = "Y";
    } else {
      isPass = "N";
    }
    util.post(api.user_company_examine, {
      companyCode: companyCode,
      userCode: userCode,
      isPass: isPass
    }, res => {
      wx.showToast({
        title: '设置成功',
      })
      let userMsgList = this.data.userMsgList
      if (isPass =='N'){
        userMsgList[itemIndex].userCompanyStatus = 3
      }
      if (isPass == 'Y'){
        userMsgList[itemIndex].userCompanyStatus = 2
      }
      
      self.setData({
        userMsgList: userMsgList,
      })
      self.getUserMsgList();
      
    }, {
      loading: true
    })
  },


  //员工详情
  goEmployeeDetails(e) {
    let usercode = e.currentTarget.dataset.usercode
    if(this.data.type==2){
      wx.navigateTo({
        url: '../employeeDetails/employeeDetails?id=' + e.currentTarget.id + '&userCode=' + usercode,
      })
    }
  },

  //打电话
  callUpClick(e){
    let name = e.currentTarget.dataset.name;
    let phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  }
})