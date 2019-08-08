<template>
  <div>
    <div id="device">
      视频设备：
      <el-select v-model="videoSource" class="device-select" placeholder="请选择视频设备">
        <el-option
          v-for="(item, key) in videoDeviceList"
          :key="key"
          :label="item.label"
          :value="item.deviceId"
        />
      </el-select>音频设备：
      <el-select v-model="audioSource" class="device-select" placeholder="请选择音频设备">
        <el-option
          v-for="(item, key) in audioDeviceList"
          :key="key"
          :label="item.label"
          :value="item.deviceId"
        />
      </el-select>
    </div>
    <div id="div_join" class="panel panel-default">
      <div class="panel-body">
        工号:
        <el-input id="channel" v-model="channel" type="text" size="4" style="width: auto" />Host:
        <el-checkbox v-model="isHost" name="asd" />
        <el-button id="join" :disabled="joinDisabled" type="primary" @click="join">进入房间</el-button>
        <el-select v-model="cameraVideoProfile" style="margin: 0 10px" placeholder="请选择摄像头分辨率">
          <el-option label="120p" value="120p" />
          <el-option label="180p" value="180p" />
          <el-option label="240p" value="240p" />
          <el-option label="360p" value="360p" />
          <el-option label="480p" value="480p" />
          <el-option label="720p" value="720p" />
          <el-option label="1080p" value="1080p" />
        </el-select>
        <el-button
          id="unpublish"
          :disabled="closeLocalStreamDisabled"
          type="primary"
          @click="closeLocalStream"
        >关闭摄像头</el-button>
        <el-button
          id="screenShare"
          :disabled="shareScreenDisabled"
          type="primary"
          @click="shareScreen"
        >屏幕共享</el-button>
        <el-select v-model="screenVideoProfile" style="margin: 0 10px" placeholder="请选择屏幕分享分辨率">
          <el-option label="480p_1" value="480p_1" />
          <el-option label="480p_2" value="480p_2" />
          <el-option label="720p_1" value="720p_1" />
          <el-option label="720p_2" value="720p_2" />
          <el-option label="1080p_1" value="1080p_1" />
          <el-option label="1080p_2" value="1080p_2" />
        </el-select>
        <el-button
          id="screenShareClose"
          :disabled="closeLocalScreenStreamDisabled"
          type="primary"
          @click="closeShareScreen"
        >关闭屏幕共享</el-button>
      </div>
    </div>
    <div id="videoContainer">
      <div id="agora_screen" />
      <div id="videoContainerInner">
        <div id="agora_local" />
      </div>
    </div>
  </div>
</template>
<script></script>
<script>
import $ from "jquery";
import AgoraRTC from "agora-rtc-sdk";

export default {
  name: "TRTC",
  data() {
    return {
      appId: "b3b9781a3a774856960b9f4a73ff029e",
      videoDeviceList: "",
      audioDeviceList: "",
      videoSource: "",
      audioSource: "",
      channel: "1010",
      localStream: "",
      localScreenStream: "",
      localClient: "",
      localScreenClient: "",
      isHost: true,
      clientOnFlag: false,
      joinDisabled: false,
      shareScreenDisabled: false,
      closeLocalStreamDisabled: false,
      closeLocalScreenStreamDisabled: false,
      screenVideoProfile: "480_1",
      cameraVideoProfile: "120p"
    };
  },
  created() {
    // this.checkToken()
  },
  mounted() {
    console.log("1111", this.bw().isChrome, this.bw().isFirefox);
    this.checkSystemRequirements();
    this.getDevices();
  },
  methods: {
    getDevices() {
      AgoraRTC.getDevices(devices => {
        this.videoDeviceList = devices.filter(
          item => item.kind === "videoinput"
        );
        this.videoSource = this.videoDeviceList[0].deviceId;
        this.audioDeviceList = devices.filter(
          item => item.kind === "audioinput"
        );
        this.audioSource = this.audioDeviceList[0].deviceId;
      });
    },
    join() {
      this.joinDisabled = true;
      this.closeLocalStreamDisabled = false;
      const channel_key = null;

      this.localClient = AgoraRTC.createClient({ mode: "live", codec: "h264" });
      // 开启云代理
      this.localClient.startProxyServer();
      // 初始化client
      this.localClient.init(
        this.appId,
        () => {
          this.localClient.join(
            channel_key,
            this.channel,
            123001,
            uid => {
              console.log("User " + uid + " join channel successfully");
              // 如果是主播模式，创建流
              if (this.isHost) {
                this.localStream = AgoraRTC.createStream({
                  streamID: uid,
                  audio: true,
                  cameraId: this.videoSource,
                  microphoneId: this.audioSource,
                  video: this.isHost
                });
                this.localStream.setVideoProfile(this.cameraVideoProfile);

                // The user has granted access to the camera and mic.
                this.localStream.on("accessAllowed", function() {
                  console.log("accessAllowed");
                });

                // The user has denied access to the camera and mic.
                this.localStream.on("accessDenied", function() {
                  console.log("accessDenied");
                });

                this.localStream.init(
                  () => {
                    console.log("getUserMedia successfully");
                    this.localStream.play("agora_local");
                    this.localClient.publish(this.localStream, function(err) {
                      console.log("Publish local stream error: " + err);
                    });
                    this.localClient.on("stream-published", function(evt) {
                      console.log("Publish local stream successfully");
                    });
                  },
                  function(err) {
                    console.log("getUserMedia failed", err);
                  }
                );
              }
            },
            function(err) {
              console.log("Join channel failed", err);
            }
          );
        },
        function(err) {
          console.log("AgoraRTC client init failed", err);
        }
      );

      this.clientOn(this.localClient);
    },
    shareScreen() {
      this.shareScreenDisabled = true;
      this.closeLocalScreenStreamDisabled = false;
      const channel_key = null;

      this.localScreenClient = AgoraRTC.createClient({
        mode: "live",
        codec: "h264"
      });
      // 开启云代理
      this.localScreenClient.startProxyServer();
      // 初始化client
      this.localScreenClient.init(
        this.appId,
        () => {
          this.localScreenClient.join(
            channel_key,
            this.channel,
            123002,
            uid => {
              console.log("User " + uid + " join channel successfully");
              // 如果是主播模式，创建流
              if (this.isHost) {
                // 判断浏览器
                if (this.bw().isFirefox) {
                  this.localScreenStream = AgoraRTC.createStream({
                    streamID: uid,
                    audio: false,
                    video: false,
                    screen: true,
                    extensionId: "minllpmhdgpndnkomcoccfekfegnlikg"
                  });
                } else {
                  this.localScreenStream = AgoraRTC.createStream({
                    streamID: uid,
                    audio: false,
                    video: false,
                    screen: true,
                    mediaSource: this.mediaSource
                  });
                }
                this.localScreenStream.setScreenProfile(
                  this.screenVideoProfile
                );
                // The user has granted access to the camera and mic.
                this.localScreenStream.on("accessAllowed", function() {
                  console.log("accessAllowed");
                });

                // The user has denied access to the camera and mic.
                this.localScreenStream.on("accessDenied", function() {
                  console.log("accessDenied");
                });

                this.localScreenStream.init(
                  () => {
                    console.log("getUserMedia successfully");
                    this.localScreenStream.play("agora_screen", {
                      fit: "contain"
                    });
                    this.localScreenClient.publish(
                      this.localScreenStream,
                      function(err) {
                        console.log("Publish local stream error: " + err);
                      }
                    );
                    this.localScreenClient.on("stream-published", function(
                      evt
                    ) {
                      console.log("Publish local stream successfully");
                    });
                  },
                  function(err) {
                    console.log("getUserMedia failed", err);
                  }
                );
              }
            },
            function(err) {
              console.log("Join channel failed", err);
            }
          );
        },
        function(err) {
          console.log("AgoraRTC client init failed", err);
        }
      );

      this.clientOn(this.localScreenClient);
    },
    clientOn(clientCurrent) {
      if (this.clientOnFlag) return;
      this.clientOnFlag = true;
      // todo 判断是否需要on，如果是接入别人的房间，则不需要on，如果是创建房间，则需要on
      // var clientCurrent = clientScreen?clientScreen:client;
      var channelKey = "";
      clientCurrent.on("error", function(err) {
        console.log("Got error msg:", err.reason);
        if (err.reason === "DYNAMIC_KEY_TIMEOUT") {
          clientCurrent.renewChannelKey(
            channelKey,
            function() {
              console.log("Renew channel key successfully");
            },
            function(err) {
              console.log("Renew channel key failed: ", err);
            }
          );
        }
      });
      clientCurrent.on("stream-added", function(evt) {
        var stream = evt.stream;
        var streamID = stream.getId();
        console.log("New stream added: " + streamID);
        console.log("Subscribe ", stream);
        if (streamID != 123001 && streamID != 123002) {
          clientCurrent.subscribe(stream, function(err) {
            console.log("Subscribe stream failed", err);
          });
        }
      });
      clientCurrent.on("stream-subscribed", function(evt) {
        var stream = evt.stream;
        console.log("Subscribe remote stream successfully: " + stream.getId());
        if (
          $("div#videoContainer #agora_remote" + stream.getId()).length === 0
        ) {
          $("div#videoContainerInner").append(
            '<div class="agora_remote" id="agora_remote' +
              stream.getId() +
              '"></div>'
          );
        }
        stream.play("agora_remote" + stream.getId());
      });

      clientCurrent.on("stream-removed", function(evt) {
        var stream = evt.stream;
        stream.stop();
        $("#agora_remote" + stream.getId()).remove();
        console.log("Remote stream is removed " + stream.getId());
      });

      clientCurrent.on("peer-leave", function(evt) {
        var stream = evt.stream;
        if (stream) {
          stream.stop();
          $("#agora_remote" + stream.getId()).remove();
          console.log(evt.uid + " leaved from this channel");
        }
      });
    },
    checkSystemRequirements() {
      if (!AgoraRTC.checkSystemRequirements()) {
        alert("Your browser does not support WebRTC!");
      }
    },
    closeLocalStream() {
      this.joinDisabled = false;
      this.closeLocalStreamDisabled = true;
      this.localStream.stop();
      this.localStream.close();
      this.localClient.unpublish(this.localStream, function(err) {
        console.log("Unpublish local stream failed" + err);
      });
      this.localClient.leave(
        function() {
          console.log("Leavel channel successfully");
        },
        function(err) {
          console.log("Leave channel failed", err);
        }
      );
    },
    closeShareScreen() {
      this.shareScreenDisabled = false;
      this.closeLocalScreenStreamDisabled = true;
      this.localScreenStream.stop();
      this.localScreenStream.close();
      this.localScreenClient.unpublish(this.localScreenStream, function(err) {
        console.log("Unpublish local stream failed" + err);
      });
      this.localScreenClient.leave(
        function() {
          console.log("Leavel channel successfully");
        },
        function(err) {
          console.log("Leave channel failed", err);
        }
      );
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
};
</script>

<style scoped>
#videoContainer {
  height: 500px;
  padding: 10px 0px;
  position: relative;
  margin: 0 auto;
}
#videoContainerInner {
  border: 1px solid #ccc;
  float: right;
  width: 300px;
  right: 30px;
  top: 10px;
}
#agora_screen {
  display: block;
  width: 900px;
  height: 650px;
  position: absolute;
  left: 10px;
  border: 2px solid #ccc;
  z-index: 1;
  background-color: #eee;
}
#agora_local {
  width: 300px;
  height: 228px;
  display: inline-block;
}
.device-select {
  width: 400px;
  margin-right: 10px;
}
#device {
  margin-bottom: 10px;
}
</style>
<style>
.agora_remote {
  width: 300px;
  height: 228px;
  display: inline-block;
}
</style>
