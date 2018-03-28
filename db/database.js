const settings = require('electron-settings')
const mysql = require('mysql')
const path = require('path')
const fs = require('fs')
const BrowserWindow = require('electron').BrowserWindow


function promiser(fnc){
  return new Promise(returner=>fnc(returner))
}

function _DEBUG_first_insert(){
  /*;['Motopompa','Motopompa piccola','Faro','Generatore'].forEach(function (i){exports.add('attrezzatura',i)})
  ;['Jeep','Macchina','Furgoncino','Barca'].forEach(function (i){exports.add('mezzo',i)})
  ;['Tizio','Caio','Sempronio','Pinco','Pallino'].forEach(function (i){exports.add('volontario',i)})
  ;['Allagamento','Sgombero neve','Soccorso in acqua','Viabilità'].forEach(function (i){exports.add('tipo',i)})
  ;['Terremoto','Emergenza fiume','Alluvione'].forEach(function (i){exports.addE(i)})*/
}

function ncheck(table){
  return table!='attrezzatura' && table!='volontario' && table!='mezzo' && table!='tipo'
}
function ncolcheck(col){
  return col!='nome' && col!='elencabile'
}

function trydb (callback){
  /*try{*/
    typeof callback === 'function' && callback()
   /* exports.save()
  }catch(e){
    console.error('Errore nel db: ',e)
    throw e;
    //console.error(e, 'Database ripristinato')
    //db = new sql.Database(fs.readFileSync(dbpath))
  }*/
}

exports.get_pref = function (id/*[,col]*/){
  return settings.get(id)
}
exports.set_pref = (id,value)=>{
  settings.set(id,value)
}

exports.save = function(){
  //NON richiesto per MySql
}
exports.close = function(){
  connection.end()
}
__add=function(table,nome,callback){
  trydb(function(){
    if(ncheck(table))
      return console.error( 'Nome tabella `'+table+'` non ammesso')
    connection.query('INSERT INTO '+table+' VALUES (null,?,1)', [nome],callback)
  })
}
exports.add=function(table,nome,callback){
  if(ncheck(table))
    return console.error( 'Nome tabella `'+table+'` non ammesso')

  connection.query('SELECT id FROM '+table+' WHERE nome=?',[nome],(e,rows,f)=>{
    if(rows.length==1)
      exports.update(table,'elencabile',1,rows[0].id,callback)
    else
      __add(table,nome,callback)
  })
}

__getI=async function(e,callback){
  e.volontari=[]
  e.attrezzatura=[]
  e.mezzi=[]
  e.movable=false
  let dataLocation =[e.volontari,e.attrezzatura,e.mezzi]
  await promiser(returner=>connection.query('SELECT volontario_id AS id FROM isVolontario WHERE intervento_id=? ORDER BY id;SELECT attrezzatura_id AS id FROM isAttrezzatura WHERE intervento_id=? ORDER BY id;SELECT mezzo_id AS id FROM isMezzo WHERE intervento_id=? ORDER BY id', [e.id,e.id,e.id], (e,r,f)=>{
    r.forEach((e,i)=>e.forEach(r=>dataLocation[i].push(r.id)))
    returner()
  }))
  typeof callback === 'function' && callback(e)
  return e
}

exports.getI=function(id,callback){
  connection.query('SELECT A.id AS id,A.nome AS nome,B.nome AS emergenza,indirizzo,seg,x,y,inizio,fine,contatto,tipo_id AS tipo, note FROM intervento AS A INNER JOIN emergenza AS B ON emergenza_id = B.id WHERE A.id=?', [id],(e,r,f)=>typeof callback === 'function' && __getI(r[0],callback))
}

exports.getAllE=function(callback){
  connection.query('SELECT * FROM emergenza ORDER BY data DESC',(e,r,f)=>{
    var obj=[]
    r.forEach(e=>obj.push({id:e.id,nome:e.nome,data:e.data,chiusura:e.chiusura}))
    typeof callback === 'function' && callback(obj)
  })
}
exports.getAdvancedEI=(roba,callback)=>{
  if(roba[1]===undefined||roba[1].id===undefined)
    return callback({e:[],i:[]})

  var iA={}, eA=[]

  connection.query('SELECT DISTINCT intervento.id AS id,\
    intervento.nome AS nome,\
    intervento.indirizzo AS indirizzo,\
    intervento.contatto AS contatto,\
    intervento.altro AS altro,\
    intervento.seg AS seg,\
    intervento.inizio AS inizio,\
    intervento.fine AS fine,\
    intervento.x AS x,\
    intervento.y AS y,\
    emergenza_id ,\
    tipo.nome AS tipo,\
    intervento.note AS note FROM is'+roba[0]+' INNER JOIN intervento ON intervento.id=intervento_id INNER JOIN tipo ON tipo_id=tipo.id WHERE '+roba[0].toLowerCase()+'_id = ?',[roba[1].id],(e,interventi)=>{
    if(e)throw e
    if(interventi===undefined||interventi.length==0)
      return callback({e:[],i:[]})
    let emergenze=[]
    interventi.forEach(e=>emergenze.push(e.emergenza_id))
    connection.query('SELECT DISTINCT * FROM emergenza WHERE id IN (?) ORDER BY data',[emergenze],async (e,r)=>{
      r.forEach(e=>{
        eA.push(e)
        iA[e.id]=[]
      })
      await Promise.all(interventi.map(e=>promiser(returner=>__getI(e,i=>returner(iA[e.emergenza_id].push(i))))))
      callback({e:eA,i:iA})
    })
  })
}

exports.getIByE=async function(eid,callback){
  connection.query('SELECT *,intervento.id AS id, intervento.nome AS nome,tipo.nome AS tipo, note FROM intervento INNER JOIN tipo ON tipo_id = tipo.id WHERE emergenza_id =? ORDER BY seg', [eid],async(e,r,f)=>{
    var obj=[]
    for(i=0;i<r.length;++i)
      obj.push(await __getI(r[i]))
    typeof callback === 'function' && callback(obj)
  })
}
exports.getE=async function(less,callback){
  connection.query('SELECT id,nome,data FROM emergenza WHERE chiusura is null ORDER BY id',async(e,r,f)=>{
    var obj=[]
    for(j=0;j<r.length;++j){
      e=r[j]
      if(less)
        obj.push({id:e.id,nome:e.nome,data:e.data})
      else
        await promiser(returner=>connection.query('SELECT id,nome,indirizzo,seg,x,y,inizio,fine,contatto,tipo_id AS tipo, note FROM intervento WHERE emergenza_id=? ORDER BY id',[e.id],async(err,r,f)=>{
          var i=[]
          for(k=0;k<r.length;++k)
            i.push(await __getI(r[k]))
          obj.push({id:e.id,nome:e.nome,data:e.data,interventi:i})
          returner()
        }))
    }
    typeof callback === 'function' && callback(obj)
  })
}

exports.addE=function(nome,callback){
  trydb(function(){
    connection.query('INSERT INTO emergenza VALUES (null,?,CURRENT_TIMESTAMP,null)', [nome],callback)
  })
}
exports.closeE=function(id,callback){
  trydb(function(){
    connection.query('UPDATE emergenza SET chiusura = CURRENT_TIMESTAMP WHERE id = ?', [id],callback)
  })
}
exports.reopenE=(id,callback)=>{
  trydb(()=>
    connection.query('UPDATE emergenza SET chiusura = NULL WHERE id = ?', [id],callback)
  )
}

exports.addI=function(nome,indirizzo,contatto,x,y,e,tipo,note,callback){
  trydb(connection.query('INSERT INTO intervento VALUES (null,?,?,?,null,CURRENT_TIMESTAMP,null,null,?,?,?,?,?)', [nome,indirizzo,contatto,x,y,tipo,e,note],(e,r,f)=>{if(e)throw e;typeof callback === 'function' && callback(r.insertId)})
  )
}
exports.editI=(id,indirizzo,contatto,tipo,note,callback)=>{
  return promiser(returner=>trydb(()=>connection.query('UPDATE intervento SET indirizzo=?, contatto=?, tipo_id= ?, note=? WHERE id = ?', [indirizzo,contatto,tipo,note,id],()=>{returner();typeof callback === 'function' && callback()})))
}
let __setUse=function(table,iid,rid,callback){
  if(ncheck(table))
    return callback(console.error( 'Nome tabella `'+table+'` non ammesso'))
  trydb(()=>{
    connection.query('INSERT INTO is'+table.charAt(0).toUpperCase() + table.slice(1)+' VALUES (null,?,?)', [iid,rid],callback)
  })
}
exports.setUse=function(table,iid,rid,callback){
  return promiser(returner=>__setUse(table,iid,rid,()=>{returner();typeof callback === 'function' && callback()}))
}
exports.unsetUse=function(table,iid,rid,callback){
  if(ncheck(table))
    return console.error( 'Nome tabella `'+table+'` non ammesso')
  trydb(()=>{
    connection.query('DELETE FROM is'+table.charAt(0).toUpperCase() + table.slice(1)+' WHERE intervento_id=? AND '+table+'_id=?', [iid,rid],callback)
  })
}
exports.stepIStatus=function(id,callback){
  trydb(function(){
    connection.query('UPDATE intervento SET fine = CURRENT_TIMESTAMP WHERE id = ? AND inizio IS NOT NULL AND fine IS NULL;UPDATE intervento SET inizio = CURRENT_TIMESTAMP ,fine = NULL WHERE id = ? AND inizio IS NULL', [id,id]
    ,callback)
  })
}
exports.moveI=function(id,x,y,callback){
  return promiser(returner=>trydb(function(){
    connection.query('UPDATE intervento SET x = ? , y = ? WHERE id = ?', [x,y,id],(e,r,f)=>{returner(r);callback(e,r,f)})
  }))
}

exports.update=function(table,col,value,id,callback){
  if(ncheck(table))
    return console.error( 'Nome tabella `'+table+'` non ammesso')
  if(ncolcheck(col))
    return console.error( 'Nome colonna `'+col+'` non ammesso')
  trydb(function(){
    connection.query('UPDATE '+table+' SET '+col+' = ? WHERE id = ?', [value,id],(e,r,f)=>{if(e)throw(e);callback(e,r,f)})
  })
}
exports.get=function(table,callback){
  if(ncheck(table))
    return console.error( 'Nome tabella `'+table+'` non ammesso')
  return promiser(returner=>connection.query('SELECT nome,elencabile,id FROM '+table+' ORDER BY id',(e,r,f)=>{returner(r);typeof callback === 'function' && callback(r)}))
}
exports.getR=function(table,callback){
  if(ncheck(table))
    return console.error( 'Nome tabella `'+table+'` non ammesso')
  return promiser(returner=>connection.query('SELECT id,nome,nome AS original,\'none\' AS flag FROM '+table+' WHERE elencabile=1 AND id != 0 ORDER BY id',(e,r,f)=>{returner(r);typeof callback === 'function' && callback(r)}))
}
exports.setR=function(table,data,callback){
  if(ncheck(table))
    return console.error( 'Nome tabella `'+table+'` non ammesso')
  promise = Promise.all(data.map(e=>promiser(returner=>{
    if(e.id==-1){
      if(e.flag=='r')
        returner(false)
      exports.add(table,e.nome,returner)
    }else
      switch(e.flag){
        case 'e':
        case 'ec':
          exports.update(table, 'nome', e.nome,e.id,returner)
          break;
        case 'r':
          exports.update(table, 'elencabile', 0,e.id,returner)
          break;
        default:
          returner(false)
      }
  })))
  promise.then(callback)
  return promise
}

//INIT

var connection = null

exports.setAuth=()=>{console.error('Applicazione non inizializzata [database.js]')}
let global_callback=()=>{}
let setLoadingInfo=()=>{}

function askAuth(callback){
  setLoadingInfo('Configurazione database')
  let window = new BrowserWindow({width: 450, height: 280,useContentSize:true,title:'Protezione Civile | connessione al DB', frame: true, center:true,alwaysOnTop:true,devTools:false,javascript:true})
  exports.setAuth=(host,user,pass,port)=>{
    settings.set('dbAuth', {
      host     : host,
      user     : user,
      password : pass,
      port     : port
    })
    exports.setAuth=()=>{console.error('Credenziali già impostate [database.js]')}
    window.close()
  }
  window.setMenuBarVisibility(false)
  window.loadURL(`file://${__dirname}/askAuth.html`)
  window.on('closed',()=>{window = null;typeof callback === 'function' && callback()})
}

function init_preferences(callback){
  setLoadingInfo('Caricamento impostazioni')
  if(!settings.has('zoom')||!settings.has('lat')||!settings.has('lng')||!settings.has('Gruppo')){
    /*settings.set('zoom',12)
    settings.set('lat',45.866)
    settings.set('lng',13.09)
    settings.set('Gruppo','Rivignano Teor')*/
    setLoadingInfo('Configurazione iniziale')
    let window = new BrowserWindow({width: 1000, height: 600,useContentSize:true,title:'Protezione Civile | configurazione iniziale', frame: true, center:true,alwaysOnTop:true,devTools:false,javascript:true,closable:false})
		window.setMenuBarVisibility(false)
    window.loadURL(`file://${__dirname}/initSettings.html`)
    window.on('closed',()=>{window = null;typeof callback === 'function' && callback()})
  }else typeof callback === 'function' && callback()
}

function try_connect(){
  try{
    auth=settings.get('dbAuth')
    setLoadingInfo('Tentativvo di connessione al database')
    connection = mysql.createConnection({
      host     : auth.host,
      user     : auth.user,
      password : auth.password,
      port     : auth.port,
      multipleStatements: true,
      dateStrings: true,
      //connectTimeout:0,
      supportBigNumbers: true,
      typeCast: (field, next)=>{
        if (field.type == 'BIT' && field.length == 1) { //Boolean
          try{
            return (field.buffer()[0] == '1') // 1 = true, 0 = false
          }catch(e){return false} //vuol dire che vale null
        }
        return next();
      }
    })
    connection.connect(e=>{
      if(e){
        setLoadingInfo('Connessione fallita')
        throw e
      }
      setLoadingInfo('Connessione riuscita')
      setLoadingInfo('Analisi database')
      connection.query('SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = \'gestione_emergenze\'', (error, results, fields)=>{
        if(error)throw error
        if(results===undefined||results.length==0){
          setLoadingInfo('Genero nuovo database')
          connection.query(fs.readFileSync(path.join(__dirname,'dbGenerator.sql'),'utf8'), (e,r,f)=>connection.query('USE gestione_emergenze'))
          setLoadingInfo('Databse generato correttamente')
          _DEBUG_first_insert()
        }else
          connection.query('USE gestione_emergenze')
        init_preferences(global_callback)
      })
    })
  }catch(e){
    setLoadingInfo('Connessione fallita')
    connection=null
    return askAuth(try_connect)
  }
}
function find_connect(){
  setLoadingInfo('Recupero credenziali database')
  if(!settings.has('dbAuth'))
    askAuth(find_connect)
  else
    try_connect()
}
exports.start_db=(callback,setLoadingInfoFnc)=>{
  global_callback=callback
  setLoadingInfo=setLoadingInfoFnc
  find_connect()
}

//BACKUP

exports.backup=(dir,callback)=>{
  let auth = settings.get('dbAuth')
  let date = new Date()
  require('mysqldump')({
      host     : auth.host,
      user     : auth.user,
      password : auth.password,
      port     : auth.port,
      database: 'gestione_emergenze',
      schema:false,
      tables:['tipo','attrezzatura','mezzo','volontario','emergenza','intervento','isAttrezzatura','isMezzo','isVolontario',],
      dest:dir+'/backup_'+date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+'.gepcdb' // destination file
    },err=>{if(err) throw err;callback()})
}
exports.backupRestore=(file_uri,callback)=>connection.query(fs.readFileSync(file_uri,'utf8'),callback)