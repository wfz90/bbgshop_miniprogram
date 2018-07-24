// pages/ucenter/distribution/distribution.js
var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    add_local_time: '0000/00/00',
    auth:false,
    is_apply: 0,
    distributionInfo: [],
    disgoods: [],
    discatch: [],
    show_mask: false,
    inputMobile: '',
    inputcode: '',
    truesode: '',
    second: 45,
    truesode: 0,
    cancatch: false,
    codeloading: false,
    codedisabled: false,
    checkdisabled: true,
    sendcodetext: " 获取验证码 ",
    changeisabled: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onloadaction()
  },
  onloadaction() {
    let that = this
    wx.showLoading({
      title: '检测中...',
      mask: true,
    })
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              console.log(res.userInfo)
              that.setData({
                auth: true,
                userInfo: res.userInfo
              })
              that.finddistribinfo()
              wx.hideLoading()
            }
          })
        } else {
          that.setData({
            auth: false,
          })
          wx.hideLoading()
        }
      }
    })
  },
  // refundcatch(e) {
  //   console.log(e)
  //   let id = e.currentTarget.dataset.id
  //   wx.showModal({
  //     title: '提示',
  //     content: '是否撤回此条申请记录 ？',
  //     success: function (res) {
  //       if (res.confirm) {
  //         // console.log('用户点击确定')

  //       } else if (res.cancel) {
  //         // console.log('用户点击取消')
  //       }
  //     }
  //   })
  // },
  tocatch() {
    // console.log('9987897987')
    wx.navigateTo({
      url: '/pages/ucenter/distribution_catch/distribution_catch',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  seerule() {
    console.log('123456798')
  },
  finddistribinfo() {
    let that = this
    util.request(api.FindDistributionInfo,{

    },'POST').then(res => {
      console.log(res)
      if(res.errno === 17){
        that.setData({
          is_apply: 1
        })
      } else if (res.errno === 503){
        that.setData({
          is_apply: 0,
          distributionInfo: res.errmsg.disdata,
          disgoods: res.errmsg.disgoods.reverse(),
          discatch: res.errmsg.discatch.reverse(),
        })
        that.setaddTime()
      } else if (res.errno === 99) {
        that.setData({
          is_apply: 2,
          // distributionInfo: res.errmsg[0]
        })
      }
    })
  },
  setaddTime() {
    let that = this
    let time = util.timestampToTime(that.data.distributionInfo[0].add_time)
    for (let i = 0; i < that.data.disgoods.length; i++){
      var list = that.data.disgoods[i]
      list.add_localtime = util.timestampToTime(list.add_time)
      // console.log(that.data.disgoods[i].add_localtime)
    }
    that.data.distributionInfo[0].localrate = Number(that.data.distributionInfo[0].rate * 100).toFixed(2)
    that.data.distributionInfo[0].localprice = Number(that.data.distributionInfo[0].price * 1).toFixed(2)
    if (Number(that.data.distributionInfo[0].localprice) > Number(that.data.distributionInfo[0].can_withdraw_cash)){
      that.setData({
        cancatch: false
      })
    }else {
      that.setData({
        cancatch: true
      })
    }
    for( let j = 0;j < that.data.discatch.length; j++){
      var listt = that.data.discatch[j]
      listt.add_localtime = util.timestampToTime(list.add_time)
    } 
    that.setData({
      add_local_time: time,
      distributionInfo: that.data.distributionInfo,
      disgoods: that.data.disgoods,
      discatch: that.data.discatch
    })


  },
  phoneinput(e) {
    // console.log(e.detail.value)
    this.setData({
      inputMobile: e.detail.value
    })
  },
  codeinput(e) {
    // console.log(e.detail.value)
    this.setData({
      inputcode: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },
  hide_model() {
    this.setData({
      show_mask:false
    })
  },
  becomedistribution() {
    let that = this
    that.setData({
      show_mask: true
    })
    // util.request(api.SetDistriUser, {}, 'POST').then(res => {
    //   console.log(res)
    //   that.finddistribinfo()
    // })
  },
  getcode() {
    var that = this
    if (this.data.inputMobile == "") {
      wx.showToast({
        title: '请先输入手机号 ！',
        icon: 'none',
        duration: 1000,
        mask: true,
      })
      // return false;
    } else {
      util.request(api.BingPhoneText, {
        Phone: that.data.inputMobile
      }, 'POST').then(function (res) {
        console.log(res)
        if (res.errno === 1001) {
          wx.showToast({
            title: '手机号格式错误 ！',
            icon: 'none',
            duration: 1000,
            mask: true,
          })
        }
        else {
          //验证手机号
          //发送验证码
          util.request(api.SedSode, {
            phone: that.data.inputMobile
          }, 'POST').then(function (res) {
            console.log(res)
            wx.showToast({
              title: '短信已发送 ！',
              icon: 'none',
              duration: 2000
            })
            console.log(res.data.num)
            that.setData({
              truesode: res.data.num
            })
          })
          //按钮倒计时
          var second = that.data.second;
          that.setData({
            sendcodetext: second + '秒',
            codedisabled: true,
            codeloading: true,
            checkdisabled: false,
          })
          const timer = setInterval(() => {
            second--;
            if (second) {
              that.setData({
                sendcodetext: second + '秒',
                codedisabled: true,
                codeloading: true,
              })
            } else {
              clearInterval(timer);
              that.setData({
                sendcodetext: ' 获取验证码 ',
                codedisabled: false,
                codeloading: false,
              })
            }
          }, 1000);
        }
      })
    }
  },
  checked: function () {
    var that = this
    console.log(that.data.truesode)
    if (that.data.inputcode == '') {
      wx.showToast({
        title: '您没有输入验证码 ！',
        icon: 'none',
        duration: 2000
      })
    } else {
      //验证手机号
      // util.request(api.CheckSode,{
      //   phone: that.data.inputMobile,
      //   code: that.data.inputcode,
      // }, 'POST').then(function (res){
      //   console.log(res)
      try {
        var value = wx.getStorageSync('userInfo')
        if (value) {
          // Do something with return value
          if (that.data.truesode !== that.data.inputcode) {
            util.showErrorToast('验证码错误 ！');
          } else {
            console.log(that.data.inputMobile)
            util.request(api.BingPhoneBing, {
              bingphone: that.data.inputMobile,
              userid: value.id
            }, 'POST').then(function (res) {
              console.log(res)
              if (res.errno == 0) {
                setTimeout(() => {
                  util.request(api.ApplyDistribution, {
                    phone: that.data.inputMobile,
                    userid: value.id
                  }, 'POST').then(ress => {
                    console.log(ress)
                    that.finddistribinfo()
                    that.hide_model()
                  })
                  util.request(api.BingPhoneFind).then(function (resd) {
                    console.log(resd)
                    that.setData({
                      userinfo: resd.data.Result
                    })
                  });
                }, 1000)
                wx.showToast({
                  title: '分销员申请已提交 ！',
                  icon: 'none',
                  duration: 2000
                })

              }
            })
          }
        }
      } catch (e) {
        // Do something when catch error
      }
      
      // })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onloadaction()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})