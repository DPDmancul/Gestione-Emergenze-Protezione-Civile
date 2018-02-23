var express = require('express')
var compress = require('compression')
var portfinder = require('portfinder')
var jimp = require('jimp')
var app = express()
app.use(compress())

var CACHEexp = 31556926

app.get('/', function(req,res) {
    res.send('Server per le mappe della Protezione Civile')
})

function sendSat(level,req,res){
	res.setHeader("Cache-Control", "max-age=31556926")
	res.sendFile(__dirname + '/satellitare/'+level+'/'+req.params.x+'/'+req.params.y+'.jpg',{},(err)=>{
		if(err)
			new jimp(256,256,(err,image)=>image.getBuffer( jimp.MIME_JPEG, (err,buff)=>res.send(buff)))
	})
}

//TODO implementare cache lato server?
app.get('/satellitare/13/:x/:y.jpg', (req, res) =>sendSat(13,req,res))
app.get('/satellitare/14/:x/:y.jpg', (req, res) =>sendSat(14,req,res))
app.get('/satellitare/16/:x/:y.jpg', (req, res) =>sendSat(16,req,res))
app.get('/satellitare/17/:x/:y.jpg', (req, res) =>
	jimp.read('http://127.0.0.1:' + exports.port + '/satellitare/16/'+Math.floor(req.params.x/2)+'/'+Math.floor(req.params.y/2)+'.jpg', (err, image)=>{
		if(err) throw err
		res.setHeader('Cache-Control', 'max-age='+CACHEexp)
		var a = req.params.x%2 ,b = req.params.y%2
		image.crop(a?128:0,b?128:0,128,128).scale(2).getBuffer( jimp.MIME_JPEG, (err,buff)=>res.send(buff))
	})
)
app.get('/satellitare/:z/:x/:y.jpg', (req, res) => //per livello 12 e 15
	new jimp(256,256,(err,image)=>
		jimp.read('http://127.0.0.1:' + exports.port + '/satellitare/'+(1*req.params.z+1)+'/'+(2*req.params.x)+'/'+(2*req.params.y)+'.jpg', (err, i1)=>{
			if(err) throw err
			res.setHeader('Cache-Control', 'max-age='+CACHEexp)
			jimp.read('http://127.0.0.1:' + exports.port + '/satellitare/'+(1*req.params.z+1)+'/'+(2*req.params.x)+'/'+(2*req.params.y+1)+'.jpg',(err,i2)=>
				jimp.read('http://127.0.0.1:' + exports.port + '/satellitare/'+(1*req.params.z+1)+'/'+(2*req.params.x+1)+'/'+(2*req.params.y)+'.jpg',(err,i3)=>
					jimp.read('http://127.0.0.1:' + exports.port + '/satellitare/'+(1*req.params.z+1)+'/'+(2*req.params.x+1)+'/'+(2*req.params.y+1)+'.jpg',(err,i4)=>
					image.blit(i1.scale(0.5), 0, 0).blit(i2.scale(0.5), 0, 128).blit(i3.scale(0.5), 128, 0).blit(i4.scale(0.5), 128,128).getBuffer( jimp.MIME_JPEG, (err,buff)=>res.send(buff))
					)
				)
			)
		})
	)
)



// app.get('/stradale/:z/:x/:y', (req, res) => {
// 	res.setHeader('Cache-Control', 'max-age='+CACHEexp)
//
// })

module.exports = (callback) => {
  portfinder.getPort((err, port) => {
    exports.port=port
    app.listen(port)//process.env.PORT || 8001)
    console.log('Map server listening on port '+port)
    if(callback!==null)
      callback(port)
  })
}
