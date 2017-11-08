/**
 * Created by pg9501 on 24.04.2017.
 */
(function () {
  'use strict';

  angular
    .module('app.administrator.devices')
    .controller('AdministratorDevicesController', AdministratorDevicesController);

  /** @ngInject */
  function AdministratorDevicesController($rootScope, $translate,$window, $scope,$cookies, $mdDialog,$http,fuseTheming,WAMPService,msNavigationService) {

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

    var vm=this;

    vm.activeTheme=fuseTheming.themes.active.theme; //get currently active theme
    $scope.$watch(watchSource, function(current, previous){ //watch theme changing and update the active theme in this controller
      vm.activeTheme=fuseTheming.themes.active.theme;
    });
    function watchSource(){
      return fuseTheming.themes.active.theme;
    }

    //update clock time every second on the navigation bar
    $scope.getDate = new Date();
    setInterval(function(){
      $scope.$apply(function(){
        $scope.getDate = new Date();
      });
    }, 1000);

    $scope.active = true;


    vm.devices=[];
    vm.unassignedDevices=[];
    vm.locations=[];
    vm.wampSession=WAMPService.getWAMPsession();

    vm.currentLanuage="en";

    vm.admin=$cookies.getObject('globals').currentUser.username;
    vm.floors=[];
    vm.selectedFloor=null;
    vm.selectedRoom=null;

    vm.defaultFloor={"id":10551,"name":"Floor 1","admin":"admin","rooms":[{"id":10567,"name":"Kitchen","devices":["Freezer","Coffee System","Hob Induction","Oven","Extractor Hood","Dishwasher","Blind_3","Tumble Dryer","Washing Machine","Fridge","Light_K19"]},{"id":10568,"name":"Living Room","devices":["Blind_5","Blind_4","Light_K21","Air Conditioner","Light_K20"]},{"id":10569,"name":"Bed Room1","devices":["Light_K16","Blind_1"]},{"id":10570,"name":"Bed Room2","devices":["Blind_2","Light_K17"]},{"id":10571,"name":"Toilet","devices":["Light_K18"]},{"id":10572,"name":"Engineering Room","devices":["PV","CHP"]}]};

    vm.floors.push(vm.defaultFloor);

    GetFloors(vm.admin).then(function (result) {
      if(result!=null){
        for(var i in result){
          var floor=result[i];
          if(floor.name!=null && floor.name!=vm.defaultFloor.name){
            vm.floors.push({
              id:     floor.id,
              name   : floor.name,
              rooms: floor.rooms
            });
          }
        }

        var devices=[{"deviceName":"µCHP","uid":"CHP","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Engineering Room"}],"deviceImage":"CHP"},
          {"deviceName":"Photovoltaic","uid":"PV","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Engineering Room"}],"deviceImage":"Photovoltaic"},
          {"deviceName":"Washing Machine","uid":"Washing Machine","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceImage":"WashingMachine"},
          {"deviceName":"Dishwasher","uid":"Dishwasher","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceImage":"Dishwasher"},
          {"deviceName":"Oven","uid":"Oven","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceImage":"Oven"},
          {"deviceName":"Tumble Dryer","uid":"Tumble Dryer","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceImage":"TumbleDryer"},
          {"deviceName":"Hob Induction","uid":"Hob Induction","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceImage":"HobInduction"},
          {"deviceName":"Coffee System","uid":"Coffee System","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceImage":"CoffeeSystem"},
          {"deviceName":"Air Conditioner","uid":"Air Conditioner","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Living Room"}],"deviceImage":"AirConditioner"},
          {"deviceName":"Fridge","uid":"Fridge","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceImage":"Fridge"},
          {"deviceName":"Freezer","uid":"Freezer","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceImage":"Freezer"},
          {"deviceName":"Extractor Hood","uid":"Extractor Hood","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceImage":"ExtractorHood"},
          {"deviceName":"Light_K16","uid":"Light_K16","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Bed Room1"}],"deviceImage":"Light_off"},
          {"deviceName":"Light_K17","uid":"Light_K17","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Bed Room2"}],"deviceImage":"Light_off"},
          {"deviceName":"Light_K18","uid":"Light_K18","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Toilet"}],"deviceImage":"Light_off"},
          {"deviceName":"Light_K19","uid":"Light_K19","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceImage":"Light_off"},
          {"deviceName":"Light_K20","uid":"Light_K20","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Living Room"}],"deviceImage":"Light_off"},
          {"deviceName":"Light_K21","uid":"Light_K21","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Living Room"}],"deviceImage":"Light_off"},
          {"deviceName":"Blind_1","uid":"Blind_1","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Bed Room1"}],"deviceImage":"Blind_50"},
          {"deviceName":"Blind_2","uid":"Blind_2","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Bed Room2"}],"deviceImage":"Blind_50"},
          {"deviceName":"Blind_3","uid":"Blind_3","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceImage":"Blind_50"},
          {"deviceName":"Blind_4","uid":"Blind_4","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Living Room"}],"deviceImage":"Blind_50"},
          {"deviceName":"Blind_5","uid":"Blind_5","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Living Room"}],"deviceImage":"Blind_50"}];


        var localDevicesStorage = window.localStorage.getItem('stage-storage-local-devices');
        var localDevices=[];
        if (localDevicesStorage === null || localDevicesStorage.length === 0)
        {
            localDevices=[
            {"deviceName":"Coffee System_2","uid":"Coffee System_2","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":""}],"deviceImage":"CoffeeSystem"},
            {"deviceName":"Air Conditioner_2","uid":"Air Conditioner_2","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":""}],"deviceImage":"AirConditioner"},
            {"deviceName":"Light_2","uid":"Light_2","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":""}],"deviceImage":"Light_off"},
          ];
          $window.localStorage.setItem('stage-storage-local-devices', angular.toJson(localDevices));

        }else{
          localDevices =JSON.parse(window.localStorage['stage-storage-local-devices']);
        }
        for(var i in localDevices){
          devices.push(localDevices[i]);
        }

        for(var i in devices){
          var device=devices[i];
          var location='';
          var floorName='';
          var roomName='';
          var id=device['uid'];
          var name=device['deviceName'];

          if(id.indexOf("SYS")>0){
            continue;
          }

          var imageName=device['deviceImage'];
          if(imageName=="Light_on"){
            imageName="Light_off";
          }
          var image='assets/images/energy-flows/'+imageName+".png";
          var generalInfoList=device["deviceGeneralInfoList"];

          for(var i in generalInfoList) {
            var info = generalInfoList[i];
            var infoName = info.infoName;
            var infoValue = info.infoValue;
            if(infoName=='Location'){
              location=infoValue;
              if(location!==''){
                floorName=location.substring(0,location.indexOf(":")).trim();
                roomName=location.substring(location.indexOf(":")+1).trim();
              }

            }
          }
          if(location!==''){
            vm.devices.push({id:id,name:name, image:image,floor:floorName,room:roomName,location:location,generalInfoList:generalInfoList});
          }else{
            vm.unassignedDevices.push({id:id,name:name, image:image,floor:floorName,room:roomName,location:location,generalInfoList:generalInfoList});
          }
        }

        for(var i in vm.floors) {
          var floor=vm.floors[i];
          for(var j in floor.rooms){
            var room=floor.rooms[j];
            room.selectedDevices=[];
            var count = 0;
            for(var k in vm.devices){
              if(vm.devices[k].floor===floor.name && vm.devices[k].room===room.name){
                count++;
              }
            }
            room.deviceNum=count;
          }

        }
      }
    });

   /* var check = function(){
      vm.wampSession=WAMPService.getWAMPsession();
      if (typeof vm.wampSession != 'undefined') {
        GetFloors(vm.admin).then(function (result) {
          if(result!=null){
            for(var i in result){
              var floor=result[i];
              if(floor.name!=null && floor.name!=vm.defaultFloor.name){
                vm.floors.push({
                  //id:     msUtils.guidGenerator(),
                  id:     floor.id,
                  name   : floor.name,
                  rooms: floor.rooms
                });
              }
            }

            vm.wampSession.call('eshl.get_all_devices',[vm.currentLanuage]).then(
              // RPC success callback
              function (devices) {

                var devices=[{"deviceName":"µCHP","deviceChannelList":[{"channelInfoList":[{"unit":null,"infoName":"State","infoValue":"Idle"},{"unit":"W","infoName":"Power","infoValue":"28.0"}],"channelName":"Otto-Engine"},{"channelInfoList":[{"unit":null,"infoName":"State","infoValue":"Idle"},{"unit":"W","infoName":"Power","infoValue":"0.0"}],"channelName":"Heating Cartridge"},{"channelInfoList":[{"unit":"degree Celsius","infoName":"Top Temperature","infoValue":"70"},{"unit":"degree Celsius","infoName":"Middle Temperature","infoValue":"59"},{"unit":"degree Celsius","infoName":"Bottom Temperature","infoValue":"50"}],"channelName":"Water Tank"}],"uid":"CHP","generatedEnegyTypes":[],"deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Engineering Room"}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"CHP"},{"deviceName":"Photovoltaic","deviceChannelList":[{"channelInfoList":[{"unit":null,"infoName":"State","infoValue":"Generating Electricity"},{"unit":"W","infoName":"Power","infoValue":"-365.0"},{"unit":"V","infoName":"Voltage","infoValue":"230.0"}],"channelName":"PV"}],"uid":"PV","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Engineering Room"}],"generatedEnegyTypes":["ELECTRICITY"],"deviceImage":"Photovoltaic"},{"deviceName":"Washing Machine","deviceChannelList":[{"channelInfoList":[{"unit":"W","infoName":"Power","infoValue":"1"},{"unit":null,"infoName":"State","infoValue":"Off"}],"channelName":"Washing Machine"}],"uid":"Washing Machine","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceDoFInfoList":[{"defaultValue":"","infoName":"Allowed Start Time","unit":null,"format":"TIME"},{"defaultValue":"2017/11/6 19:34","infoName":"Required End Time","unit":null,"format":"TIME"}],"deviceControllerList":[{"actionList":[{"available":true,"widget":{"color":"","text":"TURN ON","image":"","type":"Button","id":0},"commandList":[{"widgetState":"ON","commandString":""}],"name":"Turn on","description":""},{"available":false,"widget":{"color":"","text":"TURN OFF","image":"","type":"Button","id":0},"commandList":[{"widgetState":"OFF","commandString":""}],"name":"Turn off","description":""}],"available":true,"name":"StateController","description":""}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"WashingMachine"},{"deviceName":"Dishwasher","deviceChannelList":[{"channelInfoList":[{"unit":"W","infoName":"Power","infoValue":"5"},{"unit":null,"infoName":"State","infoValue":"Off"}],"channelName":"Dishwasher"}],"uid":"Dishwasher","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceDoFInfoList":[{"defaultValue":"","infoName":"Allowed Start Time","unit":null,"format":"TIME"},{"defaultValue":"2017/11/6 17:34","infoName":"Required End Time","unit":null,"format":"TIME"}],"deviceControllerList":[{"actionList":[{"available":true,"widget":{"color":"","text":"TURN ON","image":"","type":"Button","id":0},"commandList":[{"widgetState":"ON","commandString":""}],"name":"Turn on","description":""},{"available":false,"widget":{"color":"","text":"TURN OFF","image":"","type":"Button","id":0},"commandList":[{"widgetState":"OFF","commandString":""}],"name":"Turn off","description":""}],"available":true,"name":"StateController","description":""}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"Dishwasher"},{"deviceName":"Oven","deviceChannelList":[{"channelInfoList":[{"unit":"W","infoName":"Power","infoValue":"4"},{"unit":null,"infoName":"State","infoValue":"Off"}],"channelName":"Oven"}],"uid":"Oven","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceDoFInfoList":[{"defaultValue":"","infoName":"Allowed Start Time","unit":null,"format":"TIME"},{"defaultValue":"","infoName":"Required End Time","unit":null,"format":"TIME"}],"deviceControllerList":[{"actionList":[{"available":true,"widget":{"color":"","text":"TURN ON","image":"","type":"Button","id":0},"commandList":[{"widgetState":"ON","commandString":""}],"name":"Turn on","description":""},{"available":false,"widget":{"color":"","text":"TURN OFF","image":"","type":"Button","id":0},"commandList":[{"widgetState":"OFF","commandString":""}],"name":"Turn off","description":""}],"available":true,"name":"StateController","description":""}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"Oven"},{"deviceName":"Tumble Dryer","deviceChannelList":[{"channelInfoList":[{"unit":"W","infoName":"Power","infoValue":"1"},{"unit":null,"infoName":"State","infoValue":"Off"}],"channelName":"Tumble Dryer"}],"uid":"Tumble Dryer","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceDoFInfoList":[{"defaultValue":"","infoName":"Allowed Start Time","unit":null,"format":"TIME"},{"defaultValue":"","infoName":"Required End Time","unit":null,"format":"TIME"}],"deviceControllerList":[{"actionList":[{"available":true,"widget":{"color":"","text":"TURN ON","image":"","type":"Button","id":0},"commandList":[{"widgetState":"ON","commandString":""}],"name":"Turn on","description":""},{"available":false,"widget":{"color":"","text":"TURN OFF","image":"","type":"Button","id":0},"commandList":[{"widgetState":"OFF","commandString":""}],"name":"Turn off","description":""}],"available":true,"name":"StateController","description":""}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"TumbleDryer"},{"deviceName":"Hob Induction","deviceChannelList":[{"channelInfoList":[{"unit":"W","infoName":"Power","infoValue":"0"},{"unit":null,"infoName":"State","infoValue":"Off"}],"channelName":"Hob Induction"}],"uid":"Hob Induction","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceDoFInfoList":[{"defaultValue":"","infoName":"Allowed Start Time","unit":null,"format":"TIME"},{"defaultValue":"","infoName":"Required End Time","unit":null,"format":"TIME"}],"deviceControllerList":[{"actionList":[{"available":true,"widget":{"color":"","text":"TURN ON","image":"","type":"Button","id":0},"commandList":[{"widgetState":"ON","commandString":""}],"name":"Turn on","description":""},{"available":false,"widget":{"color":"","text":"TURN OFF","image":"","type":"Button","id":0},"commandList":[{"widgetState":"OFF","commandString":""}],"name":"Turn off","description":""}],"available":true,"name":"StateController","description":""}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"HobInduction"},{"deviceName":"Coffee System","deviceChannelList":[{"channelInfoList":[{"unit":"W","infoName":"Power","infoValue":"1"},{"unit":null,"infoName":"State","infoValue":"Off"}],"channelName":"Coffee System"}],"uid":"Coffee System","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceDoFInfoList":[{"defaultValue":"","infoName":"Allowed Start Time","unit":null,"format":"TIME"},{"defaultValue":"2017/11/6 18:34","infoName":"Required End Time","unit":null,"format":"TIME"}],"deviceControllerList":[{"actionList":[{"available":true,"widget":{"color":"","text":"TURN ON","image":"","type":"Button","id":0},"commandList":[{"widgetState":"ON","commandString":""}],"name":"Turn on","description":""},{"available":false,"widget":{"color":"","text":"TURN OFF","image":"","type":"Button","id":0},"commandList":[{"widgetState":"OFF","commandString":""}],"name":"Turn off","description":""}],"available":true,"name":"StateController","description":""}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"CoffeeSystem"},{"deviceName":"Air Conditioner","deviceChannelList":[{"channelInfoList":[{"unit":"W","infoName":"Power","infoValue":"126.25"},{"unit":null,"infoName":"State","infoValue":"On"}],"channelName":"Air Conditioner"}],"uid":"Air Conditioner","generatedEnegyTypes":["COLD"],"deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Living Room"}],"deviceControllerList":[{"actionList":[{"available":true,"widget":{"prefix":null,"postfix":"&deg;C","type":"TouchSpin","maxValue":40,"minValue":10,"step":1,"initVal":23,"decimals":0,"id":0},"commandList":[],"name":"Set temperature","description":"Set temperature"},{"available":false,"widget":{"color":"","text":"TURN ON","image":"","type":"Button","id":0},"commandList":[{"widgetState":"ON","commandString":""},{"widgetState":"Temperature:","commandString":""}],"name":"Turn on","description":""},{"available":true,"widget":{"color":"","text":"TURN OFF","image":"","type":"Button","id":0},"commandList":[{"widgetState":"OFF","commandString":""}],"name":"Turn off","description":""}],"available":true,"name":"StateController","description":""}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"AirConditioner"},{"deviceName":"Fridge","deviceChannelList":[{"channelInfoList":[{"unit":"W","infoName":"Power","infoValue":"37.04999923706055"},{"unit":null,"infoName":"State","infoValue":"On"}],"channelName":"Fridge"}],"uid":"Fridge","generatedEnegyTypes":["COLD"],"deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceControllerList":[{"actionList":[{"available":false,"widget":{"color":"","text":"TURN ON","image":"","type":"Button","id":0},"commandList":[{"widgetState":"ON","commandString":""}],"name":"Turn on","description":""},{"available":true,"widget":{"color":"","text":"TURN OFF","image":"","type":"Button","id":0},"commandList":[{"widgetState":"OFF","commandString":""}],"name":"Turn off","description":""}],"available":true,"name":"StateController","description":""}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"Fridge"},{"deviceName":"Freezer","deviceChannelList":[{"channelInfoList":[{"unit":"W","infoName":"Power","infoValue":"84.79999542236328"},{"unit":null,"infoName":"State","infoValue":"On"}],"channelName":"Freezer"}],"uid":"Freezer","generatedEnegyTypes":["COLD"],"deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceControllerList":[{"actionList":[{"available":false,"widget":{"color":"","text":"TURN ON","image":"","type":"Button","id":0},"commandList":[{"widgetState":"ON","commandString":""}],"name":"Turn on","description":""},{"available":true,"widget":{"color":"","text":"TURN OFF","image":"","type":"Button","id":0},"commandList":[{"widgetState":"OFF","commandString":""}],"name":"Turn off","description":""}],"available":true,"name":"StateController","description":""}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"Freezer"},{"deviceName":"Extractor Hood","deviceChannelList":[{"channelInfoList":[{"unit":"W","infoName":"Power","infoValue":"0.14999999105930328"},{"unit":null,"infoName":"State","infoValue":"Off"}],"channelName":"Extractor Hood"}],"uid":"Extractor Hood","generatedEnegyTypes":[],"deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceControllerList":[{"actionList":[{"available":true,"widget":{"color":"","text":"TURN ON","image":"","type":"Button","id":0},"commandList":[{"widgetState":"ON","commandString":""}],"name":"Turn on","description":""},{"available":false,"widget":{"color":"","text":"TURN OFF","image":"","type":"Button","id":0},"commandList":[{"widgetState":"OFF","commandString":""}],"name":"Turn off","description":""}],"available":true,"name":"StateController","description":""}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"ExtractorHood"},{"deviceName":"Light_K17","deviceChannelList":[{"channelInfoList":[{"unit":"W","infoName":"Power","infoValue":"0"},{"unit":null,"infoName":"State","infoValue":"Off"}],"channelName":"Light_K17"}],"uid":"Light_K17","generatedEnegyTypes":[],"deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Bed Room2"}],"deviceControllerList":[{"actionList":[{"available":true,"widget":{"onText":"Current State: ON","inverted":false,"type":"Switch","id":0,"offText":"Current State: OFF"},"commandList":[{"widgetState":"ON","commandString":"eshl.wago.v1.switch.on 17"},{"widgetState":"OFF","commandString":"eshl.wago.v1.switch.off 17"}],"name":"Turn on/off","description":""}],"available":true,"name":"StateController","description":""}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"Light_off"},{"deviceName":"Light_K16","deviceChannelList":[{"channelInfoList":[{"unit":"W","infoName":"Power","infoValue":"0"},{"unit":null,"infoName":"State","infoValue":"Off"}],"channelName":"Light_K16"}],"uid":"Light_K16","generatedEnegyTypes":[],"deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Bed Room1"}],"deviceControllerList":[{"actionList":[{"available":true,"widget":{"onText":"Current State: ON","inverted":false,"type":"Switch","id":0,"offText":"Current State: OFF"},"commandList":[{"widgetState":"ON","commandString":"eshl.wago.v1.switch.on 16"},{"widgetState":"OFF","commandString":"eshl.wago.v1.switch.off 16"}],"name":"Turn on/off","description":""}],"available":true,"name":"StateController","description":""}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"Light_off"},{"deviceName":"Light_K19","deviceChannelList":[{"channelInfoList":[{"unit":"W","infoName":"Power","infoValue":"0"},{"unit":null,"infoName":"State","infoValue":"Off"}],"channelName":"Light_K19"}],"uid":"Light_K19","generatedEnegyTypes":[],"deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceControllerList":[{"actionList":[{"available":true,"widget":{"onText":"Current State: ON","inverted":false,"type":"Switch","id":0,"offText":"Current State: OFF"},"commandList":[{"widgetState":"ON","commandString":"eshl.wago.v1.switch.on 19"},{"widgetState":"OFF","commandString":"eshl.wago.v1.switch.off 19"}],"name":"Turn on/off","description":""}],"available":true,"name":"StateController","description":""}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"Light_off"},{"deviceName":"Light_K18","deviceChannelList":[{"channelInfoList":[{"unit":"W","infoName":"Power","infoValue":"0"},{"unit":null,"infoName":"State","infoValue":"Off"}],"channelName":"Light_K18"}],"uid":"Light_K18","generatedEnegyTypes":[],"deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Toilet"}],"deviceControllerList":[{"actionList":[{"available":true,"widget":{"onText":"Current State: ON","inverted":false,"type":"Switch","id":0,"offText":"Current State: OFF"},"commandList":[{"widgetState":"ON","commandString":"eshl.wago.v1.switch.on 18"},{"widgetState":"OFF","commandString":"eshl.wago.v1.switch.off 18"}],"name":"Turn on/off","description":""}],"available":true,"name":"StateController","description":""}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"Light_off"},{"deviceName":"Light_TimestampSYS","deviceChannelList":[{"channelInfoList":[{"unit":"W","infoName":"Power","infoValue":"100"},{"unit":null,"infoName":"State","infoValue":"On"}],"channelName":"Light_TimestampSYS"}],"uid":"Light_TimestampSYS","generatedEnegyTypes":[],"deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":""}],"deviceControllerList":[{"actionList":[{"available":true,"widget":{"onText":"Current State: ON","inverted":false,"type":"Switch","id":0,"offText":"Current State: OFF"},"commandList":[{"widgetState":"ON","commandString":"eshl.wago.v1.switch.on YS"},{"widgetState":"OFF","commandString":"eshl.wago.v1.switch.off YS"}],"name":"Turn on/off","description":""}],"available":true,"name":"StateController","description":""}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"Light_on"},{"deviceName":"Light_K20","deviceChannelList":[{"channelInfoList":[{"unit":"W","infoName":"Power","infoValue":"0"},{"unit":null,"infoName":"State","infoValue":"Off"}],"channelName":"Light_K20"}],"uid":"Light_K20","generatedEnegyTypes":[],"deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Living Room"}],"deviceControllerList":[{"actionList":[{"available":true,"widget":{"onText":"Current State: ON","inverted":false,"type":"Switch","id":0,"offText":"Current State: OFF"},"commandList":[{"widgetState":"ON","commandString":"eshl.wago.v1.switch.on 20"},{"widgetState":"OFF","commandString":"eshl.wago.v1.switch.off 20"}],"name":"Turn on/off","description":""}],"available":true,"name":"StateController","description":""}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"Light_off"},{"deviceName":"Light_K21","deviceChannelList":[{"channelInfoList":[{"unit":"W","infoName":"Power","infoValue":"0"},{"unit":null,"infoName":"State","infoValue":"Off"}],"channelName":"Light_K21"}],"uid":"Light_K21","generatedEnegyTypes":[],"deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Living Room"}],"deviceControllerList":[{"actionList":[{"available":true,"widget":{"onText":"Current State: ON","inverted":false,"type":"Switch","id":0,"offText":"Current State: OFF"},"commandList":[{"widgetState":"ON","commandString":"eshl.wago.v1.switch.on 21"},{"widgetState":"OFF","commandString":"eshl.wago.v1.switch.off 21"}],"name":"Turn on/off","description":""}],"available":true,"name":"StateController","description":""}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"Light_off"},{"deviceName":"Blind_2","deviceChannelList":[{"channelInfoList":[{"unit":null,"infoName":"State","infoValue":"Closed: 50%"}],"channelName":"Blind_2"}],"uid":"Blind_2","generatedEnegyTypes":[],"deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Bed Room2"}],"deviceControllerList":[{"actionList":[{"available":true,"widget":{"max_value":100,"min_value":0,"step":25,"mode":"HORIZONTAL","initVal":50,"type":"Slider","id":6651},"commandList":[{"widgetState":"Closed: 50%","commandString":""}],"name":"Go up/down","description":""}],"available":true,"name":"StateController","description":""}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"Blind_50"},{"deviceName":"Blind_3","deviceChannelList":[{"channelInfoList":[{"unit":null,"infoName":"State","infoValue":"Closed: 50%"}],"channelName":"Blind_3"}],"uid":"Blind_3","generatedEnegyTypes":[],"deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceControllerList":[{"actionList":[{"available":true,"widget":{"max_value":100,"min_value":0,"step":25,"mode":"HORIZONTAL","initVal":50,"type":"Slider","id":6652},"commandList":[{"widgetState":"Closed: 50%","commandString":""}],"name":"Go up/down","description":""}],"available":true,"name":"StateController","description":""}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"Blind_50"},{"deviceName":"Blind_4","deviceChannelList":[{"channelInfoList":[{"unit":null,"infoName":"State","infoValue":"Closed: 100%"}],"channelName":"Blind_4"}],"uid":"Blind_4","generatedEnegyTypes":[],"deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Living Room"}],"deviceControllerList":[{"actionList":[{"available":true,"widget":{"max_value":100,"min_value":0,"step":25,"mode":"HORIZONTAL","initVal":100,"type":"Slider","id":6653},"commandList":[{"widgetState":"Closed: 100%","commandString":""}],"name":"Go up/down","description":""}],"available":true,"name":"StateController","description":""}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"Blind_50"},{"deviceName":"Blind_5","deviceChannelList":[{"channelInfoList":[{"unit":null,"infoName":"State","infoValue":"Closed: 50%"}],"channelName":"Blind_5"}],"uid":"Blind_5","generatedEnegyTypes":[],"deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Living Room"}],"deviceControllerList":[{"actionList":[{"available":true,"widget":{"max_value":100,"min_value":0,"step":25,"mode":"HORIZONTAL","initVal":50,"type":"Slider","id":6654},"commandList":[{"widgetState":"Closed: 50%","commandString":""}],"name":"Go up/down","description":""}],"available":true,"name":"StateController","description":""}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"Blind_50"},{"deviceName":"Blind_1","deviceChannelList":[{"channelInfoList":[{"unit":null,"infoName":"State","infoValue":"Closed: 100%"}],"channelName":"Blind_1"}],"uid":"Blind_1","generatedEnegyTypes":[],"deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Bed Room1"}],"deviceControllerList":[{"actionList":[{"available":true,"widget":{"max_value":100,"min_value":0,"step":25,"mode":"HORIZONTAL","initVal":100,"type":"Slider","id":7251},"commandList":[{"widgetState":"Closed: 100%","commandString":""}],"name":"Go up/down","description":""}],"available":true,"name":"StateController","description":""}],"consumedEnegyTypes":["ELECTRICITY"],"deviceImage":"Blind_50"}];
                for(var i in devices){
                  var device=devices[i];
                  var location='';
                  var floorName='';
                  var roomName='';
                  var id=device['uid'];
                  var name=device['deviceName'];

                  if(id.indexOf("SYS")>0){
                    continue;
                  }

                  var imageName=device['deviceImage'];
                  if(imageName=="Light_on"){
                    imageName="Light_off";
                  }
                  var image='assets/images/energy-flows/'+imageName+".png";
                  var generalInfoList=device["deviceGeneralInfoList"];

                  for(var i in generalInfoList) {
                    var info = generalInfoList[i];
                    var infoName = info.infoName;
                    var infoValue = info.infoValue;
                    if(infoName=='Location'){
                      location=infoValue;
                      if(location!==''){
                        floorName=location.substring(0,location.indexOf(":")).trim();
                        roomName=location.substring(location.indexOf(":")+1).trim();
                      }

                    }
                  }
                  if(location!==''){
                    vm.devices.push({id:id,name:name, image:image,floor:floorName,room:roomName,location:location,generalInfoList:generalInfoList});
                  }else{
                    vm.unassignedDevices.push({id:id,name:name, image:image,floor:floorName,room:roomName,location:location,generalInfoList:generalInfoList});
                  }
                }

                for(var i in vm.floors) {
                  var floor=vm.floors[i];
                  for(var j in floor.rooms){
                    var room=floor.rooms[j];
                    room.selectedDevices=[];
                    var count = 0;
                    for(var k in vm.devices){
                      if(vm.devices[k].floor===floor.name && vm.devices[k].room===room.name){
                        count++;
                      }
                    }
                    room.deviceNum=count;
                  }

                }

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
    check();*/



    vm.rooms=[];

    vm.changeFloor=function () {

     // vm.rooms=JSON.parse(vm.selectedFloor).rooms;
      for(var i in vm.floors){
        if(vm.floors[i].name===vm.selectedFloor){
          vm.rooms=vm.floors[i].rooms;
          break;
        }
      }
    };

    vm.assign=function () {
      var floor=null;
      var room=null;
      for(var i in vm.floors){
        if(vm.floors[i].name===vm.selectedFloor){
          floor=vm.floors[i];
          for(var j in floor.rooms){
            if(floor.rooms[j].name===vm.selectedRoom){
              room=floor.rooms[j];
              break;
            }
          }
          break;
        }
      }

      for(var i in vm.selectedDevices){
        var deviceName=vm.selectedDevices[i].id;
        if(room.devices.indexOf(deviceName)<0){
          room.devices.push(deviceName);
          room.deviceNum++;
          var index=vm.unassignedDevices.indexOf(vm.selectedDevices[i]);
          vm.unassignedDevices.splice(index,1);
          vm.selectedDevices[i].floor=floor.name;
          vm.selectedDevices[i].room=room.name;
          vm.devices.push(vm.selectedDevices[i]);
        }

      }

     // console.log("new vm.devices is ");
     // console.log(vm.devices);

     // console.log("vm.unassignedDevices is ");
     // console.log(vm.unassignedDevices);

      var localDevices =JSON.parse(window.localStorage['stage-storage-local-devices']);
      var flag=false;
      for(var i in vm.selectedDevices){
        for(var j in localDevices){
          if(vm.selectedDevices[i].id===localDevices[j].uid){
            localDevices[j].deviceGeneralInfoList[0].infoValue=vm.selectedDevices[i].floor+": "+vm.selectedDevices[i].room;
            flag=true;
            break;
          }
        }
      }
      if(flag){
        $window.localStorage.setItem('stage-storage-local-devices', angular.toJson(localDevices));
      }

      vm.selectedDevices=[];
      var newFloor={id:floor.id, name:floor.name,admin:vm.admin,rooms:floor.rooms};
      UpdateFloor(newFloor).then(function (result) {
        console.log(result);
      });


    };
    vm.selectedDevices=[];
    vm.toggle=function (item, list) {
      var idx = list.indexOf(item);
      if (idx > -1) {
        list.splice(idx, 1);
      }
      else {
        list.push(item);
      }

    };

    vm.removeDevicesFromRoom=function (floor,room) {

      var localDevices =JSON.parse(window.localStorage['stage-storage-local-devices']);

      for(var i in room.selectedDevices){
        var device=room.selectedDevices[i];
        var index1=room.devices.indexOf(device.id);
        room.devices.splice(index1,1);
        while(room.devices.indexOf(device.id)>=0){
          var index1=room.devices.indexOf(device.id);
          room.devices.splice(index1,1);
        }
        room.deviceNum--;
        var index2=vm.devices.indexOf(device);
        vm.devices.splice(index2,1);
        device.room="";
        device.floor="";
        vm.unassignedDevices.push(device);

        if(floor.name==='Floor 2' ||floor.name.indexOf('2')>=0){
          for(var j in localDevices){
            if(device.id===localDevices[j].uid){
              localDevices[j].deviceGeneralInfoList[0].infoValue="";
              break;
            }
          }
        }
        
        
        
      }
      if(floor.name==='Floor 2' ||floor.name.indexOf('2')>=0){
        $window.localStorage.setItem('stage-storage-local-devices', angular.toJson(localDevices));
      }

     
      
      room.selectedDevices=[];


      var newFloor={id:floor.id, name:floor.name,admin:vm.admin,rooms:floor.rooms};
      //console.log("newFloor");
      //console.log(newFloor);

      UpdateFloor(newFloor).then(function (result) {
        console.log(result);
      });

    };

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
    });

    vm.check=function (room) {
     // if(room.selectedDevices===null)return true;
     // if(room.selectedDevices.length===0)return true;
      return true;
    }

   // vm.devices=[{"id":"CHP","name":"µCHP","image":"assets/images/energy-flows/CHP.png","location":"","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":""}]},{"id":"PV","name":"Photovoltaic","image":"assets/images/energy-flows/Photovoltaic.png","location":"Rooftop","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":"Rooftop"}]},{"id":"Washing Machine","name":"Washing Machine","image":"assets/images/energy-flows/WashingMachine.png","location":"","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":""}]},{"id":"Dishwasher","name":"Dishwasher","image":"assets/images/energy-flows/Dishwasher.png","location":"","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":""}]},{"id":"Oven","name":"Oven","image":"assets/images/energy-flows/Oven.png","location":"","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":""}]},{"id":"Tumble Dryer","name":"Tumble Dryer","image":"assets/images/energy-flows/TumbleDryer.png","location":"","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":""}]},{"id":"Hob Induction","name":"Hob Induction","image":"assets/images/energy-flows/HobInduction.png","location":"","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":""}]},{"id":"Coffee System","name":"Coffee System","image":"assets/images/energy-flows/CoffeeSystem.png","location":"","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":""}]},{"id":"Air Conditioner","name":"Air Conditioner","image":"assets/images/energy-flows/AirConditioner.png","location":"","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":""}]},{"id":"Fridge","name":"Fridge","image":"assets/images/energy-flows/Fridge.png","location":"","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":""}]},{"id":"Freezer","name":"Freezer","image":"assets/images/energy-flows/Freezer.png","location":"","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":""}]},{"id":"Extractor Hood","name":"Extractor Hood","image":"assets/images/energy-flows/ExtractorHood.png","location":"","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":""}]},{"id":"Light_K17","name":"Light_K17","image":"assets/images/energy-flows/Light_off.png","location":"","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":""}]},{"id":"Light_K16","name":"Light_K16","image":"assets/images/energy-flows/Light_off.png","location":"","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":""}]},{"id":"Light_K19","name":"Light_K19","image":"assets/images/energy-flows/Light_off.png","location":"","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":""}]},{"id":"Light_K18","name":"Light_K18","image":"assets/images/energy-flows/Light_off.png","location":"","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":""}]},{"id":"Light_K20","name":"Light_K20","image":"assets/images/energy-flows/Light_off.png","location":"","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":""}]},{"id":"Light_K21","name":"Light_K21","image":"assets/images/energy-flows/Light_off.png","location":"","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":""}]},{"id":"Blind_2","name":"Blind_2","image":"assets/images/energy-flows/Blind_50.png","location":"","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":""}]},{"id":"Blind_3","name":"Blind_3","image":"assets/images/energy-flows/Blind_50.png","location":"","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":""}]},{"id":"Blind_4","name":"Blind_4","image":"assets/images/energy-flows/Blind_50.png","location":"","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":""}]},{"id":"Blind_5","name":"Blind_5","image":"assets/images/energy-flows/Blind_50.png","location":"","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":""}]},{"id":"Blind_1","name":"Blind_1","image":"assets/images/energy-flows/Blind_50.png","location":"","generalInfoList":[{"unit":null,"infoName":"Location","infoValue":""}]}];
    

   /* GetAllLocations().then(function (result) {

     if(result.locations!= null){
     for(var i in result.locations){
     var locationName=result.locations[i];
     vm.locations.push({name:locationName,deviceNum:0});
     }

     for(var i in vm.locations) {
     var locationName = vm.locations[i].name;
     var count = 0;
     for (var j in vm.devices) {
     if(vm.devices[j].location==locationName){
     count++
     }
     }

     vm.locations[i].deviceNum=count;
     }

     }

     });*/



    vm.save=function () {
      var isSuccessful=true;
      for(var i in vm.locations){
        var location=vm.locations[i].name;
        var deviceArray=[];
        var count=0;
        for(var j in vm.devices){
          var device=vm.devices[j];
          if(device.location==location){
            count++;
            deviceArray.push(device.id);
          }
        }
        vm.locations[i].deviceNum=count;
        UpdateLocation(location, deviceArray).then(function (result) {
          if(result=='false'){
           isSuccessful=false;
          }

        });
      }

      var alert;
      if(isSuccessful==true){

        alert = $mdDialog.alert({
          title: 'Attention',
          textContent: 'The configuration has been saved!',
          ok: 'Close'
        });

      }else{
        alert = $mdDialog.alert({
          title: 'Attention',
          textContent: 'An error has occured!',
          ok: 'Close'
        });
      }
      $mdDialog
        .show( alert )
        .finally(function() {
          alert = undefined;
        });

    }

    vm.showDeviceDetails=function (device) {

      $mdDialog.show({
          controller: DialogController,
          locals:{device:device},
          clickOutsideToClose: true,
          parent: angular.element(document.body),
          // templateUrl: "app/main/apps/energy-flows/deviceDetails.html",
          template: createDeviceDetailsTemplate(device),
          targetEvent: $window.event
        })
        .then(function(answer) {
          $scope.alert = 'You said the information was "' + answer + '".';
        }, function() {
          $scope.alert = 'You cancelled the dialog.';
        });


    }

    function createDeviceDetailsTemplate(device){
      var imgUrl='assets/images/energy-flows/'+device.image;
      var templateHead='<link rel="stylesheet" type="text/css" href="app/main/apps/dweller/energy-flows/energy-flows.scss" />'+
        '<md-dialog id="dialog" aria-label="Mango (Fruit)" style="width: 40%; height: 53%">'+
        '<form>'+
        '<md-toolbar class="md-accent-bg">'+
        '<div class="md-accent-bg md-toolbar-tools">'+
        '<div class="md-table-thumbs" style="float: left;" >'+
        '<div style="background-image:url('+imgUrl+');"></div>'+
        // '<img src='+deviceInfo.href+' width="50" height="50" class="md-avatar"/>'+
        '</div>'+
        '<h2>&nbsp;&nbsp;'+device.name+'</h2>'+
        '<span flex></span>'+
        '<md-button class="md-icon-button" ng-click="close()">'+
        '<md-icon md-svg-src="assets/images/svg/ic_close_24px.svg" aria-label="Close dialog"></md-icon>'+
        '</md-button>'+
        '</div>'+
        '</md-toolbar>'+
        '<md-dialog-content>'+
        '<table width="100%" style="font-family:sans-serif"><tr>';

      var templateContent='<td width="50%" valign="top"><table width="100%">'+createDeviceGeneralInfoTemplate(device.generalInfoList)+'</table></td>';
      var templateTail=
        '</tr></table>'+
        '</md-dialog-content>'+
        '</form>'+
        '</md-dialog>';

      return templateHead+templateContent+templateTail;
    }

    function DialogController($scope, $mdDialog) {

      $scope.close = function() {
        $mdDialog.hide();
      };

    };

    function createDeviceGeneralInfoTemplate(generalInfo){

      var content='';
      for(var i in generalInfo){
        var info=generalInfo[i];
        //console.log(state);
        var infoName=info.infoName;
        var infoValue=info.infoValue;
        if(info.unit != null){
          var unit=info.unit;
          if(unit == "degree Celsius"){
            unit="&deg;C";
          }
          infoValue+=" "+unit;
        }
        content+="<tr style='font-size: small'><td style='font-weight:bold'>"+ infoName+": </td><td>"+infoValue+"</td></tr>";
      }

      return content;
    }

    function GetFloors(admin) {
      return $http.get('http://localhost:8087/bos/api/floors/'+admin).then(handleSuccess, handleError('Error getting all locations'));
    }
    function UpdateFloor(floor) {
      return $http.put('http://localhost:8087/bos/api/floors/',floor).then(handleSuccess, handleError('Error adding device groups'));
    }
    function AddLocation(name) {
      return $http.post('http://localhost:8087/bos/api/locations/', name).then(handleSuccess, handleError('Error adding a location'));
    }
    function UpdateLocation(name, devices) {
      return $http.put('http://localhost:8087/bos/api/locations/'+ name, devices).then(handleSuccess, handleError('Error adding a location'));
    }
    function RemoveLocation(name) {
      return $http.delete('http://localhost:8087/bos/api/locations/'+ name).then(handleSuccess, handleError('Error removing a location'));
    }
    function GetAllLocations() {
      return $http.get('http://localhost:8087/bos/api/locations/').then(handleSuccess, handleError('Error getting all locations'));
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

}
)();
