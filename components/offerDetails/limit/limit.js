// pages/workBench/placeOrder/placeOrder.js
const app = getApp()
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
let formId;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    availableQuotaNum: 0,
    contractCode: null,
    quotaUsed: 0,
    dataQuery: null,
    quotaNum: 0,
    msgData: {},
    page: '',
    quotaModify: ''//获取额度申请信息
  },

  onLoad: function (options) {
    let dataQuery =  '' ;
    let quotaData = '';
    let contractCode = '' ;
    let availableQuotaNum = '' ;
    let msgData ={};
    let quotaUsed = '';
    let pages ='';
    let modifyQuotaCode ='';
    let deliveryType = ''; 
    let releaseCode = '';
    if (options.dataQuery){
      dataQuery = JSON.parse(options.dataQuery) ? JSON.parse(options.dataQuery):'';
      releaseCode = JSON.parse(options.dataQuery).releaseCode ? JSON.parse(options.dataQuery).releaseCode:'';
      contractCode = JSON.parse(options.contractCode) ? JSON.parse(options.contractCode):''
     }

    if (options.deliveryType){
      deliveryType = options.deliveryType
     }

    if (options.quotaData){
      quotaData = JSON.parse(options.quotaData) ? JSON.parse(options.quotaData):''
      availableQuotaNum = quotaData.availableQuotaNum ? quotaData.availableQuotaNum:''
      quotaData = quotaData.quotaNum 
     }
    else if (options.msgData){
      msgData = JSON.parse(options.msgData) ? JSON.parse(options.msgData):''
      modifyQuotaCode = msgData.modifyQuotaCode
     }
    if (options.page) {
      pages = options.page
    }

    this.setData({
      availableQuotaNum: availableQuotaNum,
      contractCode: contractCode,
      quotaUsed: quotaData ? quotaData:'',
      dataQuery: dataQuery,
      msgData: msgData,
      page: pages ,
      modifyQuotaCode: modifyQuotaCode,
      deliveryType: deliveryType,
      releaseCode: releaseCode
    })

    if (modifyQuotaCode){
      this.queryQuotaMsg()
    }
  },

  // 获取额度消息
  queryQuotaMsg(){
    let self = this;
      util.post(api.query_modify_quota, {
        modifyQuotaCode: self.data.modifyQuotaCode, 
      }, res => {
        self.setData({
          quotaModify: res.returnObject
        })
        
      }, {
        loading: true
      })
  },

  // 编辑修改额度
  modifyBtn(){
    let self = this;
    if (!self.data.quotaNum){
       wx.showToast({
         title: '请输入增加的额度',
         icon:'none'
       })
       return;
    }
 
    util.post(api.edit_quota, {
      modifyQuotaStatus: self.data.msgData.applyQuotaStatus,
      modifyQuotaCode: self.data.modifyQuotaCode,
      quotaNum: self.data.quotaModify.availableQuotaNum,
      addQuotaNum: self.data.quotaNum
      }, res => {
        wx.showToast({
          title: '修改成功',
          icon: 'none',
          duration: 1000
        })
    
        //推送消息
        let pushData = {}
        let formId = wx.getStorageSync('formId');
        pushData = {
          formid: formId
        }

       setTimeout(function(){
         wx.navigateBack()
       },1000)
      }, {
        loading: true
      })

  },

  quotaClick(e){
    let type = e.currentTarget.dataset.type
    if (type == 'm'){
      this.modifyBtn();
    }else{
      this.applyBtn();
    }
    wx.setStorageSync('formId', e.detail.formId);
  },

  // 申请额度
  applyBtn(){
    let self = this;
    if (self.data.quotaNum>0){
      let userCompanyCode = JSON.parse(wx.getStorageSync('userInfo')).user.auths.companyCode
      let salesCompanyCode = self.data.dataQuery.companyCode
      util.post(api.apply_quota_url, {
        deliverytypeCode: self.data.deliveryType == 1 ? '2' : '1'  ,
        purchaseCompanyCode: self.data.deliveryType == 1 ? userCompanyCode :  salesCompanyCode ,
        salesCompanyCode: self.data.deliveryType == 1 ? salesCompanyCode : userCompanyCode  ,
        contractCode: self.data.contractCode.contractCode,
        quotaNum: self.availableQuotaNum,
        addQuotaNum: self.data.quotaNum,
        releaseCode: self.data.releaseCode
      }, res => {
        wx.showToast({
          title: '额度已提交申请',
        })

       //推送消息
        let pushData = {}
        let formId = wx.getStorageSync('formId');
          pushData = {
            formid: formId
          }

       setTimeout(function(){
         wx.navigateBack()
       },1000)
      }, {
        loading: true
      })
    }else{
      wx.showToast({
        title: '请输入正确的额度',
        icon: 'none',
        duration: 2000
      })
    }
  },

  setQuotaNum(e){
    this.setData({
      quotaNum: e.detail.value
    })
  },
    goto(e){
      util.goto(e)
    }
})