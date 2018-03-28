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
    setDataService.editIntervento($scope.id,$scope.formI.tipo.id,$scope.formI.indirizzo,$scope.formI.contatto,$scope.formI.note,added,removed,
      $uibModalInstance.close)
  }
}])
