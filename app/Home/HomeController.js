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
  var yellow_icon= {
    iconUrl: '../img/yellow.svg',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  }
  $scope.__utils={red_icon:red_icon,gray_icon:gray_icon,blue_icon:blue_icon,yellow_icon:yellow_icon}

  function createMarkers(){
    let temp = $scope.markers[__temp_marker]
    resetMarkers()
    if(temp!=undefined)
      $scope.markers[__temp_marker]=temp
  }

  function resetMarkers(){
		$scope.markers={};
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
                    Segnalazione: {{\''+e.seg+'\'|amDateFormat:\'LLLL\'}}<br>'+
                    (e.inizio==undefined?'<button type="button" ng-click="stepIntervento('+e.id+')" class="btn btn-success"><span class="glyphicon glyphicon-ok"></span>  Prendi in carico</button>':'Inizio: {{\''+e.inizio+'\'|amDateFormat:\'LLLL\'}}<br>')+
                    (e.fine==undefined?(e.inizio==undefined?'':'<button type="button" ng-click="stepIntervento('+e.id+')" class="btn btn-danger"><span class="glyphicon glyphicon-flag"></span>  Fine intervento</button>'):'Fine: {{\''+e.fine+'\'|amDateFormat:\'LLLL\'}}')+
                    '<h5>{{'+e.x+'|todeg}}, {{'+e.y+'|todeg}}</h5>\
                    <b>Volontari</b>:\
                    <span ng-repeat="r in emergenze['+i+'].interventi['+j+'].volontari track by $index">\
                      {{volontari[r-1].nome}}{{$last?\'\':\',\'}} \
                    </span>\
                    <br><b>Attrezzatura</b>:\
                    <span ng-repeat="r in emergenze['+i+'].interventi['+j+'].attrezzatura track by $index">\
                      {{attrezzatura[r-1].nome}}{{$last?\'\':\',\'}} \
                    </span>\
                    <br><b>Mezzi</b>:\
                    <span ng-repeat="r in emergenze['+i+'].interventi['+j+'].mezzi track by $index">\
                      {{mezzi[r-1].nome}}{{$last?\'\':\',\'}} \
                    </span>'+(e.note?'<br><br><b>Note</b>: <span style="white-space:pre-wrap">'+e.note+'</span>':''),
          compileMessage: true,
          focus: false,
          draggable: false,
          icon: icona(e.fine==undefined,e.inizio==undefined),
          fine:e.fine==undefined,inizio:e.inizio==undefined
        }
      })
    })
  }

  var __last_gotoi=null
  var __last_gotoIstate=null
  function icona(ufine,uinizio){return ufine?uinizio?blue_icon:red_icon:gray_icon}
  $scope.gotoi=function(id){
    //leafletData.getMap('mainMap').then((map)=>map.closePopup())
    //$scope.markers[id].focus=true //non fa il $digest
    leafletData.getMap('mainMap').then((map)=>{
      if(__last_gotoi!==null&&__last_gotoIstate!==null)
        __last_gotoi.setIcon(L.icon(icona(__last_gotoIstate[0],__last_gotoIstate[1])))
      map.eachLayer((layer)=>{
        if(layer instanceof L.Marker && layer.options.title===$scope.markers[id].title && layer.options.lat===$scope.markers[id].lat && layer.options.lng===$scope.markers[id].lng){
          __last_gotoi=layer
          __last_gotoIstate=[$scope.markers[id].fine,$scope.markers[id].inizio]
          layer.togglePopup().on("popupclose", e=>layer.setIcon(L.icon(icona($scope.markers[id].fine,$scope.markers[id].inizio))))
          layer.setIcon(L.icon(yellow_icon))
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
    $scope.markers[id].icon=yellow_icon
    $scope.markers[id].message=null
    $scope.MOVER={id:id,iid:iid}
  }
  $scope.saveMoveI=function(write){
    if(write)
			return db.moveI($scope.MOVER.iid,$scope.markers[$scope.MOVER.id].lat,$scope.markers[$scope.MOVER.id].lng,()=>getDataService.getEmergenze($scope,()=>{
				$scope.markers={};$scope.$digest() //a coventin par fa capî a Leaflet che i marcadôrs a cambiin.
				$scope.saveMoveI(false);$scope.$digest()
			}))
    $scope.MOVER.id=false
    __temp_marker=null
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
    resetMarkers()
  }
  $scope.saveIntervento=function(){
    setDataService.addIntervento($scope.formI.nome,$scope.formI.indirizzo,$scope.formI.contatto,$scope.markers[__temp_marker].lat,$scope.markers[__temp_marker].lng,$scope.formI.emergenza.id,$scope.formI.tipo.value.id,$scope.formI.mezzi,$scope.formI.volontari,$scope.formI.attrezzatura,$scope.formI.note,()=>getDataService.getEmergenze($scope,()=>{$scope.cancelIntervento();$scope.$digest()}))
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
      __last_gotoi.setIcon(L.icon(icona(__last_gotoIstate[0],__last_gotoIstate[1])))
      __last_gotoi.closePopup()}
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
      icon: yellow_icon
    }
    $scope.newMarker=false
  })
  $scope.$on('leafletDirectiveMarker.mainMap.dragend', function(e,leafletPayload){
    var position = leafletPayload.leafletObject.getLatLng()
    $scope.markers[__temp_marker].lat=position.lat
    $scope.markers[__temp_marker].lng=position.lng
   })
}])
