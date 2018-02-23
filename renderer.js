require('angular-simple-logger')
require('angular-ui-bootstrap')
require('leaflet')
require('ui-leaflet')
require('ui-select')
require('moment')
require('angular-moment')
const {ipcRenderer,remote}=require('electron')
const {dialog} = remote
const db = remote.getGlobal('db')
const ports = remote.getGlobal('ports')
const windower = remote.getGlobal('windower')
const mainWindow = remote.getGlobal('mainWindow')
var app = angular.module('GestioneEmergenze', ['nemLogging','ui-leaflet','ui.bootstrap','angularMoment','ui.select'])
app.run(['amMoment','$rootScope',function(amMoment,$rootScope) {
  amMoment.changeLocale('it')
  $rootScope.elencabile = function (value){
    if(value.elencabile === undefined)
      return value.value.elencabile
    return value.elencabile
  }
  $rootScope.newTagTransform = function(tag){
   return {id:-1,value:[tag,true]}
  }
}])
app.filter('todeg', function () {
  return function (item) {
    gra=Math.floor(item)
    min_gr=(item-gra)*60
    min=Math.floor(min_gr)
    sec=(min_gr-min)*60
    return gra+'° '+min+'\' '+sec.toFixed(2)+'\'\''
  }
})

app.controller("AdminController", ['$scope','getDataService','locals','setDataService','$uibModalInstance',function($scope,getDataService,locals,setDataService,$uibModalInstance) {
  getDataService.getResources($scope,()=>$scope.$digest())
  $scope.ok = ()=>
    setDataService.editResources($scope.arrays,()=>
      getDataService.update(locals.scope,()=>
        $uibModalInstance.close()
      )
    )

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel')
  }
  $scope.addItem= function(i){
    if($scope.new[i]!='')
      $scope.arrays[i].push({id:-1,nome:$scope.new[i],original:$scope.new[i],flag:'none'})
    $scope.new[i]=''
  }
  $scope.new=['','','','']
  $scope.titles=['Tipi di intervento','Volontari','Attrezzatura','Mezzi']

  $scope.remove=function(e){
      if(e.flag!='r')
        e.flag='r'
      else
        if(e.nome!=e.original)
          e.flag='e'
        else
          e.flag='none'
  }
  $scope.edit=function(e){
    if(e.flag=='e'){
      e.nome=e.original//restore
      e.flag='none'
    }
    else if(e.flag=='ec')//editing in corso
      if(e.nome!=e.original)
        e.flag='e'
      else
        e.flag='none'
    else
      e.flag='ec'
  }
}])
app.controller("HomeController",['$scope','$uibModal','leafletData','getDataService','setDataService','$filter',function($scope,$uibModal,leafletData,getDataService,setDataService,$filter) {

  ipcRenderer.on('open', function(event, what) {
      switch(what){
        case 'resourcesManagment':$scope.openAdmin();break
        case 'storicoView':$scope.storicoView=true;$scope.$broadcast('open.storicoView');$scope.$digest();break
        case 'settings':$scope.openSettings();break
      }
    })

  $scope.newI=false
  $scope.newMarker=false
  $scope.MOVER={id:false,iid:false}
  $scope.storicoView=false
  $scope.advancedStoricoView=false
  $scope.storicoRiepilogo=false
  var donTmarker =true
  var __temp_marker='__temp_marker'
  $scope.formI={}
  getDataService.init($scope,()=>{createMarkers();$scope.$digest()})
  $scope.today = new Date()
  $scope.model={q:'',fy:false,y:parseInt($filter('date')($scope.today, 'y'))} //per lo storico

  $scope.markers={}

  var red_icon={
    iconUrl: '../img/red.svg',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  }
  var gray_icon={
    iconUrl: '../img/gray.svg',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  }
  var blue_icon= {
    iconUrl: '../img/blue.svg',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  }
  $scope.__utils={red_icon:red_icon,gray_icon:gray_icon,blue_icon:blue_icon}

  function createMarkers(){
    $scope.markers={}
    $scope.emergenze.forEach(function(ep,i){
      ep.interventi.forEach(function(e,j){
        $scope.markers[ep.id+'@'+e.id]={
          lat: e.x,
          lng: e.y,
          title:e.nome,
          getMessageScope:()=>$scope,
          message:  '<h4>'+e.nome+' <small>- '+(e.tipo?($scope.tipi[e.tipo-1].nome):e.altro)+'</small> <button title="Modifica" type="button" ng-click="editI(emergenze['+i+'].interventi['+j+'])" class="btn"><span class="glyphicon glyphicon-edit"></span><button title="Sposta" type="button" ng-click="moveI(\''+ep.id+'@'+e.id+'\','+e.id+')" class="btn"><span class="glyphicon glyphicon-move"></span></button></h4>\
                    <h5><small>Emergenza: </small>'+ep.nome+'<small> del </small>{{\''+ep.data+'\'|amDateFormat:\'l\'}}</h5>\
                    <h5>'+e.indirizzo+' - '+e.contatto+'</h5>\
                    segnalazione: {{\''+e.seg+'\'|amDateFormat:\'LLLL\'}}<br>'+
                    (e.inizio==undefined?'<button type="button" ng-click="stepIntervento('+e.id+')" class="btn btn-success"><span class="glyphicon glyphicon-ok"></span>  Prendi in carico</button>':'inizio: {{\''+e.inizio+'\'|amDateFormat:\'LLLL\'}}<br>')+
                    (e.fine==undefined?(e.inizio==undefined?'':'<button type="button" ng-click="stepIntervento('+e.id+')" class="btn btn-danger"><span class="glyphicon glyphicon-flag"></span>  Fine intervento</button>'):'fine: {{\''+e.fine+'\'|amDateFormat:\'LLLL\'}}')+
                    '<h5>{{'+e.x+'|todeg}}, {{'+e.y+'|todeg}}</h5>\
                    <b>volontari</b>:\
                    <span ng-repeat="r in emergenze['+i+'].interventi['+j+'].volontari track by $index">\
                      {{volontari[r-1].nome}}{{$last?\'\':\',\'}} \
                    </span>\
                    <br><b>attrezzatura</b>:\
                    <span ng-repeat="r in emergenze['+i+'].interventi['+j+'].attrezzatura track by $index">\
                      {{attrezzatura[r-1].nome}}{{$last?\'\':\',\'}} \
                    </span>\
                    <br><b>mezzi</b>:\
                    <span ng-repeat="r in emergenze['+i+'].interventi['+j+'].mezzi track by $index">\
                      {{mezzi[r-1].nome}}{{$last?\'\':\',\'}} \
                    </span>',
          compileMessage: true,
          focus: false,
          draggable: false,
          icon: e.fine==undefined?blue_icon:gray_icon,
          fine:e.fine
        }
      })
    })
  }

  var __last_gotoi=null
  var __last_gotoIstate=null
  $scope.gotoi=function(id){
    //leafletData.getMap('mainMap').then((map)=>map.closePopup())
    //$scope.markers[id].focus=true //non fa il $digest
    leafletData.getMap('mainMap').then((map)=>{
      if(__last_gotoi!==null&&__last_gotoIstate!==null)
        __last_gotoi.setIcon(L.icon(__last_gotoIstate?blue_icon:gray_icon))
      map.eachLayer((layer)=>{
        if(layer instanceof L.Marker && layer.options.title===$scope.markers[id].title && layer.options.lat===$scope.markers[id].lat && layer.options.lng===$scope.markers[id].lng){
          __last_gotoi=layer
          __last_gotoIstate=$scope.markers[id].fine==undefined
          layer.togglePopup()
          layer.setIcon(L.icon(red_icon))
        }
      })
    })
    $scope.center.lat=$scope.markers[id].lat+(3E9/Math.pow($scope.center.zoom,10))
    $scope.center.lng=$scope.markers[id].lng
  }

  $scope.update=()=>getDataService.getEmergenze($scope,()=>{createMarkers();$scope.$digest()})

  $scope.addEmergency=function(){
    $uibModal.open({
      templateUrl: 'NewEdialog.html',
			controller: ['$scope','$uibModalInstance',function($scope,$uibModalInstance){
        $scope.ok = function () {
          $uibModalInstance.close($scope.name)
        }
        $scope.cancel = function () {
          $uibModalInstance.dismiss('cancel')
        }
        $scope.name=''
      }],
      backdrop: 'static'
    }).result.then(function(name){
      db.addE(name)
      $scope.update()
    })
  }
  $scope.editI=function(int){
    $uibModal.open({
      templateUrl: 'editIdialog.html',
      controller: 'EditIController',
      backdrop: 'static',
      resolve: {locals: function(){return {id:int.id,scope:$scope}}}
    }).result.then(function(name){
      leafletData.getMap('mainMap').then(map=>{
        map.closePopup()
        $scope.update()
      })
    })
  }
  var movingI=false
  $scope.moveI=function(id,iid){
    if(movingI)
      return
    movingI=true
    __temp_marker=id
    $scope.markers[id].draggable=true
    $scope.markers[id].icon=red_icon
    $scope.markers[id].message=null
    $scope.MOVER={id:id,iid:iid}
  }
  $scope.saveMoveI=function(write){
    if(write)
      db.moveI($scope.MOVER.iid,$scope.markers[$scope.MOVER.id].lat,$scope.markers[$scope.MOVER.id].lng,()=>getDataService.getEmergenze($scope,()=>{$scope.saveMoveI(false);$scope.$digest()}))
    $scope.MOVER.id=false
    createMarkers()
    movingI=false
  }


  var __admin_opened=false
  $scope.openAdmin=function(){
    if(__admin_opened)
      return
    __admin_opened=true
    let __modal=$uibModal.open({
      templateUrl: '../Admin/AdminDialog.html',
      controller: 'AdminController',
      backdrop: 'static',
      resolve: {locals: function(){return {scope:$scope}}}
    })
    __modal.result.then(function(){
      $scope.update()
    })
    __modal.closed.then(function(){
      __admin_opened=false
    })
  }//()

  var __settings_opened=false
  $scope.openSettings=function(){
    if(__settings_opened)
      return
    __settings_opened=true
    let __modal=$uibModal.open({
      templateUrl: '../Settings/SettingsDialog.html',
      controller: 'SettingsController',
      backdrop: 'static',
      size: 'lg',
      resolve: {locals: function(){return {scope:$scope,center:$scope.center}}}
    })
    __modal.closed.then(function(){
      __settings_opened=false
    })
  }

  var closeEmergencyById=(id)=>{
    dialog.showMessageBox(mainWindow,{type:"warning", buttons:['Annulla','CHIUDI'], defaultId:1, title:'Conferma chiusura', message:'Premendo su CHIUDI chiuderai l\'emergenza', detail:'In caso di necessità è possibile riaprire un\'emergenza dallo storico'},function(r){
      if(r==1){
        db.closeE(id)
        $scope.$apply(function(){ //$apply forza il reloading della parte modificata al suo interno. Reloading bloccato dal messagebox
          $scope.update()
        })
      }
    })
  }

  $scope.closeEmergency=function(index){
    for(let i=0; i<$scope.emergenze[index].interventi.length; ++i)
      if($scope.emergenze[index].interventi[i].fine==undefined){
        dialog.showErrorBox('Errore','Non è possibile chiudere questa emergenza:\n ci sono degli interventi non ancora conclusi')
        return false
      }
    closeEmergencyById($scope.emergenze[index].id)
  }
  $scope.addIntervento=function(){
    __temp_marker='__temp_marker'
    $scope.newMarker=true
    $scope.newI=true
  }
  $scope.cancelIntervento=function(){
    donTmarker =true
    $scope.newI=false
    $scope.formI={}
    createMarkers()
  }
  $scope.saveIntervento=function(){
    setDataService.addIntervento($scope.formI.nome,$scope.formI.indirizzo,$scope.formI.contatto,$scope.markers[__temp_marker].lat,$scope.markers[__temp_marker].lng,$scope.formI.emergenza.id,$scope.formI.tipo.value.id,$scope.formI.mezzi,$scope.formI.volontari,$scope.formI.attrezzatura)
    //A livello teorico l'istruzione seguente potrebbe partire prima che la precedente termini (mysql è asincrono), ma non si è mai verificato: CONTROLLARE BENE se è sempre così o se ho sempre avuto fortuna nelle prove
    getDataService.getEmergenze($scope,()=>{$scope.cancelIntervento();$scope.$digest()})
  }
  $scope.stepIntervento=function(id){
    db.stepIStatus(id,()=>
      leafletData.getMap('mainMap').then(map=>{
        map.closePopup()
        $scope.update()
      })
    )
  }

  $scope.putAltroEnd = function(v1, v2) {
    if (v1.index==0)
      return 1
    if (v2.index==0)
      return -1
    return 0
  }
  $scope.addMarker=function(){
    if(__last_gotoi!=null){
      __last_gotoi.icon={}
      __last_gotoi.focus=false}
    donTmarker=false
  }
  $scope.$on('leafletDirectiveMap.mainMap.click', function(e,leafletPayload){
    if (donTmarker)
      return
    var position = leafletPayload.leafletEvent.latlng
    $scope.markers[__temp_marker]={
      lat: position.lat,
      lng: position.lng,
      title:$scope.formI.nome,
      message: 'Trascinami nel punto esatto',
      focus: true,
      draggable: true,
      icon: red_icon
    }
    $scope.newMarker=false
  })
  $scope.$on('leafletDirectiveMarker.mainMap.dragend', function(e,leafletPayload){
    var position = leafletPayload.leafletObject.getLatLng()
    $scope.markers[__temp_marker].lat=position.lat
    $scope.markers[__temp_marker].lng=position.lng
   })
}])

app.controller('MapController',['$scope', function($scope) {
    $scope.events={map:{enable:['dragend','click'],logic:'emit'}}
    $scope.defaults= {
        maxZoom: 17,
        minZoom: 12,
        attributionControl: false
    }
    $scope.maxbounds={
      southWest: {
        lat: 45.5275,
        lng: 11.7279
      },
      northEast: {
          lat: 46.6984,
          lng: 14.5184
      }
    }
    /*$scope.confini ={
        data: require('./confini.json'),
        style: {
            weight: 2,
            // opacity: 1,
            // fillColor:'white',
            color: 'black',
            // dashArray: '3',
            fillOpacity: 0
        }
    }*/
    $scope.layers={
      baselayers: {
         stradale: {
           name: 'Stradale',
					 url: '../../stradale/{z}/{x}/{y}.png',//'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
           type: 'xyz'
         },
         satellitare: {
           name: 'Satellitare',
           url: 'http://127.0.0.1:'+ports['map_renderer']+'/satellitare/{z}/{x}/{y}.jpg',//'../../satellitare/{z}/{x}/{y}.png',
           type: 'xyz'
         },
         ibrido: {
          name: 'Ibrido',
          type: 'group',
          layerOptions: {
            layers: {
              sat:{
                name: 'Ibrido_sat',
								url: 'http://127.0.0.1:'+ports['map_renderer']+'/satellitare/{z}/{x}/{y}.jpg',
                type: 'xyz'
              },
              strad:{
                name:'Ibrido_strad',
                type: 'xyz',
							 url: '../../stradale/{z}/{x}/{y}.png',//'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
                layerParams: {
                  opacity: 0.40
                }
              }
            }
          }
        }
     }
  }
}])

app.controller("EditIController", ['$scope','getDataService','setDataService','$uibModalInstance','locals','getDataService',function($scope,getDataService,setDataService,$uibModalInstance,locals,getDataService) {
  $scope.id=locals.id
  $scope.tipi=locals.scope.tipi
  $scope.volontari=locals.scope.volontari
  $scope.attrezzatura=locals.scope.attrezzatura
  $scope.mezzi=locals.scope.mezzi
  $scope.res={volontari:[],mezzi:[],attrezzatura:[]}
  $scope.formI={nome:'',emergenza:'',tipo:1,altro:'',indirizzo:'',contatto:''}

  let added=[]
  let removed=[]
  let status=[['invalid'],['invalid'],['invalid']] //'invalid' al'ê un segnepuèst parçeche i arrays a tàchin dal indiç numar 1

  db.getI($scope.id,gettedI=>{
    ;['volontari','attrezzatura','mezzi'].forEach((e,i)=>$scope[e].forEach((r)=>status[i].push('none')))
    $scope.formI=gettedI
    $scope.formI.tipo=$scope.tipi[gettedI.tipo-1] //array al tache di 0; DB al tache di 1
    ;['volontari','mezzi','attrezzatura'].forEach((r)=>{$scope.formI[r].forEach((e)=>{$scope.res[r].push($scope[r][e-1])})})
    $scope.$digest()
  })

  $scope.add=(list,id)=>{
    if(status[list][id]=='none')
      return status[list][id]='added'
    if(status[list][id]=='removed')
      status[list][id]='none'
  }
  $scope.remove=(list,id)=>{
    if(status[list][id]=='added')
      return status[list][id]='none'
    if(status[list][id]=='none')
      status[list][id]='removed'
  }

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel')
  }
  $scope.save = function(){
    status.forEach((e,i)=>e.forEach((r,j)=>{
      if(r=='added')
        added.push([i,j])
      if(r=='removed')
        removed.push([i,j])
    }))
    setDataService.editIntervento($scope.id,$scope.formI.tipo.id,$scope.formI.indirizzo,$scope.formI.contatto,added,removed,
      $uibModalInstance.close)
  }
}])

app.controller("SettingsController", ['$scope','getDataService','locals','setDataService','$uibModalInstance',function($scope,getDataService,locals,setDataService,$uibModalInstance) {
  $scope.data={}
  $scope.set=(col)=>{db.set_pref(col,$scope.data[col].val);$scope.data[col].saved=true}
  ;['Gruppo'].forEach(col=>$scope.data[col]={val:db.get_pref(col),saved:true})
  $scope.edit=(col)=>$scope.data[col].saved=false

  $scope.set_map=()=>{
    db.set_pref('lat',locals.center.lat)
    db.set_pref('lng',locals.center.lng)
    db.set_pref('zoom',locals.center.zoom)
  }

  $scope.do_backup=()=>
    dialog.showOpenDialog(mainWindow,{
      title:'Seleziona la cartella dove salvare il backup',
      buttonLabel:'Salva qui',
      properties:['openDirectory']
    },filePaths=>db.backup(filePaths[0],()=>new Notification('Gestione Emergenze\nBackup salvato con successo', {
      body: 'È consigliato copiare il backup su un supporto esterno'
    })))
  $scope.restore_backup=()=>new Notification('Gestione Emergenze', {body:'Contattare lo sviluppatore per questa funzione'})
    /*dialog.showOpenDialog(mainWindow,{
      title:'Seleziona il backup da ripristinare',
      filters: [
        {name: 'Backup', extensions: ['gepcdb']},
      ],
      properties:['openFile']
    },filePaths=>
      dialog.showMessageBox(mainWindow,{
        type:"warning",
        buttons:['Annulla','RIPRISTINA'],
        defaultId:1, title:'Conferma ripristion',
        message:'Premendo su RIPRISTINA il backup verrà ripristinato nel database', detail:'Assicurati che il database sia vuoto prima di procedere'},(r)=>{
      if(r==1)
        db.backupRestore(filePaths[0],()=>{new Notification('Gestione Emergenze\nBackup ripristinato con successo', {});locals.scope.update()})
    }))*/

  $scope.ok = ()=>
    getDataService.init(locals.scope,()=>{
      $uibModalInstance.close();
      locals.scope.$digest()
    })
  /*$scope.cancel = function () {
    $uibModalInstance.dismiss('cancel')
  }*/

}])
app.controller("StoricoController", ['$scope','getDataService','leafletData','$filter',($scope,getDataService,leafletData,$filter)=>{
  $scope.emergenza=null
  $scope.intervento=null
  $scope.emergenze=[]
  $scope.markers={}
  $scope.advancedReady=false
  $scope.advancedUnready=()=>$scope.advancedReady=false
  $scope.advancedQueries={what:null,Volontario:null,Attrezzatura:null,Mezzo:null}
  var __async_update=callback=>{
    $scope.emergenza=$scope.intervento=null
    $scope.$parent.storicoRiepilogo=false
    $scope.$parent.advancedStoricoView=false
    getDataService.listEmergenze(e=>{$scope.emergenze=e;callback(e)})
  }
  var update=()=>__async_update(()=>{$scope.advancedReady=false;$scope.$digest()})
  var getInterventi=(eid)=>getDataService.listInterventi(eid,(i)=>{$scope.interventi=createReturnMarkers(i);$scope.$digest()})
  update()
  $scope.$on('open.storicoView', ()=>update())
  $scope.setEmergenza=id=>{
    __last_gotoi=null
    $scope.intervento=null
    $scope.emergenza=id
    if(!$scope.storicoRiepilogo)
      getInterventi(id)
    else
      $scope.interventi=createReturnMarkers($scope.Ainterventi[id])
  }
  $scope.setIntervento=id=>$scope.intervento=id
  $scope.reopenEmergency=id=>{
    dialog.showMessageBox(mainWindow,{type:"warning", buttons:['Annulla','RIAPRI'], defaultId:1, title:'Conferma riapertura', message:'Premendo su RIAPRI riaprirai l\'emergenza', detail:'Questa operazione è irreversibile: l\'emergenza risulaterà non essere mai stata chiusa'},function(r){
      if(r==1)
        db.reopenE(id,()=>update())
    })
  }
  function createReturnMarkers(interventi){
    $scope.markers={}
    interventi.forEach(function(e,i){
      $scope.markers[e.id]={
        lat: e.x,
        lng: e.y,
        title:e.nome,
        focus: false,
        draggable: false,
        icon: e.fine==undefined?$scope.__utils.blue_icon:$scope.__utils.gray_icon,
        fine:e.fine
      }
    })
    leafletData.getMap('storicoMap').then((map)=>map._onResize())
    return interventi
  }
  var __last_gotoi=null
  $scope.gotoi=function(id){
    if(__last_gotoi!=null){
      $scope.markers[__last_gotoi].icon=$scope.markers[__last_gotoi].fine==undefined?$scope.__utils.blue_icon:$scope.__utils.gray_icon}
    __last_gotoi=id
    $scope.markers[id].icon=$scope.__utils.red_icon
    $scope.center.lat=$scope.markers[id].lat
    $scope.center.lng=$scope.markers[id].lng
  }
  $scope.filterDateE=(e, i, array)=>{
    if (!$scope.model.fy)
      return true
    if (parseInt($filter('date')(e.data, 'y'))<=$scope.model.y)
    if (e.chiusura===null||parseInt($filter('date')(e.chiusura, 'y'))>=$scope.model.y)
      return true
    return false
  }

  //let encodeHTML=str=>str.replace(/[\u00A0-\u9999<>\&]/gim, (i)=>'&#'+i.charCodeAt(0)+';')
  let displayE=(e,unique)=>new Promise(returner=>{
    str=`<h1><small>Emergenza:</small> ${e.nome}</h1><h2>Apertura: ${$filter('amDateFormat')(e.data,'LL')}<br>Chiusura: ${e.chiusura===null?'---':$filter('amDateFormat')(e.chiusura,'LL')}</h2><hr>`
    getDataService.listInterventi(e.id,list=>{
      list.forEach((e)=>{
        str+=`<div style="margin-top:30px"><big><b>Intervento: ${e.nome} (${e.tipo})</b></big><table>`
        str+=`<tr><td>Segnalazione:</td><td>${$filter('amDateFormat')(e.seg,'LL')}</td></tr>`
        str+=`<tr><td>Presa in carico:</td><td>${e.inizio===null?'---':$filter('amDateFormat')(e.inizio,'LL')}</td></tr>`
        str+=`<tr><td>Chiusura:</td><td>${e.fine===null?'---':$filter('amDateFormat')(e.fine,'LL')}</td></tr></table>`
        str+=`<i>${e.indirizzo} - ${e.contatto}</i><br>`
        str+=`Coordinate: ${$filter('todeg')(e.x)}, ${$filter('todeg')(e.y)}<br>`
        ;[['Volontari',e.volontari,$scope.volontari],['Attrezzatura',e.attrezzatura,$scope.attrezzatura],['Mezzi',e.mezzi,$scope.mezzi]].forEach((e)=>{
          str+='<b>'+e[0]+':</b><br><p style="margin:0;margin-left:30px">'
          e[1].forEach((id)=>str+=`${e[2][id-1].nome}<br>`)
          str+='</p>'
        })
        str+='</div>'
      })
      if(unique)
        str+=`</body><div id="pageFooter"><span style="float:left">${e.nome} (${$filter('amDateFormat')(e.data,'LL')})</span><span style="float:right">{{page}}/{{pages}}</span></div>`
      returner(str)
    })
  })
  let printData=async (name,filename,emergences)=>{
    let unique=emergences.length==1
    PAGE=`<html><head><style>html{zoom:1/*par Windows*//*0.7 par Linux*/}</style><head><body><h1>${name}</h1>`
    for(i=0;i<emergences.length;++i)
      PAGE += await displayE(emergences[i],unique)
    if(!unique)
      PAGE+=`</body><div id="pageFooter"><span style="float:left">${name} (${$filter('amDateFormat')(Date.now(),'LL')})</span><span style="float:right">{{page}}/{{pages}}</span></div>`
    PAGE+='</html>'
    windower.pdfTempUri(`${filename}.pdf`,PAGE,{format:'A4',border:'1.5cm',header:{height:'1cm',contents:'<div style="text-align:center">Protezione Civile di '+db.get_pref('Gruppo','stringa')+'</div>'},footer:{height:'1cm'}},(uri)=>windower.PdfWindow({width:900, height:700, title:name , devTools:false, darkTheme:true,vibrancy:'dark'},false,uri))
  }
  $scope.printEmergency=async e=>printData(`Resoconto emergenza ${e.nome} (${e.data})`,`${e.nome}@${$filter('amDateFormat')(e.data,'LL')}`,[e])
  $scope.advancedSearch=()=>{
    $scope.$parent.storicoRiepilogo=true
    getDataService.listEmergenzeAdvanced($scope.advancedQueries,a=>{
      $scope.emergenze=a.e
      $scope.Ainterventi=a.i
      $scope.emergenza=$scope.intervento=null
      $scope.advancedReady=true
      $scope.$digest()
    })
  }
  $scope.printResume=async ()=>printData(`Resoconto ricerca ${$scope.advancedQueries.what} ${$scope.advancedQueries[$scope.advancedQueries.what].nome}`,`${$scope.advancedQueries.what}.${$scope.advancedQueries[$scope.advancedQueries.what].nome}@${Date.now()}`,$filter('filter')($filter('filter')($scope.emergenze,$scope.filterDateE),$scope.model.q))
}])
app.factory('getDataService', function(){
  let __update=async ($scope,callback)=>{
    $scope.tipi = await db.get('tipo')
    $scope.volontari = await db.get('volontario')
    $scope.attrezzatura = await db.get('attrezzatura')
    $scope.mezzi = await db.get('mezzo')
    typeof callback === 'function' && callback()
  }
  let __getE=($scope,callback)=>
    db.getE(false,r=>{$scope.emergenze=r;typeof callback === 'function' && callback(r)})
  return {
    init:function($scope,callback){
      $scope.center={
        zoom:db.get_pref('zoom','intero'),
        lat:db.get_pref('lat','decimale'),
        lng:db.get_pref('lng','decimale')
      }
      $scope.tipi=[]
      $scope.volontari=[]
      $scope.attrezzatura=[]
      $scope.mezzi=[]
      __update($scope,()=>__getE($scope,callback))
    },
    update:__update,
    getEmergenze:__getE,
    listEmergenze:db.getAllE,
    listEmergenzeAdvanced:(a,callback)=>db.getAdvancedEI([a.what,a[a.what]],callback),
    listInterventi:db.getIByE,
    getResources:async ($scope,callback)=>{$scope.arrays=[await db.getR('tipo'),await db.getR('volontario'),await db.getR('attrezzatura'),await db.getR('mezzo')];typeof callback === 'function' && callback()}
  }
})
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
