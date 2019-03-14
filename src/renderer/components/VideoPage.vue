<template>
  <div ref="wrapper">
    <b-form-file
      v-model="file"
      :state="Boolean(file)"
      placeholder="Choose a file..."
      drop-placeholder="Drop file here..."
    />
    <b-container fluid class="my-2">
      <b-row align-h="center" ref="container">
        <canvas ref="canvas" id="canvas"></canvas>
      </b-row>
    </b-container>
    <label
      for="frameRange"
    >Current Frame: {{ currentFrame }}. Detections done: {{detectionsDone}}/{{$store.state.videoData.frameCount}}</label>
    <b-form-input
      type="range"
      id="frameRange"
      v-model="currentFrame"
      min="1"
      :max="$store.state.videoData.frameCount"
    />
    <b-modal
      v-model="loading"
      id="modal-center"
      centered
      :title="loadingTitle"
      hide-footer
      no-close-on-backdrop
      no-close-on-esc
      hide-header-close
    >
      <b-spinner label="Spinning"/>
    </b-modal>
    <!-- <div>
      <b-embed type="video" aspect="4by3" id="video" controls>
        <source
          src="C:\Users\chris.RAC115149\Desktop\testFaceBlur\MAH00292.MP4"
          type="video/mp4;codecs=&quot;avc1.42E01E, mp4a.40.2&quot;"
        >
      </b-embed>
      <b-button @click="detect">detect</b-button>
    </div>-->
  </div>
</template>

<script>
import * as faceapi from "face-api.js";
import fs from "fs";
import path, { relative } from "path";

export default {
  name: "video-page",
  components: {},
  data() {
    return {
      file: null,
      loading: false,
      loadingTitle: "",
      currentFrame: 0,
      detectionsDone: 0,
      options: new faceapi.SsdMobilenetv1Options({
        minConfidence: 0.3
      })
    };
  },
  created() {
    this.loadFaceAPI();
    const that = this;
    // this.$electron.ipcRenderer.on(
    //   "allFramesExtracted",
    //   async (event, detections) => {
    //     console.log(detections);
    //   }
    // );
    this.$electron.ipcRenderer.on(
      "allFramesExtracted",
      async (event, { frameFolderPath, frameCount, videoName }) => {
        await that.$store.dispatch("setFrameFolderPath", frameFolderPath);
        await that.$store.dispatch("setFrameCount", frameCount);
        await that.$store.dispatch("setVideoName", videoName);

        await that.$store.dispatch(
          "setDetection",
          Array(that.$store.state.videoData.frameCount).fill()
        );
        that.loadingTitle = "Detecting faces...";
        that.loading = false;
        that.startDetecting();
        that.currentFrame = 1;
      }
    );
  },
  mounted() {
    this.canvas = this.$refs.canvas;
  },
  watch: {
    async file(newFile) {
      console.log(this.file);
      await this.$store.dispatch("setFilePath", this.file.path);
      this.$electron.ipcRenderer.send("extractFrames", this.file.path);
      this.loadingTitle = "Extracting frames...";
      this.loading = true;
    },
    currentFrame(val) {
      this.drawImgToCanvas(val);
    }
  },
  methods: {
    async loadFaceAPI() {
      faceapi.env.monkeyPatch({
        Canvas: HTMLCanvasElement,
        Image: HTMLImageElement,
        ImageData: ImageData,
        Video: HTMLVideoElement,
        createCanvasElement: () => document.createElement("canvas"),
        createImageElement: () => document.createElement("img")
      });
      await faceapi.loadSsdMobilenetv1Model("static/models");
      console.log(faceapi.nets);
    },
    open(link) {
      this.$electron.shell.openExternal(link);
    },
    drawImgToCanvas(index) {
      let cv = this.$refs.canvas;
      let img = new Image();
      // this.images.push(img);
      img.onload = () => {
        cv.width = img.width;
        cv.height = img.height;
        let ctx = cv.getContext("2d");
        ctx.lineWidth = 5;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        ctx.strokeStyle = "red";
        let { offsetLeft, offsetTop } = this.$refs.canvas;
        if (this.$store.state.faceData.detection[index] != undefined) {
          this.$store.state.faceData.detection[index].forEach(detection => {
            let { x, y, width, height } = detection;

            x -= 5;
            y -= 5;
            let sqWidth = Math.max(width, height);
            sqWidth += 10;

            ctx.strokeRect(x, y, sqWidth, sqWidth);
          });
        }
      };
      img.src = path.join(
        this.$store.state.pathsData.frameFolderPath,
        `frame${index}.jpg`
      );
    },
    async startDetecting() {
      for (let i = 1; i <= this.$store.state.videoData.frameCount; i++) {
        await this.detect(
          path.join(
            this.$store.state.pathsData.frameFolderPath,
            `frame${i}.jpg`
          ),
          i
        );
      }
    },
    async detect(src, index) {
      let img = new Image();
      img.src = src;
      let det = await faceapi.detectAllFaces(img, this.options);
      if (det.length != 0) {
        const detections = det.map(ele => {
          return {
            x: ele.box.x,
            y: ele.box.y,
            width: ele.box.width,
            height: ele.box.height,
            score: ele.score
          };
        });
        const array = JSON.parse(JSON.stringify(detections));

        await this.$store.dispatch("insertDetection", { array, index });
      } else {
        await this.$store.dispatch("insertDetection", {
          array: this.$store.state.faceData.detection[index - 1],
          index
        });
      }
      this.detectionsDone += 1;
    }
  }
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro");

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Source Sans Pro", sans-serif;
}

#canvas {
  background-color: darkgray;

  height: 480px;
}
.box {
  background: linear-gradient(135deg, #0ff 0, #0ff 94%, #fff 95%);
  border: 3px solid #000;
  overflow: auto;
  width: 250px;
  height: 250px;
  font-weight: 700;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}
.container {
  text-align: center;
}
</style>
