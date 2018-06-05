let bsurl = 'http://localhost:8080/elearning/audio/list'
Page({
    data: {
        tracks: [],
    },
    onLoad: function (options) {
        var that = this
        wx.showToast({
          title: '加载中',
          icon: 'loading',
          duration: 1500
        })
        console.log(bsurl + options.id)
        wx.request({
            url: bsurl,
            success: function (res) {
              wx.hideToast()
              that.setData({
                  tracks: res.data
              })
            }
        })
        wx.setNavigationBarTitle({
          title: options.title
        })
    },
    itemClick: function(event) {
        var p = event.currentTarget.id
        var that = this
        var pages = getCurrentPages()

        if(pages.length > 1) {
            //上一个页面实例对象
            var prePage = pages[pages.length - 2]
            prePage.changeData(this.data.tracks, p, 1)
            wx.navigateBack({
                url: '../home/index?currentTab=1'
            })
        }

    }
})
