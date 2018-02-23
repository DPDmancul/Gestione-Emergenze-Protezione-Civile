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
