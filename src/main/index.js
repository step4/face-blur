import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
// import store from '../renderer/store'
// console.log(store.state.pathsData.filePath)

import ffmpegStatic from 'ffmpeg-static-electron'

import ffmpeg from 'fluent-ffmpeg'
ffmpeg.setFfmpegPath(ffmpegStatic.path)

// import * as canvas from 'canvas'

// import * as faceapi from 'face-api.js'

// // patch nodejs environment, we need to provide an implementation of
// // HTMLCanvasElement and HTMLImageElement, additionally an implementation
// // of ImageData is required, in case you want to use the MTCNN
// const { Canvas, Image, ImageData } = canvas
// faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path')
    .join(__dirname, '/static')
    .replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 800,
    useContentSize: true,
    width: 1280,
    webPreferences: {
      webSecurity: false,
    },
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

// ffmpeg.setFfprobePath('C:\\ffmpeg\\bin\\ffprobe.exe')
console.log(app.getPath('userData'))

const frameFolderPath = path.join(app.getPath('userData'), 'frames')
if (!fs.existsSync(frameFolderPath)) {
  fs.mkdirSync(frameFolderPath)
}

fs.readdir(frameFolderPath, (err, files) => {
  if (err) throw err

  for (const file of files) {
    fs.unlinkSync(path.join(frameFolderPath, file), err => {
      if (err) throw err
    })
  }
})

// store.dispatch('setFramesFolderPath', frameFolderPath)

// ffmpeg.ffprobe('C:\\Users\\chris.RAC115149\\Desktop\\testFaceBlur\\MAH00287.MP4', function(err, metadata) {
//   console.dir(metadata)
// })
// const detections = []

// const options = new faceapi.SsdMobilenetv1Options({
//   minConfidence: 0.3,
// })

ipcMain.on('extractFrames', async (event, videoPath) => {
  var extractFrames = new Promise((resolve, reject) => {
    console.log(videoPath)
    ffmpeg(videoPath)
      .on('error', err => {
        console.log(err)
        reject(err)
      })
      .on('end', function() {
        console.log('Screenshots taken')
        resolve()
      })
      .outputOptions(['-qscale:v 2'])
      .save(path.join(frameFolderPath, 'frame%d.jpg'))
  })
  await extractFrames

  const frameCount = fs.readdirSync(frameFolderPath).length
  console.log(frameCount)

  const videoName = path
    .basename(videoPath)
    .split('.')
    .slice(0, -1)
    .join('')
  // ffmpeg(path.join(frameFolder, 'frame%d.png'))
  //   .format('mp4')
  //   .save(path.join(app.getPath('desktop'), 'test.mp4'))

  event.sender.send('allFramesExtracted', {
    frameFolderPath,
    frameCount,
    videoName,
  })
  // for (let i = 1; i <= frameCount; i++) {
  //   await this.detect(path.join(frameFolderPath, `frame${i}.jpg`), i)
  // }

  // event.sender.sent('allFramesExtracted', detections)
})

// async function detect(src, index) {
//   const img = await canvas.loadImage(src)
//   let det = await faceapi.detectAllFaces(img, options)
//   if (det.length != 0) {
//     det = det.map(ele => {
//       return {
//         x: ele.box.x,
//         y: ele.box.y,
//         width: ele.box.width,
//         height: ele.box.height,
//         score: ele.score,
//       }
//     })
//     // const array = JSON.parse(JSON.stringify(det))

//     detections.push(det)
//   }
// }
