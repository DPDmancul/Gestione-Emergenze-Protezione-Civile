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