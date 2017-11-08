/**
 * Created by pg9501 on 29.09.2016.
 */
(function () {
  'use strict';

  angular
    .module('app.dweller.device-groups')
    .controller('DeviceGroupsController', DeviceGroupsController);

  /** @ngInject */
  function DeviceGroupsController($document, $window,$rootScope, $translate,$interval, $scope,$cookies,$http, $mdDialog,msNavigationService, msUtils,WAMPService)
  {
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

    var vm = this;

    vm.user=$cookies.getObject('globals').currentUser;

    // Data
    vm.currentView = 'board';
    vm.board = {groups:[],devices:[]};
    vm.newGroupName = "";

    var lightStateStorage = window.localStorage.getItem('stage-storage-light-states');
    vm.lightStates=[];

    var blindStateStorage = window.localStorage.getItem('stage-storage-blind-states');
    vm.blindStates=[];

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

    var index=vm.user.username.indexOf("_");
    var adminName='admin';
    if(index>=0){
      var postfix=vm.user.username.substring(index);
      adminName+=postfix;
    }
    adminName="admin";
    vm.lightLocations=[];
    GetFloors(adminName).then(function (result) {

      if (result != null) {
        for (var i in result) {
          var floor = result[i];
          for(var j in floor.rooms) {
            var room = floor.rooms[j];
            for (var d in room.devices) {
              if(room.devices[d].indexOf("Light")>=0){
                var deviceID=room.devices[d];
                switch (deviceID){
                  case 'Light_K16':
                    vm.lightLocations.push({Light_K16:floor.name+": "+room.name});
                    break;
                  case 'Light_K17':
                    vm.lightLocations.push({Light_K17:floor.name+": "+room.name});
                    break;
                  case 'Light_K18':
                    vm.lightLocations.push({Light_K18:floor.name+": "+room.name});
                    break;
                  case 'Light_K19':
                    vm.lightLocations.push({Light_K19:floor.name+": "+room.name});
                    break;
                  case 'Light_K20':
                    vm.lightLocations.push({Light_K20:floor.name+": "+room.name});
                    break;
                  case 'Light_K21':
                    vm.lightLocations.push({Light_K21:floor.name+": "+room.name});
                    break;
                  case 'Light_2':
                    vm.lightLocations.push({Light_2:floor.name+": "+room.name});
                    break;
                }

              }

            }
          }
        }
      }
    });

   // $scope.sharedDeviceStates=deviceService.deviceStates;
  //  $scope.sharedIdleHomeDevice=deviceService.idleHomeDevice;
    //vm.wampSession=deviceService.wampSession;
    $scope.sharedDeviceStates={coldGeneration:[],gasConsumption:[],heatGeneration:[],powerConsumption:[],powerGeneration:[]};
    vm.wampSession=WAMPService.getWAMPsession();
   // $scope.generateJsonFromJavaObj=deviceService.generateJsonFromJavaObj;
    //vm.wampSession=deviceService.wampSession;
    vm.removeDeviceFromGroup=function(group,deviceID){
      var index=group.idDevices.indexOf(deviceID);
      group.idDevices.splice(index,1);

      var devices=[];
      for(var i in group.idDevices){
        var deviceId=group.idDevices[i];

        var deviceName= vm.getDeviceById(deviceId).name;
        if(deviceName!=null){
          devices.push(deviceName);
        }
      }
      var deviceGroup={groupName:group.name,dwellerName:vm.user.username,devices:devices};

      UpdateDeviceGroup(deviceGroup).then(function (result) {
        console.log(result);
      });

    }

    vm.currentLanuage="en";
    vm.dweller={};
    vm.devices=[];

    var check = function(){
      vm.wampSession=WAMPService.getWAMPsession();
      if (typeof vm.wampSession != 'undefined') {
        // run when condition is met
        vm.wampSession.subscribe('eshl.power_consuming_home_device', powerConsumingHomeDeviceDataHandler);
        GetDweller(vm.user.username).then(function (result) {
          if (result != null) {
            vm.dweller = result;
            var permissions = vm.dweller.permissions;
            for (var i in permissions) {
              var permission = permissions[i];
              var devices = permission.devices;
              for(var dev in devices){
                if(dev!="getById"){
                  var isExisted=false;
                  for(var j in vm.devices){
                    if(vm.devices[j].name==devices[dev]){
                      isExisted=true;
                      break;
                    }
                  }
                  if(!isExisted){
                    vm.devices.push({name:devices[dev],image:"",location:"",state:"",power:"",controllers:[]});
                  }
                }

              }
            }

            vm.wampSession.call('eshl.get_all_devices',[vm.currentLanuage]).then(
              // RPC success callback
              function (devices) {
                for(var dev in vm.devices){
                  if(dev!="getById"){
                    for(var i in devices){
                      var device=devices[i];
                      var location='';
                      var id=device['uid'];
                      var name=device['deviceName'];
                      var image='assets/images/energy-flows/'+device['deviceImage']+".png";
                      var state='';
                      var generalInfoList=device["deviceGeneralInfoList"];
                      var channels=device['deviceChannelList'];
                      var controllers=device['deviceControllerList'];
                      if(vm.devices[dev].name==id){
                        for(var i in generalInfoList) {
                          var info = generalInfoList[i];
                          var infoName = info.infoName;
                          var infoValue = info.infoValue;
                          if(infoName=='Location'||infoName=='Standort'||infoName=='地点'){
                            location=infoValue;
                          }
                        }
                        vm.devices[dev].image=image;
                        vm.devices[dev].location=location;
                        vm.devices[dev].controllers=controllers;

                        if(id.indexOf('Light')>=0){
                          for(var k in vm.lightStates) {
                            var lightID = Object.keys(vm.lightStates[k])[0];
                            if(lightID===id){
                              var lightState=vm.lightStates[k][lightID];
                              var status='';
                              if(lightState==='on'){
                                vm.devices[dev].image="assets/images/energy-flows/Light_on.png";
                                // vm.devices[dev].power=100;
                                if(vm.currentLanuage=='en'){
                                  status='On';
                                }else if(vm.currentLanuage=='de'){
                                  status='Ein';
                                }else if(vm.currentLanuage=='ch'){
                                  status='开启';
                                }
                              }else{
                                vm.devices[dev].image="assets/images/energy-flows/Light_off.png";
                                if(vm.currentLanuage=='en'){
                                  status='Off';
                                }else if(vm.currentLanuage=='de'){
                                  status='Aus';
                                }else if(vm.currentLanuage=='ch'){
                                  status='关闭';
                                }
                              }
                              vm.devices[dev].state=status;
                              break;
                            }
                          }

                          continue;
                        }
                        if(id.indexOf('Blind')>=0){
                          for (var k in vm.blindStates) {
                            var blindID=Object.keys(vm.blindStates[k])[0];
                            var initVal=vm.blindStates[k][blindID];
                            var device = vm.devices[dev];
                            if(device.name==blindID){
                              device.image="assets/images/energy-flows/Blind_"+initVal+".png";
                              if(vm.currentLanuage==='en'){
                                switch(initVal){
                                  case 0:
                                    device.state="Open:100%";
                                    break;
                                  case 25:
                                    device.state="Closed:25%";
                                    break;
                                  case 50:
                                    device.state="Closed:50%";
                                    break;
                                  case 75:
                                    device.state="Closed:75%";
                                    break;
                                  case 100:
                                    device.state="Closed:100%";
                                    break;
                                  default:
                                    break;
                                }
                              }else if(vm.currentLanuage==='de'){
                                switch(initVal){
                                  case 0:
                                    device.state="Auf:100%";
                                    break;
                                  case 25:
                                    device.state="Zu:25%";
                                    break;
                                  case 50:
                                    device.state="Zu:50%";
                                    break;
                                  case 75:
                                    device.state="Zu:75%";
                                    break;
                                  case 100:
                                    device.state="Zu:100%";
                                    break;
                                  default:
                                    break;
                                }
                              }else if(vm.currentLanuage==='ch'){
                                switch(initVal){
                                  case 0:
                                    device.state="打开:100%";
                                    break;
                                  case 25:
                                    device.state="关闭:25%";
                                    break;
                                  case 50:
                                    device.state="关闭:50%";
                                    break;
                                  case 75:
                                    device.state="关闭:75%";
                                    break;
                                  case 100:
                                    device.state="关闭:100%";
                                    break;
                                  default:
                                    break;
                                }
                              }
                              break;

                            }
                          }
                          continue;
                        }

                        for(var j=0;j<channels.length;j++){
                          var channelInfo=channels[j]['channelInfoList'];
                          for(var k=0;k<channelInfo.length;k++){
                            if(channelInfo[k]['infoName']=='stateName' || channelInfo[k]['infoName']=='State'|| channelInfo[k]['infoName']=='Status'||
                              channelInfo[k]['infoName']=='Zustand'|| channelInfo[k]['infoName']=='状态'){
                              var status=channelInfo[k]['infoValue'];
                              vm.devices[dev].state=status;
                              break;
                            }
                          }
                        }

                        break;
                      }

                    }
                    for(var k in vm.board.devices){
                      if(vm.board.devices[k].name==vm.devices[dev].name){
                        vm.board.devices[k].image=vm.devices[dev].image;
                        vm.board.devices[k].location=vm.devices[dev].location;
                        vm.board.devices[k].state=vm.devices[dev].state;
                        vm.board.devices[k].controllers=vm.devices[dev].controllers;
                        break;
                      }
                    }
                  }

                }


                GetDeviceGroups(vm.user.username).then(function (result) {
                  if(result!=null){
                    for(var i in result){
                      var deviceGroup=result[i];
                      var idDevices=[];

                      if(deviceGroup.devices!=null && deviceGroup.devices.length>0){
                        for(var j in deviceGroup.devices){

                          var deviceName=deviceGroup.devices[j];
                          var deviceId="";
                          for(var dev in vm.board.devices){
                            if(vm.board.devices[dev].name==deviceName){

                              deviceId=vm.board.devices[dev].id;
                              break;
                            }
                          }

                          var location="";
                          var state="";
                          var power="";
                          var image="";
                          var controllers=[];

                          for(var k in vm.devices){
                            if(vm.devices[k].name==deviceName){
                              location=vm.devices[k].location;
                              state=vm.devices[k].state;
                              power=vm.devices[k].power;
                              image=vm.devices[k].image;
                              controllers=vm.devices[k].controllers;
                              break;
                            }
                          }

                          if(deviceId==""){
                            deviceId = msUtils.guidGenerator();
                            vm.board.devices.push({
                              id               : deviceId,
                              name             : deviceName,
                              image            : image,
                              location      : location,
                              state: state,
                              power       : power,
                              controllers:controllers
                            });
                          }
                          idDevices.push(deviceId);


                        }

                      }

                      if(deviceGroup.groupName!=null){
                        vm.board.groups.push({
                          id:     msUtils.guidGenerator(),
                          name   : deviceGroup.groupName,
                          idDevices: idDevices
                        });
                      }


                    }

                  }
                });


              },
              // RPC error callback
              function (error) {
                console.log("Call failed:", error);
              }
            );

          }
        });
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

      for(var i in vm.lightStates) {
        var lightID = Object.keys(vm.lightStates[i])[0];
        var lightState=vm.lightStates[i][lightID];
        var lightLocation='';
        for(var j in vm.lightLocations){
          var lightID2=Object.keys(vm.lightLocations[j])[0];
          if(lightID===lightID2){
            lightLocation=vm.lightLocations[j][lightID2];
            break;
          }
        }
        if(lightState==='on'){

          var state='On';
          if(vm.currentLanuage=='de'){
            state='Ein';
          }else if(vm.currentLanuage=='ch'){
            state='开启';
          }
          jsonObj={"id":lightID,"name":lightID,"generalInfo":[{"infoName":"Location","infoValue":lightLocation}],
            "channels":[{"channelName":lightID,"channelInfo":[{"infoName":"Power","infoValue":100,"unit":"W"},{"infoName":"State","infoValue":state}]}],
            "DoFInfo":[],"controllers":[{"controllerName":"StateController","description":"","actionList":[{"actionName":"Turn on/off","description":"",
              "widget":{"onText":"Current State: ON","inverted":false,"type":"Switch","id":0,"offText":"Current State: OFF"},
              "commandList":[{"widgetState":"ON","commandString":"eshl.wago.v1.switch.on 21"},{"widgetState":"OFF","commandString":"eshl.wago.v1.switch.off 21"}],
              "isAvailable":true}],"isAvailable":true}],"value":300,"inDeviceGroup":0,"type":"pCon","href":"assets/images/energy-flows/Light_on.png"};

          var children=vm.arrayPowerConsumption.children;
          var length=children.length;
          children[length]=jsonObj;

        }
      }

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
            if(jsonObj.id.indexOf("Light")>=0){
              //console.log(JSON.stringify(jsonObj));
              continue;
            }

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

      vm.wampSession.call('eshl.get_all_devices',[vm.currentLanuage]).then(
        // RPC success callback
        function (devices) {
          for(var dev in vm.devices){
            if(dev!="getById"){
              for(var i in devices){
                var device=devices[i];
                var location='';
                var id=device['uid'];
                var name=device['deviceName'];
                var image='assets/images/energy-flows/'+device['deviceImage']+".png";
                var state='';

                var generalInfoList=device["deviceGeneralInfoList"];
                var channels=device['deviceChannelList'];
                if(vm.devices[dev].name==id){
                  for(var i in generalInfoList) {
                    var info = generalInfoList[i];
                    var infoName = info.infoName;
                    var infoValue = info.infoValue;
                    if(infoName=='Location'||infoName=='Standort'||infoName=='地点'){
                      location=infoValue;
                    }
                  }
                  vm.devices[dev].image=image;
                  vm.devices[dev].location=location;

                  if(id.indexOf('Light')>=0){
                    for(var k in vm.lightStates) {
                      var lightID = Object.keys(vm.lightStates[k])[0];
                      if(lightID===id){
                        var lightState=vm.lightStates[k][lightID];
                        var status='';
                        if(lightState==='on'){
                          vm.devices[dev].image="assets/images/energy-flows/Light_on.png";
                         // vm.devices[dev].power=100;
                          if(vm.currentLanuage=='en'){
                            status='On';
                          }else if(vm.currentLanuage=='de'){
                            status='Ein';
                          }else if(vm.currentLanuage=='ch'){
                            status='开启';
                          }
                        }else{
                          vm.devices[dev].image="assets/images/energy-flows/Light_off.png";
                          if(vm.currentLanuage=='en'){
                            status='Off';
                          }else if(vm.currentLanuage=='de'){
                            status='Aus';
                          }else if(vm.currentLanuage=='ch'){
                            status='关闭';
                          }
                        }
                        vm.devices[dev].state=status;
                        break;
                      }
                    }

                    continue;
                  }
                  if(id.indexOf('Blind')>=0){
                    for (var k in vm.blindStates) {
                      var blindID=Object.keys(vm.blindStates[k])[0];
                      var initVal=vm.blindStates[k][blindID];
                        var device = vm.devices[dev];
                        if(device.name==blindID){
                          device.image="assets/images/energy-flows/Blind_"+initVal+".png";
                          if(vm.currentLanuage==='en'){
                            switch(initVal){
                              case 0:
                                device.state="Open:100%";
                                break;
                              case 25:
                                device.state="Closed:25%";
                                break;
                              case 50:
                                device.state="Closed:50%";
                                break;
                              case 75:
                                device.state="Closed:75%";
                                break;
                              case 100:
                                device.state="Closed:100%";
                                break;
                              default:
                                break;
                            }
                          }else if(vm.currentLanuage==='de'){
                            switch(initVal){
                              case 0:
                                device.state="Auf:100%";
                                break;
                              case 25:
                                device.state="Zu:25%";
                                break;
                              case 50:
                                device.state="Zu:50%";
                                break;
                              case 75:
                                device.state="Zu:75%";
                                break;
                              case 100:
                                device.state="Zu:100%";
                                break;
                              default:
                                break;
                            }
                          }else if(vm.currentLanuage==='ch'){
                            switch(initVal){
                              case 0:
                                device.state="打开:100%";
                                break;
                              case 25:
                                device.state="关闭:25%";
                                break;
                              case 50:
                                device.state="关闭:50%";
                                break;
                              case 75:
                                device.state="关闭:75%";
                                break;
                              case 100:
                                device.state="关闭:100%";
                                break;
                              default:
                                break;
                            }
                          }
                          break;

                        }
                    }
                    continue;
                  }

                  for(var j=0;j<channels.length;j++){
                    var channelInfo=channels[j]['channelInfoList'];
                    for(var k=0;k<channelInfo.length;k++){
                      if(channelInfo[k]['infoName']=='stateName' || channelInfo[k]['infoName']=='State'|| channelInfo[k]['infoName']=='Status'||
                        channelInfo[k]['infoName']=='Zustand'|| channelInfo[k]['infoName']=='状态'){
                        var status=channelInfo[k]['infoValue'];
                        vm.devices[dev].state=status;
                        break;
                      }
                    }
                  }

                  break;
                }

              }
              for(var k in vm.board.devices){
                if(vm.board.devices[k].name==vm.devices[dev].name){
                  vm.board.devices[k].image=vm.devices[dev].image;
                  vm.board.devices[k].location=vm.devices[dev].location;
                  vm.board.devices[k].state=vm.devices[dev].state;
                  break;
                }
              }
            }

          }
        },
        // RPC error callback
        function (error) {
          console.log("Call failed:", error);
        }
      );

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

    vm.checkGroupForBlinds=function(group){
      var flag=true;
      for(var i in group.idDevices){
        var deviceId=group.idDevices[i];
        var deviceName= vm.getDeviceById(deviceId).name;
        if(deviceName.indexOf("Blind")<0){
          flag=false;
          break;
        }
      }
      if(flag) return true;
      return false;
    };

    vm.checkGroupForLights=function(group){
      var flag=true;
      for(var i in group.idDevices){
        var deviceId=group.idDevices[i];
        var deviceName= vm.getDeviceById(deviceId).name;
        if(deviceName.indexOf("Light")<0){
          flag=false;
          break;
        }
      }
      if(flag) return true;
      return false;
    }



    $scope.$watch(
      "sharedDeviceStates",
      function handleDeviceStateChange( newValue, oldValue ) {

        for(var dev in vm.board.devices){
          var deviceName=vm.board.devices[dev].name;
         // console.log("devcieName is "+deviceName);
          if(deviceName.indexOf("Light")>=0){
            continue;
          }
          var power='0';
          var state=vm.board.devices[dev].state;

          var flag=false;
          for(var deviceType in $scope.sharedDeviceStates){
            var devices=$scope.sharedDeviceStates[deviceType];
            for(var i=0;i<devices.length;i++){
              var device=devices[i];
              if(device['id']==deviceName){
                var channels=device['channels'];
                for(var j=0;j<channels.length;j++){
                  var channelInfo=channels[j]['channelInfo'];
                  var power_channel='';
                  var state_channel='';
                  for(var k=0;k<channelInfo.length;k++){
                    if(channelInfo[k]['infoName']=='Power' || channelInfo[k]['infoName']=='power'){
                      power_channel=channelInfo[k]['infoValue'];
                    //  console.log("power_channel is "+power_channel);
                    }else if(channelInfo[k]['infoName']=='stateName' || channelInfo[k]['infoName']=='State'|| channelInfo[k]['infoName']=='Status'){
                      state_channel=channelInfo[k]['infoValue'];
                    //  console.log("state_channel is "+state_channel);
                    }
                    if(power_channel!='' && state_channel != ''){
                      power=power_channel;
                      state=state_channel;

                      flag=true;
                      break;
                    }
                  }
                  if(flag)break;
                }
              }
              if(flag)break;
            }
            if(flag){
              break;
            }
          }

          if(!flag && deviceName.indexOf('Light')>=0){
            if(vm.currentLanuage=="en"){
              state='Off';
            }else if(vm.currentLanuage=="de"){
              state='Aus';
            }else{
              state='关闭';
            }

          }


          vm.board.devices[dev].power=power +" W";
          vm.board.devices[dev].state=state;

        }

      }
      ,true);


    // Methods
  //  vm.openCardDialog = DialogService.openCardDialog;

    vm.removeGroup = removeGroup;
    //vm.cardFilter = cardFilter;

    //////////


    /**
     * Add new Group
     */
    vm.addNewGroup=function(newGroupForm)
    {

      vm.newGroupName=$scope.newGroupForm.$editables[0].scope.$data;
      if ( vm.newGroupName === '' )
      {
        return;
      }

      vm.board.groups.push({
        id:   msUtils.guidGenerator(),
        name   : vm.newGroupName,
        idDevices: []
      });

      var deviceGroup={groupName:vm.newGroupName,dwellerName:vm.user.username,devices:[]};
      AddDeviceGroup(deviceGroup).then(function (result) {

        console.log(result);
      });


      vm.newGroupName = '';
      newGroupForm.$cancel();

    }

    /**
     * Remove list
     *
     * @param ev
     * @param list
     */
    function removeGroup(ev, group)
    {
      var confirm = $mdDialog.confirm({
        title              : 'Remove Group',
        parent             : $document.find('#scrumboard'),
        textContent        : 'Are you sure want to remove this group?',
        ariaLabel          : 'remove group',
        targetEvent        : ev,
        clickOutsideToClose: true,
        escapeToClose      : true,
        ok                 : 'Remove',
        cancel             : 'Cancel'
      });
      $mdDialog.show(confirm).then(function ()
      {
        vm.board.groups.splice(vm.board.groups.indexOf(group), 1);
        RemoveDeviceGroup(group.name).then(function (result) {

          console.log(result);
        });


      }, function ()
      {
        // Canceled
      });

    }

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


      if(deviceInfo.name=='Air Conditioner'){
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
                    if(description!=""){
                      content+="<tr ><td style='font-weight:bold'>"+ description+":</td><td>" +
                        "<ng-touch-spin style='width: 50%'  ng-model='touchSpinState'  postfix='&deg;C' ng-change='touchSpinChange(touchSpinState,"+JSON.stringify(deviceID)+","+JSON.stringify(location)+")' initval="+widget.initVal+" decimals="+widget.decimals+" step="+widget.step+">"+
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

    vm.openDeviceDialog=function(event,deviceIDinGroup){
      var device=vm.getDeviceById(deviceIDinGroup);
      var deviceID=device.name;

      var defaultData=new Array();
      var deviceInfo=null;
      var imgUrl=device.image;
      var deviceName=device.name;
      vm.wampSession.call('eshl.get_home_device',[vm.currentLanuage,deviceID]).then(
        // RPC success callback
        function (device) {
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
              clickOutsideToClose: true,
              parent: angular.element(document.body),
              // templateUrl: "app/main/apps/energy-flows/deviceDetails.html",
              template: createDeviceDetailsTemplate(deviceInfo,defaultData),
              targetEvent: $window.event
            })
            .then(function(result) {

              if(deviceID.indexOf('Blind')>=0){
                var imgUrl='assets/images/energy-flows/Blind_'+result+'.png';
                var status=getBlindStatus(result);

                for(var j in vm.board.devices) {

                  if (vm.board.devices[j].name == deviceID) {
                    vm.board.devices[j].image=imgUrl;
                    vm.board.devices[j].state=status;

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

                for(var j in vm.board.devices) {

                  if (vm.board.devices[j].name == deviceID) {
                    vm.board.devices[j].image=imgUrl;
                    vm.board.devices[j].state=status;

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

    function getBlindStatus(sliderState){
      var status="";
      if(vm.currentLanuage=='en'){
        switch(sliderState){
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
        switch(sliderState){
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
        switch(sliderState){
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
      return status;
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
        /*if(vm.currentLanuage==='en'){
          for(var j in deviceInfo.channels){
            var channel=deviceInfo.channels[j];
            var channelInfo=channel.channelInfo;
            for(var k in channelInfo){
              if(channelInfo[k].infoName=='State'|| channelInfo[k].infoName=='Status'){
                if(channelInfo[k].infoValue=='Off'){
                  switchState=false;
                }else if(channelInfo[k].infoValue=='On'){
                  switchState=true;
                }
              }
            }
          }
        }else if(vm.currentLanuage==='de'){
          for(var j in deviceInfo.channels){
            var channel=deviceInfo.channels[j];
            var channelInfo=channel.channelInfo;
            for(var k in channelInfo){
              if(channelInfo[k].infoName=='Zustand'){
                if(channelInfo[k].infoValue.toLowerCase()=='aus'){
                  switchState=false;
                }else if(channelInfo[k].infoValue.toLowerCase()=='ein'){
                  switchState=true;
                }
              }
            }
          }
        }else if(vm.currentLanuage==='ch'){
          for(var j in deviceInfo.channels){
            var channel=deviceInfo.channels[j];
            var channelInfo=channel.channelInfo;
            for(var k in channelInfo){
              if(channelInfo[k].infoName=='状态'){
                if(channelInfo[k].infoValue=='关闭'){
                  switchState=false;
                }else if(channelInfo[k].infoValue=='开启'){
                  switchState=true;
                }
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
        $scope.sliderStateString='';
        var sliderState;
       /* if(vm.currentLanuage==='en'){
          for(var j in deviceInfo.channels){
            var channel=deviceInfo.channels[j];
            var channelInfo=channel.channelInfo;
            for(var k in channelInfo){
              if(channelInfo[k].infoName=='State'|| channelInfo[k].infoName=='Status'){
                switch (channelInfo[k].infoValue){
                  case 'Open: 100%':
                    sliderState=0;
                    $scope.sliderStateString='Open: 100%';
                    break;
                  case 'Closed: 25%':
                    sliderState=25;
                    $scope.sliderStateString='Closed: 25%';
                    break;
                  case 'Closed: 50%':
                    sliderState=50;
                    $scope.sliderStateString='Closed: 50%';
                    break;
                  case 'Closed: 75%':
                    sliderState=75;
                    $scope.sliderStateString='Closed: 75%';
                    break;
                  case 'Closed: 100%':
                    sliderState=100;
                    $scope.sliderStateString='Closed: 100%';
                    break;
                  default:break;
                }

              }
            }
          }
        }else if(vm.currentLanuage==='de'){
          for(var j in deviceInfo.channels){
            var channel=deviceInfo.channels[j];
            var channelInfo=channel.channelInfo;
            for(var k in channelInfo){
              if(channelInfo[k].infoName=='Zustand'){
                switch (channelInfo[k].infoValue){
                  case 'Auf: 100%':
                    sliderState=0;
                    $scope.sliderStateString='Auf: 100%';
                    break;
                  case 'Zu: 25%':
                    sliderState=25;
                    $scope.sliderStateString='Zu: 25%';
                    break;
                  case 'Zu: 50%':
                    sliderState=50;
                    $scope.sliderStateString='Zu: 50%';
                    break;
                  case 'Zu: 75%':
                    sliderState=75;
                    $scope.sliderStateString='Zu: 75%';
                    break;
                  case 'Zu: 100%':
                    sliderState=100;
                    $scope.sliderStateString='Zu: 100%';
                    break;
                  default:break;
                }

              }
            }
          }
        }else if(vm.currentLanuage==='ch'){
          for(var j in deviceInfo.channels){
            var channel=deviceInfo.channels[j];
            var channelInfo=channel.channelInfo;
            for(var k in channelInfo){
              if(channelInfo[k].infoName=='状态'){
                switch (channelInfo[k].infoValue){
                  case '打开: 100%':
                    sliderState=0;
                    $scope.sliderStateString='打开: 100%';
                    break;
                  case '关闭: 25%':
                    sliderState=25;
                    $scope.sliderStateString='关闭: 25%';
                    break;
                  case '关闭: 50%':
                    sliderState=50;
                    $scope.sliderStateString='关闭: 50%';
                    break;
                  case '关闭: 75%':
                    sliderState=75;
                    $scope.sliderStateString='关闭: 75%';
                    break;
                  case '关闭: 100%':
                    sliderState=100;
                    $scope.sliderStateString='关闭: 100%';
                    break;
                  default:break;
                }

              }
            }
          }
        }*/

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
        var eventLogger={deviceID:deviceID,location:location,time:time,action:action,operationMode:"Device_Operation",executor:vm.dweller.name};
        addEventLogger(eventLogger).then(function (result) {
          console.log(result);

        });


      }

      $scope.switchChange=function (switchState, action,deviceID,location) {

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
            switchState='On';
            actionName="Turn "+switchState.toLowerCase();
          }else if(vm.currentLanuage=='de'){
            switchState='Ein';
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
            switchState='Off';
            actionName="Turn "+switchState.toLowerCase();
          }else if(vm.currentLanuage=='de'){
            switchState='Aus';
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
          var widgetState=action.commandList[i].widgetState.toLowerCase();
          if(widgetState==switchState.toLowerCase()){
            // console.log(action.commandList[i]);
            var commandString=action.commandList[i].commandString;
            var command=commandString.split(" ")[0];
            var param=commandString.split(" ")[1];
            // console.log("command is "+command);
            // console.log("param is "+param);
            vm.wampSession.call(command,[param]).then(
              // RPC success callback
              function (result) {
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

      }




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

    vm.changeStateForBlindGroup=function (group,sliderState) {

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

      for(var i in group.idDevices){
        var deviceID=group.idDevices[i];
        var device=vm.getDeviceById(deviceID);
        var deviceName=device.name;
        var location=device.location;

        // UpdateBlindInitVal(deviceName,sliderState).then(function (result) {
        //   console.log(result);
        //
        // });

        for(var j in vm.blindStates) {
          var blindID = Object.keys(vm.blindStates[j])[0];
          if (blindID === deviceName) {
            vm.blindStates[j][blindID]=sliderState;
            break;
          }
        }

        var imgUrl='assets/images/energy-flows/Blind_'+sliderState+'.png';
        var status=getBlindStatus(sliderState);

        device.image=imgUrl;
        device.state=status;

        var actionName=getBlindActionName(sliderState);

        var eventLogger={deviceID:deviceName,location:location,time:time,action:actionName,operationMode:"Group_Operation",executor:vm.dweller.name};
        addEventLogger(eventLogger).then(function (result) {
          console.log(result);

        });
      }
      $window.localStorage.setItem('stage-storage-blind-states', angular.toJson(vm.blindStates));
    };
    function getBlindActionName(sliderState){
      var actionName="";
      if(vm.currentLanuage==='en'){
        switch (sliderState){
          case 0:
            actionName="Set open: 100%";
            break;
          case 25:
            actionName="Set close: 25%";
            break;
          case 50:
            actionName="Set close: 50%";
            break;
          case 75:
            actionName="Set close: 75%";
            break;
          case 100:
            actionName="Set close: 100%";
            break;
          default:
            break;
        }

      }else if(vm.currentLanuage==='de'){
        switch (sliderState){
          case 0:
            actionName="aufmachen: 100%";
            break;
          case 25:
            actionName="zumachen: 25%";
            break;
          case 50:
            actionName="zumachen: 50%";
            break;
          case 75:
            actionName="zumachen: 75%";
            break;
          case 100:
            actionName="zumachen: 100%";
            break;
          default:
            break;
        }
      }else if(vm.currentLanuage==='ch'){
        switch (sliderState){
          case 0:
            actionName="Set open: 100%";
            break;
          case 25:
            actionName="Set close: 25%";
            break;
          case 50:
            actionName="Set close: 50%";
            break;
          case 75:
            actionName="Set close: 75%";
            break;
          case 100:
            actionName="Set close: 100%";
            break;
          default:
            break;
        }
      }
      return actionName;
    }
    vm.changeStateForLightGroup=function (group,switchState) {
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
      var imgUrl='';
      var actionName='';
      var lightState='';

      if(switchState){
        imgUrl='assets/images/energy-flows/Light_on.png';
        lightState='on';
        if(vm.currentLanuage=='en'){
          switchState='On';
          actionName="Turn "+switchState.toLowerCase();
        }else if(vm.currentLanuage=='de'){
          switchState='Ein';
          actionName="einschalten";
        }else{
          switchState='开启';
          actionName="Turn on";
        }

      }else{
        imgUrl='assets/images/energy-flows/Light_off.png';
        lightState='off';
        if(vm.currentLanuage=='en'){
          switchState='Off';
          actionName="Turn "+switchState.toLowerCase();
        }else if(vm.currentLanuage=='de'){
          switchState='Aus';
          actionName="ausschalten";
        }else{
          switchState='关闭';
          actionName="Turn off";
        }
      }
      for(var j in group.idDevices) {
        var deviceID = group.idDevices[j];
        var device = vm.getDeviceById(deviceID);

        device.image=imgUrl;
        device.state=switchState;

        for(var i in vm.lightStates) {
          var lightID = Object.keys(vm.lightStates[i])[0];
          if (lightID === device.name) {
            vm.lightStates[i][lightID]=lightState;
            break;
          }
        }
      }
      $window.localStorage.setItem('stage-storage-light-states', angular.toJson(vm.lightStates));


     /* setTimeout(function () {
        for(var j in group.idDevices) {
          var deviceID = group.idDevices[j];
          var device = vm.getDeviceById(deviceID);
          var controller=device.controllers[0];
          var action=controller.actionList[0];
          var location=device.location;


          if(j>0){
            wait(1000);
          }

          for(var i in action.commandList){
            var widgetState=action.commandList[i].widgetState.toLowerCase();
            if(widgetState==switchState.toLowerCase()){
              var commandString=action.commandList[i].commandString;
              var command=commandString.split(" ")[0];
              var param=commandString.split(" ")[1];


              vm.wampSession.call(command,[param]).then(
                // RPC success callback
                function (result) {
                  console.log(result);
                }

              );


            }
          }
          var eventLogger={deviceID:device.name,location:location,time:time,action:actionName,operationMode:"Group_Operation",executor:vm.dweller.name};
          addEventLogger(eventLogger).then(function (result) {
            console.log(result);

          });
        }
      },500);*/




      setTimeout(function () {
        for(var j in group.idDevices) {
          var deviceID = group.idDevices[j];
          var device = vm.getDeviceById(deviceID);
          var controller=device.controllers[0];
          var action=controller.actionList[0];
          var location=device.location;

          if(j>0){
            wait(1000);
          }

          var eventLogger={deviceID:device.name,location:location,time:time,action:actionName,operationMode:"Group_Operation",executor:vm.dweller.name};
          addEventLogger(eventLogger).then(function (result) {
            console.log(result);

          });
        }
      },500);

    };

    function wait(ms){
      var start = new Date().getTime();
      var end = start;
      while(end < start + ms) {
        end = new Date().getTime();
      }
    }

    vm.getDeviceById=function (deviceId) {
      for(var i in vm.board.devices){
        var device=vm.board.devices[i];
        if(device.id==deviceId){
          return device;
        }
      }
    }

    /**
     * Array prototype
     *
     * Get by id
     *
     * @param value
     * @returns {T}
     */
  /*  Array.prototype.getById = function (value)
    {
      return this.filter(function (x)
      {
        return x.id === value;
      })[0];
    };*/
    function UpdateBlindInitVal(blindName,initVal) {
      return $http.put('http://localhost:8087/bos/api/dummyDevices/blinds/'+blindName+"/"+initVal).then(handleSuccess, handleError('Error updating blind initVal'));
    }
    function GetFloors(admin) {
      return $http.get('http://localhost:8087/bos/api/floors/'+admin).then(handleSuccess, handleError('Error getting all locations'));
    }
    function addEventLogger(eventLogger){
      return $http.post('http://localhost:8087/bos/api/eventLogger/',eventLogger).then(handleSuccess, handleError('Error adding eventLogger'));
    }
    function GetDweller(name) {
      return $http.get('http://localhost:8087/bos/api/users/dweller/'+name).then(handleSuccess, handleError('Error getting the dweller'));
    }
    function GetAllLocations() {
      return $http.get('http://localhost:8087/bos/api/locations/').then(handleSuccess, handleError('Error getting all locations'));
    }
    function GetDeviceGroups(dwellerName) {
      return $http.get('http://localhost:8087/bos/api/deviceGroups/'+dwellerName).then(handleSuccess, handleError('Error getting device groups'));
    }
    function AddDeviceGroup(deviceGroup) {
      return $http.post('http://localhost:8087/bos/api/deviceGroups/',deviceGroup).then(handleSuccess, handleError('Error adding device groups'));
    }
    function UpdateDeviceGroup(deviceGroup) {
      return $http.put('http://localhost:8087/bos/api/deviceGroups/',deviceGroup).then(handleSuccess, handleError('Error adding device groups'));
    }
    function RemoveDeviceGroup(groupName) {
      return $http.delete('http://localhost:8087/bos/api/deviceGroups/'+groupName).then(handleSuccess, handleError('Error getting device groups'));
    }
    function handleSuccess(res) {
      return res.data;
    }
    function handleError(error) {
      return function () {
        return { success: false, message: error };
      };
    }



  }
})();
