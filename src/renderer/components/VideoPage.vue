<template>
  <div ref="wrapper">
    <b-form-file
      v-model="file"
      :state="Boolean(file)"
      placeholder="Choose a file..."
      drop-placeholder="Drop file here..."
    />
    <div>{{data.length}}</div>
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
var mul_table = [
  1,
  57,
  41,
  21,
  203,
  34,
  97,
  73,
  227,
  91,
  149,
  62,
  105,
  45,
  39,
  137,
  241,
  107,
  3,
  173,
  39,
  71,
  65,
  238,
  219,
  101,
  187,
  87,
  81,
  151,
  141,
  133,
  249,
  117,
  221,
  209,
  197,
  187,
  177,
  169,
  5,
  153,
  73,
  139,
  133,
  127,
  243,
  233,
  223,
  107,
  103,
  99,
  191,
  23,
  177,
  171,
  165,
  159,
  77,
  149,
  9,
  139,
  135,
  131,
  253,
  245,
  119,
  231,
  224,
  109,
  211,
  103,
  25,
  195,
  189,
  23,
  45,
  175,
  171,
  83,
  81,
  79,
  155,
  151,
  147,
  9,
  141,
  137,
  67,
  131,
  129,
  251,
  123,
  30,
  235,
  115,
  113,
  221,
  217,
  53,
  13,
  51,
  50,
  49,
  193,
  189,
  185,
  91,
  179,
  175,
  43,
  169,
  83,
  163,
  5,
  79,
  155,
  19,
  75,
  147,
  145,
  143,
  35,
  69,
  17,
  67,
  33,
  65,
  255,
  251,
  247,
  243,
  239,
  59,
  29,
  229,
  113,
  111,
  219,
  27,
  213,
  105,
  207,
  51,
  201,
  199,
  49,
  193,
  191,
  47,
  93,
  183,
  181,
  179,
  11,
  87,
  43,
  85,
  167,
  165,
  163,
  161,
  159,
  157,
  155,
  77,
  19,
  75,
  37,
  73,
  145,
  143,
  141,
  35,
  138,
  137,
  135,
  67,
  33,
  131,
  129,
  255,
  63,
  250,
  247,
  61,
  121,
  239,
  237,
  117,
  29,
  229,
  227,
  225,
  111,
  55,
  109,
  216,
  213,
  211,
  209,
  207,
  205,
  203,
  201,
  199,
  197,
  195,
  193,
  48,
  190,
  47,
  93,
  185,
  183,
  181,
  179,
  178,
  176,
  175,
  173,
  171,
  85,
  21,
  167,
  165,
  41,
  163,
  161,
  5,
  79,
  157,
  78,
  154,
  153,
  19,
  75,
  149,
  74,
  147,
  73,
  144,
  143,
  71,
  141,
  140,
  139,
  137,
  17,
  135,
  134,
  133,
  66,
  131,
  65,
  129,
  1
];

var shg_table = [
  0,
  9,
  10,
  10,
  14,
  12,
  14,
  14,
  16,
  15,
  16,
  15,
  16,
  15,
  15,
  17,
  18,
  17,
  12,
  18,
  16,
  17,
  17,
  19,
  19,
  18,
  19,
  18,
  18,
  19,
  19,
  19,
  20,
  19,
  20,
  20,
  20,
  20,
  20,
  20,
  15,
  20,
  19,
  20,
  20,
  20,
  21,
  21,
  21,
  20,
  20,
  20,
  21,
  18,
  21,
  21,
  21,
  21,
  20,
  21,
  17,
  21,
  21,
  21,
  22,
  22,
  21,
  22,
  22,
  21,
  22,
  21,
  19,
  22,
  22,
  19,
  20,
  22,
  22,
  21,
  21,
  21,
  22,
  22,
  22,
  18,
  22,
  22,
  21,
  22,
  22,
  23,
  22,
  20,
  23,
  22,
  22,
  23,
  23,
  21,
  19,
  21,
  21,
  21,
  23,
  23,
  23,
  22,
  23,
  23,
  21,
  23,
  22,
  23,
  18,
  22,
  23,
  20,
  22,
  23,
  23,
  23,
  21,
  22,
  20,
  22,
  21,
  22,
  24,
  24,
  24,
  24,
  24,
  22,
  21,
  24,
  23,
  23,
  24,
  21,
  24,
  23,
  24,
  22,
  24,
  24,
  22,
  24,
  24,
  22,
  23,
  24,
  24,
  24,
  20,
  23,
  22,
  23,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  23,
  21,
  23,
  22,
  23,
  24,
  24,
  24,
  22,
  24,
  24,
  24,
  23,
  22,
  24,
  24,
  25,
  23,
  25,
  25,
  23,
  24,
  25,
  25,
  24,
  22,
  25,
  25,
  25,
  24,
  23,
  24,
  25,
  25,
  25,
  25,
  25,
  25,
  25,
  25,
  25,
  25,
  25,
  25,
  23,
  25,
  23,
  24,
  25,
  25,
  25,
  25,
  25,
  25,
  25,
  25,
  25,
  24,
  22,
  25,
  25,
  23,
  25,
  25,
  20,
  24,
  25,
  24,
  25,
  25,
  22,
  24,
  25,
  24,
  25,
  24,
  25,
  25,
  24,
  25,
  25,
  25,
  25,
  22,
  25,
  25,
  25,
  24,
  25,
  24,
  25,
  18
];

function boxBlurCanvasRGBA(
  ctx,
  top_x,
  top_y,
  width,
  height,
  radius,
  iterations
) {
  if (isNaN(radius) || radius < 1) return;

  radius |= 0;

  if (isNaN(iterations)) iterations = 1;
  iterations |= 0;
  if (iterations > 3) iterations = 3;
  if (iterations < 1) iterations = 1;

  var context = ctx;
  var imageData;

  try {
    try {
      imageData = context.getImageData(top_x, top_y, width, height);
    } catch (e) {
      // NOTE: this part is supposedly only needed if you want to work with local files
      // so it might be okay to remove the whole try/catch block and just use
      // imageData = context.getImageData( top_x, top_y, width, height );
      try {
        netscape.security.PrivilegeManager.enablePrivilege(
          "UniversalBrowserRead"
        );
        imageData = context.getImageData(top_x, top_y, width, height);
      } catch (e) {
        alert("Cannot access local image");
        throw new Error("unable to access local image data: " + e);
        return;
      }
    }
  } catch (e) {
    alert("Cannot access image");
    throw new Error("unable to access image data: " + e);
    return;
  }

  var pixels = imageData.data;

  var rsum, gsum, bsum, asum, x, y, i, p, p1, p2, yp, yi, yw, idx, pa;
  var wm = width - 1;
  var hm = height - 1;
  var wh = width * height;
  var rad1 = radius + 1;

  var mul_sum = mul_table[radius];
  var shg_sum = shg_table[radius];

  var r = [];
  var g = [];
  var b = [];
  var a = [];

  var vmin = [];
  var vmax = [];

  while (iterations-- > 0) {
    yw = yi = 0;

    for (y = 0; y < height; y++) {
      rsum = pixels[yw] * rad1;
      gsum = pixels[yw + 1] * rad1;
      bsum = pixels[yw + 2] * rad1;
      asum = pixels[yw + 3] * rad1;

      for (i = 1; i <= radius; i++) {
        p = yw + ((i > wm ? wm : i) << 2);
        rsum += pixels[p++];
        gsum += pixels[p++];
        bsum += pixels[p++];
        asum += pixels[p];
      }

      for (x = 0; x < width; x++) {
        r[yi] = rsum;
        g[yi] = gsum;
        b[yi] = bsum;
        a[yi] = asum;

        if (y == 0) {
          vmin[x] = ((p = x + rad1) < wm ? p : wm) << 2;
          vmax[x] = (p = x - radius) > 0 ? p << 2 : 0;
        }

        p1 = yw + vmin[x];
        p2 = yw + vmax[x];

        rsum += pixels[p1++] - pixels[p2++];
        gsum += pixels[p1++] - pixels[p2++];
        bsum += pixels[p1++] - pixels[p2++];
        asum += pixels[p1] - pixels[p2];

        yi++;
      }
      yw += width << 2;
    }

    for (x = 0; x < width; x++) {
      yp = x;
      rsum = r[yp] * rad1;
      gsum = g[yp] * rad1;
      bsum = b[yp] * rad1;
      asum = a[yp] * rad1;

      for (i = 1; i <= radius; i++) {
        yp += i > hm ? 0 : width;
        rsum += r[yp];
        gsum += g[yp];
        bsum += b[yp];
        asum += a[yp];
      }

      yi = x << 2;
      for (y = 0; y < height; y++) {
        pixels[yi + 3] = pa = (asum * mul_sum) >>> shg_sum;
        if (pa > 0) {
          pa = 255 / pa;
          pixels[yi] = ((rsum * mul_sum) >>> shg_sum) * pa;
          pixels[yi + 1] = ((gsum * mul_sum) >>> shg_sum) * pa;
          pixels[yi + 2] = ((bsum * mul_sum) >>> shg_sum) * pa;
        } else {
          pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
        }
        if (x == 0) {
          vmin[y] = ((p = y + rad1) < hm ? p : hm) * width;
          vmax[y] = (p = y - radius) > 0 ? p * width : 0;
        }

        p1 = x + vmin[y];
        p2 = x + vmax[y];

        rsum += r[p1] - r[p2];
        gsum += g[p1] - g[p2];
        bsum += b[p1] - b[p2];
        asum += a[p1] - a[p2];

        yi += width << 2;
      }
    }
  }

  context.putImageData(imageData, top_x, top_y);
}

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
      }),
      data: []
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
        // that.startDetecting();
        that.currentFrame = 1;
      }
    );
    this.$electron.ipcRenderer.on("data", async (event, data) => {
      this.data.push(data);
    });
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
        if (this.data[index - 1] != undefined) {
          this.data[index - 1].forEach(detection => {
            let [x, y, x2, y2] = detection;

            // x -= 5;
            // y -= 5;
            // let sqWidth = Math.max(width, height);
            // sqWidth += 10;
            let width = x2 - x;
            let height = y2 - y;
            boxBlurCanvasRGBA(ctx, x, y, width, height, 20, 1);
            // ctx.strokeRect(x, y, width, height);
          });
        }
        // if (this.$store.state.faceData.detection[index] != undefined) {
        //   this.$store.state.faceData.detection[index].forEach(detection => {
        //     let { x, y, width, height } = detection;

        //     x -= 5;
        //     y -= 5;
        //     let sqWidth = Math.max(width, height);
        //     sqWidth += 10;

        //     ctx.strokeRect(x, y, sqWidth, sqWidth);
        //   });
        // }
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
