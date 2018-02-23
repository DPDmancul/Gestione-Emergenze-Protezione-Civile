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