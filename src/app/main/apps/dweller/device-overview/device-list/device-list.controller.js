/**
 * Created by pg9501 on 29.09.2016.
 */
(function () {
  'use strict';

  angular
    .module('app.dweller.device-overview.device-list')
    .controller('DeviceOverviewDeviceListController', DeviceOverviewDeviceListController);

  /** @ngInject */
  function DeviceOverviewDeviceListController($rootScope, $translate,$cookies, $timeout,$window,$http, $scope, $mdDialog,msNavigationService,WAMPService) {

    //update clock time every second on the navigation bar
    $scope.getDate = new Date();
    setInterval(function(){
      $scope.$apply(function(){
        $scope.getDate = new Date();
      });
    }, 1000);
    function initializeNavigator() {
      msNavigationService.saveItem('administration', {
        title : 'ADMINISTRATION ',
        group : true,
        weight: 1,
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
          return false;
        }
      });

      msNavigationService.saveItem('life-assistant', {
        title : 'LIFE ASSISTANT ',
        group : true,
        weight: 2,
        hidden: function () {
          return false;
        }
      });
    }

    initializeNavigator();

    var vm=this;
    $scope.active = true;
    $scope.active1 = true;


   // $scope.sharedDeviceStates=deviceService.deviceStates;

   // $scope.sharedIdleHomeDevice=deviceService.idleHomeDevice;

    $scope.sharedDeviceStates={coldGeneration:[],gasConsumption:[],heatGeneration:[],powerConsumption:[],powerGeneration:[]};


    vm.sharedWampSession=WAMPService.getWAMPsession();
  //  $scope.generateJsonFromJavaObj=deviceService.generateJsonFromJavaObj;

    vm.currentLanuage="en";

    var lightStateStorage = window.localStorage.getItem('stage-storage-light-states');
    vm.lightStates=[];

    var blindStateStorage = window.localStorage.getItem('stage-storage-blind-states');
    vm.blindStates=[];

    $rootScope.$on('$translateChangeSuccess', function () {

      if($translate.use().substring(0,1)=='c'){
        vm.currentLanuage="ch";
      }
      if($translate.use().substring(0,1)=='e'){
        vm.currentLanuage="en";
      }
      if($translate.use().substring(0,1)=='d'){
        vm.currentLanuage="de";
      }
      vm.locations=[];
      vm.floors=[];
      vm.deviceGroups=[];
      vm.getDweller(user.name);
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

      if (lightStateStorage === null || lightStateStorage.length === 0){
        vm.lightStates=[{"Light_K16":"off"},{"Light_K17":"off"},{"Light_K18":"off"},{"Light_K19":"off"},{"Light_K20":"off"},{"Light_K21":"off"},{"Light_2":"off"}];
        $window.localStorage.setItem('stage-storage-light-states', angular.toJson(vm.lightStates));
      }else{
        vm.lightStates=JSON.parse(window.localStorage['stage-storage-light-states']);
      }

      if (blindStateStorage === null || blindStateStorage.length === 0){
        vm.blindStates=[{"Blind_1":"50"},{"Blind_2":"50"},{"Blind_3":"50"},{"Blind_4":"50"},{"Blind_5":"50"}];
        $window.localStorage.setItem('stage-storage-blind-states', angular.toJson(vm.blindStates));
      }else{
        vm.blindStates=JSON.parse(window.localStorage['stage-storage-blind-states']);
      }

    });

    vm.airConditionerTemp=22;
   /* GetAirConditionerTemp().then(function (result) {
      var numb = result.match(/\d/g);
      if(numb!=null){
        vm.airConditionerTemp=result;
      }

    });*/


    var check = function(){
      vm.sharedWampSession=WAMPService.getWAMPsession();
      if (typeof vm.sharedWampSession != 'undefined') {
        // run when condition is met
        vm.sharedWampSession.subscribe('eshl.power_consuming_home_device', powerConsumingHomeDeviceDataHandler);

      }
      else {
        setTimeout(check, 500); // check again in a second
      }
    }
    check();

    vm.arrayPowerConsumption={name:"Power Consumption",children:[]};
    vm.arrayPowerGeneration={name:"Power Generation",children:[]};
    vm.arrayHeatGeneration={name:"Heat Generation",children:[]};
    vm.arrayColdGeneration={name:"Cold Generation",children:[]};
    vm.arrayGasConsumption={name:"Gas Consumption",children:[]};

    function powerConsumingHomeDeviceDataHandler (args) {

      var msgContent = args[0];
      var length=vm.arrayPowerConsumption.children.length;
      vm.arrayPowerConsumption.children.splice(0, length);
      length=vm.arrayPowerGeneration.children.length;
      vm.arrayPowerGeneration.children.splice(0, length);
      length=vm.arrayHeatGeneration.children.length;
      vm.arrayHeatGeneration.children.splice(0, length);
      length=vm.arrayGasConsumption.children.length;
      vm.arrayGasConsumption.children.splice(0, length);
      length=vm.arrayColdGeneration.children.length;
      vm.arrayColdGeneration.children.splice(0, length);
      //var msgContent=JSONObject["msgContent"];

      for(var msg in msgContent) {
        // console.log(msg);
        //  console.log(msgContent[msg]);

        var consumedEnergyTypes=msgContent[msg]["consumedEnegyTypes"];
        var generatedEnergyTypes=msgContent[msg]["generatedEnegyTypes"];

        if(consumedEnergyTypes!=null&&consumedEnergyTypes.includes("ELECTRICITY")){

          var jsonObj=vm.generateJsonFromJavaObj(msgContent[msg],"pCon");
          if(jsonObj.id != null){
            var children=vm.arrayPowerConsumption.children;
            var length=children.length;
            children[length]=jsonObj;
          }
        }


        if(consumedEnergyTypes!=null&&consumedEnergyTypes.includes("GAS")){
          var jsonObj=vm.generateJsonFromJavaObj(msgContent[msg],"gCon");
          if(jsonObj.id != null){
            var children=vm.arrayGasConsumption.children;
            var length=children.length;
            children[length]=jsonObj;
          }
        }

        if(generatedEnergyTypes!=null&&generatedEnergyTypes.includes("ELECTRICITY")){
          var jsonObj=vm.generateJsonFromJavaObj(msgContent[msg],"pGen");

          if(jsonObj.id != null){
            var children=vm.arrayPowerGeneration.children;
            var length=children.length;
            children[length]=jsonObj;
          }
        }
        if(generatedEnergyTypes!=null&&generatedEnergyTypes.includes("HEAT")){
          var jsonObj=vm.generateJsonFromJavaObj(msgContent[msg],"hGen");
          if(jsonObj.id != null){
            var children=vm.arrayHeatGeneration.children;
            var length=children.length;
            children[length]=jsonObj;
          }

        }
        if(generatedEnergyTypes!=null&&generatedEnergyTypes.includes("COLD")){
          var jsonObj=vm.generateJsonFromJavaObj(msgContent[msg],"cGen");
          if(jsonObj.id != null){
            var children=vm.arrayColdGeneration.children;
            var length=children.length;
            children[length]=jsonObj;
          }

        }

        //var length=children.length;

        //  children[length]={"id": JSONObject["deviceName"],"name": JSONObject["deviceName"],"generalInfo":generalInfo,"channels":channelList,"DoFInfo":DoFInfoArray, "value": 524,"inDeviceGroup":0,"type":"pCon","href": "assets/images/energy-flows/"+JSONObject["deviceImage"]+".png"};
      }

      if(vm.arrayPowerGeneration.children.length ==0){
        vm.arrayPowerGeneration.children[0]={"id": "No Device","name": "No Device","generalInfo":"","channels":"","DoFInfo":"", "value": 0,"inDeviceGroup":0,"type":"pGen","href": ""}
      }
      if(vm.arrayHeatGeneration.children.length ==0){
        vm.arrayHeatGeneration.children[0]={"id": "No Device","name": "No Device","generalInfo":"","channels":"","DoFInfo":"", "value": 0,"inDeviceGroup":0,"type":"hGen","href": ""}
      }
      if(vm.arrayPowerConsumption.children.length ==0){
        vm.arrayPowerConsumption.children[0]={"id": "No Device","name": "No Device","generalInfo":"","channels":"","DoFInfo":"", "value": 0,"inDeviceGroup":0,"type":"pCon","href": ""}
      }
      if(vm.arrayGasConsumption.children.length ==0){
        vm.arrayGasConsumption.children[0]={"id": "No Device","name": "No Device","generalInfo":"","channels":"","DoFInfo":"", "value": 0,"inDeviceGroup":0,"type":"gCon","href": ""}
      }
      if(vm.arrayColdGeneration.children.length ==0){
        vm.arrayColdGeneration.children[0]={"id": "No Device","name": "No Device","generalInfo":"","channels":"","DoFInfo":"", "value": 0,"inDeviceGroup":0,"type":"cGen","href": ""}
      }

      //  $scope.sharedDeviceStates={powerConsumption:vm.arrayPowerConsumption.children,powerGeneration:vm.arrayPowerGeneration.children,heatGeneration:vm.arrayHeatGeneration.children,coldGeneration: vm.arrayColdGeneration.children,gasConsumption:vm.arrayGasConsumption.children};

      $scope.sharedDeviceStates.coldGeneration=vm.arrayColdGeneration.children;
      $scope.sharedDeviceStates.heatGeneration=vm.arrayHeatGeneration.children;
      $scope.sharedDeviceStates.powerGeneration=vm.arrayPowerGeneration.children;
      $scope.sharedDeviceStates.powerConsumption=vm.arrayPowerConsumption.children;
      $scope.sharedDeviceStates.gasConsumption=vm.arrayGasConsumption.children;
    }

    function isJson(str) {
      try {
        JSON.parse(str);
      } catch (e) {
        return false;
      }
      return true;
    }

    function isNumber(s) {
      if (s!=null && s!="")
      {
        return !isNaN(s);
      }
      return false;
    }
    vm.generateJsonFromJavaObj=function(deviceJavaObj,energyType){
      var deviceID=deviceJavaObj["uid"];
      var permissions=vm.dweller.permissions;
      var generalInfo=new Array();
      var channelList=new Array();
      var controllerList=new Array();
      var DoFInfoArray=new Array();
      var isInPermission=false;
      for(var i in permissions){
        var permission=permissions[i];
        var devices=permission.devices;
        var operations=permission.operations;
        for(var dev in devices){
          if(deviceID==devices[dev]){
            isInPermission=true;
            if(operations.indexOf("VIEW_DEVICE_GENERAL_INFORMATION")>-1){
              var generalInfoList=deviceJavaObj["deviceGeneralInfoList"];
              //var generalInfo=new Array();
              var pValue=200;
              for(var i in generalInfoList) {
                var info=generalInfoList[i];
                var infoName=info.infoName;
                var infoValue=info.infoValue;
                if(isNumber(infoValue)){
                  infoValue=Math.round(infoValue* 10 ) / 10;
                }
                var infoUnit=info.unit;
                if(infoUnit!=null && infoUnit != ""){
                  generalInfo.push({"infoName":infoName,"infoValue":infoValue,"unit":infoUnit});
                }else{
                  generalInfo.push({"infoName":infoName,"infoValue":infoValue});
                }
              };
            }
            if(operations.indexOf("VIEW_DEVICE_CHANNEL_INFORMATION")>-1 ){
              var deviceChannelList=deviceJavaObj["deviceChannelList"];
              // var channelList=new Array();
              for(var i in deviceChannelList) {
                var channel=deviceChannelList[i];
                var channelName=channel.channelName;
                var channelInfo=channel.channelInfoList;
                //  var actions=channel.actions;
                var channelInfoArray=new Array();
                for(var j in channelInfo){
                  var info=channelInfo[j];
                  var infoName=info.infoName;
                  var infoValue=info.infoValue;
                  if(isNumber(infoValue)){
                    infoValue=Math.round(infoValue* 10 ) / 10;
                  }
                  var infoUnit=info.unit;
                  if(infoUnit!=null && infoUnit != ""){
                    if(infoUnit=='W'){
                      if((energyType=='pCon' && infoValue>0)||(energyType=='pGen' && infoValue<0)){
                        pValue+=infoValue;
                      }

                    }
                    channelInfoArray.push({"infoName":infoName,"infoValue":infoValue,"unit":infoUnit});
                  }else{
                    channelInfoArray.push({"infoName":infoName,"infoValue":infoValue});
                  }
                }

                //  var actionArray=new Array();

                // channelList.push({"channelName":channelName,"channelInfo":channelInfoArray,"actions":actionArray});
                channelList.push({"channelName":channelName,"channelInfo":channelInfoArray});
              }
            }

            if( operations.indexOf("CONTROL_DEVICE")>-1){
              var deviceControllerList=deviceJavaObj["deviceControllerList"];
              for(var i in deviceControllerList) {
                var controller=deviceControllerList[i];
                var controllerName=controller.name;
                var controllerDescription=controller.description;
                var controllerAvailable=controller.available;
                var actions=controller.actionList;
                var actionArray=new Array();
                for(var k in actions){
                  var action=actions[k];
                  var actionName=action.name;
                  var actionDescription=action.description;
                  var widget=action.widget;
                  var actionAvailable=action.available;
                  var commands=action.commandList;
                  var commandArray=new Array();
                  for(var com in commands){
                    var widgetState=commands[com].widgetState;
                    var commandString=commands[com].commandString;
                    commandArray.push({"widgetState":widgetState,"commandString":commandString});
                  }
                  actionArray.push({"actionName":actionName,"description":actionDescription,"widget":widget,"commandList":commandArray,"isAvailable":actionAvailable});
                }
                controllerList.push({"controllerName":controllerName,"description":controllerDescription,"actionList":actionArray,"isAvailable":controllerAvailable});
              }
            }
            if( operations.indexOf("SET_DOF")>-1){
              var DoFInfoList=deviceJavaObj["deviceDoFInfoList"];
              //    var DoFInfoArray=new Array();
              for(var m in DoFInfoList){
                var DoFInfo=DoFInfoList[m];
                var infoName=DoFInfo.infoName;
                var defaultValue=DoFInfo.defaultValue;
                var format=DoFInfo.format;
                var infoUnit=(DoFInfo.unit==null?"":DoFInfo.unit);
                DoFInfoArray.push({"infoName":infoName,"defaultValue":defaultValue,"format":format,"unit":infoUnit});
              }
            }
            break;

          }
        }
        if(isInPermission){
          break;
        }
      }
      var json={};
      if(isInPermission){
        json={"id": deviceJavaObj["uid"],"name": deviceJavaObj["deviceName"],"generalInfo":generalInfo,"channels":channelList,"DoFInfo":DoFInfoArray,"controllers":controllerList, "value": Math.abs(pValue),"inDeviceGroup":0,"type":energyType,"href": "assets/images/energy-flows/"+deviceJavaObj["deviceImage"]+".png"};
      }


      return json;

    }

    var user=JSON.parse(window.localStorage.getItem('user-info'));
    vm.dweller={};
    vm.getDweller=function (userName) {
      GetDweller(userName).then(function (result) {
        if (result != null) {
          vm.dweller = result;
          var permissions = vm.dweller.permissions;
          vm.devices=[];
          for (var i in permissions) {
            var permission = permissions[i];
            for (var j in permission.devices) {
              if(j  === "getById"){
                continue;
              }

              var operations=permission.operations;
              var imgName=permission.devices[j].replace(" ", "");
              var url="assets/images/energy-flows/"+imgName+".png";
              if(imgName.indexOf("Light")>=0){
                url="assets/images/energy-flows/Light_off.png";
              }
              var statusStr="Off";
              if(vm.currentLanuage=='de'){
                statusStr="aus";
              }else if(vm.currentLanuage=='ch'){
                statusStr="关闭";
              }
              vm.devices.push({name:permission.devices[j], url:url, operations:operations, power:0,status:statusStr,location:"",type:[],group:[]});
            }
          }
          /*GetAllLocationsWithDevices().then(function (result) {
            if (result != null) {
              var locations=result;

              for (var i in locations) {
                var location=locations[i];
                vm.locations.push({name:location.name, deviceNum:0,onDeviceNum:0});
                for(var j in vm.devices){
                  var device=vm.devices[j];
                  if(location.devices.indexOf(device.name)>=0){
                    device.location=location.name;
                  }

                }
              }
            }
          });*/

          var index=vm.dweller.name.indexOf("_");
          var adminName='admin';
          if(index>=0){
            var postfix=vm.dweller.name.substring(index);
            adminName+=postfix;
          }
          adminName="admin";
          GetFloors(adminName).then(function (result) {

            if(result!=null) {
              for (var i in result) {
                var floor = result[i];

                var isAccessibleFloor=false;
                for(var j in floor.rooms){
                  var room=floor.rooms[j];
                  for(var d in room.devices){
                    for(var k in vm.devices){
                      if(vm.devices[k].name===room.devices[d]){

                        vm.devices[k].floor=floor.name;
                        vm.devices[k].room=room.name;
                        isAccessibleFloor=true;
                        break;
                      }

                    }
                  }
                }
                if(isAccessibleFloor){
                  vm.floors.push({
                    name   : floor.name,
                    rooms: floor.rooms
                  });
                }



              }
            }
          }

          );

          for (var i in vm.blindStates) {
            var blindID=Object.keys(vm.blindStates[i])[0];
            var initVal=vm.blindStates[i][blindID];
            for(var j in vm.devices) {
              var device = vm.devices[j];
              if(device.name==blindID){
                device.url="assets/images/energy-flows/Blind_"+initVal+".png";
                if(vm.currentLanuage==='en'){
                  switch(initVal){
                    case 0:
                      device.status="Open:100%";
                      break;
                    case 25:
                      device.status="Closed:25%";
                      break;
                    case 50:
                      device.status="Closed:50%";
                      break;
                    case 75:
                      device.status="Closed:75%";
                      break;
                    case 100:
                      device.status="Closed:100%";
                      break;
                    default:
                      break;
                  }
                }else if(vm.currentLanuage==='de'){
                  switch(initVal){
                    case 0:
                      device.status="Auf:100%";
                      break;
                    case 25:
                      device.status="Zu:25%";
                      break;
                    case 50:
                      device.status="Zu:50%";
                      break;
                    case 75:
                      device.status="Zu:75%";
                      break;
                    case 100:
                      device.status="Zu:100%";
                      break;
                    default:
                      break;
                  }
                }else if(vm.currentLanuage==='ch'){
                  switch(initVal){
                    case 0:
                      device.status="打开:100%";
                      break;
                    case 25:
                      device.status="关闭:25%";
                      break;
                    case 50:
                      device.status="关闭:50%";
                      break;
                    case 75:
                      device.status="关闭:75%";
                      break;
                    case 100:
                      device.status="关闭:100%";
                      break;
                    default:
                      break;
                  }
                }
                break;

              }
            }

          }

          /*GetAllBlinds().then(function (result) {
            if (result != null) {
              var blinds=result;
              for(var i in blinds){
                var blind=blinds[i];
                var widget=blind.widget;
                var initVal=widget.initVal;
                for(var j in vm.devices) {
                  var device = vm.devices[j];
                  if(device.name==blind.name){
                    device.url="assets/images/energy-flows/Blind_"+initVal+".png";
                    if(vm.currentLanuage==='en'){
                      switch(initVal){
                        case 0:
                          device.status="Open:100%";
                          break;
                        case 25:
                          device.status="Closed:25%";
                          break;
                        case 50:
                          device.status="Closed:50%";
                          break;
                        case 75:
                          device.status="Closed:75%";
                          break;
                        case 100:
                          device.status="Closed:100%";
                          break;
                        default:
                          break;
                      }
                    }else if(vm.currentLanuage==='de'){
                      switch(initVal){
                        case 0:
                          device.status="Auf:100%";
                          break;
                        case 25:
                          device.status="Zu:25%";
                          break;
                        case 50:
                          device.status="Zu:50%";
                          break;
                        case 75:
                          device.status="Zu:75%";
                          break;
                        case 100:
                          device.status="Zu:100%";
                          break;
                        default:
                          break;
                      }
                    }else if(vm.currentLanuage==='ch'){
                      switch(initVal){
                        case 0:
                          device.status="打开:100%";
                          break;
                        case 25:
                          device.status="关闭:25%";
                          break;
                        case 50:
                          device.status="关闭:50%";
                          break;
                        case 75:
                          device.status="关闭:75%";
                          break;
                        case 100:
                          device.status="关闭:100%";
                          break;
                        default:
                          break;
                      }
                    }

                  }
                }

              }
            }
          });*/

        }

        GetDeviceGroups(vm.dweller.name).then(function (result) {

          for(var i in result){
            var deviceGroup=result[i];
            if(deviceGroup.groupName==null){
              continue;
            }
            vm.deviceGroups.push({name:deviceGroup.groupName,deviceNum:deviceGroup.devices.length,onDeviceNum:0});
            for(var j in deviceGroup.devices){
              var deviceName=deviceGroup.devices[j];
              for(var dev in vm.devices){
                if(vm.devices[dev].name==deviceName){
                  vm.devices[dev].group.push(deviceGroup.groupName);
                  break;
                }
              }
            }
          }

        });

      });
    }

    vm.getDweller(user.name);




    function GetAllLocationsWithDevices() {
      return $http.get('http://localhost:8087/bos/api/locations/devices').then(handleSuccess, handleError('Error getting all locations'));
    }
    function GetAllBlinds() {
      return $http.get('http://localhost:8087/bos/api/dummyDevices/blinds').then(handleSuccess, handleError('Error getting all blinds'));
    }
    function GetDweller(name) {
      return $http.get('http://localhost:8087/bos/api/users/dweller/'+name).then(handleSuccess, handleError('Error getting the dweller'));
    }
    function GetDeviceGroups(dwellerName) {
      return $http.get('http://localhost:8087/bos/api/deviceGroups/'+dwellerName).then(handleSuccess, handleError('Error getting device groups'));
    }
    function handleSuccess(res) {
      return res.data;
    }
    function handleError(error) {
      return function () {
        return { success: false, message: error };
      };
    }

    vm.deviceGroups=[];

    $timeout(function() {

    $scope.$watch(
      "sharedDeviceStates",
      function handleDeviceStateChange( newValue, oldValue ) {
         // console.log( "device state changed!!!");
        //   console.log($scope.sharedDeviceStates.powerConsumption[0].value);
        for(var index in vm.devices){
          var deviceName=vm.devices[index].name;
          vm.devices[index].power=0;
          //vm.devices[index].status='Off';

          if(deviceName.indexOf("Light")>=0){
            for(var i in vm.lightStates) {
              var lightID = Object.keys(vm.lightStates[i])[0];
              if(lightID===deviceName){
                var lightState=vm.lightStates[i][lightID];
                var status='';
                if(lightState==='on'){
                  vm.devices[index].url="assets/images/energy-flows/Light_on.png";
                  vm.devices[index].power=100;
                  if(vm.currentLanuage=='en'){
                    status='On';
                  }else if(vm.currentLanuage=='de'){
                    status='Ein';
                  }else if(vm.currentLanuage=='ch'){
                    status='开启';
                  }
                }else{
                  vm.devices[index].url="assets/images/energy-flows/Light_off.png";
                  if(vm.currentLanuage=='en'){
                    status='Off';
                  }else if(vm.currentLanuage=='de'){
                    status='Aus';
                  }else if(vm.currentLanuage=='ch'){
                    status='关闭';
                  }
                }
                vm.devices[index].status=status;
                break;
              }
            }

            continue;
          }

          var flag=false;
          for(var deviceType in $scope.sharedDeviceStates){
            // console.log("deviceType is: "+deviceType);
            var devices=$scope.sharedDeviceStates[deviceType];
            //  console.log(devices);
            for(var i=0;i<devices.length;i++){
              var device=devices[i];
              if(device['id']==deviceName){
                vm.devices[index].power=0;
                vm.devices[index].url=device['href'];
                var generalInfo=device['generalInfo'];
                for(var g=0;g<generalInfo.length;g++){
                  if(generalInfo[g]['infoName']=='Power'||generalInfo[g]['infoName']=='power'||generalInfo[g]['infoName']=='Leistung'||generalInfo[g]['infoName']=='功率'){
                    vm.devices[index].power=generalInfo[g]['infoValue'];
                  }else if(generalInfo[g]['infoName']=='Location'||generalInfo[g]['infoName']=='location'||generalInfo[g]['infoName']=='Standort'||generalInfo[g]['infoName']=='地点'){
                    vm.devices[index].location=generalInfo[g]['infoValue'];
                  }
                }

                switch (deviceName){
                  case "Air Conditioner":
                    vm.devices[index].type=["Power Consumption","Cold Generation"];
                        break;
                  case "CHP":
                    vm.devices[index].type=["Power Consumption","Power Generation","Heat Generation","Gas Consumption"];
                    break;
                  case "Electric Vehicle":
                    vm.devices[index].type=["Power Consumption","Power Generation"];
                    break;
                  case "PV":
                    vm.devices[index].type=["Power Generation"];
                    break;
                  default:
                    vm.devices[index].type=["Power Consumption"];
                    break;
                }

                var channels=device['channels'];
                for(var j=0;j<channels.length;j++){
                  var channelInfo=channels[j]['channelInfo'];
                  //  console.log(channelInfo);

                  for(var k=0;k<channelInfo.length;k++){
                    if(channelInfo[k]['infoName']=='stateName' || channelInfo[k]['infoName']=='State'|| channelInfo[k]['infoName']=='Status'
                    || channelInfo[k]['infoName']=='Zustand'|| channelInfo[k]['infoName']=='状态'){
                      var status=channelInfo[k]['infoValue'];
                      if(vm.currentLanuage=='de'){
                        switch(status.toLowerCase()){
                          case "on":
                                status="ein";
                                break;
                          case "off":
                                status="aus";
                                break;
                          case "idle":
                                status="untätig";
                                break;
                          case "running":
                            status="läuft";
                            break;
                          case "end":
                            status="end";
                            break;
                          default:
                                break;
                        }

                      }else if(vm.currentLanuage=='ch'){
                        switch(status.toLowerCase()){
                          case "on":
                            status="开启";
                            break;
                          case "off":
                            status="关闭";
                            break;
                          case "idle":
                            status="闲置";
                            break;
                          case "running":
                            status="运行";
                            break;
                          case "end":
                            status="结束";
                            break;
                          default:
                            break;
                        }
                      }
                      vm.devices[index].status=status;
                      /*if(deviceName.indexOf("Light")>=0){
                        if(status=='On'|| status=='ON'|| status=='ein'|| status=='开启'){
                          vm.devices[index].url="assets/images/energy-flows/Light_on.png";
                        }else{
                          vm.devices[index].url="assets/images/energy-flows/Light_off.png";
                        }
                      }*/

                    }else if(channelInfo[k]['infoName']=='Power' || channelInfo[k]['infoName']=='power'){
                      vm.devices[index].power+=channelInfo[k]['infoValue'];
                    }
                  }
                }
                flag=true;
                break;
              }

            }
            if(flag)break;
          }

        }
        /*for(var i=0;i<vm.locations.length;i++){
          var location=vm.locations[i];
          var deviceNum=0;
          var offDeviceNum=0;
          for(var j=0;j<vm.devices.length;j++){
            if(vm.devices[j].location==location.name){
              deviceNum++;
              if(vm.devices[j].power==0){
                offDeviceNum++;
              }
            }

          }
          vm.locations[i].deviceNum=deviceNum;
          vm.locations[i].onDeviceNum=deviceNum-offDeviceNum;
        }*/

        for(var i=0;i<vm.floors.length;i++) {
          var floor=vm.floors[i];
          for(var j=0;j<floor.rooms.length;j++){
            var room=floor.rooms[j];
            var deviceNum=room.devices.length;
            var offDeviceNum=0;
            for(var k=0;k<vm.devices.length;k++){
              if(vm.devices[k].floor==floor.name&&vm.devices[k].room==room.name){
                if(vm.devices[k].power==0){
                  offDeviceNum++;
                }
              }
            }
            room.onDeviceNum=deviceNum-offDeviceNum;

          }
        }


        for(var i=0;i<vm.deviceTypes.length;i++){
          var type=vm.deviceTypes[i];
          var deviceNum=0;
          var offDeviceNum=0;
          for(var j=0;j<vm.devices.length;j++){
            if(vm.devices[j].type.indexOf(type.name)>=0){
              deviceNum++;
              /* if(vm.devices[j].status=="Off"){
               offDeviceNum++;
               }*/
              if(vm.devices[j].power==0){
                offDeviceNum++;
              }
            }

          }
          vm.deviceTypes[i].deviceNum=deviceNum;
          vm.deviceTypes[i].onDeviceNum=deviceNum-offDeviceNum;
        }

        for(var i=0;i<vm.deviceGroups.length;i++){
          var group=vm.deviceGroups[i];
          var deviceNum=0;
          var offDeviceNum=0;
          for(var j=0;j<vm.devices.length;j++){
            if(vm.devices[j].group.indexOf(group.name)>=0){
              deviceNum++;
              if(vm.devices[j].power==0){
                offDeviceNum++;
              }
            }

          }
          vm.deviceGroups[i].deviceNum=deviceNum;
          vm.deviceGroups[i].onDeviceNum=deviceNum-offDeviceNum;
        }

      }
      ,true);

    },2000);
    // Local images
    //vm.locations=["Kitchen","Bedroom1","Bedroom2","Bath Room","Living Room","Others"];
    vm.locations=[];

    vm.floors=[];

    vm.deviceTypes=[
      {
        name:"Power Consumption",
        deviceNum:0,
        onDeviceNum:0
      },
      {
        name:"Power Generation",
        deviceNum:0,
        onDeviceNum:0
      },
      {
        name:"Heat Generation",
        deviceNum:0,
        onDeviceNum:0
      },
      {
        name:"Cold Generation",
        deviceNum:0,
        onDeviceNum:0
      },
      {
        name:"Gas Consumption",
        deviceNum:0,
        onDeviceNum:0
      }
    ];
    vm.devices =[];


    function createDeviceDetailsTemplate(deviceInfo,defaultData){
      var templateHead='<link rel="stylesheet" type="text/css" href="app/main/apps/dweller/energy-flows/energy-flows.scss" />'+
        '<md-dialog id="dialog" aria-label="Mango (Fruit)" style="width: 40%; height: 53%">'+
        '<form>'+
        '<md-toolbar class="md-accent-bg">'+
        '<div class="md-accent-bg md-toolbar-tools">'+
        '<div class="md-table-thumbs" style="float: left;" >'+
        '<div id="divImage" style="background-image:url('+deviceInfo.href+');"></div>'+
        // '<img src='+deviceInfo.href+' width="50" height="50" class="md-avatar"/>'+
        '</div>'+
        '<h2>&nbsp;&nbsp;{{deviceInfo.name}}</h2>'+
        '<span flex></span>'+
        '<md-button class="md-icon-button" ng-click="close()">'+
        '<md-icon md-svg-src="assets/images/svg/ic_close_24px.svg" aria-label="Close dialog"></md-icon>'+
        '</md-button>'+
        '</div>'+
        '</md-toolbar>'+
        '<md-dialog-content>'+
        '<table width="100%" style="font-family:sans-serif"><tr>';

      var templateContent='';


      if(deviceInfo.id=='Air Conditioner'){
        var templateState='<td width="100%" valign="top"><table width="100%">'+createDeviceGeneralInfoTemplate(deviceInfo)+createDeviceChannelInfoTemplate(deviceInfo)+createDeviceControllerTemplate(deviceInfo)+'</table></td>';
        templateContent=templateState;
      }else{
        var templateState='<td width="50%" valign="top"><table width="100%">'+createDeviceGeneralInfoTemplate(deviceInfo)+createDeviceChannelInfoTemplate(deviceInfo)+createDeviceControllerTemplate(deviceInfo)+'</table></td>';
        var templateDoF='<td width="50%" valign="top"><table width="100%">'+createDoFInfoTemplate(deviceInfo,defaultData)+'</table></td>';
        templateContent=templateState+templateDoF;
      }

      var templateTail=
        '</tr></table>'+
        '</md-dialog-content>'+
        '</form>'+
        '</md-dialog>';

      return templateHead+templateContent+templateTail;

    }

    function createDeviceGeneralInfoTemplate(deviceInfo){
      var generalInfo=deviceInfo.generalInfo;
      var content='';
      if(generalInfo != null){
        for(var i in generalInfo){
          var info=generalInfo[i];
          if(info.infoName!=null){
            var infoName=info.infoName;
            var infoValue=info.infoValue;
            if(infoName==='Location'){
              var floorValue=infoValue.substring(0,infoValue.indexOf(":")).trim();
              var roomValue=infoValue.substring(infoValue.indexOf(":")+1).trim();
              var floorName='Floor';
              var roomName='Room';
              if(vm.currentLanuage==='de'){
                floorName='Etage';
                roomName='Zimmer';
              }else if(vm.currentLanuage==='ch'){
                floorName='楼层';
                roomName='房间';
              }
              content+="<tr ><td style='font-weight:bold'>"+ floorName+":&nbsp;&nbsp; </td><td>"+floorValue+"</td></tr>";
              content+="<tr ><td style='font-weight:bold'>"+ roomName+":&nbsp;&nbsp; </td><td>"+roomValue+"</td></tr>";
              continue;
            }
            if(info.unit != null){
              var unit=info.unit;
              if(unit == "degree Celsius"){
                unit="&deg;C";
              }
              infoValue+=" "+unit;
            }
            content+="<tr ><td style='font-weight:bold'>"+ infoName+": </td><td>"+infoValue+"</td></tr>";
          }

        }
      }else{
        content+="<tr><td style='font-weight:bold'>"+ deviceInfo.infoName+": </td><td>"+deviceInfo.value+" "+deviceInfo.unit+"</td></tr>";

      }
      return content;
    }

    function createDeviceChannelInfoTemplate(deviceInfo){
      var channels=[];
      for(var i in deviceInfo.channels){
        if(deviceInfo.channels[i].channelName!=null){
          channels.push(deviceInfo.channels[i]);
        }
      }

      var content='';
      if(channels != null){

        for(var i in channels){
          var channel=channels[i];
          if(channels.length>1){
            var channelName=channel.channelName;
            if(channelName!=null){
              content+="<tr ><td colspan='2' style='font-weight:bold'>"+channelName+":</td></tr>";
            }else{
              continue;
            }
          }
          var channelInfo=channels[i].channelInfo;
          for(var j in channelInfo){
            var info=channelInfo[j];
            //console.log(state);
            var infoName=info.infoName;
            if(infoName!=null){
              var infoValue=info.infoValue;
              if(deviceInfo.name.indexOf("Light")>=0){
                if(vm.currentLanuage=='en'){
                  if(infoName=='State'||infoName=='Status'){
                    infoValue="{{switchState.toString().replace(true, 'On').replace(false, 'Off')}}";
                  }

                }else if(vm.currentLanuage=='de'){
                  if(infoName=='Zustand'){
                    infoValue="{{switchState.toString().replace(true, 'ein').replace(false, 'aus')}}";
                  }
                }else if(vm.currentLanuage=='ch'){
                  if(infoName=='状态'){
                    infoValue="{{switchState.toString().replace(true, '开启').replace(false, '关闭')}}";
                  }
                }
                if(infoName=='Power' || infoName=='power') {
                  infoValue="{{switchState.toString().replace(true, '100').replace(false, '0')}}";
                }

              }
              if(deviceInfo.name.indexOf("Blind")>=0){
                if(infoName=='State'||infoName=='Status' ||infoName=='Zustand'||infoName=='状态'){
                  infoValue="{{sliderStateString}}";
                }
              }

              if(info.unit != null){
                var unit=info.unit;
                if(unit == "degree Celsius"){
                  unit="&deg;C";
                }
                infoValue+=" "+unit;
              }
              content+="<tr ><td style='font-weight:bold'>"+ infoName+": </td><td>"+infoValue+"</td></tr>";
            }

          }
        }

      }

      return content;
    }

    function createDeviceControllerTemplate(deviceInfo){
      var controllers=[];

      var deviceID=deviceInfo.id;

      var generalInfo=deviceInfo.generalInfo;
      var location='';
      if(generalInfo != null) {
        for (var i in generalInfo) {
          var info = generalInfo[i];
          if (info.infoName != null) {
            var infoName = info.infoName;
            var infoValue = info.infoValue;
            if(infoName==='Location' || infoName==='location' || infoName==='Standort'|| infoName==='地点'){
              location=infoValue;
              break;
            }
          }
        }
      }

      for(var i in deviceInfo.controllers){
        if(deviceInfo.controllers[i].controllerName!=null){
          controllers.push(deviceInfo.controllers[i]);
        }
      }
      var content='';
      if(controllers != null){
        for(var i in controllers){
          var controller=controllers[i];
          if(controller.controllerName!=null && controller.isAvailable){
            var actions=controller.actionList;
            for(var j in actions){
              var action=actions[j];
              if(action.actionName!=null && action.isAvailable){
                var description=action.description;
                var widget=action.widget;
                if(widget!=null){
                  if(widget.type=='Button'){
                    if(widget.color==''&& widget.image==''){
                      if(description!=""){
                        content+="<tr ><td style='font-weight:bold'>"+ description+": </td><td><md-button class='md-raised' ng-click='buttonClick("+JSON.stringify(widget.text)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")' style='margin-left: 0px;margin-top: 15px'>"+widget.text+"</md-button></td></tr>";
                      }else{
                        content+="<tr ><td colspan='2'>";
                        content+="<md-button class='md-raised' ng-click='buttonClick("+JSON.stringify(widget.text)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")' style='margin-left: 0px;margin-top: 15px'>"+widget.text+"</md-button>";
                        content+="</td></tr>";
                      }
                    }
                    if(widget.color!='' && widget.image!= ''){
                      var src="assets/images/svg/"+widget.image+".svg";
                      if(description!=""){
                        content+="<tr ><td style='font-weight:bold'>"+ description+": </td><td><md-button class='md-raised' ng-click='buttonClick("+JSON.stringify(widget.text)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")' style='margin-left: 0px;margin-top: 15px;color:"+widget.color+"'><div layout='column'><md-icon md-svg-src="+src+"></md-icon><span>"+widget.text+"</span></div></md-button></td></tr>";
                      }else{
                        content+="<tr ><td colspan='2'>";
                        content+="<md-button class='md-raised' ng-click='buttonClick("+JSON.stringify(widget.text)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")' style='margin-left: 0px;margin-top: 15px;color:"+widget.color+"'><div layout='column'><md-icon md-svg-src="+src+"></md-icon><span>"+widget.text+"</span></div></md-button>";
                        content+="</td></tr>";
                      }
                    }
                    if(widget.color!='' && widget.image == ''){
                      if(description!=""){
                        content+="<tr ><td style='font-weight:bold'>"+ description+": </td><td><md-button class='md-raised' ng-click='buttonClick("+JSON.stringify(widget.text)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")' style='margin-left: 0px;margin-top: 15px;color:"+widget.color+"'>"+widget.text+"</md-button></td></tr>";

                      }else{
                        content+="<tr ><td colspan='2'>";
                        content+="<md-button class='md-raised' ng-click='buttonClick("+JSON.stringify(widget.text)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")' style='margin-left: 0px;margin-top: 15px;color:"+widget.color+"'>"+widget.text+"</md-button>";
                        content+="</td></tr>";
                      }

                    }
                    if(widget.color =='' && widget.image != ''){
                      var src="assets/images/svg/"+widget.image+".svg";
                      if(description!=""){
                        content+="<tr ><td style='font-weight:bold'>"+ description+"</td><td><md-button class='md-raised' ng-click='buttonClick("+JSON.stringify(widget.text)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")' style='margin-left: 0px;margin-top: 15px;'><md-icon md-svg-src="+src+"></md-icon>"+widget.text+"</md-button></td></tr>";

                      }else{
                        content+="<tr ><td colspan='2'>";
                        content+="<md-button class='md-raised' ng-click='buttonClick("+JSON.stringify(widget.text)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")' style='margin-left: 0px;margin-top: 15px;'><md-icon md-svg-src="+src+"></md-icon>"+widget.text+"</md-button>";
                        content+="</td></tr>";
                      }
                    }
                  }
                  if(widget.type=='Slider'){
                    description="Set State";
                    if(vm.currentLanuage=='de'){
                      description="Zustand setzen";
                    }else if(vm.currentLanuage=='ch'){
                      description="设置状态";
                    }
                    if(description!=""){
                      content+="<tr ><td style='font-weight:bold'>"+ description+":</td><td><md-slider-container><md-slider style='width: 80%' ng-model='sliderState' aria-label='slider'  min="+ widget.min_value+" max="+widget.max_value+" step="+widget.step+ " class='md-accent' ng-change='sliderChange(sliderState,"+JSON.stringify(action)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")'> </md-slider>"+
                        " </md-slider-container></td></tr>"

                    }else{
                      content+="<tr ><td colspan='2'>";
                      content+="<md-slider-container><md-slider style='width: 80%' ng-model='sliderState' aria-label='slider' min="+ widget.min_value+" max="+widget.max_value+" step="+widget.step+ " class='md-accent' ng-change='sliderChange(sliderState,"+JSON.stringify(action)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")'> </md-slider>"+
                        " </md-slider-container>";
                      content+="</td></tr>";
                    }
                  }

                  if(widget.type=='Switch'){

                    description="Set State";
                    if(vm.currentLanuage=='de'){
                      description="Zustand setzen";
                    }else if(vm.currentLanuage=='ch'){
                      description="设置状态";
                    }
                    if(description!=""){
                      content+="<tr ><td style='font-weight:bold'>"+ description+": </td><td><md-switch class='md-accent' ng-model='switchState' aria-label='switch' ng-change='switchChange(switchState,"+JSON.stringify(action)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")'> </md-switch >"+
                        " </td></tr>"
                    } else{
                      content+="<tr ><td colspan='2'>";

                      //switchState=true;
                      //console.log("switchState="+switchState);
                      content+="<md-switch aria-label='Switch' class='md-accent' ng-model='switchState' ng-change='switchChange(switchState,"+JSON.stringify(action)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")'> </md-switch >";
                      content+="</td></tr>";
                    }
                  }

                  if(widget.type=='TouchSpin'){
                    var airConditionerTempStorage = window.localStorage.getItem('stage-storage-temp-air-conditioner');
                    var airConditionerTemp=22;
                    if (airConditionerTempStorage === null){
                      $window.localStorage.setItem('stage-storage-temp-air-conditioner', 22);
                    }else{
                      airConditionerTemp=JSON.parse(window.localStorage['stage-storage-temp-air-conditioner']);

                    }
                    if(description!=""){
                      content+="<tr ><td style='font-weight:bold'>"+ description+":</td><td>" +
                        "<ng-touch-spin style='width: 50%'  ng-model='touchSpinState'  postfix='&deg;C' ng-change='touchSpinChange(touchSpinState,"+JSON.stringify(deviceID)+","+JSON.stringify(location)+")' initval="+airConditionerTemp+" decimals="+widget.decimals+" step="+widget.step+">"+
                        " </td></tr>"
                    } else{
                      content+="<tr ><td colspan='2'>";

                      //switchState=true;
                      //console.log("switchState="+switchState);
                      content+="<ng-touch-spin style='width: 50%'  ng-model='touchSpinState' postfix='&deg;C' initval="+widget.initVal+" decimals="+widget.decimals+" step="+widget.step+">";
                      content+="</td></tr>";
                    }
                  }
                }


              }
            }
          }
        }
      }
      return content;

    }

    function createDoFInfoTemplate(deviceInfo,defaultData){
      var DoFInfo=deviceInfo.DoFInfo;
      var content='';
      //var defaultData=new Array();
      if(DoFInfo!=null && DoFInfo.length>0){
        for(var i in DoFInfo){
          var info=DoFInfo[i];
          var infoName=info.infoName;
          var infoValue=info.infoValue;
          var format=info.format;
          var unit=info.unit;
          var defaultValue=info.defaultValue;
          if(format=="NUMBER"){

            // content+="<tr style='height: 30px'><td width='40%'>"+ infoName+" ("+unit+"): </td><td width='60%'><input style='width: 99px' type='number' name='input' required></td></tr>";
            content+="<tr style='height: 30px'><td width='100%'>"+ infoName+" ("+unit+"): </td></tr><tr><td width='100%'><input style='width: 99px' type='number' name='input' required value='"+defaultValue+"'></td></tr>";
          }else if(format=='TIME'){

            var defaultTime='';
            if(defaultValue!=null && defaultValue!="" ){
              defaultTime=new Date(defaultValue);
            }else{
              var d = new Date();
              var year=d.getFullYear();
              var month=d.getMonth();
              var day=d.getDate();
              var hour=d.getHours();
              var minute=d.getMinutes();
              defaultTime=new Date(year,month,day,hour,minute);
            }
            defaultData.push(defaultTime);

            // content+="<tr style='height: 30px'><td width='40%'>"+ infoName+": </td><td width='60%'><input type='datetime-local' style='width: 230px' ng-model='data.datetime' placeholder='yyyy-MM-ddTHH:mm:ss' required /></td></tr>";
            content+="<tr style='height: 30px'><td width='100%'>"+ infoName+": </td></tr><tr><td width='100%'><input type='datetime-local' style='width: 230px' ng-model='defaultData["+(defaultData.length-1)+"]' placeholder='yyyy-MM-ddTHH:mm:ss' required /></td></tr>";
          }
        }
/*
        content+="<tr style='height: 30px'><td> <md-button class='md-raised' style='margin-left: 0px;margin-top: 15px'>{{'DEVICE_LIST.APPLY'|translate}}</md-button> <md-button class='md-raised'>{{'DEVICE_LIST.START_NOW'|translate}}</md-button></td></tr>";
*/
        content+="<tr style='height: 30px'><td> <md-button class='md-raised' style='margin-left: 0px;margin-top: 15px'>{{'DEVICE_LIST.APPLY'|translate}}</md-button> </td></tr>";

      }
      return content;
    }


    vm.showDeviceDetails=function(device){
      var defaultData=new Array();
      var deviceInfo=null;
      var deviceID=device.name;
      var imgUrl=device.url;
      vm.sharedWampSession.call('eshl.get_home_device',[vm.currentLanuage,deviceID]).then(

        // RPC success callback
        function (device) {
         // console.log("eshl.get_home_device:");
         // console.log(device);

          deviceInfo= vm.generateJsonFromJavaObj(device,"pCon");

          if(deviceInfo.id.indexOf('Light')>=0){
            for(var i in vm.lightStates) {
              var lightID = Object.keys(vm.lightStates[i])[0];
              if (lightID === deviceInfo.id) {
                if(vm.lightStates[i][lightID]==='on'){
                  deviceInfo.href='assets/images/energy-flows/Light_on.png';
                }else{
                  deviceInfo.href='assets/images/energy-flows/Light_off.png';
                }
                break;
              }
            }
          }else if(deviceInfo.id.indexOf('Blind')>=0){
            for(var i in vm.blindStates) {
              var blindID = Object.keys(vm.blindStates[i])[0];
              if (blindID === deviceInfo.id) {
                deviceInfo.href='assets/images/energy-flows/Blind_'+vm.blindStates[i][blindID]+'.png';
                break;
              }
            }
          }

          $mdDialog.show({
              controller: DialogController,
              // scope: scope.$new(),
              locals:{sharedDeviceStates:$scope.sharedDeviceStates,deviceInfo:deviceInfo,defaultData:defaultData},
              clickOutsideToClose: false,
              parent: angular.element(document.body),
              // templateUrl: "app/main/apps/energy-flows/deviceDetails.html",
              template: createDeviceDetailsTemplate(deviceInfo,defaultData),
              targetEvent: $window.event
            })
            .then(function(result) {

              if(deviceID.indexOf('Blind')>=0){
                var imgUrl='assets/images/energy-flows/Blind_'+result+'.png';
                var status='';
                if(vm.currentLanuage=='en'){
                  switch(result){
                    case 0:
                      status="Open:100%";
                      break;
                    case 25:
                      status="Closed:25%";
                      break;
                    case 50:
                      status="Closed:50%";
                      break;
                    case 75:
                      status="Closed:75%";
                      break;
                    case 100:
                      status="Closed:100%";
                      break;
                    default:
                      break;
                  }
                }else if(vm.currentLanuage=='de'){
                  switch(result){
                    case 0:
                      status="Auf:100%";
                      break;
                    case 25:
                      status="Zu:25%";
                      break;
                    case 50:
                      status="Zu:50%";
                      break;
                    case 75:
                      status="Zu:75%";
                      break;
                    case 100:
                      status="Zu:100%";
                      break;
                    default:
                      break;
                  }
                }else if(vm.currentLanuage=='ch'){
                  switch(result){
                    case 0:
                      status="打开:100%";
                      break;
                    case 25:
                      status="关闭:25%";
                      break;
                    case 50:
                      status="关闭:50%";
                      break;
                    case 75:
                      status="关闭:75%";
                      break;
                    case 100:
                      status="关闭:100%";
                      break;
                    default:
                      break;
                  }
                }

                for(var j in vm.devices) {
                  if (vm.devices[j].name == deviceID) {
                    vm.devices[j].url=imgUrl;
                    vm.devices[j].status=status;
                    break;
                  }
                }
              }
              if(deviceID.indexOf('Light')>=0){
                var imgUrl;
                var status;
                if(result){
                  imgUrl='assets/images/energy-flows/Light_on.png';
                  if(vm.currentLanuage=='en'){
                    status="On";
                  }else if(vm.currentLanuage=='de'){
                    status="Ein";
                  }else{
                    status="打开";
                  }

                }else{
                  imgUrl='assets/images/energy-flows/Light_off.png';
                  if(vm.currentLanuage=='en'){
                    status="Off";
                  }else if(vm.currentLanuage=='de'){
                    status="Aus";
                  }else{
                    status="关闭";
                  }

                }
                for(var j in vm.devices) {

                  if (vm.devices[j].name == deviceID) {
                    vm.devices[j].url=imgUrl;
                    vm.devices[j].status=status;

                    break;
                  }
                }
              }
            }, function() {
              $scope.alert = 'You cancelled the dialog.';
            });

        },
        // RPC error callback
        function (error) {
          console.log("Call failed:", error);
        }
      );


    }

    function DialogController($scope,$mdDialog,deviceInfo,defaultData) {


      $scope.deviceInfo=deviceInfo;
      $scope.defaultData=defaultData;
      $scope.close = function() {

        if(deviceInfo.id.indexOf('Blind')>=0){
          $mdDialog.hide($scope.sliderState);
        }else  if(deviceInfo.id.indexOf('Light')>=0){
          $mdDialog.hide($scope.switchState);
        }else{
          $mdDialog.hide();
        }
      };

      if(deviceInfo.id.indexOf('Light_')>=0){
        var switchState;
        /*for(var j in deviceInfo.channels){
         var channel=deviceInfo.channels[j];
         var channelInfo=channel.channelInfo;
         for(var k in channelInfo){
         if(channelInfo[k].infoName=='State'|| channelInfo[k].infoName=='Status'|| channelInfo[k].infoName=='Zustand'|| channelInfo[k].infoName=='状态'){
         if(channelInfo[k].infoValue=='Off'||channelInfo[k].infoValue=='aus' || channelInfo[k].infoValue=='关闭'){
         switchState=false;
         }else if(channelInfo[k].infoValue=='On'||channelInfo[k].infoValue=='ein'||channelInfo[k].infoValue=='开启'){
         switchState=true;
         }
         }
         }
         }*/

        for(var i in vm.lightStates) {
          var lightID = Object.keys(vm.lightStates[i])[0];
          if (lightID === deviceInfo.id) {
            if(vm.lightStates[i][lightID]==='on'){
              switchState=true;
            }else{
              switchState=false;
            }
          }
        }

        $scope.switchState=switchState;

      }

      if(deviceInfo.id.indexOf('Blind')>=0){
        //   console.log(deviceInfo);
        $scope.sliderStateString='';
        var sliderState;

        for(var i in vm.blindStates) {
          var blindID = Object.keys(vm.blindStates[i])[0];
          if (blindID === deviceInfo.id) {
            sliderState=vm.blindStates[i][blindID];
            break;
          }
        }

        if(vm.currentLanuage==='en'){

          switch (sliderState) {
            case 0:
              $scope.sliderStateString = 'Open: 100%';
              break;
            case 25:
              $scope.sliderStateString = 'Closed: 25%';
              break;
            case 50:
              $scope.sliderStateString = 'Closed: 50%';
              break;
            case 75:
              $scope.sliderStateString = 'Closed: 75%';
              break;
            case 100:
              $scope.sliderStateString = 'Closed: 100%';
              break;
            default:
              break;
          }


        }else if(vm.currentLanuage==='de'){

          switch (sliderState) {
            case 0:
              $scope.sliderStateString = 'Auf: 100%';
              break;
            case 25:
              $scope.sliderStateString = 'Zu: 25%';
              break;
            case 50:
              $scope.sliderStateString = 'Zu: 50%';
              break;
            case 75:
              $scope.sliderStateString = 'Zu: 75%';
              break;
            case 100:
              $scope.sliderStateString = 'Zu: 100%';
              break;
            default:
              break;
          }

        }else if(vm.currentLanuage==='ch'){

          switch (sliderState) {
            case 0:
              $scope.sliderStateString = '打开: 100%';
              break;
            case 25:
              $scope.sliderStateString = '关闭: 25%';
              break;
            case 50:
              $scope.sliderStateString = '关闭: 50%';
              break;
            case 75:
              $scope.sliderStateString = '关闭: 75%';
              break;
            case 100:
              $scope.sliderStateString = '关闭: 100%';
              break;
            default:
              break;
          }

        }

        $scope.sliderState=sliderState;
      }

      $scope.buttonClick=function (actionName,deviceID,location) {
        var date=new Date();
        var y=date.getYear();
        var m=date.getMonth();
        var d=date.getDate();

        var h=date.getHours();
        var min=date.getMinutes();
        var sec=date.getSeconds();

        if(h.toString().length==1){
          h="0"+h;
        }
        if(min.toString().length==1){
          min="0"+min;
        }
        if(sec.toString().length==1){
          sec="0"+sec;
        }

        var time=d+"/"+m+" "+h+":"+min+":"+sec;
        var action=actionName.charAt(0).toUpperCase()+actionName.substring(1).toLowerCase();

        var eventLogger={deviceID:deviceID,location:location,time:time,action:action,operationMode:"Device_Operation",executor:vm.dweller.name};
        addEventLogger(eventLogger).then(function (result) {
          console.log(result);

        });

      }

      $scope.touchSpinChange=function (touchSpinState,deviceID,location) {

        var date=new Date();
        var y=date.getYear();
        var m=date.getMonth();
        var d=date.getDate();

        var h=date.getHours();
        var min=date.getMinutes();
        var sec=date.getSeconds();

        if(h.toString().length==1){
          h="0"+h;
        }
        if(min.toString().length==1){
          min="0"+min;
        }
        if(sec.toString().length==1){
          sec="0"+sec;
        }

        var time=d+"/"+m+" "+h+":"+min+":"+sec;

        var actionName="Set temperature";
        if(vm.currentLanuage==='de'){
          actionName="Temperatur einstellen";
        }else if(vm.currentLanuage==='ch'){
          actionName="设置温度";
        }
        var action=actionName+": "+touchSpinState+"°C";
        $window.localStorage.setItem('stage-storage-temp-air-conditioner', touchSpinState);
       /* UpdateAirConditionerTemp(touchSpinState).then(function (result) {
          console.log(result);

        });*/
        var eventLogger={deviceID:deviceID,location:location,time:time,action:action,operationMode:"Device_Operation",executor:vm.dweller.name};
        addEventLogger(eventLogger).then(function (result) {
          console.log(result);

        });


      }


      $scope.switchChange=function (switchState, action,deviceID,location) {

       // console.log("location is "+location);

        var date=new Date();
        var y=date.getYear();
        var m=date.getMonth();
        var d=date.getDate();

        var h=date.getHours();
        var min=date.getMinutes();
        var sec=date.getSeconds();

        if(h.toString().length==1){
          h="0"+h;
        }
        if(min.toString().length==1){
          min="0"+min;
        }
        if(sec.toString().length==1){
          sec="0"+sec;
        }

        var time=d+"/"+m+" "+h+":"+min+":"+sec;
        console.log("time is "+time);

        var imgSrc='url(assets/images/energy-flows/Light_off.png)';
        var actionName="";
        if(switchState){
          if(vm.currentLanuage=='en'){
            switchState='ON';
            actionName="Turn "+switchState.toLowerCase();
          }else if(vm.currentLanuage=='de'){
            switchState='ein';
            actionName="einschalten";
          }else{
            switchState='开启';
            actionName="Turn on";
          }

          imgSrc='url(assets/images/energy-flows/Light_on.png)';

          for(var i in vm.lightStates) {
            var lightID = Object.keys(vm.lightStates[i])[0];
            if (lightID === deviceID) {
              vm.lightStates[i][lightID]='on';
            }
          }

        }else{

          if(vm.currentLanuage=='en'){
            switchState='OFF';
            actionName="Turn "+switchState.toLowerCase();
          }else if(vm.currentLanuage=='de'){
            switchState='aus';
            actionName="ausschalten";
          }else{
            switchState='关闭';
            actionName="Turn off";
          }
          for(var i in vm.lightStates) {
            var lightID = Object.keys(vm.lightStates[i])[0];
            if (lightID === deviceID) {
              vm.lightStates[i][lightID]='off';
            }
          }
        }
        $window.localStorage.setItem('stage-storage-light-states', angular.toJson(vm.lightStates));

        document.getElementById("divImage").style.backgroundImage=imgSrc;

        /*for(var i in action.commandList){
          var widgetState=action.commandList[i].widgetState;
          if(widgetState==switchState){
            var commandString=action.commandList[i].commandString;
            var command=commandString.split(" ")[0];
            var param=commandString.split(" ")[1];
            vm.sharedWampSession.call(command,[param]).then(
              // RPC success callback
              function (result) {
                console.log("the result is ");
                console.log(result);
              }

            );
          }
        }*/

        //var action="Turn "+switchState.toLowerCase();
        var eventLogger={deviceID:deviceID,location:location,time:time,action:actionName,operationMode:"Device_Operation",executor:vm.dweller.name};
        addEventLogger(eventLogger).then(function (result) {
          console.log(result);

        });

      }
      $scope.sliderChange=function (sliderState, action,deviceID,location) {

        console.log("slider location is");
        console.log(location);

        var imgSrc='url(assets/images/energy-flows/Blind_'+sliderState+'.png)';
        document.getElementById("divImage").style.backgroundImage=imgSrc;
        var actionName="";
        if(vm.currentLanuage==='en'){
          switch (sliderState){
            case 0:
              $scope.sliderStateString='Open: 100%';
              break;
            case 25:
              $scope.sliderStateString='Closed: 25%';
              break;
            case 50:
              $scope.sliderStateString='Closed: 50%';
              break;
            case 75:
              $scope.sliderStateString='Closed: 75%';
              break;
            case 100:
              $scope.sliderStateString='Closed: 100%';
              break;
            default:
              break;
          }
          actionName="Set "+$scope.sliderStateString.toLowerCase();
        }else if(vm.currentLanuage==='de'){
          switch (sliderState){
            case 0:
              $scope.sliderStateString='Auf: 100%';
              actionName="aufmachen: 100%";
              break;
            case 25:
              $scope.sliderStateString='Zu: 25%';
              actionName="zumachen: 25%";
              break;
            case 50:
              $scope.sliderStateString='Zu: 50%';
              actionName="zumachen: 50%";
              break;
            case 75:
              $scope.sliderStateString='Zu: 75%';
              actionName="zumachen: 75%";
              break;
            case 100:
              $scope.sliderStateString='Zu: 100%';
              actionName="zumachen: 100%";
              break;
            default:
              break;
          }
        }else if(vm.currentLanuage==='ch'){
          switch (sliderState){
            case 0:
              $scope.sliderStateString='打开: 100%';
              actionName="Set open: 100%";
              break;
            case 25:
              $scope.sliderStateString='关闭: 25%';
              actionName="Set close: 25%";
              break;
            case 50:
              $scope.sliderStateString='关闭: 50%';
              actionName="Set close: 50%";
              break;
            case 75:
              $scope.sliderStateString='关闭: 75%';
              actionName="Set close: 75%";
              break;
            case 100:
              $scope.sliderStateString='关闭: 100%';
              actionName="Set close: 100%";
              break;
            default:
              break;
          }
        }

        for(var i in vm.blindStates) {
          var blindID = Object.keys(vm.blindStates[i])[0];
          if (blindID === deviceID) {
            vm.blindStates[i][blindID]=sliderState;
          }
        }
        $window.localStorage.setItem('stage-storage-blind-states', angular.toJson(vm.blindStates));


       /* UpdateBlindInitVal(deviceInfo.id,sliderState).then(function (result) {
          console.log(result);

        });*/

        var date=new Date();
        var y=date.getYear();
        var m=date.getMonth();
        var d=date.getDate();

        var h=date.getHours();
        var min=date.getMinutes();
        var sec=date.getSeconds();

        if(h.toString().length==1){
          h="0"+h;
        }
        if(min.toString().length==1){
          min="0"+min;
        }
        if(sec.toString().length==1){
          sec="0"+sec;
        }

        var time=d+"/"+m+" "+h+":"+min+":"+sec;

        //var action="Set "+$scope.sliderStateString.toLowerCase();
        var eventLogger={deviceID:deviceID,location:location,time:time,action:actionName,operationMode:"Device_Operation",executor:vm.dweller.name};
        addEventLogger(eventLogger).then(function (result) {
          console.log(result);

        });

      };





      /* $scope.saveConfiguration=function() {

       var stageJson=JSON.parse(window.localStorage['stage-storage-'+vm.selectedTabTitle]);
       stageJson.deviceImages[$scope.currentImgName].deviceName=$scope.deviceName;
       stageJson.deviceImages[$scope.currentImgName].isConfigured=true;
       window.localStorage.setItem('stage-storage-'+vm.selectedTabTitle, JSON.stringify(stageJson));
       changeKineticImgAttr($scope.currentImgName,'isConfigured',true,vm.selectedTabTitle);
       changeKineticImgAttr($scope.currentImgName,'deviceName',$scope.deviceName,vm.selectedTabTitle);
       $scope.close();
       }*/
    };

    function UpdateBlindInitVal(blindName,initVal) {
      return $http.put('http://localhost:8087/bos/api/dummyDevices/blinds/'+blindName+"/"+initVal).then(handleSuccess, handleError('Error updating blind initVal'));
    }
    function GetFloors(admin) {
      return $http.get('http://localhost:8087/bos/api/floors/'+admin).then(handleSuccess, handleError('Error getting all locations'));
    }
    function addEventLogger(eventLogger){
      return $http.post('http://localhost:8087/bos/api/eventLogger/',eventLogger).then(handleSuccess, handleError('Error adding eventLogger'));
    }
    function UpdateAirConditionerTemp(value) {
      return $http.put('http://localhost:8087/bos/api/airConditionerTemp/'+value).then(handleSuccess, handleError('Error updating air conditioner temp'));
    }
    function GetAirConditionerTemp() {
      return $http.get('http://localhost:8087/bos/api/airConditionerTemp').then(handleSuccess, handleError('Error getting air conditioner temp'));
    }
    function handleSuccess(res) {
      return res.data;
    }
    function handleError(error) {
      return function () {
        return { success: false, message: error };
      };
    }

    vm.switchOnAll=function(){

    }
    vm.switchOffAll=function(){

    }
    vm.switchOnGroupAll=function(location){

    }
    vm.switchOffGroupAll=function(location){

    }
    vm.checkGroupOn=function (group) {
      if( group.onDeviceNum==group.deviceNum){
        return true;
      }
      return false;
    }
    vm.checkGroupOff=function (group) {
      if( group.onDeviceNum>0){
        return false;
      }
      return true;
    }
  }

}
)();
