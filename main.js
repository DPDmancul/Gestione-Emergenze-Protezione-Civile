const electron = require('electron')
const path = require('path')
// Module to control application life.
const app = electron.app
if(require('electron-squirrel-startup')) /*return app.quit()*/ app.exit()
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const {Menu, MenuItem,shell} = require('electron')

global.ports = {}
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  splashWindow = new BrowserWindow({width: 400, height: 280,resizable:false,useContentSize:true,title:'Protezione Civile', skipTaskbar:true,parent: mainWindow, frame: false, center:true,alwaysOnTop:true,devTools:false,javascript:false})
  splashWindow.loadURL(`file://${__dirname}/loading.html`)

  function setLoadingInfo(text){console.log(/*splashWindow.webContents.send('setLoadingInfo', */text)}//+' ...')}

  setLoadingInfo('Avvio map renderer')
  /*const map_renderer =*/ require('./map_renderer')((port)=>global.ports['map_renderer']=port)
//   global.ports['map_renderer']=map_renderer.port


  setLoadingInfo('Caricando le librerie')
  const db = global.db = require('./db/database')
//   global.db=db
  const windower = global.windower = require('./newWindow')

  setLoadingInfo('Avviando il database')
  db.start_db((/*callback*/)=>{
    setLoadingInfo('Apertura della finestra principale')
    mainWindow = new BrowserWindow({width: 1200, height: 700,title:'Gestione emergenze', icon: path.join(__dirname,'icon.ico'),show: false /*,devTools:false TODOREMOVE*/})
    global.mainWindow=mainWindow

      mainWindow.on('closed', function () {
        db.close()
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        BrowserWindow.getAllWindows().forEach((e)=>e.close())
        mainWindow = null
      })
      const template = [{
          label: '&App',
          submenu: [{label: 'Informazioni',role: 'about', accelerator: "CmdOrCtrl+I", click () { __about= new BrowserWindow({parent: mainWindow, modal: true, show: true,width: 400, height: 300, skipTaskbar:true, center:true, devTools:false, javascript:false,maximizable:false,resizable:false});__about.webContents.on('new-window', function(e, url) {e.preventDefault();shell.openExternal(url)});__about.setMenu(null);__about.loadURL(`file://${__dirname}/about.html`) }},{type: 'separator'}, {label: 'Esci',role: 'quit'}/*TODO REMOVE*/,{label:'Diagnosi (non usare)',role:'toggledevtools'}]
        },{
          label: '&Strumenti',
          role: 'settings',
          submenu: [{label: 'Tutte le emergenze', click () {mainWindow.webContents.send('open', 'storicoView')},accelerator: "CmdOrCtrl+E"},{label: 'Gestione risorse', click () {mainWindow.webContents.send('open', 'resourcesManagment')},accelerator: "CmdOrCtrl+R"},{type: 'separator'},{label: 'Impostazioni', click () {mainWindow.webContents.send('open', 'settings')},accelerator: "CmdOrCtrl+I"}]
        },{
          label: '&Finestra',
          role: 'window',
          submenu: [{label: 'Minimizza',role: 'minimize'}, {label: 'Chiudi',role: 'close'}]
        }
      ]
      const menu = Menu.buildFromTemplate(template)
      Menu.setApplicationMenu(menu)
      mainWindow.setMenu(menu)
      mainWindow.loadURL(`file://${__dirname}/app/Home/app.html`)
      mainWindow.webContents.on('did-finish-load', function () {
      mainWindow.show();
      setLoadingInfo('Caricamento completato')
      splashWindow.close()
      spalshWindow=null
    })
  },setLoadingInfo)

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
  app.quit()
  // }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
