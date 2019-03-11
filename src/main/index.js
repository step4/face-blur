import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'

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
      webSecurity: false
    }
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
console.log(app.getPath('userData'))

ipcMain.on('newFile', async (event, pathToVid) => {
  // event.sender.send('pong', Math.random())
  console.log(pathToVid)
  var frameCount = 0
  var fp = new Promise((resolve, reject) => {
    ffmpeg(pathToVid)
      .on('error', err => {
        reject(err)
      })
      .ffprobe(0, function(err, data) {
        console.log(data)
        resolve(data.streams[0].nb_frames)
      })
  })
  frameCount = await fp
  var fs = new Promise((resolve, reject) => {
    ffmpeg(pathToVid)
      .on('filenames', function(filenames) {
        console.log('Will generate ' + filenames.join(', '))
      })
      .on('end', function() {
        console.log('Screenshots taken')
        resolve()
      })
      .screenshots({
        // Will take screens at 20%, 40%, 60% and 80% of the video
        count: frameCount,
        filename: 'frame-%i.png',
        folder: path.join(app.getPath('userData'), 'frames')
      })
  })
  await fs
  ffmpeg(path.join(app.getPath('userData'), 'frames/frame-%d.png'))
    .format('mp4')
    .save('/Users/chris/Desktop/test.mp4')
})
