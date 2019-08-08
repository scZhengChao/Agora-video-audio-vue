<template>
  <div>
    <div class="news">
      <div class="text">
        <p>当前人数: <span></span></p>
        <p>通话时长: <span></span></p>
        <p>房间号: <input v-model="channel" type='text'/></p>
      </div>
      <div class="handle">
        <el-button type="primary" @click='join' :disabled='joinDisabled'>视频</el-button>
        <el-button type="primary" >语音</el-button>
        <el-button type="primary" @click='shareScreen' :disabled='shareScreenDisabled'>投屏</el-button>
        <el-button type="primary" @click='leave' :disabled='leaveDisabled'>离开频道</el-button>
        <el-button type="primary" @click='closeScreen' :disabled='closeShareScreen'>取消屏幕共享</el-button>
        <el-checkbox v-model="isOpenCamera" @change='handleCamera' class="checked">{{isOpenCamera?"关闭摄像头":"打开摄像头"}}</el-checkbox>
        <el-checkbox v-model="isMute" @change='handleMute' class="checked">{{isMute ?"静音":"开启audio"}}</el-checkbox>
      </div>
    </div>
    <div class="situation">
      <div>视频输入:
        <el-select v-model="videoSource" placeholder="请选择视频设备" @change='switchVideoDevice'>
          <el-option
            v-for="(item,index) in videoinput"
            :key="index"
            :label="item.label"
            :value="item.deviceId">
          </el-option>
        </el-select>
      </div>
      <div >音频输入:
          <el-select v-model="audioSource" placeholder="请选择音频设备" @change='switchAudioDevice'>
            <el-option
              v-for="(item,index) in audioinput"
              :key="index"
              :label="item.label"
              :value="item.deviceId">
            </el-option>
          </el-select>
      </div>
     
      <div>
        选择分辨率:
        <el-select v-model="distinguishability" placeholder="请选择分辨率">
            <el-option
              v-for="(item,index) in distinguishabilityProfile"
              :key="index"
              :label="item.label"
              :value="item.profile">
            </el-option>
          </el-select>
      </div>
    </div>
    <div class="view">
      <div id="user">
      </div>
      <div id="screen"></div>
    </div>
    
  </div>
</template>

<script>
  import AgoraRTC from 'agora-rtc-sdk'
export default {
  name:"TRTC",
  data(){return{
    appId:'b3b9781a3a774856960b9f4a73ff029e', //appId
    audioinput:[],  //音频输入
    videoinput:[],  //视屏输入
    videoSource:'',
    audioSource:'',
    localStreams:[],

    client:null,  //客户端
    localStream:null,
    screenStream:null,
    screenClient:null,


    token:null,
    channel:'1000',
    uid:undefined,

    getSupportCodec:{
      audio:[],
      video:[]
    },
    sendSupportCodec:{
      audio:[],
      video:[]
    },

    isOpenCamera:true,
    joinDisabled:false,
    leaveDisabled:false,
    shareScreenDisabled:false,
    closeShareScreen:false,
    isMute:true,
    isHost:true,

    distinguishability:'720p_5',
    distinguishabilityProfile:[
      {label: '160 x 120', profile:'120p'},
      {label: '120 x 120', profile:'120p_3'},
      {label: '320 x 180', profile:'180p'},
      {label: '180 x 180', profile:'180p_3'},
      {label: '320 x 240', profile:'240p'},
      {label: '240 x 240', profile:'240p_3'},
      {label: '640 x 360', profile:'360p'},
      {label: '360 x 360', profile:'360p_3'},
      {label: '640 x 480', profile:'480p'},
      {label: '480 x 480', profile:'480p_3'},
      {label: '1280 x 720', profile:'720p'},
      {label: '960 x 720', profile:'720p_5'}
    ]
  }},
  created(){
    this.checkSource()
    this.isSupport()
    // this.getSupportedCodec() 
    // this.sendSupportedCodec()
  },
  mounted(){
 
    // this.subscribe()
  },
  methods:{
    handleMute(isMute){
      if(!this.localStream) return false
      isMute?this.localStream.unmuteAudio():this.localStream.muteAudio()
        // this.localStream.setAudioVolume(0)
        // this.localStream.setAudioVolume(100)
    },
    handleCamera(isCamera){
      if(!this.localStream) return false
      isCamera?this.localStream.unmuteVideo():this.localStream.muteVideo()
        // this.localStream.stop('currentView')  //相对于 play 来说
        // this.localStream.play("currentView")  //相对于 play 来说
    },
    checkSource(){
      AgoraRTC.getDevices(devices=>{
        // 输入输出设备信息
        this.audioinput = devices.filter(item=>item.kind == 'audioinput')
        this.audioSource = this.audioinput[0].deviceId
        this.videoinput = devices.filter(item=>item.kind == 'videoinput')
        this.videoSource = this.videoinput[0].deviceId
    
      },err=>{
        console.log('get devices source error')
      })
    },
    isSupport(){
      if(!AgoraRTC.checkSystemRequirements()){
        alert('do not support')
      }
    },
    checkNetworkStatus(uid){
      // stream-subscribed 后  Chrome 
      setInterval(()=>{
        this.client.getRemoteVideoStats(function(statsMap){
              // video stats map for remote streams, indexed by uid
            console.log(statsMap)
              var stats = statsMap[uid];
              console.log(JSON.stringify(stats));
          })

          this.client.getRemoteAudioStats(function(statsMap){
              // audio stats map for remote streams, indexed by uid
        
              var stats = statsMap[uid];
              console.log(JSON.stringify(stats));
          })

          this.client.getTransportStats(function(stats){
              // gateway network stats
              console.log(JSON.stringify(stats));
          })
      }, 2 * 1000);
    },
    join(){
      let validator =  this.validator({
        channel:this.channel
      })
      if( validator !== true) {
        alert(validator) 
        return false
      }
      this.joinDisabled = true
      this.client = AgoraRTC.createClient({mode: 'live', codec: "h264"});
      this.client.startProxyServer();
      this.client.init(this.appId ,  () =>{
          this.client.join(this.token, this.channel,this.uid, (uid) =>{
            console.log("User " + uid + " join channel successfully" + new Date().toLocaleTimeString());
            this.localStreams.push(uid)
            if(this.isHost){
              this.localStream = AgoraRTC.createStream({
                  streamID: uid,
                  audio: true,
                  video: this.isOpenCamera,
                  screen: false,
                  cameraId:this.videoSource,
                  microphoneId:this.audioSource
              });

              this.localStream.setVideoProfile(this.distinguishability)
              // The user has granted access to the camera and mic.
              this.localStream.on("accessAllowed", function() {
                console.log("accessAllowed"+new Date().toLocaleTimeString());
              });

              // The user has denied access to the camera and mic.
              this.localStream.on("accessDenied", function() {
                console.log("accessDenied"+new Date().toLocaleTimeString());
              });

              this.localStream.init(() =>{
                this.localStream.play('screen');
                // publish start
                this.client.publish(this.localStream, function (err) {
                  console.log("Publish local stream error: " + err + new Date().toLocaleTimeString());
                })
                this.client.on('stream-published', (evt)=>{
                  console.log("Publish local stream successfully" + new Date().toLocaleTimeString());
                });
                  // publish end 

              }, function (err) {
                console.log("getUserMedia failed", err);
              });
              
            }
          }, function(err) {
            console.log("Join  failed", err);
          });

      }, function (err) {
          console.log(" init failed ", err);
      });
      this.subscribe(this.client)
    },
    subscribe(currentClient){  //just for subscribe
      let channel = this.channel
      currentClient.on('error', function(err) {
        console.log("Got error msg:", err.reason);
        if (err.reason === 'DYNAMIC_KEY_TIMEOUT') {
          currentClient.renewChannelKey(channel, function(){
            console.log("Renew channel key successfully");
          }, function(err){
            console.log("Renew channel key failed: ", err);
          });
        }
      });
      // subscribe start   remote
      currentClient.on('stream-added',  (evt)=> {
        var stream = evt.stream;
        let id = stream.getId()
        console.log("1111111111111 New stream added: " + id);
        if(!this.localStreams.includes(id)){
          currentClient.subscribe(stream, function (err) {
            console.log("Subscribe stream failed", err);
          });
        }
      });

      currentClient.on('stream-subscribed', function (evt) {
        var stream = evt.stream;
        let streamId = stream.getId()
        console.log("222222222222222 Subscribe remote stream successfully: " + streamId);
        if ($('#user #agora_remote'+streamId).length === 0) {
          console.log('append 111111111111')
          $('#user').append('<div class="agora_remote" id="agora_remote'+streamId +'"></div>');
        }
        stream.play('agora_remote' + streamId);
      });

      currentClient.on('stream-removed', function (evt) {
        var stream = evt.stream;
        let streamId = stream.getId()
        stream.stop();
        $('#agora_remote' + streamId).remove();
        console.log("Remote stream is removed " + streamId);
      });

      currentClient.on('peer-leave', function (evt) {  //，即对方调用了 Client.leave。已离开频道
        var stream = evt.stream;
        if (stream) {
          stream.stop();
          $('#agora_remote' + stream.getId()).remove();
          console.log(evt.uid + " leaved from this channel");
        }
      });
      // subscribe end
    },
    leave(){
      this.leaveDisabled = true
      this.joinDisabled = false
      try{
        this.localStream && this.localStreams.splice(this.localStreams.indexOf(this.localStream.getId()),1) 
        this.client && this.client.unpublish(this.localStream)
        this.localStream && this.localStream.close()  //该方法关闭视频流或音频流。调用该方法会取消摄像头和麦克风的访问权限。
        this.client &&  
        this.client.leave(function () {
          console.log("Leavel channel successfully");
        }, function (err) {
          console.log("Leave channel failed");
        });
        this.localStream.stop()  //相对于 play 来说
      }catch(err){
        alert('推出失败')
      }
    },
    validator(options){
      if(options.channel.trim() == ''){
        return '房间号必须输入'
      }else{
        return true
      }
    },
    switchVideoDevice(data){ // firefox 不支持
      // console.log(data)
      if(!!!this.localStream) return 
      this.localStream.switchDevice('video',data,()=>{
        console.log('switch video device success')
      },(err)=>{
        console.log('switch video device failed' + err)
      })
    },
    shareScreen(){
      this.shareScreenDisabled = true
      this.screenClient = AgoraRTC.createClient({mode: 'rtc', codec: "vp8"});
      this.screenClient.init(this.appId ,  () =>{
          this.screenClient.join(this.token, this.channel,this.uid, (uid) =>{
            this.localStreams.push(uid)
            console.log("User " + uid + " join channel successfully" + new Date().toLocaleTimeString());
            if(this.isHost){
              this.screenStream = AgoraRTC.createStream({
                  streamID: uid,
                  audio: false,
                  video: false,
                  screen: true,
                  // extensionId:'minllpmhdgpndnkomcoccfekfegnlikg',
              });

              this.screenStream.setScreenProfile('720p_1')
              // The user has granted access to the camera and mic.
              this.screenStream.on("accessAllowed", function() {
                console.log("accessAllowed"+new Date().toLocaleTimeString());
              });

              // The user has denied access to the camera and mic.
              this.screenStream.on("accessDenied", function() {
                console.log("accessDenied"+new Date().toLocaleTimeString());
              });

              this.screenStream.init(() =>{
                this.screenStream.play('screen',{
                  fit:'contain'
                });
                if ($('#user #agora_remote'+this.localStream.getId()).length === 0) {
                  this.localStream.stop('screen')  //相对于 play 来说
                  $('#user').append('<div class="agora_remote" id="agora_remote'+this.localStream.getId() +'"></div>');
                  this.localStream.play('agora_remote' + this.localStream.getId())  //相对于 play 来说
                }
                // publish start
                this.screenClient.publish(this.screenStream, function (err) {
                  console.log("Publish local stream error: " + err + new Date().toLocaleTimeString());
                })
                this.screenClient.on('stream-published', (evt)=>{
                  console.log("Publish local stream successfully" + new Date().toLocaleTimeString());
                });
                  // publish end 

              }, function (err) {
                console.log("getUserMedia failed", err);
              });
              
            }
          }, function(err) {
            console.log("Join  failed", err);
          });

      }, function (err) {
          console.log(" init failed ", err);
      });
      this.subscribe(this.screenClient)
    },
    closeScreen(){
      this.closeScreen = true
      this.screenStream.stop()  //相对于 play 来说
      // this.screenStream.close()  //该方法关闭视频流或音频流。调用该方法会取消摄像头和麦克风的访问权限。
      this.screenClient.leave(function () {
        console.log("Leavel channel successfully");
      }, function (err) {
        console.log("Leave channel failed");
      });
    },
    switchAudioDevice(data){
      if(!!!this.localStream) return 
      this.localStream.switchDevice('audio',data,()=>{
        console.log('switch video device success')
      },(err)=>{
        console.log('switch video device failed' + err)
      })
    },
    getSupportedCodec(){  // get codec
      AgoraRTC.getSupportedCodec()
      .then((result)=>{
        this.getSupportCodec.video = result.video
        this.getSupportCodec.audio =  result.audio
      });
    },
    sendSupportedCodec(){  //send codec
      navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(function(mediaStream){
            return AgoraRTC.getSupportedCodec({stream: mediaStream});
      }).then((result)=>{
        this.sendSupportCodec.video = result.video
        this.sendSupportCodec.audio = result.audio
      });
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
      };
    }

  }
}
</script>
<style>
  *{
    margin: 0;
    padding: 0;
  }
  .news{
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    margin-bottom: 20px;
  }
  .handle{
    box-sizing: border-box;
  }
  .checked{
    margin: 0 5px 0 5px;
  }
  .situation{
    width: 100%;
    text-align: left;
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-items: center;
  }
  .text p{
    text-align: left;
  }
  .view{
    height: 450px;
    width: 100%;
    border: 1px solid gray;
    box-sizing: border-box;
    display: flex;
  }
  #screen{
    width: 70%;
    box-sizing: border-box;
    border-left: 1px solid gray;
  }
  #user{
    flex: 1;
  }
  .agora_remote {
    width: 100%;
    height: 200px;
  }
</style>