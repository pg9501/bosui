(function ()
{
    'use strict';

    angular
        .module('app.dweller.energy-flows')
        .controller('EnergyFlowsController', EnergyFlowsController);

  angular.module('app.dweller.energy-flows').run(['gridsterConfig', function(gridsterConfig) {
    //gridsterConfig.colWidth = 100;

  }]);

    /** @ngInject */
    function EnergyFlowsController($scope, $rootScope, $translate,$window,$cookies, $mdSidenav,$http,msNavigationService,deviceService,WAMPService)
    {
      var vm = this;

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

      var $container=$('#'+"realTimePowerUsage");


    //  WAMPService.openWAMPSession();

      var saveCookie=window.localStorage.getItem('save-cookie');
      var isLogin=window.localStorage.getItem('is-login');
      var user=$cookies.getObject('globals').currentUser;
      if(user.role != 'DWELLER' || (isLogin=='false' && saveCookie=='false')){
       // $state.go('login');
      }

      vm.dweller={};
      GetDweller(user.username).then(function (result) {
        if(result!=null){
          vm.dweller=result;
        }
      });

      var index=user.username.indexOf("_");
      var adminName='admin';
      if(index>=0){
        var postfix=user.username.substring(index);
        adminName+=postfix;
      }
      vm.lightLocations=[];
      adminName="admin";
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

      //update clock time every second on the navigation bar
      $scope.getDate = new Date();
      setInterval(function(){
        $scope.$apply(function(){
          $scope.getDate = new Date();
        });
      }, 1000);

      var lightStateStorage = window.localStorage.getItem('stage-storage-light-states');
      vm.lightStates=[];

      if (lightStateStorage === null || lightStateStorage.length === 0){
        vm.lightStates=[{"Light_K16":"off"},{"Light_K17":"off"},{"Light_K18":"off"},{"Light_K19":"off"},{"Light_K20":"off"},{"Light_K21":"off"},{"Light_2":"off"}];
        $window.localStorage.setItem('stage-storage-light-states', angular.toJson(vm.lightStates));
      }else{
        vm.lightStates=JSON.parse(window.localStorage['stage-storage-light-states']);
      }

      $scope.sharedDeviceStates=deviceService.deviceStates;
      $scope.sharedIdleHomeDevice=deviceService.idleHomeDevice;
      $scope.sharedWeatherData=deviceService.weatherData;

    //  console.log( $scope.sharedDeviceStates);
     // $scope.sharedHomeDevice={"uid":"Air Conditioner","deviceName":"Air Conditioner","deviceImage":"AirConditioner","consumedEnegyTypes":[],"generatedEnegyTypes":["ELECTRICITY"],"deviceGeneralInfoList":[{"infoName":"Location","infoValue":"Kitchen","unit":null}],"deviceChannelList":[{"channelName":"Air Conditioner","channelInfoList":[{"infoName":"Power","infoValue":"0.0","unit":"W"},{"infoName":"State","infoValue":"Off","unit":null}],"actions":[{"actionName":"TURN ON","description":null}]}]};
      $scope.sharedDeviceStates.coldGeneration=[{"name":"name11"}];
      $scope.sharedDeviceStates.gasConsumption=[{"name":"name12"}];
      $scope.sharedDeviceStates.heatGeneration=[{"name":"name13"}];
      $scope.sharedDeviceStates.powerConsumption=[{"name":"name14"}];
      $scope.sharedDeviceStates.powerGeneration=[{"name":"name15"}];

      $scope.test=0;

      vm.currentLanuage="en";

      vm.wampSession=WAMPService.getWAMPsession();

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

      // Widget 1
      vm.widget1 = {
        title: 'Tariff and Load Limit Signals for next 24 hours'
      };

      $rootScope.$on('$translateChangeSuccess', function () {

        if($translate.use().substring(0,1)=='c'){
          vm.currentLanuage="ch";
          vm.widget1.title="未来24小时的电价和电压负载限制信号";
        }
        if($translate.use().substring(0,1)=='e'){
          vm.currentLanuage="en";
          vm.widget1.title="Tariff and power load limit signals for next 24 hours";
        }
        if($translate.use().substring(0,1)=='d'){
          vm.currentLanuage="de";
          vm.widget1.title="Tarif- und Leistungslast-Grenzsignale für die nächsten 24 Stunden";
        }


        vm.arrayPowerConsumption.name=$translate.instant('ENERGY_OVERVIEW.POWER_CONSUMPTION');
        vm.arrayPowerGeneration.name=$translate.instant('ENERGY_OVERVIEW.POWER_GENERATION');
        vm.arrayHeatGeneration.name=$translate.instant('ENERGY_OVERVIEW.HEAT_GENERATION');
        vm.arrayColdGeneration.name=$translate.instant('ENERGY_OVERVIEW.COLD_GENERATION');
        vm.arrayGasConsumption.name=$translate.instant('ENERGY_OVERVIEW.GAS_CONSUMPTION');

      });



     // vm.electricityPrices=TariffData.data;
     // vm.powerUpperLimitData=powerUpperLimitData.data;
    /*  vm.arrayPowerConsumption={name:"Power Consumption",children:[]};
      vm.arrayPowerGeneration={name:"Power Generation",children:[]};
      vm.arrayHeatGeneration={name:"Heat Generation",children:[]};
      vm.arrayColdGeneration={name:"Cold Generation",children:[]};
      vm.arrayGasConsumption={name:"Gas Consumption",children:[]};*/

      vm.arrayPowerConsumption={name:"Power-consuming devices",children:[]};
      vm.arrayPowerGeneration={name:"Power-generating devices",children:[]};
      vm.arrayHeatGeneration={name:"Heat-generating devices",children:[]};
      vm.arrayColdGeneration={name:"Cold-generating devices",children:[]};
      vm.arrayGasConsumption={name:"Gas-consuming devices",children:[]};

      vm.toggleSidenav = toggleSidenav;



        // Data
        vm.gridsterOpts = {
          margins: [15, 15],
          outerMargin: false,
          pushing: true,
          floating: true,
          draggable: {
            enabled: true
          },
          resizable: {
            enabled: true,
            handles: ['n', 'e', 's', 'w', 'se', 'sw']
          }
        };
      // these map directly to gridsterItem options
      vm.items1 = [{
        type: 'powerConsumption',
        sizeX: 2,
        sizeY: 2,
        row: 0,
        col: 0
      }, {
        type: 'powerGeneration',
        sizeX: 2,
        sizeY: 2,
        row: 0,
        col: 2
      },
        {
          type: 'heatGeneration',
          sizeX: 2,
          sizeY: 2,
          row: 0,
          col: 4
        }, {
          type: 'coldGeneration',
          sizeX: 2,
          sizeY: 2,
          row: 0,
          col: 6
        }, {
          type: 'gasConsumption',
          sizeX: 2,
          sizeY: 2,
          row: 0,
          col: 8
        },
        {
          type: '',
          sizeX: 10,
          sizeY: 3,
          row: 2,
          col: 0
        }

      ];
      vm.items_chart = [{
        type: '',
        sizeX: 10,
        sizeY: 2,
        row: 2,
        col: 0
      }];

      // Methods

      /**
       * Toggle sidenav
       *
       * @param sidenavId
       */
      function toggleSidenav(sidenavId)
      {
        $mdSidenav(sidenavId).toggle();
      }

//////////

      function GetDweller(name) {
        return $http.get('http://localhost:8087/bos/api/users/dweller/'+name).then(handleSuccess, handleError('Error getting the dweller'));
      }
      function GetFloors(admin) {
        return $http.get('http://localhost:8087/bos/api/floors/'+admin).then(handleSuccess, handleError('Error getting all locations'));
      }
      function handleSuccess(res) {
        return res.data;
      }
      function handleError(error) {
        return function () {
          return { success: false, message: error };
        };
      }

      function isJson(str) {
        try {
          JSON.parse(str);
        } catch (e) {
          return false;
        }
        return true;
      }

      function isNumber(s)
      {
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

              /*if( operations.indexOf("CONTROL_DEVICE")>-1){
                var deviceChannelList=deviceJavaObj["deviceChannelList"];
                for(var i in deviceChannelList) {
                  var channel=deviceChannelList[i];
                  var channelName=channel.channelName;
                  var channelInfo=channel.channelInfoList;
                  var actions=channel.actions;
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

                  for(var k in actions){
                    var action=actions[k];
                    var widget=action.widget;
                    var command=action.command;
                    actionArray.push({"widget":widget,"command":command});
                  }
                  channelList.push({"channelName":channelName,"channelInfo":channelInfoArray,"actions":actionArray});
                }
              }*/
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

       // console.log("the json of the HomeDevice class:");
       // console.log(json);

        return json;

      }

      deviceService.generateJsonFromJavaObj=vm.generateJsonFromJavaObj;

      var homeCurrentLoad=0;
      var homePowerGeneration=0;
      var homePowerConsumption=0;

     // vm.sendToServer('get_Running_Devices');
      //vm.powerConsuming=[{key : "Consuming", value : 200},{key : "Generating", value : 100}];
      //vm.powerGenerating=[{key : "Generating", value : 100}];

      vm.currentLoad=150;
      vm.powerUpperLimit= 3000;
      vm.powerLowerLimit= -3000;
      vm.currentVoltage=217.7;
      vm.currentFrequency=49.98;
      vm.loadRoundProgressColor="#64bd64";
      vm.currentElectricityPrice = 25;
      vm.currentPvFeedinPrice =12;
      vm.currentChpFeedinPrice=8;
      vm.currentGasPrice=9;

      vm.powerUsage=[{key : "Con/Gen", power : 1860,loadLimit: vm.powerUpperLimit},{key : "Con/Gen", power : -850, loadLimit: vm.powerLowerLimit},{key : "Net", power : 1010}];


      ///////////////// WAMP Router Connection Start/////////////////// get epsTopic, plsTopic




     /* function epsHandler (args) {
        var msg = args[0];
        //    console.log("event for 'eshl.signals.eps' received: ");

        var prices_activePowerExternal = msg['ACTIVEPOWEREXTERNAL']['prices'];
        var prices_naturalGasPowerExternal = msg['NATURALGASPOWEREXTERNAL']['prices'];
        var prices_pvFeedin = msg['PVACTIVEPOWERFEEDIN']['prices'];
        var prices_chpFeedin = msg['CHPACTIVEPOWERFEEDIN']['prices'];
        var timeList_electricityPrice = Object.keys(prices_activePowerExternal);
        var timeList_pvFeedin = Object.keys(prices_pvFeedin);
        var timeList_chpFeedin = Object.keys(prices_pvFeedin);
        var timeList_gasPrice = Object.keys(prices_naturalGasPowerExternal);
        var electricityPriceList = Object.values(prices_activePowerExternal);
        var pvFeedinPriceList = Object.values(prices_pvFeedin);
        var chpFeedinPriceList = Object.values(prices_chpFeedin);
        //var firstTime = timeList[0];
        //var firstPrice = priceList[0];

        // console.log(pvFeedinPriceList);

        vm.electricityPrices = [];
        vm.pvFeedinPrices = [];
        vm.chpFeedinPrices = [];
        var date = new Date();
        var currentSec = date.getSeconds();
        var totalSec = Date.now() / 1000 | 0;

        var currentTimestamp = totalSec - currentSec;
        // console.log(currentTimestamp);
        var endTimestamp = currentTimestamp + 86400;
        for (var i = 0; i < timeList_electricityPrice.length; i++) {
          if (timeList_electricityPrice[i] >= currentTimestamp && timeList_electricityPrice[i] <= endTimestamp) {
            var electricityPrice = {"x": timeList_electricityPrice[i], "y": electricityPriceList[i]};
            vm.electricityPrices.push(electricityPrice);
          }
        }

        for (var i = 0; i < timeList_pvFeedin.length; i++) {
          if (timeList_pvFeedin[i] >= currentTimestamp && timeList_pvFeedin[i] <= endTimestamp) {
            var pvFeedinPrice = {"x": timeList_pvFeedin[i], "y": pvFeedinPriceList[i]};
            vm.pvFeedinPrices.push(pvFeedinPrice);
          }
        }

        for (var i = 0; i < timeList_chpFeedin.length; i++) {
          if (timeList_chpFeedin[i] >= currentTimestamp && timeList_chpFeedin[i] <= endTimestamp) {
            var chpFeedinPrice = {"x": timeList_chpFeedin[i], "y": chpFeedinPriceList[i]};
            vm.chpFeedinPrices.push(chpFeedinPrice);
          }
        }

        if (vm.electricityPrices.length == 0) {
          var electricityPrice = {"x": currentTimestamp, "y": electricityPriceList[electricityPriceList.length - 1]};
          vm.electricityPrices.push(electricityPrice);
        }
        if (vm.pvFeedinPrices.length == 0) {
          var pvFeedinPrice = {"x": currentTimestamp, "y": pvFeedinPriceList[pvFeedinPriceList.length - 1]};
          vm.pvFeedinPrices.push(pvFeedinPrice);
        }
        if (vm.chpFeedinPrices.length == 0) {
          var chpFeedinPrice = {"x": currentTimestamp, "y": chpFeedinPriceList[chpFeedinPriceList.length - 1]};
          vm.chpFeedinPrices.push(chpFeedinPrice);
        }
        if (vm.electricityPrices[0]['x'] > currentTimestamp) {
          for (var time = currentTimestamp; time < vm.electricityPrices[0]['x']; time += 60) {
            var electricityPrice = {"x": time, "y": electricityPriceList[0]};
            vm.electricityPrices.push(electricityPrice);
          }
        }
        if (vm.pvFeedinPrices[0]['x'] > currentTimestamp) {
          for (var time = currentTimestamp; time < vm.electricityPrices[0]['x']; time += 60) {
            var pvFeedinPrice = {"x": time, "y": pvFeedinPriceList[0]};
            vm.pvFeedinPrices.push(pvFeedinPrice);
          }
        }
        if (vm.chpFeedinPrices[0]['x'] > currentTimestamp) {
          var chpFeedinPrice = {"x": time, "y": chpFeedinPriceList[0]};
          vm.chpFeedinPrices.push(chpFeedinPrice);
        }
        if (vm.electricityPrices[vm.electricityPrices.length - 1]['x'] < endTimestamp) {
          for (var time = vm.electricityPrices[vm.electricityPrices.length - 1]['x'] + 60; time <= endTimestamp; time += 60) {
            var electricityPrice = {"x": time, "y": electricityPriceList[electricityPriceList.length - 1]};
            vm.electricityPrices.push(electricityPrice);
          }
        }

        if (vm.pvFeedinPrices[vm.pvFeedinPrices.length - 1]['x'] < endTimestamp) {
          for (var time = vm.pvFeedinPrices[vm.pvFeedinPrices.length - 1]['x'] + 60; time <= endTimestamp; time += 60) {
            var pvFeedinPrice = {"x": time, "y": pvFeedinPriceList[pvFeedinPriceList.length - 1]};
            vm.pvFeedinPrices.push(pvFeedinPrice);
          }
        }
        if (vm.chpFeedinPrices[vm.chpFeedinPrices.length - 1]['x'] < endTimestamp) {
          for (var time = vm.chpFeedinPrices[vm.chpFeedinPrices.length - 1]['x'] + 60; time <= endTimestamp; time += 60) {
            var chpFeedinPrice = {"x": time, "y": chpFeedinPriceList[chpFeedinPriceList.length - 1]};
            vm.chpFeedinPrices.push(chpFeedinPrice);
          }
        }

        // console.log( timeList );
        //  console.log("tariff history: ");

        vm.currentElectricityPrice = vm.electricityPrices[0]['y'];
        vm.currentPvFeedinPrice =vm.pvFeedinPrices[0]['y'];
        vm.currentChpFeedinPrice=vm.chpFeedinPrices[0]['y'];

        var gasPriceList = Object.values(prices_naturalGasPowerExternal);
        // firstTime = timeList[currentTimestamp];
        if(timeList_gasPrice.indexOf(currentTimestamp)>=0){
          vm.currentGasPrice =gasPriceList[currentTimestamp];
        }else{
          vm.currentGasPrice =gasPriceList[gasPriceList.length-1];
        }

      }*/


      /*function plsHandler (args) {
        var msg = args[0];
        //      console.log("event for 'eshl.signals.pls' received: ");
        //console.log(msg);

        var upperLoadLimitSignals = msg['ACTIVEPOWEREXTERNAL']['powerLimits'];
        var timeList = Object.keys(upperLoadLimitSignals);
        var powerList = Object.values(upperLoadLimitSignals);
        vm.powerUpperLimitData = [];
        vm.powerLowerLimitData = [];
        var date = new Date();
        var currentSec = date.getSeconds();
        var totalSec = Date.now() / 1000 | 0;
        var currentTimestamp = totalSec - currentSec;
        var endTimestamp = currentTimestamp + 86400;
        // console.log("timestamp: "+currentTimestamp);
        for (var i = 0; i < timeList.length; i++) {
          if (timeList[i] >= currentTimestamp && timeList[i] <= endTimestamp) {
            var upperLoadLimit = {"x": timeList[i], "y": powerList[i]['powerUpperLimit']};
            vm.powerUpperLimitData.push(upperLoadLimit);
            var lowerLoadLimit = {"x": timeList[i], "y": powerList[i]['powerLowerLimit']};
            vm.powerLowerLimitData.push(lowerLoadLimit);
          }
        }
        if (vm.powerUpperLimitData.length == 0) {
          var upperLoadLimit = {"x": currentTimestamp, "y": powerList[0]['powerUpperLimit']};
          vm.powerUpperLimitData.push(upperLoadLimit);

          var lowerLoadLimit = {"x": currentTimestamp, "y": powerList[0]['powerLowerLimit']};
          vm.powerLowerLimitData.push(lowerLoadLimit);
        }
        if (vm.powerUpperLimitData[0]['x'] > currentTimestamp) {
          for (var time = currentTimestamp; time < vm.powerUpperLimitData[0]['x']; time += 60) {
            var upperLoadLimit = {"x": time, "y": powerList[0]['powerUpperLimit']};
            vm.powerUpperLimitData.push(upperLoadLimit);

            var lowerLoadLimit = {"x": time, "y": powerList[0]['powerLowerLimit']};
            vm.powerLowerLimitData.push(lowerLoadLimit);
          }
        }
        if (vm.powerUpperLimitData[vm.powerUpperLimitData.length - 1]['x'] < endTimestamp) {
          for (var time = vm.powerUpperLimitData[vm.powerUpperLimitData.length - 1]['x'] + 60; time <= endTimestamp; time += 60) {
            var upperLoadLimit = {"x": time, "y": powerList[powerList.length - 1]['powerUpperLimit']};
            vm.powerUpperLimitData.push(upperLoadLimit);

            var lowerLoadLimit = {"x": time, "y": powerList[powerList.length - 1]['powerLowerLimit']};
            vm.powerLowerLimitData.push(lowerLoadLimit);
          }
        }
        vm.powerUpperLimit=vm.powerUpperLimitData[0]['y'];
        vm.powerLowerLimit=vm.powerLowerLimitData[0]['y'];
      }*/

      function weatherPredictionHandler (args) {

      }
      function weatherCurrentHandler (args) {
        var msg = args[0];
        console.log("event for 'current weather' received: ");
        var weekday = new Array(7);
        weekday[0]=  "Sunday";
        weekday[1] = "Monday";
        weekday[2] = "Tuesday";
        weekday[3] = "Wednesday";
        weekday[4] = "Thursday";
        weekday[5] = "Friday";
        weekday[6] = "Saturday";
        var currentData=JSON.parse(args[0]);
        var currentDate=currentData['dt'];
        var day=new Date(currentDate*1000),
          hour=day.getHours(),
          minute=day.getMinutes(),
          dd = day.getDate(),
          mm =day.getMonth()+1, //January is 0!
          yyyy =day.getFullYear(),
          week = weekday[day.getDay()];
        var currentDayStr =yyyy+"-"+mm+"-"+dd;
        var currentTimeStr=hour+":"+minute;
        var weatherCurrent={
          "type":"Observed",
          "date":currentDayStr,
          "time":currentTimeStr,
          "week":week,
          "weather":currentData['weather'][0]['description'],
          "icon":currentData['weather'][0]['icon'],
          "humidity":currentData['main']['humidity'],
          "temp_max":Math.round((currentData['main']['temp_max']-273.15)* 10 ) / 10,
          "temp_min":Math.round((currentData['main']['temp_min']-273.15)* 10 ) / 10,
          "temp":Math.round((currentData['main']['temp']-273.15)* 10 ) / 10,
          "wind_speed":Math.round(currentData['wind']['speed']* 10 ) / 10,
          "pressure":Math.round(currentData['main']['pressure']* 10 ) / 10
        };
        // console.log(currentData);



        /*          var prediction=$scope.sharedWeatherData.prediction;
         $scope.sharedWeatherData.prediction=[];
         $scope.sharedWeatherData.current=[];
         $scope.sharedWeatherData.prediction=prediction;*/
        // $scope.sharedWeatherData.current=[];
        //  $scope.sharedWeatherData.current.push(weatherCurrent);

        var current= new Array();
        current.push(weatherCurrent);
        // $scope.sharedWeatherData.current.splice(0, 1);
        $scope.sharedWeatherData.current=current;
        //console.log($scope.sharedCurrentWeatherData);
      }


      // SUBSCRIBE to a topic and receive events
    /*  vm.wampSession.subscribe('eshl.signals.eps', epsHandler).then(
        function (subscription) {
          console.log("subscription.id");
          console.log(subscription.id);
          //     setInterval(function(){
          var getHistory = function () {

            vm.wampSession.call('wamp.subscription.get_events', [subscription.id, 1]).then(
              function (history) {
                if (history.length !== 0) {
                  //handling past data here
                  //        console.log("history eshl.signals.eps received!");
                  var prices_activePowerExternal = history[0]['args'][0]['ACTIVEPOWEREXTERNAL']['prices'];

                  var prices_pvFeedin = history[0]['args'][0]['PVACTIVEPOWERFEEDIN']['prices'];
                  var prices_chpFeedin = history[0]['args'][0]['CHPACTIVEPOWERFEEDIN']['prices'];
                  var prices_naturalGasPowerExternal = history[0]['args'][0]['NATURALGASPOWEREXTERNAL']['prices'];
                  var timeList_electricityPrice = Object.keys(prices_activePowerExternal);
                  var timeList_pvFeedin = Object.keys(prices_pvFeedin);
                  var timeList_chpFeedin = Object.keys(prices_chpFeedin);
                  var timeList_gasPrice = Object.keys(prices_naturalGasPowerExternal);
                  var electricityPriceList = Object.values(prices_activePowerExternal);
                  var pvFeedinPriceList = Object.values(prices_pvFeedin);
                  var chpFeedinPriceList = Object.values(prices_chpFeedin);

                  vm.electricityPrices = [];
                  vm.pvFeedinPrices = [];
                  vm.chpFeedinPrices = [];
                  var date = new Date();
                  var currentSec = date.getSeconds();
                  var totalSec = Date.now() / 1000 | 0;

                  var currentTimestamp = totalSec - currentSec;
                  // console.log(currentTimestamp);
                  var endTimestamp = currentTimestamp + 86400;
                  for (var i = 0; i < timeList_electricityPrice.length; i++) {
                    if (timeList_electricityPrice[i] >= currentTimestamp && timeList_electricityPrice[i] <= endTimestamp) {
                      var electricityPrice = {"x": parseInt(timeList_electricityPrice[i]), "y": parseInt(electricityPriceList[i])};
                      vm.electricityPrices.push(electricityPrice);
                    }
                  }


                  for (var i = 0; i < timeList_pvFeedin.length; i++) {

                    if (timeList_pvFeedin[i] >= currentTimestamp && timeList_pvFeedin[i] <= endTimestamp) {

                      var pvFeedinPrice = {"x": parseInt(timeList_pvFeedin[i]), "y": parseInt(pvFeedinPriceList[i])};
                      vm.pvFeedinPrices.push(pvFeedinPrice);
                    }
                  }

                  for (var i = 0; i < timeList_chpFeedin.length; i++) {
                    if (timeList_chpFeedin[i] >= currentTimestamp && timeList_chpFeedin[i] <= endTimestamp) {
                      var chpFeedinPrice = {"x": parseInt(timeList_chpFeedin[i]), "y": parseInt(chpFeedinPriceList[i])};
                      vm.chpFeedinPrices.push(chpFeedinPrice);
                    }
                  }

                  if (vm.electricityPrices.length == 0) {
                    var electricityPrice = {"x": currentTimestamp, "y": electricityPriceList[electricityPriceList.length - 1]};
                    vm.electricityPrices.push(electricityPrice);
                  }
                  if (vm.pvFeedinPrices.length == 0) {

                    var pvFeedinPrice = {"x": currentTimestamp, "y": pvFeedinPriceList[pvFeedinPriceList.length - 1]};
                    vm.pvFeedinPrices.push(pvFeedinPrice);
                  }
                  if (vm.chpFeedinPrices.length == 0) {
                    var chpFeedinPrice = {"x": currentTimestamp, "y": chpFeedinPriceList[chpFeedinPriceList.length - 1]};
                    vm.chpFeedinPrices.push(chpFeedinPrice);
                  }

                  //fill in missing values
                  var firstValue=vm.electricityPrices[0];
                  var tempArray=new Array();
                  tempArray.push(firstValue);
                  for(var i=1;i<vm.electricityPrices.length;i++) {
                    var secondValue = vm.electricityPrices[i];
                    if (secondValue['x'] - firstValue['x'] > 60) {
                      for(var j=firstValue['x'];j<=secondValue['x'];j+=60) {
                        var item={"x":j,"y":firstValue['y']};
                        tempArray.push(item);
                      }
                    }
                    tempArray.push(secondValue);
                    firstValue=secondValue;
                  }
                  vm.electricityPrices=tempArray;

                  //fill in missing values
                  var firstValue=vm.pvFeedinPrices[0];
                  var tempArray=new Array();
                  tempArray.push(firstValue);
                  for(var i=1;i<vm.pvFeedinPrices.length;i++) {
                    var secondValue = vm.pvFeedinPrices[i];
                    if (secondValue['x'] - firstValue['x'] > 60) {
                      for(var j=firstValue['x'];j<=secondValue['x'];j+=60) {
                        var item={"x":j,"y":firstValue['y']};
                        tempArray.push(item);
                      }
                    }
                    tempArray.push(secondValue);
                    firstValue=secondValue;
                  }
                  vm.pvFeedinPrices=tempArray;

                  //fill in missing values
                  var firstValue=vm.chpFeedinPrices[0];
                  var tempArray=new Array();
                  tempArray.push(firstValue);
                  for(var i=1;i<vm.chpFeedinPrices.length;i++) {
                    var secondValue = vm.chpFeedinPrices[i];
                    if (secondValue['x'] - firstValue['x'] > 60) {
                      for(var j=firstValue['x'];j<=secondValue['x'];j+=60) {
                        var item={"x":j,"y":firstValue['y']};
                        tempArray.push(item);
                      }
                    }
                    tempArray.push(secondValue);
                    firstValue=secondValue;
                  }
                  vm.chpFeedinPrices=tempArray;

                  if (vm.electricityPrices[0]['x'] > currentTimestamp) {
                    var tempArray=new Array();
                    for (var time = currentTimestamp; time < vm.electricityPrices[0]['x']; time += 60) {
                      var electricityPrice = {"x": time, "y":  vm.electricityPrices[0]['y']};
                      // vm.electricityPrices.push(electricityPrice);
                      tempArray.push(electricityPrice);
                    }
                    if(tempArray.length>0){
                      vm.electricityPrices=tempArray.concat(vm.electricityPrices);
                    }

                  }
                  if (vm.pvFeedinPrices[0]['x'] > currentTimestamp) {
                    var tempArray=new Array();
                    for (var time = currentTimestamp; time < vm.pvFeedinPrices[0]['x']; time += 60) {
                      var pvFeedinPrice = {"x": time, "y": vm.pvFeedinPrices[0]['y']};
                      tempArray.push(pvFeedinPrice);
                    }
                    if(tempArray.length>0){
                      vm.pvFeedinPrices=tempArray.concat(vm.pvFeedinPrices);
                    }
                  }
                  if (vm.chpFeedinPrices[0]['x'] > currentTimestamp) {
                    var tempArray = new Array();
                    for (var time = currentTimestamp; time < vm.chpFeedinPrices[0]['x']; time += 60) {
                      var chpFeedinPrice = {"x": time, "y": vm.chpFeedinPrices[0]['y']};
                      tempArray.push(chpFeedinPrice);
                    }
                    if (tempArray.length > 0) {
                      vm.chpFeedinPrices = tempArray.concat(vm.chpFeedinPrices);
                    }
                  }


                  if (vm.electricityPrices[vm.electricityPrices.length - 1]['x'] < endTimestamp) {
                    for (var time = vm.electricityPrices[vm.electricityPrices.length - 1]['x'] + 60; time <= endTimestamp; time += 60) {
                      var electricityPrice = {"x": time, "y": vm.electricityPrices[vm.electricityPrices.length - 1]['y']};
                      vm.electricityPrices.push(electricityPrice);
                    }
                  }

                  if (vm.pvFeedinPrices[vm.pvFeedinPrices.length - 1]['x'] < endTimestamp) {
                    for (var time = vm.pvFeedinPrices[vm.pvFeedinPrices.length - 1]['x'] + 60; time <= endTimestamp; time += 60) {
                      var pvFeedinPrice = {"x": time, "y": pvFeedinPriceList[pvFeedinPriceList.length - 1]};
                      vm.pvFeedinPrices.push(pvFeedinPrice);
                    }
                  }
                  if (vm.chpFeedinPrices[vm.chpFeedinPrices.length - 1]['x'] < endTimestamp) {
                    for (var time = vm.chpFeedinPrices[vm.chpFeedinPrices.length - 1]['x'] + 60; time <= endTimestamp; time += 60) {
                      var chpFeedinPrice = {"x": time, "y": chpFeedinPriceList[chpFeedinPriceList.length - 1]};
                      vm.chpFeedinPrices.push(chpFeedinPrice);
                    }
                  }
                  vm.currentElectricityPrice = vm.electricityPrices[0]['y'];
                  vm.currentPvFeedinPrice =vm.pvFeedinPrices[0]['y'];
                  vm.currentChpFeedinPrice=vm.chpFeedinPrices[0]['y'];



                  var gasPriceList = Object.values(prices_naturalGasPowerExternal);
                  // firstTime = timeList[currentTimestamp];
                  if(timeList_gasPrice.indexOf(currentTimestamp)>=0){
                    vm.currentGasPrice =gasPriceList[currentTimestamp];
                  }else{
                    vm.currentGasPrice =gasPriceList[gasPriceList.length-1];
                  }

                }
              },
              function (error) {
                console.log(error);
              }
            );
          };
          getHistory();
          setInterval(getHistory, 60*1000);
          //    }(), 60*1000); //update every minute
        },
        function (error) {
          console.log(error);
        }
      );*/

      function predictionHandler (args) {
        var msg = args[0];
        //console.log(msg);
        var scheduleMsg = msg['schedules'];
        var epsMsg = msg['priceSignals'];
        var plsMsg = msg['powerLimitSignals'];

        epsHandler (epsMsg,['external','pv','chp']);
        plsHandler (plsMsg);
      }

      vm.startDate=new Date();
      vm.startTime=vm.startDate;
      vm.endDate=new Date();
      vm.endDate.setDate(new Date().getDate() + 1);
      vm.endTime=vm.endDate;

      vm.startTimeStamp =(vm.startTime.getTime())/ 1000 | 0;

      vm.endTimeStamp =(vm.endTime.getTime())/ 1000 | 0;

      function epsHandler (msg,type) {

        var prices_activePowerExternal = msg['ACTIVEPOWEREXTERNAL']['prices'];

        var prices_pvFeedin = msg['PVACTIVEPOWERFEEDIN']['prices'];
        var prices_chpFeedin = msg['CHPACTIVEPOWERFEEDIN']['prices'];
        var timeList_electricityPrice = Object.keys(prices_activePowerExternal);
        var timeList_pvFeedin = Object.keys(prices_pvFeedin);
        var timeList_chpFeedin = Object.keys(prices_chpFeedin);
        var electricityPriceList = Object.values(prices_activePowerExternal);
        var pvFeedinPriceList = Object.values(prices_pvFeedin);
        var chpFeedinPriceList = Object.values(prices_chpFeedin);

        if(type.indexOf('external')>=0){
          vm.electricityPrices = [];

          for (var i = 0; i < timeList_electricityPrice.length; i++) {
            if (timeList_electricityPrice[i] >= vm.startTimeStamp && timeList_electricityPrice[i] <= vm.endTimeStamp) {
              var electricityPrice = {"x": parseInt(timeList_electricityPrice[i]), "y": parseInt(electricityPriceList[i])};
              vm.electricityPrices.push(electricityPrice);
            }
          }
          if (vm.electricityPrices.length == 0) {
            var electricityPrice = {"x": vm.startTimeStamp, "y": electricityPriceList[electricityPriceList.length - 1]};
            vm.electricityPrices.push(electricityPrice);
          }
          //fill in missing values
          var firstValue=vm.electricityPrices[0];
          var tempArray=new Array();
          tempArray.push(firstValue);
          for(var i=1;i<vm.electricityPrices.length;i++) {
            var secondValue = vm.electricityPrices[i];
            if (secondValue['x'] - firstValue['x'] > 60) {
              for(var j=firstValue['x'];j<=secondValue['x'];j+=60) {
                var item={"x":j,"y":firstValue['y']};
                tempArray.push(item);
              }
            }
            tempArray.push(secondValue);
            firstValue=secondValue;
          }
          vm.electricityPrices=tempArray;

        }

        if(type.indexOf('pv')>=0){
          vm.pvFeedinPrices = [];

          for (var i = 0; i < timeList_pvFeedin.length; i++) {

            if (timeList_pvFeedin[i] >= vm.startTimeStamp && timeList_pvFeedin[i] <= vm.endTimeStamp) {

              var pvFeedinPrice = {"x": parseInt(timeList_pvFeedin[i]), "y": parseInt(pvFeedinPriceList[i])};
              vm.pvFeedinPrices.push(pvFeedinPrice);
            }
          }
          if (vm.pvFeedinPrices.length == 0) {

            var pvFeedinPrice = {"x": vm.startTimeStamp, "y": pvFeedinPriceList[pvFeedinPriceList.length - 1]};
            vm.pvFeedinPrices.push(pvFeedinPrice);
          }
          //fill in missing values
          var firstValue=vm.pvFeedinPrices[0];
          var tempArray=new Array();
          tempArray.push(firstValue);
          for(var i=1;i<vm.pvFeedinPrices.length;i++) {
            var secondValue = vm.pvFeedinPrices[i];
            if (secondValue['x'] - firstValue['x'] > 60) {
              for(var j=firstValue['x'];j<=secondValue['x'];j+=60) {
                var item={"x":j,"y":firstValue['y']};
                tempArray.push(item);
              }
            }
            tempArray.push(secondValue);
            firstValue=secondValue;
          }
          vm.pvFeedinPrices=tempArray;

          if (vm.pvFeedinPrices[0]['x'] > vm.startTimeStamp) {
            var tempArray=new Array();
            for (var time = vm.startTimeStamp; time < vm.pvFeedinPrices[0]['x']; time += 60) {
              var pvFeedinPrice = {"x": time, "y": vm.pvFeedinPrices[0]['y']};
              tempArray.push(pvFeedinPrice);
            }
            if(tempArray.length>0){
              vm.pvFeedinPrices=tempArray.concat(vm.pvFeedinPrices);
            }
          }
          if (vm.pvFeedinPrices[vm.pvFeedinPrices.length - 1]['x'] < vm.endTimeStamp) {
            for (var time = vm.pvFeedinPrices[vm.pvFeedinPrices.length - 1]['x'] + 60; time <= vm.endTimeStamp; time += 60) {
              var pvFeedinPrice = {"x": time, "y": pvFeedinPriceList[pvFeedinPriceList.length - 1]};
              vm.pvFeedinPrices.push(pvFeedinPrice);
            }
          }

        }

        if(type.indexOf('chp')>=0){
          vm.chpFeedinPrices = [];

          for (var i = 0; i < timeList_chpFeedin.length; i++) {
            if (timeList_chpFeedin[i] >= vm.startTimeStamp && timeList_chpFeedin[i] <= vm.endTimeStamp) {
              var chpFeedinPrice = {"x": parseInt(timeList_chpFeedin[i]), "y": parseInt(chpFeedinPriceList[i])};
              vm.chpFeedinPrices.push(chpFeedinPrice);
            }
          }
          if (vm.chpFeedinPrices.length == 0) {
            var chpFeedinPrice = {"x": vm.startTimeStamp, "y": chpFeedinPriceList[chpFeedinPriceList.length - 1]};
            vm.chpFeedinPrices.push(chpFeedinPrice);
          }
          //fill in missing values
          var firstValue=vm.chpFeedinPrices[0];
          var tempArray=new Array();
          tempArray.push(firstValue);
          for(var i=1;i<vm.chpFeedinPrices.length;i++) {
            var secondValue = vm.chpFeedinPrices[i];
            if (secondValue['x'] - firstValue['x'] > 60) {
              for(var j=firstValue['x'];j<=secondValue['x'];j+=60) {
                var item={"x":j,"y":firstValue['y']};
                tempArray.push(item);
              }
            }
            tempArray.push(secondValue);
            firstValue=secondValue;
          }
          vm.chpFeedinPrices=tempArray;
          if (vm.chpFeedinPrices[0]['x'] > vm.startTimeStamp) {
            var tempArray = new Array();
            for (var time = vm.startTimeStamp; time < vm.chpFeedinPrices[0]['x']; time += 60) {
              var chpFeedinPrice = {"x": time, "y": vm.chpFeedinPrices[0]['y']};
              tempArray.push(chpFeedinPrice);
            }
            if (tempArray.length > 0) {
              vm.chpFeedinPrices = tempArray.concat(vm.chpFeedinPrices);
            }
          }
          if (vm.chpFeedinPrices[vm.chpFeedinPrices.length - 1]['x'] < vm.endTimeStamp) {
            for (var time = vm.chpFeedinPrices[vm.chpFeedinPrices.length - 1]['x'] + 60; time <= vm.endTimeStamp; time += 60) {
              var chpFeedinPrice = {"x": time, "y": chpFeedinPriceList[chpFeedinPriceList.length - 1]};
              vm.chpFeedinPrices.push(chpFeedinPrice);
            }
          }

        }


      }

      function plsHandler (msg) {


        var loadLimitSignals = msg['ACTIVEPOWEREXTERNAL']['powerLimits'];
        var timeList = Object.keys(loadLimitSignals);
        var powerList = Object.values(loadLimitSignals);
        vm.powerUpperLimitData = [];
        vm.powerLowerLimitData = [];

        for (var i = 0; i < timeList.length; i++) {
          if (timeList[i] >= vm.startTimeStamp && timeList[i] <= vm.endTimeStamp) {
            var upperLoadLimit = {"x": timeList[i], "y": powerList[i]['powerUpperLimit']};
            vm.powerUpperLimitData.push(upperLoadLimit);
            var lowerLoadLimit = {"x": timeList[i], "y": powerList[i]['powerLowerLimit']};
            vm.powerLowerLimitData.push(lowerLoadLimit);
            //  console.log(powerList[i]['powerLowerLimit']);

          }
        }
        if (vm.powerUpperLimitData.length == 0) {
          var upperLoadLimit = {"x": vm.startTimeStamp, "y": powerList[0]['powerUpperLimit']};
          vm.powerUpperLimitData.push(upperLoadLimit);

          var lowerLoadLimit = {"x": vm.startTimeStamp, "y": powerList[0]['powerLowerLimit']};
          vm.powerLowerLimitData.push(lowerLoadLimit);

        }

        //fill in missing values
        var firstValue=vm.powerUpperLimitData[0];
        var tempArray=new Array();
        tempArray.push(firstValue);

        for(var i=1;i<vm.powerUpperLimitData.length;i++) {
          var secondValue = vm.powerUpperLimitData[i];
          if (secondValue['x'] - firstValue['x'] > 60) {
            for(var j=firstValue['x'];j<=secondValue['x'];j+=60) {
              var item={"x":j,"y":firstValue['y']};
              tempArray.push(item);
            }
          }
          tempArray.push(secondValue);
          firstValue=secondValue;
        }
        vm.powerUpperLimitData=tempArray;

        //fill in missing values
        var firstValue=vm.powerLowerLimitData[0];
        var tempArray=new Array();
        tempArray.push(firstValue);
        for(var i=1;i<vm.powerLowerLimitData.length;i++) {
          var secondValue = vm.powerLowerLimitData[i];
          if (secondValue['x'] - firstValue['x'] > 60) {
            for(var j=firstValue['x'];j<=secondValue['x'];j+=60) {
              var item={"x":j,"y":firstValue['y']};
              tempArray.push(item);
            }
          }
          tempArray.push(secondValue);
          firstValue=secondValue;

        }
        vm.powerLowerLimitData=tempArray;

        if (vm.powerUpperLimitData[0]['x'] > vm.startTimeStamp) {
          var tempArray1 = new Array();
          var tempArray2 = new Array();
          for (var time = vm.startTimeStamp; time < vm.powerUpperLimitData[0]['x']; time += 60) {
            var upperLoadLimit = {"x": time, "y": vm.powerUpperLimitData[0]['y']};
            tempArray1.push(upperLoadLimit);

            var lowerLoadLimit = {"x": time, "y": vm.powerLowerLimitData[0]['y']};
            tempArray2.push(lowerLoadLimit);
          }
          if (tempArray1.length > 0) {
            vm.powerUpperLimitData = tempArray1.concat(vm.powerUpperLimitData);
          }
          if (tempArray2.length > 0) {
            vm.powerLowerLimitData = tempArray2.concat(vm.powerLowerLimitData);
          }
        }

        if (vm.powerUpperLimitData[vm.powerUpperLimitData.length - 1]['x'] < vm.endTimeStamp) {
          for (var time = vm.powerUpperLimitData[vm.powerUpperLimitData.length - 1]['x'] + 60; time <= vm.endTimeStamp; time += 60) {
            var upperLoadLimit = {"x": time, "y": powerList[powerList.length - 1]['powerUpperLimit']};
            vm.powerUpperLimitData.push(upperLoadLimit);

            var lowerLoadLimit = {"x": time, "y": powerList[powerList.length - 1]['powerLowerLimit']};
            vm.powerLowerLimitData.push(lowerLoadLimit);
          }
        }



      }

      var check = function(){
        vm.wampSession=WAMPService.getWAMPsession();
        if (typeof vm.wampSession != 'undefined'){
          // run when condition is met
          deviceService.wampSession=vm.wampSession;
          // SUBSCRIBE to the prediction topic and receive events
          vm.wampSession.subscribe('eshl.optimisation.results', predictionHandler).then(
            function (subscription) {

              vm.wampSession.call('wamp.subscription.get_events', [subscription.id, 20]).then(
                function (history) {
                  if (history.length !== 0) {
                    predictionHandler (history[0].args);
                  }
                },
                function (error) {
                  console.log(error);
                }
              );

            }


          );
          vm.wampSession.subscribe('eshl.signals.pls', plsHandler).then(
            function (subscription) {

              var getHistory = function () {
                // setInterval(function(){


                vm.wampSession.call('wamp.subscription.get_events', [subscription.id, 1]).then(
                  function (history) {
                    if (history.length !== 0) {
                      //handling past data here
                      // console.log(history[0]['args'][0]);
                      //       console.log("history eshl.signals.pls received!");

                      console.log("eshl.signals.pls subscription.id is "+subscription.id);
                      var loadLimitSignals = history[0]['args'][0]['ACTIVEPOWEREXTERNAL']['powerLimits'];
                      var timeList = Object.keys(loadLimitSignals);
                      var powerList = Object.values(loadLimitSignals);
                      vm.powerUpperLimitData = [];
                      vm.powerLowerLimitData = [];
                      var date = new Date();
                      var currentSec = date.getSeconds();
                      var totalSec = Date.now() / 1000 | 0;
                      var currentTimestamp = totalSec - currentSec;
                      var endTimestamp = currentTimestamp + 86400;
                      // console.log("timestamp: "+currentTimestamp);
                      for (var i = 0; i < timeList.length; i++) {
                        if (timeList[i] >= currentTimestamp && timeList[i] <= endTimestamp) {
                          var upperLoadLimit = {"x": timeList[i], "y": powerList[i]['powerUpperLimit']};
                          vm.powerUpperLimitData.push(upperLoadLimit);
                          var lowerLoadLimit = {"x": timeList[i], "y": powerList[i]['powerLowerLimit']};
                          vm.powerLowerLimitData.push(lowerLoadLimit);
                        }
                      }
                      if (vm.powerUpperLimitData.length == 0) {
                        var upperLoadLimit = {"x": currentTimestamp, "y": powerList[0]['powerUpperLimit']};
                        vm.powerUpperLimitData.push(upperLoadLimit);

                        var lowerLoadLimit = {"x": currentTimestamp, "y": powerList[0]['powerLowerLimit']};
                        vm.powerLowerLimitData.push(lowerLoadLimit);
                      }
                      //fill in missing values
                      var firstValue=vm.powerUpperLimitData[0];
                      var tempArray=new Array();
                      tempArray.push(firstValue);
                      for(var i=1;i<vm.powerUpperLimitData.length;i++) {
                        var secondValue = vm.powerUpperLimitData[i];
                        if (secondValue['x'] - firstValue['x'] > 60) {
                          for(var j=firstValue['x'];j<=secondValue['x'];j+=60) {
                            var item={"x":j,"y":firstValue['y']};
                            tempArray.push(item);
                          }
                        }
                        tempArray.push(secondValue);
                        firstValue=secondValue;
                      }
                      vm.powerUpperLimitData=tempArray;

                      //fill in missing values
                      var firstValue=vm.powerLowerLimitData[0];
                      var tempArray=new Array();
                      tempArray.push(firstValue);
                      for(var i=1;i<vm.powerLowerLimitData.length;i++) {
                        var secondValue = vm.powerLowerLimitData[i];
                        if (secondValue['x'] - firstValue['x'] > 60) {
                          for(var j=firstValue['x'];j<=secondValue['x'];j+=60) {
                            var item={"x":j,"y":firstValue['y']};
                            tempArray.push(item);
                          }
                        }
                        tempArray.push(secondValue);
                        firstValue=secondValue;
                      }
                      vm.powerLowerLimitData=tempArray;


                      if (vm.powerUpperLimitData[0]['x'] > currentTimestamp) {
                        var tempArray1 = new Array();
                        var tempArray2 = new Array();
                        for (var time = currentTimestamp; time < vm.powerUpperLimitData[0]['x']; time += 60) {
                          var upperLoadLimit = {"x": time, "y": vm.powerUpperLimitData[0]['y']};
                          tempArray1.push(upperLoadLimit);

                          var lowerLoadLimit = {"x": time, "y": vm.powerLowerLimitData[0]['y']};
                          tempArray2.push(lowerLoadLimit);
                        }
                        if (tempArray1.length > 0) {
                          vm.powerUpperLimitData = tempArray1.concat(vm.powerUpperLimitData);
                        }
                        if (tempArray2.length > 0) {
                          vm.powerLowerLimitData = tempArray2.concat(vm.powerLowerLimitData);
                        }
                      }
                      if (vm.powerUpperLimitData[vm.powerUpperLimitData.length - 1]['x'] < endTimestamp) {
                        for (var time = vm.powerUpperLimitData[vm.powerUpperLimitData.length - 1]['x'] + 60; time <= endTimestamp; time += 60) {
                          var upperLoadLimit = {"x": time, "y": powerList[powerList.length - 1]['powerUpperLimit']};
                          vm.powerUpperLimitData.push(upperLoadLimit);

                          var lowerLoadLimit = {"x": time, "y": powerList[powerList.length - 1]['powerLowerLimit']};
                          vm.powerLowerLimitData.push(lowerLoadLimit);
                        }
                      }
                      vm.powerUpperLimit=vm.powerUpperLimitData[0]['y'];
                      vm.powerLowerLimit=vm.powerLowerLimitData[0]['y'];
                    }
                  },
                  function (error) {
                    console.log(error);
                  }
                );
                //   }(), 60*1000); //update every minute
              };
              getHistory();
              setInterval(getHistory, 60*1000);
            },
            function (error) {
              console.log(error);
            }
          );


          vm.wampSession.subscribe('eshl.openweathermap.v1.readout.weatherprediction', weatherPredictionHandler).then(
            function (subscription) {

              var getHistory = function () {
                // setInterval(function(){
                vm.wampSession.call('wamp.subscription.get_events', [subscription.id, 1]).then(
                  function (history) {
                    if (history.length !== 0) {
                      //    console.log("weatherprediction received!");
                      var weatherPredictionData=JSON.parse(history[0]['args'][0]).list;
                      var today = new Date();
                      var dd = today.getDate();
                      var mm = today.getMonth(); //January is 0!
                      var yyyy = today.getFullYear();

                      var weekday = new Array(7);
                      weekday[0]=  "Sunday";
                      weekday[1] = "Monday";
                      weekday[2] = "Tuesday";
                      weekday[3] = "Wednesday";
                      weekday[4] = "Thursday";
                      weekday[5] = "Friday";
                      weekday[6] = "Saturday";

                      var week = weekday[today.getDay()];

                      var weatherPrediction=[];
                      //    console.log(weatherPredictionData);
                      var currentData=weatherPredictionData[0];

                      var weatherCurrent={
                        "type":"Forecast",
                        "date":currentData['dt_txt'].split(' ')[0],
                        "time":currentData['dt_txt'].split(' ')[1],
                        "week":week,
                        "weather":currentData['weather'][0]['description'],
                        "icon":currentData['weather'][0]['icon'],
                        "humidity":currentData['main']['humidity'],
                        "temp_max":Math.round((currentData['main']['temp_max']-273.15)* 10 ) / 10,
                        "temp_min":Math.round((currentData['main']['temp_min']-273.15)* 10 ) / 10,
                        "temp":Math.round((currentData['main']['temp']-273.15)* 10 ) / 10,
                        "wind_speed":Math.round(currentData['wind']['speed']* 10 ) / 10,
                        "pressure":Math.round(currentData['main']['pressure']* 10 ) / 10
                      }

                      today =new Date(yyyy,mm,dd,0,0,0);
                      var nextDay=today.setDate(today.getDate() + 1);
                      var lastDay=today.setDate(today.getDate() + 3);
                      for(var day=nextDay;day<=lastDay;day=day.setDate(day.getDate() + 1)){
                        var currentDayStart=day;
                        day=new Date(day);
                        dd = day.getDate();
                        mm =day.getMonth()+1; //January is 0!
                        yyyy =day.getFullYear();
                        week = weekday[day.getDay()];
                        var nextDate=currentDayStart+24*60*60*1000;
                        var currentDayStr =yyyy+"-"+mm+"-"+dd;
                        var min=currentData['main']['temp_max'];
                        var max=currentData['main']['temp_min'];

                        var finalData;
                        for(var i=0;i<weatherPredictionData.length;i++){
                          currentData=weatherPredictionData[i];
                          var currentDate= new Date(currentData['dt_txt']).getTime();

                          if (currentDate>=currentDayStart && currentDate<=nextDate) {

                            var temp_max = currentData['main']['temp_max'];
                            var temp_min = currentData['main']['temp_min'];
                            if (temp_max > max) {
                              max = temp_max;
                            }
                            if (temp_min < min) {
                              min = temp_min;
                            }

                            if(currentData['dt_txt'].split(' ')[1]==='12:00:00'){
                              finalData=currentData;
                            }
                          }

                          if(currentDate>=nextDate){
                            weatherPrediction.push({
                              "date":finalData['dt_txt'].split(' ')[0],
                              "time":finalData['dt_txt'].split(' ')[1],
                              "week":week,
                              "weather":finalData['weather'][0]['description'],
                              "icon":finalData['weather'][0]['icon'],
                              "humidity":finalData['main']['humidity'],
                              "temp_max":Math.round((max-273.15)* 10 ) / 10,
                              "temp_min":Math.round((min-273.15)* 10 ) / 10,
                              // "temp":Math.round((currentData['main']['temp']-273.15)* 10 ) / 10,
                              "wind_speed":Math.round(finalData['wind']['speed']* 10 ) / 10,
                              "pressure":Math.round(finalData['main']['pressure']* 10 ) / 10

                            });
                            break;
                          }

                        }
                        if(currentDayStart===lastDay){
                          weatherPrediction.push({
                            "date":finalData['dt_txt'].split(' ')[0],
                            "time":finalData['dt_txt'].split(' ')[1],
                            "week":week,
                            "weather":finalData['weather'][0]['description'],
                            "icon":finalData['weather'][0]['icon'],
                            "humidity":finalData['main']['humidity'],
                            "temp_max":Math.round((max-273.15)* 10 ) / 10,
                            "temp_min":Math.round((min-273.15)* 10 ) / 10,
                            // "temp":Math.round((currentData['main']['temp']-273.15)* 10 ) / 10,
                            "wind_speed":Math.round(finalData['wind']['speed']* 10 ) / 10,
                            "pressure":Math.round(finalData['main']['pressure']* 10 ) / 10

                          });
                        }
                      }

                      //  var current= new Array();
                      //  current.push(weatherCurrent);
                      $scope.sharedWeatherData.prediction=weatherPrediction;
                      // console.log($scope.sharedWeatherData.current.length);
                      if($scope.sharedWeatherData.current.length==0){
                        $scope.sharedWeatherData.current.push(weatherCurrent);
                      }

                      vm.sharedWeatherData=$scope.sharedWeatherData;

                    }

                  },
                  function (error) {
                    console.log(error);
                  }
                );
                //   }(), 60*1000); //update every minute
              };
              getHistory();
              setInterval(getHistory, 2*60*60*1000);
            },
            function (error) {
              console.log(error);
            }
          );

          vm.buildingEnergyFlowDirection='in';
          vm.buildingEnergyFlowColor='orange';

          vm.wampSession.subscribe('eshl.openweathermap.v1.readout.currentweather', weatherCurrentHandler);


          vm.wampSession.subscribe('eshl.global_energy_data', globalEnergyDataHandler);


          vm.wampSession.subscribe('eshl.power_consuming_home_device', powerConsumingHomeDeviceDataHandler);

        }
        else {
          setTimeout(check, 500); // check again in a second
        }
      }

      check();


      function globalEnergyDataHandler (args) {
        var msgContent = args[0][0];
        // console.log(args[0][0]);
        homeCurrentLoad=msgContent["power"];
        var homeVoltage=msgContent["voltage"];
        var homeFrequency=msgContent["frequency"];
        homePowerConsumption=Math.round(msgContent["otherData"]["powerConsumption"]);
        homePowerGeneration=Math.round(msgContent["otherData"]["powerGeneration"]);
        var net =homePowerConsumption+homePowerGeneration;
        if(net>0){
          vm.buildingEnergyFlowDirection='in';
          vm.buildingEnergyFlowColor='orange';
        }else{
          vm.buildingEnergyFlowDirection='out';
          vm.buildingEnergyFlowColor='#64bd64';
        }
        vm.powerUsage=[{key : "Con/Gen", power : homePowerConsumption,loadLimit:vm.powerUpperLimit},{key : "Con/Gen", power :homePowerGeneration,loadLimit:vm.powerLowerLimit},{key : "Net", power :net}];
        vm.currentVoltage=Math.round( homeVoltage * 10 ) / 10;
        // vm.currentFrequency=Math.round( homeFrequency * 100 ) / 100;
        vm.currentFrequency=Math.round( homeFrequency * 100 ) / 100;
        vm.currentLoad=Math.round(homeCurrentLoad);
        //  vm.powerUpperLimit= vm.currentLoad- vm.currentLoad % 1000+1000;
        if(vm.currentLoad/vm.powerUpperLimit>0.8){
          vm.loadRoundProgressColor="red";
        }else if(vm.currentLoad/vm.powerUpperLimit<0.5){
          vm.loadRoundProgressColor="#64bd64";
        }else{
          vm.loadRoundProgressColor="#FFA500";
        }
      }

      function powerConsumingHomeDeviceDataHandler (args) {
        // console.log(args[0]);
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


      /* session.call('eshl.get_home_device',['Dishwasher']).then(
       // RPC success callback
       function (device) {
       console.log("current home device:");
       console.log(device);
       },
       // RPC error callback
       function (error) {
       console.log("Call failed:", error);
       }
       );*/






     /* // the URL of the WAMP Router (Crossbar.io)
      var wsuri;
      wsuri = "ws://localhost:8080/ws";
      // the WAMP connection to the Router
      var connection = new autobahn.Connection({
        url: wsuri,
        realm: "eshl"
      });
      vm.session;
      // fired when connection is established and session attached
      connection.onopen = function (session, details) {
        console.log("WAMP Router Connected");
        console.log("Connected to " + wsuri);
        vm.session=session;


      };*/

    }
})();
