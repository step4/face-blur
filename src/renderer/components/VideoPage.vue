<template>
  <div ref="wrapper">
    <b-form-file
      v-model="file"
      :state="Boolean(file)"
      placeholder="Choose a file..."
      drop-placeholder="Drop file here..."
    />
    <b-container fluid class="my-2">
      <b-row align-h="center">
        <canvas ref="canvas" id="canvas"></canvas>
      </b-row>
    </b-container>
    <!-- <b-embed ref="vid" type="video" aspect="4by3" controls>
      <source src type="video/mp4;codecs=&quot;avc1.42E01E, mp4a.40.2&quot;">
    </b-embed>-->
    <label
      for="frameRange"
    >Current Frame: {{ currentFrame }}. Detection: {{currentDetectionIndex}}/{{frameCount}}</label>
    <b-form-input type="range" id="frameRange" v-model="currentFrame" min="1" :max="frameCount"/>
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
var faceapi = require("face-api.js");
import fs from "fs";
import path from "path";

export default {
  name: "video-page",
  components: {},
  data() {
    return {
      file: null,
      loading: false,
      loadingTitle: "",
      frameCount: 0,
      currentFrame: 0,
      images: [],
      frameFolder: "",
      detections: [],
      currentDetectionIndex: 0
    };
  },
  created() {
    this.loadFaceAPI();
    this.frameFolder = path.join(
      this.$electron.remote.app.getPath("userData"),
      "frames"
    );
    console.log(this.$electron);
    const that = this;
    this.$electron.ipcRenderer.on(
      "allFramesExtracted",
      async (event, framesCount) => {
        console.log(framesCount);
        that.frameCount = framesCount;

        that.loading = false;
        that.loadingTitle = "Loading images...";
        // that.loading = true;
        that.loadImages();
        // that.loading = false;
        that.currentFrame = 1;

        // that.loadingTitle = "Detecting faces...";
        // that.loading = true;
        // await that.detectFaces();
        // that.loading = false;
      }
    );
  },
  mounted() {
    let cv = this.$refs.canvas;
    console.log(cv);
    const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 });
    // let vid = document.getElementById("video");
    // vid.addEventListener("timeupdate", async event => {
    //   console.log(await faceapi.detectAllFaces(vid, options));
    // });
  },
  watch: {
    file(oldFile) {
      console.log(this.file);
      // console.log(this.$refs.vid.children[0]);
      // this.$refs.vid.children[0].src = `file://${this.file.path}`;
      this.$electron.ipcRenderer.send("extractFrames", this.file.path);
      this.loadingTitle = "Extracting frames...";
      this.loading = true;
      // this.$refs.src.src = this.file;
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
        let cxt = cv.getContext("2d");
        cxt.lineWidth = 5;
        cxt.drawImage(img, 0, 0, img.width, img.height);
        cxt.strokeStyle = "red";
        cxt.save();
        if (this.detections[index] != undefined) {
          this.detections[index].forEach(detection => {
            let { _x, _y, _width, _height } = detection._box;
            _x -= 5;
            _y -= 5;
            let sqWidth = Math.max(_width, _height);
            sqWidth += 10;

            cxt.strokeRect(_x, _y, sqWidth, sqWidth);
            cxt.filter = "blur(10px)";
            cxt.drawImage(
              cv,
              _x,
              _y,
              sqWidth,
              sqWidth,
              _x,
              _y,
              sqWidth,
              sqWidth
            );
            cxt.restore();
          });
        }
      };
      img.src = path.join(this.frameFolder, `frame${index}.jpg`);
    },
    async loadImages() {
      for (let i = 1; i <= this.frameCount; i++) {
        await this.addImageProcess(
          path.join(this.frameFolder, `frame${i}.jpg`),
          i
        );
      }
    },
    async addImageProcess(src, index) {
      const options = new faceapi.SsdMobilenetv1Options({
        minConfidence: 0.3
      });
      let img = new Image();
      // this.images.push(img);
      img.src = src;
      // img.onload = () => resolve();
      this.currentDetectionIndex = index;
      let det = await faceapi.detectAllFaces(img, options);
      console.log(det);
      if (det.length != 0) {
        this.detections[index] = JSON.parse(JSON.stringify(det));
      } else {
        console.log(JSON.parse(JSON.stringify(this.detections[index - 1])));
        this.detections[index] = JSON.parse(
          JSON.stringify(this.detections[index - 1])
        );
      }
    },
    async detectFaces() {
      const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 });
      this.images.forEach(async (ele, ind) => {
        let det = await faceapi.detectAllFaces(ele, options);
        console.log(det);
        if (det.length != 0) {
          this.detections[ind] = det;
        }
        console.log(ind);
      });
      // for (let i = 0; i <= this.frameCount - 1; i++) {
      //   let det = await faceapi.detectAllFaces(this.images[i], options);
      //   if (det.length != 0) {
      //     this.detections[i] = det;
      //   }
      //   if (i % 20 == 0) {
      //     console.log(i);
      //   }
      // }
    },
    async detect() {
      const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 });
      let vid = document.getElementById("video");
      console.log(await faceapi.detectAllFaces(vid, options));
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
</style>
