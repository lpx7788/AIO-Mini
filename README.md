
# AIO-Mini
> A mini program project for AIO

## 介绍

  聚点商城小程序1.
  
  设计图稿：
  ![image](https://github.com/lpx7788/AIO-Mini/blob/master/images/page1.png)(https://github.com/lpx7788/AIO-Mini/blob/master/images/page2.png)(https://github.com/lpx7788/AIO-Mini/blob/master/images/page3.png)

### 说明

　　#小程序1.0版本 

    项目git地址: http://112.74.42.194:8099/ZhongKa/AIO-Mini.git  

    项目原型地址： http://192.168.0.232:8003  

    项目showdoc文档地址： https://www.showdoc.cc/ZKAIO?page_id=1781905476867847  


### 相关技术：

   	小程序原生组件；wx.getStorageSync('')存储登录信息； wx.connectSocket（{}）通信获取行情信息；

    flex 布局  

### 微信小程序官方文档地址

  	小程序官方文档： https://developers.weixin.qq.com/miniprogram/dev/component/  

    小程序开发指南：https://developers.weixin.qq.com/ebook?action=get_post_info&docid=0008aeea9a8978ab0086a685851c0a  

    小程序开发规范文档：https://shimo.im/docs/EZKacqyM018gmopv/read  

    小程序社区: https://developers.weixin.qq.com/community/develop/question  
  


### 公共方法的使用

   token: wx.getStorageSync('token') 登录信息的获取  

  ajax请求调用: util.post(api.get_message_url, {}, res => {}, {}, fail => {})  


###时间过滤器的使用：

   <wxs module="dateUtil" src="../../../wxs/formatTime.wxs"></wxs>  

   {{dateUtil.dateFormat('1537578367970','yyyy-MM-dd hh:mm:ss ')}}  


### 项目目录结构
 

├── .gitignore //忽略提交文件  
├── README.md  //md文件  
├── .gitignore //忽略提交文件    
├── README.md  //md文件    
├── app.js  
├── app.json  
├── app.wxss  
├── components //公共模块  
│   ├── areaPicker //地区列表（华南，华东）  
│   ├── category //品种  
│   ├── filtrate //筛选  
│   ├── offerDetails //点价模块  
│   │   ├── delayMidpoints //延期点价  
│   │   ├── index //点价详情  
│   │   ├── limit //申请额度  
│   │   └── placeOrder //点价页面  
│   ├── pageTit //页面内特殊标题  
│   ├── popUps //自定义弹窗  
│   ├── region //地区选择  
│   ├── search //搜索组件  
│   │   ├── index  
│   │   ├── orderResult //订单搜索  
│   │   └── searchResult //首页搜索  
│   ├── timePicker //自定义时间组件  
│   └── userSelect //用户自选页面  
├── images //图片
├── pages  //普通页面模块  
│   ├── home //首页  
│   │       └── index.wxss  
│   ├── mine //我的  
│   │   ├── aboutUs //关于我们  
│   │   ├── changeCompany //更换公司  
│   │   ├── changePW //更改密码  
│   │   ├── changePhoneNum //更改电话号码  
│   │   ├── companyCertification //公司认证  
│   │   ├── identity //身份认证  
│   │   ├── index //首页（我的）  
│   │   ├── integral //积分列表页  
│   │   ├── integralDescription //积分明细  
│   │   ├── integralDetails //积分详情  
│   │   ├── integralExchange //积分兑换  
│   │   ├── integralOrder //积分订单  
│   │   ├── privacy //用户注册协议  
│   │   ├── qrcode //公众号二维码页面  
│   │   ├── set //我的设置页面  
│   │   ├── setPW //设置密码  
│   │   ├── toAPP //跳转app页面  
│   │   └── webView //内嵌网页  
│   └── workBench //工作台  
│       ├── FollowUpNew //新增业务跟进  
│       ├── askToBuy //我的求购  
│       ├── buying //发布求购页  
│       ├── company //供应商列表页  
│       ├── contract //合同列表页  
│       ├── contractDetail //合同详情  
│       ├── employeeDetails //员工详情  
│       ├── index //我的工作台首页  
│       ├── inventory //调整库存  
│       ├── modifyGoods //修改商品  
│       ├── order //订单  
│       ├── orderDetail //订单详情  
│       ├── orderMessage //订单消息  
│       ├── orderRecord  //订单记录  
│       ├── staffManagement //员工申请、员工管理  
│       └── warehouse //仓库补充页面  
├── project.config.json //项目配置文件  
├── utils  
│   ├── api.js //接口地址文件  
