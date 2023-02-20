const app = getApp()
import util from '../../../utils/util.js';
import api from '../../../utils/api.js';
// let formId;
var totalpage;
Page({
  data: {
    msgList: [],
    curpage:1,
    type:1,//订单类型  1消息 2额度 3系统
    messageTypes:'' ,//4订单消息  5系统消息 123额度消息
    messageStatus: '',	  //是	string	消息状态 Y: 已读 N: 未读
    messageCode: '' ,//消息编号
    filterDataStatus:false,
    emptyPage:false,
    pageSize: 20,
    catchBottom:false,
    allRead:false
  },

  onLoad: function(options) {
    if (options){
      //订单消息
      if(options.type==1){
        this.setData({
          messageTypes: ['4'],
          type:1
        })
        wx.setNavigationBarTitle({
          title: '订单消息'
        })
      } 
      //额度消息
      else if (options.type == 2){
        this.setData({
          messageTypes: ['1','2','3'],
          type: 2
        })
        wx.setNavigationBarTitle({
          title: '额度消息'
        })
      } 
      // 系统消息
      else if (options.type == 3) {
        this.setData({
          messageTypes: ['5'],
          type: 3
        })
        wx.setNavigationBarTitle({
          title: '系统消息'
        })
      }
    }
    this.getMsgList();
  },

  onShow(){
    if (!this.data.filterDataStatus) {
      this.setData({
        filterDataStatus: true
      })
      return
    } else {
       this.getMsgList();
    }


  },

  onReachBottom: function() {
    console.log(this.data.curpage);
    if (Number(this.data.curpage - 1) * Number(this.data.pageSize) <= totalpage){
      this.getMsgList();
    }else{
      this.setData({
        catchBottom:true
      })
    }
  },

  onPullDownRefresh() {
    this.setData({
      msgList:[],
      curpage:1
    })
    this.getMsgList();
  },

  //获取信息列表数据
  getMsgList() {
    let self = this;
    if (!self.data.messageTypes){
      return
    }
    util.post(api.get_message_url, {
      messageStatus: "",
      pageNum: self.data.curpage,
      messageTypes: self.data.messageTypes, //4订单消息  5系统消息 123额度消息
      pageSize: self.data.pageSize
    }, res => {
      wx.stopPullDownRefresh();  
      totalpage = res.returnObject.total;
      let msgList = res.returnObject.messages;
      let datas = self.data.msgList
      self.setData({
        ['msgList[' + self.data.curpage + ']']: msgList,
        curpage: self.data.curpage + 1
      })

      if (this.data.msgList[1].length == 0) {
        self.setData({
          emptyPage: true
        })
      }

    }, {
      loading: true
    })
  },

  //全部已读
  allRead(){
    let msgList = this.data.msgList
    let self = this;
    util.post(api.update_all_message, {
      messageType: self.data.messageTypes, //消息类型： 1: 额度申请通知, 2: 额度添加通知, 3: 额度审批通知, 4: 订单消息, 5: 系统消息
    }, res => {
       wx.showToast({
         title: '设置成功',
       })
      self.setData({
        allRead: true,
      })
    }, {
        loading: true
      })
  },

  // 修改
  amend(e){
    let msgData = e.currentTarget.dataset.item.ext1;
    let orderMessage = 'orderMessage'
    wx.navigateTo({
      url: `../../../components/offerDetails/limit/limit?page=${orderMessage}&msgData=${msgData}`
    })
  },

  //拒绝/同意
  agreeOrNot(e){
    let self = this;
    let index = e.currentTarget.dataset.listidx;
    let type = e.currentTarget.dataset.type
    let pageindex = e.currentTarget.dataset.pageindex;
    let modifyQuotaCode = e.currentTarget.dataset.code;
    let modifyQuotaStatus;
    let msgList = self.data.msgList

    // 2: 审核通过, 3: 审核不通过
    if (type=="Y"){
      modifyQuotaStatus = "2";
    }else{
      modifyQuotaStatus = "3";
    }

    util.post(api.approve_quotal, {
      modifyQuotaStatus: modifyQuotaStatus, 
      modifyQuotaCode: modifyQuotaCode
    }, res => {
      wx.showToast({
        title: '设置成功',
      })
    
      let messageStatus = 'msgList[' + pageindex + '][' + index + '].messageStatus'
      let ext1 = JSON.parse(msgList[indexrr][idx].ext1)
      if (type == "Y") {
        ext1.applyQuotaStatus = 2
      } else {
        ext1.applyQuotaStatus = 3
      }

      ext1 = JSON.stringify(ext1)
      let ext1Data = 'msgList[' + indexrr + ']' + '[' + idx + '].ext1'

      self.setData({
        [messageStatus]: "Y",
        [ext1Data]: ext1
      })
    }, {
        loading: true
      })

  },

  //更新消息
  updateMsg(index,pageindex){
    let self = this;
    util.post(api.update_message_status, {
      messageStatus: self.data.messageStatus=="Y"?'N':'Y',	  //是	string	消息状态 Y: 已读 N: 未读
      messageCode: self.data.messageCode  //是	string	消息编号
    }, res => {
      let msgList = this.data.msgList;
      let messageStatus = 'msgList[' + pageindex + '][' + index + '].messageStatus'
      self.setData({
        [messageStatus]: "Y",
      })
    }, {
        loading: true
      })
  },

  goto(e) {
    let self = this;
    let data = e.currentTarget.dataset
    let index = data.listidx;
    let pageindex = data.pageindex;
    let userType = data.type
    this.setData({
      messageStatus: data.msg,
      messageCode:data.code
    })
  
      if (e.currentTarget.dataset.msg == 'Y') {
        if (this.data.type == 1) {
          if (userType == '买家') {
            wx.showToast({
              title: '请登录聚点商城APP或网页端操作',
              icon: 'none'
            })
            return;
          }
          util.goto(e);
        }
      } else if (e.currentTarget.dataset.msg == 'N'){
        if (this.data.type == 1) {
          this.updateMsg(index,pageindex);

          if (userType == '买家') {
           setTimeout(function(){
             wx.showToast({
               title: '请登录聚点商城APP或网页端操作',
               icon: 'none'
             })
           },1000)
            return;
          }
          util.goto(e);
        } else {
          this.updateMsg(index,pageindex);
        }
      }
  },
})