/**
 * Created by shuding on 5/23/16.
 * <ds303077135@gmail.com>
 */

const electron = require('electron');
const {app} = electron;
const {BrowserWindow} = electron;

let win;

function createWindow() {
  win = new BrowserWindow({
    width:          960,
    height:         850,
    minWidth:       500,
    minHeight:      400,
    titleBarStyle:  'hidden',
    title:          'Innsbruck',
    webPreferences: {
      scrollBounce: true
    }
  });

  let app = require('../app')({
    electron: true
  });
  app.listen(3000, () => {
    "use strict";
    win.loadURL(`http://localhost:3000`);
  });

  //win.webContents.openDevTools();

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
