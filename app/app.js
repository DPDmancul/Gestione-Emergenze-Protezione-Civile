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
