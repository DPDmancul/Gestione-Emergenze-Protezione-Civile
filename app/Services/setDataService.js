app.factory('setDataService', function(){
  let __editListI=(i,list,fnc)=>Promise.all(list.map(e=>new Promise(resolve =>
    fnc(['volontario','attrezzatura','mezzo'][e[0]],i,e[1],resolve))
  ))
  let addListI=(i,list)=>__editListI(i,list,db.setUse)
  let removeListI=(i,list)=>__editListI(i,list,db.unsetUse)
  return {
    editResources:async function(res,callback){
      await db.setR('tipo',res[0])
      await db.setR('volontario',res[1])
      await db.setR('attrezzatura',res[2])
      await db.setR('mezzo',res[3])
      callback()
    },
    addIntervento:(nome,indirizzo,contatto,x,y,e,tipo,mezzo,vol,attr)=>
      db.addI(nome,indirizzo,contatto,x,y,e,tipo,id=>{
        if(mezzo!=undefined)
          mezzo.forEach(function(e){
            db.setUse('mezzo',id,e.value.id)
          })
        if(vol!=undefined)
          vol.forEach(function(e){
            db.setUse('volontario',id,e.value.id)
          })
        if(attr!=undefined)
          attr.forEach(function(e){
            db.setUse('attrezzatura',id,e.value.id)
          })
      }),
      editIntervento:async (id,tipo,indirizzo,contatto,added,removed,callback)=>{
        await db.editI(id,indirizzo,contatto,tipo)
        await removeListI(id,removed)
        await addListI(id,added)
        callback()
      }
    }
})
