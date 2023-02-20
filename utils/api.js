const api = {
  webSk_md_url: '/webSk/md', //实时行情接口
  webSk_service_url: '/webSk/service', //Websocket服务
  // login_url: '/user/login', // 登录/
  // login_url: '/userWechat/loginWeChat', // 登录
  login_url: '/user/loginWeChat', // 登录（未注册用户新增返回openId 用于用户注册是保存数据库2019-6-14修改）

  // weChatRegister_url: '/userWechat/weChatRegister', //微信设置密码
  weChatRegister_url: '//user/weChatRegister', //微信设置密码（微信用户注册变更2019-6-14修改）

  level2_city_list_url: '/company/provinceCityList', // 城市二级列表
  level3_city_list_url: '/invoice/getAddressData', // 城市三级列表
  category_tree_url: '/category/tree', // 品种列表
  company_list_url: '/userCompany/queryChangeList', //可切换公司列表
  banner_list_url:'/advertisement/query',//首页轮播图
  customizeProduct_list_url: '/v1.2/product/queryUserSelection',//首页获取自选商品
  product_list_url: '/v1.2/product/search',//首页获取商品(除自选商品)
  user_refresh_url: '/user/refresh',//个人信息
  reset_password_url: '/user/resetPassword',//重置密码
  get_verificationCode_url: '/user/verificationCode',//获取验证码
  userCompany_join_url: '/userCompany/join',//申请入驻
  // company_join_url: '/company/join', //企业入驻申请
  // company_join_url: '/userWechat/join', //企业入驻申请
  company_join_url: '/company/joinMini', //企业入驻申请（企业入驻申请2019-6-14修改）

  get_hot_category_url: '/category/getHotCategory', //热门品种
  get_message_url: '/message/query',//消息列表
  get_userCompany_url: '/userCompany/queryUserCompany',//员工列表管理
  get_userCompany_detail_url: '/userCompany/queryUserCompanyDetail',//员工详情
  get_orderList_url: '/order/queryOrderList',//订单列表
  get_ListByUser_url: '/businessFollowUp/queryListByUser',//业务跟进列表
  update_jurisdiction_url: '/userCompany/updateJurisdiction',//员工权限的修改
  get_areaList_url: '/businessFollowUp/areaList',//员工权限的修改
  save_businessFollowUp_url: '/businessFollowUp/save',//新增业务跟进
  update_businessFollowUp_url: '/businessFollowUp/update',//编辑业务跟进
  delete_businessFollowUp_url: '/businessFollowUp/delete',//编辑业务跟进
  product_attr_forsearch: '/v1.2/product/queryProductAttrForSearch',// 首页筛选条件-获取品牌,规格,材质
  order_select_bsmw: '/order/select/bsmw',//订单查询条件-品牌、规格、材质
  get_area_list: '/businessFollowUp/areaList',//获取地区列表
  warehouse_by_area_query: '/v1.2/product/queryWareHouseByArea',//获取仓库列表
  suppliers_company_query: '/company/querySuppliers',//获取交易公司
  get_product_url: '/v1.2/product/query',//我的求购
  get_product_queryDetail_url: '/v1.2/product/queryDetail',//求购详情
  update_product_url: '/v1.2/product/updateProductRelease',//更新商品
  quota_url: '/quota/queryQuota',//额度查询
  apply_quota_url: '/quota/applyForQuota',//申请额度
  setting_user_selection_url: '/v1.2/product/settingUserSelection', //设置自选
  send_order_url: '/order/sendOrder',//确定价下单
  get_order_details_url: '/order/getOrderdetails',//订单明细查询
  change_company_url: '/userCompany/changeCompany',//切换公司
  get_order_flow_url: '/order/queryOrderFlow',//获取订单记录 
  cancel_order_url: '/order/cancelOrder',//撤销订单
  get_user_selection_url: '/v1.2/product/getUserSelectionProduct' ,//设置自选
  update_all_message: '/message/updateAllMessage', //消息全部已读
  update_message_status: '/message/updateMessageStatus' ,//更新消息状态
  category_attribute: '/v1.2/categoryAttribute/getAttrValue', //分类查询属性
  product_update_release: '/v1.2/product/updateProductRelease', //编辑发布商品
  contract_tree: '/contract/tree', //合约树
  product_release: '/v1.2/product/release', //发布求购  
  savet_order_remark: '/order/saveOrderRemark', //保存订单备注 
  future_order_cancel: '/order/cancelUnconfirmedPricingOrder', //点价订单-待确认撤单
  future_order_apply: '/order/applyCancelPricingOrder' ,//点价订单-已挂单撤单申请
  order_reject: '/order/rejectOrder', //确定价订单拒绝(包含卖家拒绝销售,买家拒绝采购)
  confirm_order: '/order/confirmOrder', //确定价订单确认(包含卖家确认销售,买家确认采购)
  reject_Pricing_order: '/order/rejectUnconfirmedPricingOrder', //点价拒单
  confirmed_Pricing_order: '/order/confirmPricingOrder', //点价订单确认
  statement_of_account: '/order/completedPricingOrder', //点价结单
  transaction_pricing_order: '/order/transactionPricingOrder', //订单成交
  cancel_pricing_order: '/order/cancelPricingOrder' ,//点价取消
  examine_cancel_pricing_order: '/order/examineCancelPricingOrder', //撤销点价订单
  query_contract: '/v1.2.5/purSalesContract/queryContract' ,//合同列表
  contract_detail: '/v1.2.5/purSalesContract/contractDetail',//合同详情
  related_order_list: '/v1.2.5/purSalesContract/relatedOrderList',//获取合同关联订单列表      
  approve_quotal: '/quota/approveQuota', //额度审核
  user_company_examine: '/userCompany/examine', //员工审批
  query_modify_quota: '/quota/queryModifyQuota', //获取额度申请消息
  edit_quota: '/quota/editApproveQuota', //编辑额度
  update_product_stock: '/v1.2/product/updateProductStock', //修改商品库存
  company_suppliers_query: '/company/querySuppliers', //供应商列表
  company_query_customers: '/company/queryCustomers', //企业查询客户列表
  edit_pending_pricing: '/order/editPendingOrdersPricing', //点价修改
  edit_Order_Product: '/order/editOrderProduct', //修改商品
  warehouse_save: '/productWarehouse/save', //新增仓库
  follow_up_category_list: '/businessFollowUp/categoryList', //获取品种列表
  integral_exchange_list: '/integral/integralExchangeList', //获取积分兑换
  integral_detail: '/integral/detail', //用户积分明细
  integral_order_list: '/integral/integralOrderList', //用户积分订单列表
  get_address_list: '/invoice/getAddressData',//获取省市区列表
  integral_exchange: '/integral/integralExchange',//积分兑换
  verify_floatingPrice: '/v1.2/product/verifyFloatingPrice',//验证升贴水
  pending_order_number: '/v1.2/product/pendingOrdersNumber',//获取未成交订单数
  update_product_floatingPrice: '/v1.2/product/updateProductFloatingPrice',//验证升贴水
  confirm_update_floatingPrice: '/v1.2/product/confirmUpdateFloatingPrice',//确定修改升贴水
  upload_picture: '/v1.0/uploadPicture/wxUpload',//上传图片

  // push_orderPush: '/push/orderPush',//模板推送 
  push_orderPush: '/mini/push/orderPush',//模板推送 (推送模板消息接口变更2019-6-14修改)

  // push_savaFormId: '/push/savaFormId',//formid池
  push_savaFormId: '/user/savaFormId',//formid池（收集formID接口变更2019-6-14修改）
  check_BeforeSend_Order:'/order/checkBeforeSendOrder',

}

export default api;