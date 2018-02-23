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
