
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';

Page({

  data: {
    userMsgList: [],//员工列表C
    listByUserList: [],//跟进列表
    type:1,//1员工申请  2员工管理
    id:'',//员工id
    businessList: ['采购', '销售', '采购与销售'],
    identitList: ['管理员', '业务经理'],
    currentBusiness:'',//当前的业务方向
    currentIdentit:'',//当前的身份
    userCode: '',//用户编码
    businessDirection: 1 ,//1业务方向 1：采购 ，2：销售，3：采购与销售
    allowPricing:2,//是否点价
    roleCode:'',
    dataStatus:false,
    isManager:false,//是否是业务经理
  },

  onLoad: function (options) {
    this.data.userCode = options.userCode;
    this.setData({
      userCode: options.userCode,
      id: options.id
    })
    this.getUserMsg();
    this.listByUserList();
  },

  onShow(){
    if (!this.data.dataStatus) {
      this.setData({
        dataStatus: true
      })
      return
    } else {
      this.setData({
        listByUserList: [],
      })
      this.listByUserList();
    }
  },


  //获取信息列表数据
  getUserMsg() {
    let self = this;
    let userInfo = wx.getStorageSync('userInfo');
    let companyCode = JSON.parse(userInfo).user.auths.companyCode;
    util.post(api.get_userCompany_detail_url, {
      id:self.data.id,
    }, res => {
      let userMsgList = res.returnObject ? res.returnObject:'';
      if (userMsgList.roleCodeExp =='业务经理'){
        self.setData({
          isManager: true
        })
      }
      self.setData({
        userMsgList: userMsgList,
        allowPricing:userMsgList.allowPricing,
        roleCode: userMsgList.roleCode,
        businessDirection: userMsgList.businessDirection
      });
    }, {
        loading: true
      })
  },

  //获取跟进列表数据
  listByUserList() {
    let self = this;
    let byUserCode = self.data.userCode;
    util.post(api.get_ListByUser_url, {
      byUserCode: byUserCode,
    }, res => {
      let listByUserList = res.returnObject;
      self.setData({
        listByUserList: listByUserList,
      });
      }, {
        loading: true
      })

  },
 
  //身份切换
  identityTab(){
    let self = this;
    wx.showActionSheet({
      itemList: self.data.identitList,
      success(res) {
        let isManager = self.data.isManager;
        if (res.tapIndex==1){
          isManager = true
        }else{
          isManager = false
        }
        self.setData({
          isManager: isManager,
          currentIdentit: self.data.identitList[res.tapIndex],
          roleCode: Number(res.tapIndex)+1
        })
      }
    })
  },

 //业务方向
  businessTab(){
    let self = this;
    wx.showActionSheet({
      itemList: self.data.businessList,
      success(res) {
        self.setData({
          currentBusiness: self.data.businessList[res.tapIndex],
          businessDirection: res.tapIndex + 1
        })
      }
    })
  },

  // 编辑跟进
  editBtn(e){
    let itemData = JSON.stringify(e.target.dataset.item);
    let self = this;
    wx.navigateTo({
      url: '../../workBench/FollowUpNew/FollowUpNew?userCode=' + self.data.userCode + '&type=2' + '&itemData='+itemData,
    })
  },

  newlyBtn(){
    let self = this;
    wx.navigateTo({
      url: '../../workBench/FollowUpNew/FollowUpNew?userCode=' + self.data.userCode+'&type=1',
    })
  },

  // 是否允许点价
  switchTab(e) {
    this.setData({
      // 1：允许, 2：不允许
      allowPricing: e.detail.value==true?1:2
    })
  },

  // 保存数据
  saveBtn(e){
    let self = this;
    let data = {}
    let name = e.currentTarget.dataset.name
    if (name== "del"){
      data = {
        id: self.data.id,
        expel: "expel"
      }
      wx.showModal({
        title: '温馨提示',
        content: '确定要删除该用户吗?',
        success:function(res){
           if(res.confirm){
            self.requestAjax(data);
           }
        }
      })
    }else{
      data={
        id: self.data.id,
        businessDirection: self.data.businessDirection + '',
        allowPricing: self.data.allowPricing + '',
        roleCode: self.data.roleCode + '' ? self.data.roleCode + '' : ''
      }
      self.requestAjax(data);
    }
  
  },

  requestAjax(data) {
    util.post(api.update_jurisdiction_url, data, res => {
      let listByUserList = res.returnObject;
      wx.showToast({
        title: '操作成功',
      })

      if (name == "del") {
        setTimeout(function () {
          wx.navigateBack()
        }, 2000)
      }
    }, {})
  },

  goto(e) {
    util.goto(e);
  },

  //打电话
  callUpClick(e) {
    let name = e.currentTarget.dataset.name;
    let phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  }
})