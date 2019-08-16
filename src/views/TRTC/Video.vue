<template>
    <div class="videoContainer" v-loading="pageLoading">
      <div class="video_info">
        <div class="video_title"><img src="../../assets/av/av_title_logo.png" class="title_png" />平安面对面</div>
        <div class="videoCall_info">
          <p>当前人数： <span>{{joinedCustomer.length+1}}</span></p>
          <p>通话时长： <span>{{duration}}</span></p>
        </div>
        <div class="video_user">
          <div class="channel_host" v-if="host != null">
            <img :src="host.img"  class='video_portrait'>
            <div class="video_customer_name">
              <p>{{host.post}}</p>
              <p>{{host.name}}</p>
            </div>
            <img src="../../assets/av/kick_out.png" class="kick_out" v-if='false'>
          </div>
          <!-- -----------------------async add customer  start------------------>
          <div class="channel_host" v-for="item of joinedCustomer" :key="item.id">
              <img :src="item.img"  class='video_portrait'>
              <div class="video_customer_name">
                <p>{{item.post}}</p>
                <p>{{item.name}}</p>
              </div>
              <img src="../../assets/av/kick_out.png" class="kick_out" title="kick out!!"  @click="kickOut(item.stream)">
          </div>
          <!--  -----------------------async add customer  end- --------------------------->
        </div>
        <div class="video_leave">
            <div class="video_hang_up" @click="leave"></div>
        </div>
      </div>
      <div class="video_view_handle">
        <div class="video_view" id="video_view">
          <div :class="{video_host:true, is_active:isScreen}" id="video_host"></div>
          <!-------------------------- async add video_customer  start --------------------->
          <div :class="{video_customer:true, is_active:isScreen}" id='video_customer' v-for="item in joinedCustomer" :key="item.id" ></div>
          <!-------------------------- async add video_customer   end--------------------->
          <div class="video_customer" id='video_customer' v-if="joinedCustomer.length == 0 && isScreen == false" >
            <div class="video_standby" >
                <img src="../../assets/av/touxiang.png"  class="video_standby_host video_standby_portrait">
                <img src="../../assets/av/connecting.png" >
                <img src="../../assets/av/touxiang.png"  class="video_standby_customer video_standby_portrait">
               <div class="video_standby_info"> 等待客户进入房间....</div>
            </div>
          </div>
        </div>
        <div class="video_mute_screen">
          <div :class="{video_mute:true,is_active:isMute}" @click="handleMute"></div>
          <div :class="{video_screen:true,is_active:isScreen}" @click="handleScreen"></div>
        </div>
      </div>
    </div>
  </template>
  <style scoped>  
    /* container  start */
    .videoContainer{
      width: 100%;
      height: 100%;
      /* min-width: 900px; */
      display: flex;
      /* min-height: 500px; */
    }
    .video_info{
      display: flex;
      flex-direction: column;
      background: #2E3036;
      color: white;
      width: 240px;
    }
    .video_view_handle{
      flex:1;
    }
    /* container   end */

  /* title start  */
    .video_title{
      background: #ffa655;
      color: white;
      font-size: 18px;
      height: 50px;
    }
    .title_png{
      vertical-align: middle;
      margin: 0 10px 0 20px;
    }
    .video_title:after{
      content: "";
      width: 0;
      display: inline-block;
      height: 100%;
      vertical-align: middle;
    }
    /* title end  */

    /* info   start */
  .videoCall_info{
    color: white;
    font-size: 12px;
    height: 80px;
    /* padding: 10px 0 0 20px; */
    /* box-sizing: border-box; */
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 20px;
  }
  .videoCall_info p {
    margin: 0;
    padding: 0;
    margin-bottom: 8px;
  }
  /* info   end */

  /* video_user  start */
  .video_user{
    flex: 1;
  }
  .channel_host{
    height: 80px;
    position: relative;
  }
  .channel_host:after{
    content: '';
    width: 0;
    height: 100%;
    vertical-align: middle;
    display: inline-block;
  }
  .video_customer_name{
    display: inline-block;
    font-size: 12px;
    vertical-align: middle;
  }
  .video_customer_name p {
    margin:0;
    padding: 0;
    margin-bottom: 4px;
  }
  .video_portrait{
    width: 50px;
    height: 50px;
    border-radius: 50%;
    vertical-align: middle;
    margin-left: 20px;
    margin-right: 15px;
  }
  .kick_out{
    width: 18px;
    height:18px;
    position: absolute;
    top: 50%;
    right: 30px;
    transform: translateY(-50%);
    cursor: pointer;
  }
  /* video_user   end */


  /* video_leave    start*/
  .video_leave{
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .video_hang_up{
    width: 80px;
    height: 30px;
    background: #ff6f6f url(../../assets/av/hang_up.png) no-repeat center center;
    border-radius: 30px;
    cursor: pointer;
  }

  /* video_leave   end */



  /* video_view_handle   start */

  .video_view_handle{
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .video_view{
    flex: 1;
    position: relative;
  }
  .video_view>div{
    float: left;
  }
  .video_host{
    width: 50%;
    height: 100%;
    background: #3A3D44;
  }
  .video_customer{
    width: 50%;
    height: 100%;
    background: #3A3D44;
    position: relative;
  }

  /* video_standby   start */
  .video_standby{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%,-50%,0);
    color: white;
  }
  .video_standby .video_standby_portrait{
    width: 60px;
    height: 60px;
    border-radius: 50%;
    position: absolute;
  }
  .video_standby_host{
    top: 0;
    left: 0;
  }
  .video_standby_customer{
    top: 120px;
    right: 0;
  }
  .video_standby_info{
    height: 20px;
    margin-top: 50px;
  }

  /* video_standby   send */

  .video_host.is_active{
    width: 150px;
    height: 200px;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 9999999;
  }
  .video_customer.is_active{
    width:150px;
    height: 200px;
    position: absolute;
    right: 0;
    top: 200px;
    z-index: 9999999;
  }
  .video_mute_screen{
    height: 80px;
    background: #2E3036;
    position: relative;
  }
  .video_mute_screen>div{
    width: 80px;
    height:30px;
    border-radius: 30px;
    cursor: pointer;
    position: absolute;
    top: 50%;
    transform: translateY(-50%)
  }
  .video_mute{
    background: white url(../../assets/av/close_MIC.png) no-repeat center center;
    left: 30%;
  }
  .video_screen{
    background: white url(../../assets/av/screen_share.png) no-repeat center center;
    right: 30%;
  }
  .video_screen.is_active{
    background: #ffa655 url(../../assets/av/screen_share_w.png) no-repeat center center;
  }
  .video_mute.is_active{
    background: #ffa655 url(../../assets/av/open_MIC.png) no-repeat center center;
  }

  /* video_view_handle   end */

</style>
<style>
 
  .agora_remote_video_screen{
    width:100%;
    height:100%;
  }
  .agora_remote_video_customer{
    width:100%;
    height:100%;
  }
 
</style>
  
  <script>
  import AgoraRTC from "agora-rtc-sdk";
  // import { formatSecond } from "@/utils/formatData.js";
  // import $ from "jquery";
  // import { WeChat } from "@/plugins/mixin";

  export default {
    name:'screenAndVideo',
    // mixins: [WeChat],
    data(){return{
      AgoraRTCId:'b3b9781a3a774856960b9f4a73ff029e',
      token:undefined,
      channel:'123456',
      videoProfile:'720p_5',
      screenProfile:'720p_1',
      uid:undefined,

      timerStats:null,   //timer  for userCount and duration

      client:null,
      localStreams:[],  // local stream id
      host:null,
      localStream:null,
      screenStream:null,
      screenClient:null,

      joinedCustomer:[],  // remote stream and user info
    

      duration:'00:00',
      userCount:0,
      joined:false,  // just two people

      isMute:false,
      isScreen:false,
      disableMute:false,
      disableScreen:false,
      disableLeave:true,
      pageLoading:false,
     
    }},
    created(){},
    methods:{
      handleMute(){
        if(this.disableMute)return false
        this.disableMute = true
        this.isMute = !this.isMute
        if(!this.localStream) return false
        this.isMute?this.localStream.unmuteAudio():this.localStream.muteAudio() 
        this.disableMute = false
      },
      handleScreen(){
        if(this.disableScreen) return false
        this.disableScreen = true
        this.isScreen?this.closeScreen():this.shareScreen()
      },
      isSupport(){
        return new Promise((resolve,reject)=>{
           resolve(AgoraRTC.checkSystemRequirements())
        })
      },
      addLocalStreamUid(uid){
          if(!this.localStreams.includes(uid)){
            this.localStreams.push(uid)
          }
      },
      join(){
        this.client = AgoraRTC.createClient({mode: 'live', codec: "h264"});
        this.client.startProxyServer();
        this.client.init(this.AgoraRTCId ,  () =>{
            this.client.join(this.token, this.channel,this.uid, (uid) =>{
              this.host = {img:require('../../assets/av/touxiang.png'),post:'客户经理',name:'黄晓明'}
              this.uid = uid
              this.timerStats = setInterval(this.getstats,1000)
              this.addLocalStreamUid(uid)
              this.localStream = AgoraRTC.createStream({
                    streamID: uid,
                    audio: true,
                    video: true,
                    screen: false                
                });
                this.localStream.setVideoProfile(this.videoProfile)
        
                // this.localStream.on("accessAllowed", function() {
                //   console.log("accessAllowed");
                // });
                // this.localStream.on("accessDenied", function() {
                //   console.log("accessDenied");
                // });

                this.localStream.init(() =>{
                  this.pageLoading = false
                  this.localStream.play('video_host');
                  // this.client.enableDualStream(function() {   //因对网络情况较弱的时候
                  //     console.log("Enable dual stream success!")
                  // }, function(err) {
                  //   console,log("Enable dual stream failed" + err)
                  // })
                  this.publish()
                  
                }, function (err) {
                  console.log("getUserMedia failed", err);
                });
            }, function(err) {
              console.log("Join  failed", err);
            });
        }, function (err) {
            console.log(" init failed ", err);
        });
        this.subscribe()
      },
      subscribe(){   //   just for subscribe
        let channel = this.channel
        this.client.on('error', function(err) {
          console.log("Got error msg:", err.reason);
          if (err.reason === 'DYNAMIC_KEY_TIMEOUT') {
            currentClient.renewChannelKey(channel, function(){  //跟新token
              console.log("Renew channel key successfully");
            }, function(err){
              console.log("Renew channel key failed: ", err);
            });
          }
        });
        // subscribe start   remote
        this.client.on('stream-added',  (evt)=> {    //
          var stream = evt.stream;
          let id = stream.getId()
          if(!this.localStreams.includes(id)){
            if(!this.joined){
              this.joined = true
              // currentClient.setStreamFallbackOption(stream, 2); //  策略2 退回视频小流 退回音频
              this.client.subscribe(stream, function (err) {
                console.log("Subscribe stream failed", err);
              });
            }else{
              this.$message.error('暂时只允许一个人加入')
            }
          }
        });
        this.client.on('stream-subscribed', (evt) =>{
          var stream = evt.stream;
          let streamId = stream.getId()
          this.joinedCustomer.push({id:streamId,img:require('../../assets/av/touxiang.png'),post:'客户经理',name:'张三',stream:stream})
          this.$nextTick(()=>{
            $('#video_customer').append('<div  class="agora_remote_video_customer"  id="agora_remote'+streamId +'"></div>');
            stream.play('agora_remote'+streamId)
          })
        });
        this.client.on('stream-removed', function (evt) {   //unpublish。
          var stream = evt.stream;
          let streamId = stream.getId()
          // stream.stop();
          // $('#agora_remote' + streamId).remove();
          console.log("Remote stream is removed " + streamId);
        });
  
        this.client.on('peer-leave',  (evt)=> {  //，即对方调用了 Client.leave。已离开频道
          var stream = evt.stream;
          this.unsubscribe(stream)
          let id = stream.getId()
         
            if($('#agora_remote' + id).length !== 0){
              let index = this.joinedCustomer.findIndex(item=>item.id == id) !== -1 &&  this.joinedCustomer.splice(index,1)
              $('#agora_remote' + id ).remove();
            }
            console.log(evt.uid + " leaved from this channel");
         
        });
        // currentClient.on("stream-type-changed", (evt)=> {
        //   let type = evt.streamType
        //   let id = evt.uid
        //   if(type == 0){
        //     this.$message.info(`${id}  已升为高清视频`)
        //   }else if(type == 1){
        //     this.$message.info(`${id}  已降低视频分辨率`)
        //   }
          
        // });
        // currentClient.on("stream-fallback", (evt)=> {
        //   let type = evt.attr
        //   let id = evt.uid
        //   if(type == 0){
        //     this.$message.info(`${id}  已恢复为音视频流`)
        //   }else if(type == 1){
        //     this.$message.info(`${id}  已从音视频流回退到纯音频流`)
        //   }
        // });
      
      },
      leave(){
        try{
          this.localStream && this.localStreams.splice(this.localStreams.indexOf(this.localStream.getId()),1) 
          this.client && this.client.unpublish(this.localStream)
          this.localStream && this.localStream.close()  //该方法关闭视频流或音频流
          this.client &&  this.client.leave( ()=>{
            console.log("Leavel channel successfully");
          }, function (err) {
            console.log("Leave channel failed");
          });
        }finally{
          clearInterval(this.timerStats)
          this.disableLeave = false
          window.close()
        }
      },
      shareScreen(){ 
        this.screenClient = AgoraRTC.createClient({mode: 'live', codec: "h264"});
        this.screenClient.startProxyServer();
        this.screenClient.init(this.AgoraRTCId , () =>{
            this.screenClient.join(this.token, this.channel,undefined, (uid) =>{
              this.addLocalStreamUid(uid)
                this.screenStream = AgoraRTC.createStream({
                    streamID: uid,
                    audio: false,
                    video: false,
                    screen: true,
                });
                this.screenStream.setScreenProfile(this.screenProfile)
                this.screenStream.on("accessAllowed", function() {
                  console.log("accessAllowed"+new Date().toLocaleTimeString());
                });
  
                // The user has denied access to the camera and mic.
                this.screenStream.on("accessDenied", function() {
                  console.log("accessDenied"+new Date().toLocaleTimeString());
                });
  
                this.screenStream.init(() =>{
                  this.disableScreen = false
                  $('#video_view').append('<div class="agora_remote_video_screen" id="agora_remote'+this.screenStream.getId() +'"></div>');
                  this.screenStream.play('agora_remote'+this.screenStream.getId())
                  this.isScreen = true
                  
                
                  // publish start
                  this.screenClient.publish(this.screenStream, function (err) {
                    console.log("Publish local stream error: ");
                  })
                  this.screenClient.on('stream-published', (evt)=>{
                    console.log("Publish local stream successfully");
                  });
                    // publish end 
  
                }, function (err) {
                  console.log("getUserMedia failed", err);
                });
                
          
            }, function(err) {
              console.log("Join  failed", err);
            });
  
        }, function (err) {
            console.log(" init failed ", err);
        });
      },
      closeScreen(){
        try{
          this.screenStream && this.localStreams.splice(this.localStreams.indexOf(this.screenStream.getId()),1)
          // this.screenClient && this.screenClient.unpublish(this.screenStream)
          // this.screenStream && this.screenStream.close()
          // this.screenStream.stop()
          this.screenClient && this.screenClient.leave( ()=> {
            console.log("Leavel channel successfully");
            this.isScreen = false
          }, function (err) {
            console.log("Leave channel failed");
          });
        }finally{
          this.screenStream = null;
          this.screenClient = null;
          this.disableScreen = false
        }
      },
      bw() {
        const UserAgent = navigator.userAgent.toLowerCase();
        return {
          isUc: /ucweb/.test(UserAgent), // UC浏览器
          isChrome: /chrome/.test(UserAgent), // Chrome浏览器
          isFirefox: /firefox/.test(UserAgent), // 火狐浏览器
          isOpera: /opera/.test(UserAgent), // Opera浏览器
          isSafire: /safari/.test(UserAgent) && !/chrome/.test(UserAgent), // safire浏览器
          is360: /360se/.test(UserAgent), // 360浏览器
          isBaidu: /bidubrowser/.test(UserAgent), // 百度浏览器
          isSougou: /metasr/.test(UserAgent), // 搜狗浏览器
          isIE6: /msie 6.0/.test(UserAgent), // IE6
          isIE7: /msie 7.0/.test(UserAgent), // IE7
          isIE8: /msie 8.0/.test(UserAgent), // IE8
          isIE9: /msie 9.0/.test(UserAgent), // IE9
          isIE10: /msie 10.0/.test(UserAgent), // IE10
          isIE11: /msie 11.0/.test(UserAgent), // IE11
          isLB: /lbbrowser/.test(UserAgent), // 猎豹浏览器
          isWX: /micromessenger/.test(UserAgent), // 微信内置浏览器
          isQQ: /qqbrowser/.test(UserAgent) // QQ浏览器
        }
      },
      getstats(){
        this.client && this.client.getSessionStats((data)=>{
          this.duration = data.Duration
          this.isScreen ?this.userCount = data.UserCount - 1:this.userCount = data.UserCount
          console.log(this.userCount,'------当前人数-------')
        })
      },
      kickOut(stream){
        this.joinedCustomer.splice(this.joinedCustomer.findIndex(item=>item.id == stream.getId()),1)
        this.unsubscribe(stream)
        this.joined = false
      },
      goOut(){
        window.onbeforeunload = (e)=>{
          if(this.$route.path === '/video' && this.disableLeave){
            e.returnValue = false
            return '刷新或者关闭浏览器，将会导致音视频中断，确认是否刷新或者关闭' 
          }
        }
      },
      publish(){
        this.client.publish(this.localStream, function (err) {
          console.log("Publish local stream error: ");
        })
        this.client.on('stream-published', (evt)=>{
          console.log("Publish local stream successfully");
        });
      },
      unsubscribe(stream){
        this.client.unsubscribe(stream, function(err) {
          console.log('unsubscribe failed' +  err);
        })
      },
      checkSource(){  
        AgoraRTC.getDevices(devices=>{
          let audioinput = devices.some(item=>item.kind === "audioinput")
          let videoinput =  devices.some(item=>item.kind === "videoinput")
          let audiooutput =  devices.some(item=>item.kind === "audiooutput")
          audiooutput || this.$message.error('没有音频输出')
          audioinput || this.$message.error('没有音频输入')
          videoinput || this.$message.error('没有视频输入')
          audioinput &&  videoinput && this.join()
        },err=>{
          console.log('get devices source error')
        })
      },
      init(){
        this.isSupport().then(res=>{
          res?this.checkSource():this.$message.error('当前环境不支持')
        })
      }
    },
    mounted(){
       this.goOut()
       this.init()
      // new Promise(this.checkToken).finally(()=>{
      // })
    }
  }
  </script>
  