<template>
  <div id="wrapper">
    <img id="logo" src="~@/assets/logo.png" alt="electron-vue">
    <b-form-file
      v-model="file"
      :state="Boolean(file)"
      placeholder="Choose a file..."
      drop-placeholder="Drop file here..."
    />
    <b-embed ref="vid" type="video" aspect="4by3" controls>
      <source src type="video/mp4;codecs=&quot;avc1.42E01E, mp4a.40.2&quot;">
    </b-embed>
  </div>
</template>

<script>
import SystemInformation from "./LandingPage/SystemInformation";
import * as faceapi from "face-api.js";
import fs from "fs";

export default {
  name: "landing-page",
  components: { SystemInformation },
  data() {
    return { file: null };
  },
  created() {
    // await faceapi.loadSsdMobilenetv1Model("static/models");
    // console.log(faceapi.nets);
    console.log(this.$electron);
  },
  watch: {
    file(oldFile) {
      console.log(this.file);
      console.log(this.$refs.vid.children[0]);
      this.$refs.vid.children[0].src = `file://${this.file.path}`;
      this.$electron.ipcRenderer.send("newFile", this.file.path);
      // this.$refs.src.src = this.file;
    }
  },
  methods: {
    open(link) {
      this.$electron.shell.openExternal(link);
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

#wrapper {
  background: radial-gradient(
    ellipse at top left,
    rgba(255, 255, 255, 1) 40%,
    rgba(229, 229, 229, 0.9) 100%
  );
  height: 100vh;
  padding: 60px 80px;
  width: 100vw;
}

#logo {
  height: auto;
  margin-bottom: 20px;
  width: 420px;
}

main {
  display: flex;
  justify-content: space-between;
}

main > div {
  flex-basis: 50%;
}

.left-side {
  display: flex;
  flex-direction: column;
}

.welcome {
  color: #555;
  font-size: 23px;
  margin-bottom: 10px;
}

.title {
  color: #2c3e50;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 6px;
}

.title.alt {
  font-size: 18px;
  margin-bottom: 10px;
}

.doc p {
  color: black;
  margin-bottom: 10px;
}

.doc button {
  font-size: 0.8em;
  cursor: pointer;
  outline: none;
  padding: 0.75em 2em;
  border-radius: 2em;
  display: inline-block;
  color: #fff;
  background-color: #4fc08d;
  transition: all 0.15s ease;
  box-sizing: border-box;
  border: 1px solid #4fc08d;
}

.doc button.alt {
  color: #42b983;
  background-color: transparent;
}
</style>
