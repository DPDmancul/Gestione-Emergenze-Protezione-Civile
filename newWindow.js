const BrowserWindow = require('electron').BrowserWindow
const PDFWindow = require('electron-pdf-window')

const path = require('path')
const temp = require('temp').track()
const fs   = require('fs')
var pdf    = require('html-pdf')

exports.icon= path.join(__dirname,'favicon.png')

exports.withTempUri=(name,data,callback)=>{
  temp.open(name, function(err, info) {
    if (err) throw err
    fs.write(info.fd, data,(err)=>{
      if (err) throw err
      fs.close(info.fd,(err)=>{
        if (err) throw err
        callback(`file://${info.path}`)
      })
    })
  })
}
exports.pdfTempUri=(name,html,options,callback)=>{
  temp.open(name, function(err, info) {
    if (err) throw err
    pdf.create(html,options).toStream((err, stream)=>{
			if(err)throw err
      let tempFile = fs.createWriteStream(info.path)
      stream.pipe(tempFile)
      tempFile.addListener('finish',()=>callback(`file://${info.path}`))
    })
  })
}

exports.Window=(params,menuBar)=>{
  if(params['icon']===null||params['icon']===undefined)
    params.icon=exports.icon
  let window = new BrowserWindow(params)
  window.setMenuBarVisibility(menuBar)
  window.on('closed',()=>window = null)
  return window
}
exports.WebWindow=(params,menuBar,url)=>{
  let window = exports.Window(params,menuBar).loadURL(url)
  return window
}
exports.PdfWindow=(params,menuBar,url)=>{
  let window = exports.Window(params,menuBar)
  PDFWindow.addSupport(window)
  window.loadURL(url)
  return window
}