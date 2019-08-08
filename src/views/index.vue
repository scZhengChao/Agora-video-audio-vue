<template>
  <div :style="screenHeight" class="audio">
    <ul class="audio-header">
      <li>平安面对面</li>
    </ul>
    <el-button type="primary" size="mini" @click="createRoom">视频</el-button>
    <el-row class="action-bar">
      <el-col :span="4">
        <h4>当前人数：1</h4>
        <h4>通话时长：00:00</h4>
      </el-col>
      <el-col :span="3" :offset="11">
        <div class="MIC">
          <!-- eslint-disable-next-line -->
          <!-- <img src="../../assets/av/MIC.png" alt /> -->
        </div>
      </el-col>
      <el-col :span="3">
        <div class="MIC">
          <!-- eslint-disable-next-line -->
          <!-- <img src="../../assets/av/screen_share.png" alt /> -->
        </div>
      </el-col>
      <el-col :span="3">
        <div class="hang-up" @click="leaveRoom()">
          <!-- eslint-disable-next-line -->
          <!-- <img src="../../assets/av/hang_up.png" alt /> -->
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="4" :style="contentHeight" class="audio-box">
        <div id="av">
          <div id="agora_local" />
        </div>
        <!-- <el-row>
          <el-col :span="8" class="audio-avatar">
            <img src="../../assets/av/touxiang.png" alt />
          </el-col>
          <el-col :offset="2" :span="14" style="line-height:30px;">
            <div>客户经理</div>
            <div>黄晓明</div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8" class="audio-avatar">
            <img src="../../assets/av/touxiang.png" alt />
          </el-col>
          <el-col :offset="2" :span="14" style="line-height:30px">
            <div>客户经理</div>
            <div>黄晓明</div>
          </el-col>
        </el-row>-->
      </el-col>
      <el-col :span="19" :style="contentHeight" class="screen-share-box">
        <ul>
          <li>
            <!-- eslint-disable-next-line -->
            <!-- <img src="../../assets/av/none_screen.png" alt /> -->
          </li>
          <li class="none_screen">暂无共享</li>
        </ul>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import AgoraRTC from "agora-rtc-sdk";
// import $ from "jquery";
export default {
  data() {
    return {
      localClient: "",
      appId: "b3b9781a3a774856960b9f4a73ff029e",
      channelKey: null,
      channelName: "6666",
      UID: "8888",
      localStream: "",
      screenHeight: {
        height: window.innerHeight - 60 + "px"
      },
      contentHeight: {
        height: window.innerHeight - 60 - 180 + "px"
      }
    };
  },
  created() {},
  mounted() {
    // this.createRoom();
  },
  methods: {
    createRoom() {
      this.localClient = AgoraRTC.createClient({ mode: "live", codec: "h264" });
      this.localClient.init(
        this.appId,
        () => {
          this.localClient.join(
            this.channelKey,
            this.channelName,
            this.UID,
            uid => {
              console.log("User " + uid + " join channel successfully");
              this.localStream = AgoraRTC.createStream({
                streamID: uid,
                audio: true,
                video: true,
                screen: false
              });
              this.localStream.init(
                () => {
                  console.log("getUserMedia successfully");
                  this.localStream.play("agora_local");
                  this.localClient.publish(this.localStream, err => {
                    console.log("Publish local stream error: " + err);
                  });
                  this.localClient.on("stream-published", evt => {
                    console.log("Publish local stream successfully");
                  });
                },
                err => {
                  console.log("getUserMedia failed", err);
                }
              );
            },
            err => {
              console.log("Join channel failed", err);
            }
          );
        },
        err => {
          console.log("AgoraRTC localClient init failed", err);
        }
      );
      this.clientOn(this.localClient);
    },
    // 监听
    clientOn(currentClient) {
      console.log("监听1");
      var channelKey = "";
      currentClient.on("error", function(err) {
        console.log("Got error msg:", err.reason);
        if (err.reason === "DYNAMIC_KEY_TIMEOUT") {
          currentClient.renewChannelKey(
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
      currentClient.on("stream-added", evt => {
        var stream = evt.stream;
        var streamID = stream.getId();
        console.log("New stream added: " + streamID);
        console.log("监听2");
        if (streamID !== "8888") {
          currentClient.subscribe(stream, function(err) {
            console.log("Subscribe stream failed", err);
          });
        }
      });
      currentClient.on("stream-subscribed", evt => {
        var remoteStream = evt.stream;
        console.log("监听3");
        console.log(
          111,
          "Subscribe remote stream successfully: " + remoteStream.getId()
        );
        $("div#av").append(
          '<div class="agora_remote" id="agora_remote' +
            remoteStream.getId() +
            '"></div>'
        );
        // 这里使用agora_remote + remoteStream.getId()作为dom元素的id。
        remoteStream.play("agora_remote" + remoteStream.getId());
      });
    },
    leaveRoom() {
      this.localClient.leave(
        () => {
          console.log("Leave channel successfully");
        },
        // eslint-disable-next-line
        err => {
          console.log("Leave channel failed");
        }
      );
    },
    // 静音
    mute() {
      this.client.on("stream-subscribed", function(evt) {
        var stream = evt.stream;
        // 将订阅流静音
        stream.setAudioVolume(0);
      });
    }
  }
};
</script>

<style scoped>
.audio {
  background: #f0f0f1;
  padding-bottom: 30px;
}
.audio-header {
  height: 60px;
  background: #ffa655;
}
.audio-header > li {
  font-size: 24px;
  color: #fff;
  line-height: 60px;
  margin-left: 80px;
}
.action-bar {
  padding: 20px 40px 0 40px;
}
.MIC,
.hang-up {
  width: 100px;
  padding: 5px;
  border: 2px solid #ffa655;
  border-radius: 20px;
  background: #fff;
  display: flex;
  justify-content: center;
}
.hang-up {
  background: #ff6f6f;
  border: none;
  padding: 12px 5px;
}
.audio-box,
.screen-share-box {
  background: #fff;
  margin: 10px 0 0 20px;
  border-radius: 6px;
  padding: 20px;
}
.audio-avatar > img {
  height: 50px;
  width: 50px;
  border-radius: 100%;
  border: 2px solid #e4e7ed;
  padding: 5px;
  margin-bottom: 20px;
}
h4 {
  margin: 5px;
}
.screen-share-box {
  display: flex;
  justify-content: center;
  align-items: center;
}
.none_screen {
  color: #909399;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-top: 20px;
}
/* 音频块 */
#agora_local,
.agora_remote {
  height: 200px;
  width: 200px;
}
</style>
