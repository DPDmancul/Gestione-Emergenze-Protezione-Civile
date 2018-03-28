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
        icon: icona(e),
        fine:e.fine,
        inizio:e.inizio
      }
    })
    leafletData.getMap('storicoMap').then((map)=>map._onResize())
    return interventi
  }
  function icona(e){return e.fine==undefined?e.inizio==undefined?$scope.__utils.blue_icon:$scope.__utils.red_icon:$scope.__utils.gray_icon}
  var __last_gotoi=null
  $scope.gotoi=function(id){
    if(__last_gotoi!=null)
      $scope.markers[__last_gotoi].icon=icona($scope.markers[__last_gotoi])
    __last_gotoi=id
    $scope.markers[id].icon=$scope.__utils.yellow_icon
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
        if(e.note)
          str+=`<b>Note:</b><br><p style="margin:0;margin-left:30px;white-space:pre-wrap">${e.note}</p>`
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