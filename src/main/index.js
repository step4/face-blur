import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'

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
    height: 563,
    useContentSize: true,
    width: 1000,
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

import ffmpegStatic from 'ffmpeg-static-electron'

import ffmpeg from 'fluent-ffmpeg'
ffmpeg.setFfmpegPath(ffmpegStatic.path)
// ffmpeg.setFfprobePath('C:\\ffmpeg\\bin\\ffprobe.exe')
console.log(app.getPath('userData'))

const directory = path.join(app.getPath('userData'), 'frames')
if (!fs.existsSync(directory)) {
  fs.mkdirSync(directory)
}

fs.readdir(directory, (err, files) => {
  if (err) throw err

  for (const file of files) {
    fs.unlinkSync(path.join(directory, file), err => {
      if (err) throw err
    })
  }
})

// ffmpeg.ffprobe('C:\\Users\\chris.RAC115149\\Desktop\\testFaceBlur\\MAH00287.MP4', function(err, metadata) {
//   console.dir(metadata)
// })

const frameFolder = path.join(app.getPath('userData'), 'frames')

ipcMain.on('extractFrames', async (event, pathToVid) => {
  console.log(pathToVid)
  var frameCount = 0

  var lastFrameEnqueued = 0
  var extractFrames = new Promise((resolve, reject) => {
    ffmpeg(pathToVid)
      .on('error', err => {
        console.log(err)
        reject(err)
      })
      .on('end', function() {
        console.log('Screenshots taken')
        resolve(lastFrameEnqueued)
      })
      .on('progress', function(progress) {
        lastFrameEnqueued = progress.frames
      })
      .outputOptions(['-qscale:v 2'])
      .save(path.join(frameFolder, 'frame%d.jpg'))
  })
  frameCount = await extractFrames

  console.log(frameCount)

  // ffmpeg(path.join(frameFolder, 'frame%d.png'))
  //   .format('mp4')
  //   .save(path.join(app.getPath('desktop'), 'test.mp4'))

  event.sender.send('allFramesExtracted', frameCount)
})
