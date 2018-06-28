var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    // text:"这是一个页面"
    navList: [],
    goodsList: [],
    id: 0,
    currentCategory: {},
    scrollLeft: 0,
    scrollTop: 0,
    scrollHeight: 0,
    page: 1,
    frompage: 0,
    size: 10000
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    wx.showLoading({
      title: '获取中...',
      mask: true,
    })
    console.log(options)
    if (options.id) {
      that.setData({
        id: parseInt(options.id),
        frompage: parseInt(options.page)
      });
    }

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight
        });
      }
    });


    this.getCategoryInfo();

  },
  getCategoryInfo: function () {
    let that = this;
    var pages = getCurrentPages();
    var prePageRoute = pages[pages.length - 2].__route__;
    console.log(pages, prePageRoute)
    util.request(api.GoodsCategory, { id: this.data.id })
      .then(function (res) {
          console.log(res)
        if (res.errno == 0) {
          that.setData({
            // navList: res.data.brotherCategory,
            currentCategory: res.data.currentCategory
          });
          if (prePageRoute == 'pages/catalog/catalog'){
            that.setData({
              navList: res.data.brotherCategory,
            });
          } else if (prePageRoute == 'pages/index/index'){
            that.setData({
              navList: res.data.brotherCategory.reverse(),
            });
          }
          //nav位置
          let currentIndex = 0;
          let navListCount = that.data.navList.length;
          for (let i = 0; i < navListCount; i++) {
            currentIndex += 1;
            if (that.data.navList[i].id == that.data.id) {
              break;
            }
          }
          if (currentIndex > navListCount / 2 && navListCount > 5) {
            that.setData({
              scrollLeft: currentIndex * 60
            });
          }
          that.getGoodsList();

        } else {
          //显示错误信息
        }
        
      });
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    console.log(1);
  },
  onHide: function () {
    // 页面隐藏
  },
  getGoodsList: function () {
    var that = this;
    util.request(api.GoodsList, {categoryId: that.data.id, page: that.data.page, size: 500})
      .then(function (res) {
        console.log(res)
        if(res.errno === 0){
          that.setData({
            goodsList: res.data.goodsList,
          });
          wx.hideLoading()
        }else {
          wx.hideLoading()
          wx.showToast({
            title: '异常 ！',
            icon: 'none',
            duration: 2000,
            mask: true,
          })
        }

      });
  },
  onUnload: function () {
    // 页面关闭
  },
  switchCate: function (event) {
    if (this.data.id == event.currentTarget.dataset.id) {
      return false;
    }
    wx.showLoading({
      title: '获取中...',
      mask: true,
    })
    var that = this;
    var clientX = event.detail.x;
    var currentTarget = event.currentTarget;
    if (clientX < 60) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft - 60
      });
    } else if (clientX > 330) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft
      });
    }
    this.setData({
      id: event.currentTarget.dataset.id
    });

    this.getCategoryInfo();
  }
})