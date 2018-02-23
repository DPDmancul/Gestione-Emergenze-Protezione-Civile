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