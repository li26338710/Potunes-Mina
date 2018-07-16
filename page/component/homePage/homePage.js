// pages/homePage/homePage.js
const app = getApp()
import api from '../../api/API.js'

Page({
  data:{
    headTitle:["推荐","歌手","排行","歌单","电台","MV"],//头部标题
    head_choseIndex:0,//头部标题选项
    scrol_picData:[],  //轮播图数据
    songHot:[],//热门歌单
    songRec:[],//歌曲推荐
    radioRc:[],//电台节目
    singerList:[],//歌手列表
    singerType:["华语男歌手","华语女歌手","华语组合","欧美男歌手","欧美女歌手","欧美组合","韩国男歌手","韩国女歌手","韩国组合","日本男歌手","日本女歌手","日本组合"],
    sortList:[],//排行榜
    gedanList:[],//歌单
    chanelList:[],//电台
    mvList:[]//mv

  },
  onLoad:function(){
       this.requestZero()
  },
  head_action:function (e) {
    var dataset = e.currentTarget.dataset
    var self = this
    self.setData({
        head_choseIndex:dataset.id
    })
  },
  requestZero:function () {
    var self = this
    //轮播图
    app.requestData(api.home + 'baidu.ting.plaza.getFocusPic' + '&num=6',{},(err,data) => {
        self.setData({
          scrol_picData:data.pic
        })
    })
    //歌曲推荐
    app.requestData(api.home + 'baidu.ting.song.getEditorRecommend',{},(err,data) => {
        self.setData({
          songRec:data.content[0].song_list
        })
    })  
  },
  selectMode: function (e) {
    var dataset = e.currentTarget.dataset
    wx.navigateTo({
      
      url: '../modeChange/index?id=' + dataset.id + '&index=' + dataset.songindex
    })
  }

})