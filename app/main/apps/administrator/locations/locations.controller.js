/**
 * Created by pg9501 on 29.09.2016.
 */
(function () {
  'use strict';

  angular
    .module('app.administrator.locations')
    .controller('AdministratorLocationsController', AdministratorLocationsController);

  /** @ngInject */
  function AdministratorLocationsController($document,$cookies, $timeout,$window,$rootScope, $scope,$translate, $mdDialog,$http,msUtils,msNavigationService) {

    function initializeNavigator() {
      msNavigationService.saveItem('administration', {
        title : 'ADMINISTRATION ',
        group : true,
        weight: 1,
        hidden: function () {
          return false;
        }
      });

      msNavigationService.saveItem('dweller', {
        title : 'DWELLERS',
        group : true,
        weight: 1,
        hidden: function () {
          return true;
        }

      });
      msNavigationService.saveItem('optimization_goals', {
        title : 'OPTIMIZATION',
        group : true,
        weight: 2,
        hidden: function () {
          return true;
        }
      });
      msNavigationService.saveItem('history', {
        title : 'HISTORY',
        group : true,
        weight: 3,
        hidden: function () {
          return true;
        }
      });
      msNavigationService.saveItem('community', {
        title : 'COMMUNITY',
        group : true,
        weight: 4,
        hidden: function () {
          return true;
        }
      });
      msNavigationService.saveItem('utility-company', {
        title : 'UTILITY COMPANY',
        group : true,
        weight: 5,
        hidden: function () {
          return true;
        }
      });

      msNavigationService.saveItem('dweller', {
        title : 'DWELLERS',
        group : true,
        weight: 1,
        hidden: function () {
          return true;
        }

      });

      msNavigationService.saveItem('energy-management', {
        title : 'ENERGY MANAGEMENT',
        group : true,
        weight: 1,
        hidden: function () {
          return true;
        }
      });

      msNavigationService.saveItem('life-assistant', {
        title : 'LIFE ASSISTANT ',
        group : true,
        weight: 2,
        hidden: function () {
          return true;
        }
      });
    }

    initializeNavigator();

    //update clock time every second on the navigation bar
    $scope.getDate = new Date();
    setInterval(function(){
      $scope.$apply(function(){
        $scope.getDate = new Date();
      });
    }, 1000);

  /*var vm=this;
    vm.floors=[];
    vm.locations=[];
    vm.isSaveDisabled=true;
    vm.isAddDisabled=false;

    GetAllLocations().then(function (locations) {

      console.log("current locations are");
      console.log(locations.locations);
      if(locations.locations!= null)
      vm.locations=locations.locations;

    });

    vm.addNewLocation=function () {

      vm.locations.push("");
      vm.isAddDisabled=true;
    };
    vm.changeLocation=function () {
      vm.isSaveDisabled=false;

    }
    vm.removeLocation=function(location){
      var index=-1;
      for( var i=0;i< vm.locations.length;i++){
        if(vm.locations[i]==location){
          index=i;

          break;
        }
      }
      vm.locations.splice(index,1);
      vm.isSaveDisabled=true;

      if(vm.locations[vm.locations.length-1]!= ""){
        vm.isAddDisabled=false;
      }
      RemoveLocation(location);

    };
    vm.saveLocation=function(location){
      var newItemNo = vm.locations.length-1;
      vm.locations[newItemNo]=location;
     vm.isSaveDisabled=true;
      vm.isAddDisabled=false;
      AddLocation(location) .then(function (isSuccessful) {
        console.log("the result is"+ isSuccessful);
        if(isSuccessful=='true'){
          console.log("add a new location successfully");
        }else{
          console.log("add a new location unsuccessfully");
        }
      });
    };*/

    var vm=this;
    vm.building = {floors:[],rooms:[]};
    vm.newFloorName = "";

   

    var deviceImageLibStorage = window.localStorage.getItem('device-image-library');

    if (deviceImageLibStorage === null || deviceImageLibStorage.length === 0)
    {
      var deviceImages=[{"id":"CHP","name":"µCHP","url":"assets/images/energy-flows/CHP.png"},{"id":"PV","name":"Photovoltaic","url":"assets/images/energy-flows/Photovoltaic.png"},
        {"id":"Washing Machine","name":"Washing Machine","url":"assets/images/energy-flows/WashingMachine.png"},{"id":"Dishwasher","name":"Dishwasher","url":"assets/images/energy-flows/Dishwasher.png"},
        {"id":"Oven","name":"Oven","url":"assets/images/energy-flows/Oven.png"},{"id":"Tumble Dryer","name":"Tumble Dryer","url":"assets/images/energy-flows/TumbleDryer.png"},
        {"id":"Hob Induction","name":"Hob Induction","url":"assets/images/energy-flows/HobInduction.png"},{"id":"Coffee System","name":"Coffee System","url":"assets/images/energy-flows/CoffeeSystem.png"},
        {"id":"Air Conditioner","name":"Air Conditioner","url":"assets/images/energy-flows/AirConditioner.png"},{"id":"Fridge","name":"Fridge","url":"assets/images/energy-flows/Fridge.png"},
        {"id":"Freezer","name":"Freezer","url":"assets/images/energy-flows/Freezer.png"},{"id":"Extractor Hood","name":"Extractor Hood","url":"assets/images/energy-flows/ExtractorHood.png"},
        {"id":"Light_K17","name":"Light_K17","url":"assets/images/energy-flows/Light_off.png"},{"id":"Light_K16","name":"Light_K16","url":"assets/images/energy-flows/Light_off.png"},
        {"id":"Light_K19","name":"Light_K19","url":"assets/images/energy-flows/Light_off.png"},{"id":"Light_K18","name":"Light_K18","url":"assets/images/energy-flows/Light_off.png"},
        {"id":"Light_K20","name":"Light_K20","url":"assets/images/energy-flows/Light_off.png"},{"id":"Light_K21","name":"Light_K21","url":"assets/images/energy-flows/Light_off.png"},
        {"id":"Blind_2","name":"Blind_2","url":"assets/images/energy-flows/Blind_50.png"},{"id":"Blind_3","name":"Blind_3","url":"assets/images/energy-flows/Blind_50.png"},
        {"id":"Blind_4","name":"Blind_4","url":"assets/images/energy-flows/Blind_50.png"},{"id":"Blind_5","name":"Blind_5","url":"assets/images/energy-flows/Blind_50.png"},
        {"id":"Blind_1","name":"Blind_1","url":"assets/images/energy-flows/Blind_50.png"},{"id":"Coffee System_2","name":"Coffee System_2","url":"assets/images/energy-flows/CoffeeSystem.png"},
        {"id":"Air Conditioner_2","name":"Air Conditioner_2","url":"assets/images/energy-flows/AirConditioner.png"},{"id":"Light_2","name":"Light_2","url":"assets/images/energy-flows/Light_off.png"}];

      $window.localStorage.setItem('device-image-library', angular.toJson(deviceImages));
    }

    vm.removeRoomFromFloor=function(floor,room){
     // var index=floor.idRooms.indexOf(roomID);
     // floor.idRooms.splice(index,1);

      var rooms=[];
      for(var i in floor.rooms){

        var roomName= floor.rooms[i].name;
        if(roomName!=room.name){
          rooms.push(roomName);
        }
      }
      var newFloor={name:floor.name,rooms:rooms,admin:vm.admin};

      UpdateFloor(newFloor).then(function (result) {
        console.log(result);
      });

    };

    vm.getRoomById=function (roomId) {
      for(var i in vm.building.rooms){
        var room=vm.building.rooms[i];
        if(room.id==roomId){
          return room.room;
        }
      }
    };


    vm.currentLanuage="en";
    //vm.admin="";

    vm.admin=$cookies.getObject('globals').currentUser.username;

    vm.defaultFloor={"id":10551,"name":"Floor 1","admin":"admin","rooms":[{"id":10567,"name":"Kitchen","devices":["Freezer","Coffee System","Hob Induction","Oven","Extractor Hood","Dishwasher","Blind_3","Tumble Dryer","Washing Machine","Fridge","Light_K19"]},{"id":10568,"name":"Living Room","devices":["Blind_5","Blind_4","Light_K21","Air Conditioner","Light_K20"]},{"id":10569,"name":"Bed Room1","devices":["Light_K16","Blind_1"]},{"id":10570,"name":"Bed Room2","devices":["Blind_2","Light_K17"]},{"id":10571,"name":"Toilet","devices":["Light_K18"]},{"id":10572,"name":"Engineering Room","devices":["PV","CHP"]}]};

    vm.building.floors.push(vm.defaultFloor);

    //window.localStorage.removeItem("stage-storage-Floor_1");
    //window.localStorage.removeItem("stage-storage-tabs");

    var defaultFloorPlanStorage = window.localStorage.getItem('stage-storage-Floor_1');

    if (defaultFloorPlanStorage === null || defaultFloorPlanStorage.length === 0)
    {
      /*GetDefaultFloorPlanStorage().then(function (result) {
        if(result!=null){

          console.log("defaultFloorPlanStorage does not exist!");

          $window.localStorage.setItem('stage-storage-Floor_1', angular.toJson(result));

        }
      });*/
      var defaultValue={"container":"container_Floor_1","width":800,"height":480,"scale":{"x":1.0624169986719787,"y":1.1347517730496455},"backgroundImage":"assets/images/energy-flows/ESHL.png","deviceImages":{"CHP":{"x":725.6308100929615,"y":31.773049645390074,"image":"http://localhost:3000/assets/images/energy-flows/CHP.png","width":43.913235945108454,"height":46.90307328605201,"deviceName":"µCHP","deviceID":"CHP","anchorRadius":7.1084379016625725,"isConfigured":false,"anchorColor":"#ddd"},"PV":{"x":726.6932270916334,"y":405.10638297872345,"image":"http://localhost:3000/assets/images/energy-flows/Photovoltaic.png","width":41.7884019477645,"height":46.90307328605201,"deviceName":"Photovoltaic","deviceID":"PV","anchorRadius":7.1084379016625725,"isConfigured":false,"anchorColor":"#ddd"},"Washing Machine":{"x":341.0358565737052,"y":24.9645390070922,"image":"http://localhost:3000/assets/images/energy-flows/WashingMachine.png","width":37.53873395307658,"height":40.094562647754145,"deviceName":"Washing Machine","deviceID":"Washing Machine","anchorRadius":7.1084379016625725,"isConfigured":false,"anchorColor":"#ddd"},"Dishwasher":{"x":650.199203187251,"y":85.10638297872342,"image":"http://localhost:3000/assets/images/energy-flows/Dishwasher.png","width":37.53873395307658,"height":41.22931442080379,"deviceName":"Dishwasher","deviceID":"Dishwasher","anchorRadius":7.1084379016625725,"isConfigured":false,"anchorColor":"#ddd"},"Oven":{"x":648.074369189907,"y":22.69503546099291,"image":"http://localhost:3000/assets/images/energy-flows/Oven.png","width":34.35148295706065,"height":41.22931442080379,"deviceName":"Oven","deviceID":"Oven","anchorRadius":7.1084379016625725,"isConfigured":false,"anchorColor":"#ddd"},"Tumble Dryer":{"x":342.09827357237714,"y":86.24113475177306,"image":"http://localhost:3000/assets/images/energy-flows/TumbleDryer.png","width":33.28906595838867,"height":37.82505910165485,"deviceName":"Tumble Dryer","deviceID":"Tumble Dryer","anchorRadius":7.1084379016625725,"isConfigured":false,"anchorColor":"#ddd"},"Hob Induction":{"x":579.0172642762284,"y":23.829787234042556,"image":"http://localhost:3000/assets/images/energy-flows/HobInduction.png","width":36.4763169544046,"height":45.76832151300237,"deviceName":"Hob Induction","deviceID":"Hob Induction","anchorRadius":7.1084379016625725,"isConfigured":false,"anchorColor":"#ddd"},"Coffee System":{"x":650.199203187251,"y":297.30496453900713,"image":"http://localhost:3000/assets/images/energy-flows/CoffeeSystem.png","width":36.4763169544046,"height":41.22931442080379,"deviceName":"Coffee System","deviceID":"Coffee System","anchorRadius":7.1084379016625725,"isConfigured":false,"anchorColor":"#ddd"},"Fridge":{"x":650.199203187251,"y":154.3262411347518,"image":"http://localhost:3000/assets/images/energy-flows/Fridge.png","width":37.53873395307658,"height":43.498817966903076,"deviceName":"Fridge","deviceID":"Fridge","anchorRadius":7.1084379016625725,"isConfigured":false,"anchorColor":"#ddd"},"Freezer":{"x":648.074369189907,"y":226.9503546099291,"image":"http://localhost:3000/assets/images/energy-flows/Freezer.png","width":40.72598494909252,"height":41.22931442080375,"deviceName":"Freezer","deviceID":"Freezer","anchorRadius":7.1084379016625725,"isConfigured":false,"anchorColor":"#ddd"},"Extractor Hood":{"x":505.71049136786183,"y":21.560283687943265,"image":"http://localhost:3000/assets/images/energy-flows/ExtractorHood.png","width":34.35148295706065,"height":49.17257683215131,"deviceName":"Extractor Hood","deviceID":"Extractor Hood","anchorRadius":7.1084379016625725,"isConfigured":false,"anchorColor":"#ddd"},"Blind_3":{"x":422.8419654714475,"y":20.425531914893618,"image":"assets/images/energy-flows/Blind_50.png","width":48.16290393979637,"height":52.576832151300245,"deviceName":"Blind_3","deviceID":"Blind_3","anchorRadius":7.1084379016625725,"isConfigured":false,"anchorColor":"#ddd"},"Light_K19":{"x":440.2749003984064,"y":116.22695035460993,"image":"assets/images/energy-flows/Light_off.png","width":50.28773793714033,"height":53.71158392434989,"deviceName":"Light_K19","deviceID":"Light_K19","anchorRadius":6,"isConfigured":false,"anchorColor":"#ddd"},"Air Conditioner":{"x":290.0398406374502,"y":200.85106382978725,"image":"http://localhost:3000/assets/images/energy-flows/AirConditioner.png","width":49.22532093846835,"height":54.84633569739953,"deviceName":"Air Conditioner","deviceID":"Air Conditioner","anchorRadius":7.1084379016625725,"isConfigured":false,"anchorColor":"#ddd"},"Light_K20":{"x":241.16865869853916,"y":302.97872340425533,"image":"assets/images/energy-flows/Light_off.png","width":43.913235945108454,"height":48.037825059101664,"deviceName":"Light_K20","deviceID":"Light_K20","anchorRadius":7.1084379016625725,"isConfigured":false,"anchorColor":"#ddd"},"Light_K21":{"x":470.65073041168654,"y":298.43971631205676,"image":"assets/images/energy-flows/Light_off.png","width":40.72598494909252,"height":46.90307328605201,"deviceName":"Light_K21","deviceID":"Light_K21","anchorRadius":7.1084379016625725,"isConfigured":false,"anchorColor":"#ddd"},"Blind_4":{"x":178.4860557768924,"y":408.5106382978724,"image":"assets/images/energy-flows/Blind_100.png","width":43.913235945108454,"height":49.17257683215131,"deviceName":"Blind_4","deviceID":"Blind_4","anchorRadius":7.1084379016625725,"isConfigured":false,"anchorColor":"#ddd"},"Blind_5":{"x":299.60159362549797,"y":410.78014184397165,"image":"assets/images/energy-flows/Blind_50.png","width":44.97565294378043,"height":50.30732860520095,"deviceName":"Blind_5","deviceID":"Blind_5","anchorRadius":7.1084379016625725,"isConfigured":false,"anchorColor":"#ddd"},"Light_K16":{"x":52.12084993359893,"y":274.95744680851067,"image":"assets/images/energy-flows/Light_off.png","width":39.66356795042054,"height":48.037825059101664,"deviceName":"Light_K16","deviceID":"Light_K16","anchorRadius":6,"isConfigured":false,"anchorColor":"#ddd"},"Blind_1":{"x":54.18326693227091,"y":409.645390070922,"image":"assets/images/energy-flows/Blind_100.png","width":42.850818946436476,"height":46.90307328605201,"deviceName":"Blind_1","deviceID":"Blind_1","anchorRadius":7.1084379016625725,"isConfigured":false,"anchorColor":"#ddd"},"Light_K18":{"x":176.36122177954846,"y":38.58156028368795,"image":"assets/images/energy-flows/Light_off.png","width":42.850818946436476,"height":46.90307328605201,"deviceName":"Light_K18","deviceID":"Light_K18","anchorRadius":7.1084379016625725,"isConfigured":false,"anchorColor":"#ddd"},"Light_K17":{"x":52.058432934926955,"y":166.8085106382979,"image":"assets/images/energy-flows/Light_off.png","width":41.7884019477645,"height":51.442080378250594,"deviceName":"Light_K17","deviceID":"Light_K17","anchorRadius":7.1084379016625725,"isConfigured":false,"anchorColor":"#ddd"},"Blind_2":{"x":44.6215139442231,"y":24.9645390070922,"image":"assets/images/energy-flows/Blind_50.png","width":48.16290393979637,"height":54.84633569739953,"deviceName":"Blind_2","deviceID":"Blind_2","anchorRadius":7.1084379016625725,"isConfigured":false,"anchorColor":"#ddd"}}};
      $window.localStorage.setItem('stage-storage-Floor_1', angular.toJson(defaultValue));
    }

    var defaultFloorPlanTabs = window.localStorage.getItem('stage-storage-tabs');

    if (defaultFloorPlanTabs === null || defaultFloorPlanTabs.length === 0){

      var defaultValue=[{"title":"Floor 1"},{"title":"Floor 2"}];
      $window.localStorage.setItem('stage-storage-tabs', angular.toJson(defaultValue));
    }




    GetFloors(vm.admin).then(function (result) {
      if(result!=null){
        for(var i in result){
          var floor=result[i];
          //console.log("current floor is");
          //console.log(JSON.stringify(floor));
          if(floor.name!=null && floor.name!=vm.defaultFloor.name){
            vm.building.floors.push({
              //id:     msUtils.guidGenerator(),
              id:     floor.id,
              name   : floor.name,
              rooms: floor.rooms
            });
          }
        }
      }
    });

    $rootScope.$on('$translateChangeSuccess', function () {

      if ($translate.use().substring(0, 1) == 'c') {
        vm.currentLanuage = "ch";
      }
      if ($translate.use().substring(0, 1) == 'e') {
        vm.currentLanuage = "en";
      }
      if ($translate.use().substring(0, 1) == 'd') {
        vm.currentLanuage = "de";
      }
    });

    $scope.$on('$viewContentLoaded', function(){
      //Here your view content is fully loaded !!
      if($translate.use().substring(0,1)=='c'){
        vm.currentLanuage="ch";
      }
      if($translate.use().substring(0,1)=='e'){
        vm.currentLanuage="en";
      }
      if($translate.use().substring(0,1)=='d'){
        vm.currentLanuage="de";
      }
    });

    /**
     * Add new Floor
     */
    vm.floorPlanTabs=[];
    vm.addFloor=function(newFloorForm)
    {

      vm.newFloorName=$scope.newFloorForm.$editables[0].scope.$data;
      if ( vm.newFloorName === '' )
      {
        return;
      }

      for(var i in vm.building.floors){
        if(vm.newFloorName===vm.building.floors[i].name){
          var alert = $mdDialog.alert({
            title: 'Attention',
            textContent: 'This floor name has existed!',
            ok: 'Close'
          });

          $mdDialog
            .show( alert )
            .finally(function() {
              alert = undefined;
            });
          return;
        }
      }

      if(isJson(window.localStorage['stage-storage-tabs'])){
        vm.floorPlanTabs=JSON.parse(window.localStorage['stage-storage-tabs']);
      }
      vm.floorPlanTabs.push({ title: vm.newFloorName});

      $window.localStorage.setItem('stage-storage-tabs', angular.toJson(vm.floorPlanTabs));

      var newFloor={name:vm.newFloorName,admin:vm.admin,rooms:[]};
      AddFloor(newFloor).then(function (result) {

        console.log(result);
        if(result!=null){
          vm.building.floors.push({
            id:   result,
            name   : vm.newFloorName,
            rooms: []
          });
        }

      });

      vm.newGroupName = '';
      newFloorForm.$cancel();

    };

    vm.changeFloorName=function (floorForm, floor) {

      var oldFloorName=floor.name;
      floorForm.$save();
      var newFloorName=floor.name;
      var newFloor={id:floor.id, name:floor.name,admin:vm.admin,rooms:floor.rooms};
      UpdateFloor(newFloor).then(function (result) {
        console.log(result);
      });

      if(isJson(window.localStorage['stage-storage-tabs'])){
        vm.floorPlanTabs=JSON.parse(window.localStorage['stage-storage-tabs']);
      }

      for(var i in vm.floorPlanTabs){
        if(vm.floorPlanTabs[i].title===oldFloorName){
          vm.floorPlanTabs[i].title=newFloorName;
          break;
        }
      }
      $window.localStorage.setItem('stage-storage-tabs', angular.toJson(vm.floorPlanTabs));

      var stageJson =JSON.parse(window.localStorage['stage-storage-'+oldFloorName.replace(/ /g,"_")]);

      stageJson.container="container_"+newFloorName.replace(/ /g,"_");
      $window.localStorage.setItem('stage-storage-'+newFloorName.replace(/ /g,"_"), angular.toJson(stageJson));

      window.localStorage.removeItem('stage-storage-'+oldFloorName.replace(/ /g,"_"));


    }

    /**
     * Remove floor
     *
     * @param ev
     * @param floor
     */
    vm.removeFloor=function(ev, floor)
    {
      var confirm = $mdDialog.confirm({
        title              : 'Remove Floor',
        parent             : $document.find('#scrumboard'),
        textContent        : 'Are you sure want to remove this floor?',
        ariaLabel          : 'remove floor',
        targetEvent        : ev,
        clickOutsideToClose: true,
        escapeToClose      : true,
        ok                 : 'Remove',
        cancel             : 'Cancel'
      });
      $mdDialog.show(confirm).then(function ()
      {
        vm.building.floors.splice(vm.building.floors.indexOf(floor), 1);
        var rooms=[];
        for(var i in floor.rooms){
          var room={id:floor.rooms[i].id,name:floor.rooms[i].name,devices:floor.rooms[i].devices};
          rooms.push(room);
        }

        RemoveFloor(floor.id).then(function (result) {

          console.log(result);
          if(result===true || result==='true'){

          }
        });

        if(isJson(window.localStorage['stage-storage-tabs'])){
          vm.floorPlanTabs=JSON.parse(window.localStorage['stage-storage-tabs']);
        }
        var index=0;
        for(var i in vm.floorPlanTabs){
          if(vm.floorPlanTabs[i].title===floor.name){
            index=i;
            break;
          }
        }
        vm.floorPlanTabs.splice(index,1);

        $window.localStorage.setItem('stage-storage-tabs', angular.toJson(vm.floorPlanTabs));

        window.localStorage.removeItem('stage-storage-'+floor.name.replace(/ /g,"_"));


      }, function ()
      {
        // Canceled
      });

    }


    function AddFloor(floor) {
      return $http.post('http://localhost:8087/bos/api/floors/', floor).then(handleSuccess, handleError('Error adding a location'));
    }

    /*function RemoveFloor(floorName,admin) {
      return $http.delete('http://localhost:8087/bos/api/floors/'+ admin+'/'+floorName).then(handleSuccess, handleError('Error removing a location'));
    }*/
    function RemoveFloor(floorID) {
      return $http.delete('http://localhost:8087/bos/api/floors/'+floorID).then(handleSuccess, handleError('Error removing a location'));
    }
    function GetFloors(admin) {
      return $http.get('http://localhost:8087/bos/api/floors/'+admin).then(handleSuccess, handleError('Error getting all locations'));
    }
    function UpdateFloor(floor) {
      return $http.put('http://localhost:8087/bos/api/floors/',floor).then(handleSuccess, handleError('Error adding device groups'));
    }
    function GetDefaultFloorPlanStorage() {
      return $http.get('http://localhost:8087/bos/api/floorplan/').then(handleSuccess, handleError('Error getting all locations'));
    }

   /* function AddLocation(name) {
      return $http.post('http://localhost:8087/bos/api/locations/', name).then(handleSuccess, handleError('Error adding a location'));
    }
    function RemoveLocation(name) {
      return $http.delete('http://localhost:8087/bos/api/locations/'+ name).then(handleSuccess, handleError('Error removing a location'));
    }
    function GetAllLocations() {
      return $http.get('http://localhost:8087/bos/api/locations/').then(handleSuccess, handleError('Error getting all locations'));
    }*/
    function handleSuccess(res) {
      return res.data;
    }
    function handleError(error) {
      return function () {
        return { success: false, message: error };
      };
    }

  }

}
)();
