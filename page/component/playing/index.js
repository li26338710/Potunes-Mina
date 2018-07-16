//获取应用实例
let app = getApp()
let bsurl = app.globalData.apiurl + '/elearning/audio/getMusicInfo'
 
var common = require('../../../utils/util.js');

let seek = 0
let defaultdata = {
  winWidth: 0,
  winHeight: 0,
  listHeight: 0,
  tracks: [],
  // 播放列表
  playlists: [],
  coverImgUrl: "http://lastshrek.b0.upaiyun.com/icon.jpg",
  nowPlayingTitle:"请选择歌曲",
  nowPlayingArtist: "",
  playing:false,
  playtime: '00:00',
  duration: '00:00',
  percent: 1,
  lrc: [],
  lrcindex: 0,
  showlrc: false,
  disable: false,
  downloadPercent: 0,
  curIndex: 0,
  initial: true,
  shuffle: 1,
  music:{},

  animationData: {},
  pop: false,
  scroll: false,
  currentTab: 0,
  recording:0, // 0 : Stop ,1:recording ,2:pausing

  id:0,
  mode:0,
  index:0
}

Page({
  data: defaultdata,
  onLoad: function(options) {
    var that = this
    that.setData({
      mode: options.mode,
      id: options.id,
      index: options.index,
    })

    wx.request({
      url: bsurl + "/" + options.id + "/" + options.mode + "?openid=" + app.globalData.userInfo.openId,
      success: function (res) {
        res.data.forEach(function(playlist) {
          playlists.push(playlist)
        })
        playlists.push(res.data)
        that.setData({
          listHeight: res.data.length * 230,
          playlists: playlists,
          loadingHide:true,
          curIndex:0,
          initial:true
        })
      }
    })
    //获取系统信息
    wx.getSystemInfo( {
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        })
      }
    })
    //监听停止,自动下一首
    wx.onBackgroundAudioStop(function () {
      that.playnext();
    })
    //that.playingtoggle();
  },
  bindChange: function(e) {
    var that = this
    that.setData( { currentTab: e.detail.current })
  },
  onGotUserInfo: function (e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
  },
  swichNav: function(e) {
    var that = this;
    if( this.data.currentTab === e.target.dataset.current ) {
      return false;
    } else {
      that.setData( {
        currentTab: e.target.dataset.current
      })
    }
  },
  // 跳转下一页
  tracks: function(event) {
    var index = event.currentTarget.id
    var playlist = this.data.playlists[index]
    var p = playlist.idCategory
    var title = playlist.title
    wx.navigateTo({
        url: '../testtracks/index?id=' + p + '&title=' + title
    })
  },
  // 接收点击数据
  changeData: function(tracks, index, tab) {
    var curMusic = tracks[index]
    this.setData({
      curIndex: index,
      tracks: tracks,
      coverImgUrl:curMusic.aCover,
      nowPlayingArtist: curMusic.cName,
      nowPlayingTitle: curMusic.aName,
      playing: true,
      music: curMusic,
      lrc: [],
      lrcindex: 0
    })
    app.globalData.curplay.id = curMusic.id
    //存储当前播放
    wx.setStorageSync("curIndex", index)
    wx.setStorageSync("tracks", tracks)
    app.seekmusic(1)
    // if (!this.data.initial) {
    //   this.onRecorderPause();
    // }
    
    if (this.data.showlrc) {
      common.loadlrc(this)
    }
  },
  //播放方法
  playingtoggle:function() {
    var that = this
    if (this.data.initial) {
      this.changeData(this.data.tracks, this.data.curIndex)
      this.setData({
        initial: false
      })
      wx.showToast({
        title: '开始播放',
        icon: 'success',
        duration: 2000
      })
      return
    }
    // if (this.data.recording==1) {
    //   this.onRecorderPause();
    // }
    if (this.data.playing) {
      that.setData({
        playing: false,
      })
      app.stopmusic(1)
      wx.showToast({
        title: '暂停播放',
        icon: 'success',
        duration: 2000
      })
    } else {
      app.seekmusic(1, function () {
        wx.showToast({
          title: '继续播放',
          icon: 'success',
          duration: 2000
        })
        that.setData({
          playing: true,
        })
      }, app.globalData.currentPosition)
    }
  },
  playnext: function (e) {
    
    let shuffle = this.data.shuffle
    let count = this.data.tracks.length
    let lastIndex = parseInt(this.data.curIndex)

    if (lastIndex == count - 1) {
      lastIndex = 0
    } else {
      lastIndex = lastIndex + 1
    }

    this.changeData(this.data.playlists, lastIndex)
    if (this.data.initial) {
      this.setData({
        initial: false
      })
    }
  },
  playprev: function (e) {
    
    let shuffle = this.data.shuffle
    let lastIndex = parseInt(this.data.curIndex)
    let count = this.data.tracks.length
    if (shuffle == 3) {
      //随机播放
      lastIndex = Math.floor(Math.random() * count)
    } else if (shuffle == 1) {
      if (lastIndex == 0) {
        lastIndex = count - 1
      } else {
        lastIndex = lastIndex - 1
      }
    }
    this.changeData(this.data.tracks, lastIndex)
    if (this.data.initial) {
      this.setData({
        initial: false
      })
    }
  },
  playFF: function () {
    app.playFF();
    this.onRecorderPause();
  },
  playFB: function () {
    app.playFB();
    this.onRecorderPause();
  },

  playshuffle: function() {
    if (this.data.shuffle == 1) {
      this.setData({
        shuffle: 2
      })
      return
    }
    if (this.data.shuffle == 2) {
      this.setData({
        shuffle: 3
      })
      return
    }
    if (this.data.shuffle == 3) {
      this.setData({
        shuffle: 1
      })
    }
  },
  musicinfo: function() {
    let pop = this.data.pop
    var animation = wx.createAnimation({
      duration: 100,
    })
    this.animation = animation
    this.setData({
      animationData:animation.export()
    })
    if (!pop) {
      // 创建动画
      this.animation.translate(0, -this.data.winHeight + 31).step()

    } else {
      this.animation.translate(0, this.data.winHeight - 81).step()
    }
    this.setData({
      animationData: this.animation.export(),
      pop: !pop
    })
  },
  // 点击播放列表
  itemClick: function(event) {
    var p = event.currentTarget.id
    this.changeData(this.data.tracks, p)
    this.musicinfo()
  },
  // 加载歌词
  loadlrc: function(event) {
    if (this.data.showlrc == false) {
      this.setData({
        showlrc: true
      })
      common.loadlrc(this);
    } else {
      this.setData({
        showlrc: false
      })
    }
  },
  onShow: function (options) {
    var that = this
    app.globalData.playtype = 1;
    common.playAlrc(that, app);
    seek = setInterval(function () {
      common.playAlrc(that, app);
    }, 1000)
  },
  onUnload: function () {
    clearInterval(seek)
  },
  onHide: function () {
    clearInterval(seek)
  },

  onRecorderStart: function () {
    app.stopmusic();
    app.recorderStart();
    this.setData({
    	recording:1
    })
  },
  // 暂停录音
  onRecorderPause: function () {
    app.recorderPause();
    this.setData({
    	recording:2
    })
  },
  // 继续录音
  onRecorderResume: function () {
    app.stopmusic();
    app.recorderResume();
    this.setData({
    	recording:1
    })
  },
  // 停止录音
  onRecorderStop: function () {
    app.recorderStop();
    this.setData({
    	recording:3
    })
  },
  // 播放声音
  onRecorderPlay: function () {

    innerAudioContext.autoplay = true
    innerAudioContext.src = this.tempFilePath,
      innerAudioContext.onPlay(() => {
        console.log('开始播放')
      })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })

  },
  onRecorderUpload: function () {
    
    this.setData({
      recording: 0
    });
    var urls = app.globalData.apiurl + "/elearning/recorder/upload";
    console.log(app.globalData.recorderTempFilePath);
    wx.uploadFile({
      url: urls,
      filePath: app.globalData.recorderTempFilePath,
      name: 'file',
      formData: {
        'openId': encodeURI(app.globalData.userInfo.openId),
          'nickname':  encodeURI(app.globalData.personInfo.nickName),
            'province': encodeURI(app.globalData.personInfo.province),
              'city': encodeURI(app.globalData.personInfo.city),
                'gender': encodeURI(app.globalData.personInfo.gender)
      },
      // header: {
      //   'content-type': 'multipart/form-data'
      // },
      success: function (res) {
        var str = res.data;
        wx.showToast({
          title: '录音上传成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: function (res) {
        console.log(res);
        wx.showModal({
          title: '提示',
          content: "网络请求失败，请确保网络是否正常",
          showCancel: false,
          success: function (res) {

          }
        });
        wx.hideToast();
      }
    });
  }
}) 
