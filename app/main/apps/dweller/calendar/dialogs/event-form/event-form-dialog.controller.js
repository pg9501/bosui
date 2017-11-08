(function ()
{
    'use strict';

    angular.module('app.dweller.calendar')
        .controller('EventFormDialogController', EventFormDialogController);

    /** @ngInject */
    function EventFormDialogController($mdDialog,$http,$rootScope,$scope,$translate,WAMPService, dialogData)
    {
        var vm = this;

        // Data
        vm.dialogData = dialogData;
        vm.notifications = ['15 minutes before', '30 minutes before', '1 hour before'];

        // Methods
        vm.saveEvent = saveEvent;
        vm.closeDialog = closeDialog;

        vm.user=JSON.parse(window.localStorage.getItem('user-info'));
     //   vm.selectedLocation={name:"",isInBuilding:true,temperature:25,humidity:50};
      vm.calendarEvent={};
      vm.calendarEvent.title='';
        vm.devices=[];
        vm.locations=[];
        vm.settingType='Location';
        vm.settingTypeEnd='';
        vm.sharedWampSession=WAMPService.wampSession;
       // vm.generateJsonFromJavaObj=deviceService.generateJsonFromJavaObj;

      vm.currentLanuage="en";


      $rootScope.$on('$translateChangeSuccess', function () {

        if($translate.use().substring(0,1)=='c'){
          vm.currentLanuage="ch";
          for(var i in vm.calendarEvent.deviceGroupsStart){
            var group=vm.calendarEvent.deviceGroupsStart[i];
            if(group.targetState=='??? (not set yet)'||group.targetState=='??? (noch nicht eingestellt)'){
              group.targetState=='??? (还未设置)'
            }
          }
          for(var i in vm.calendarEvent.deviceGroupsEnd){
            var group=vm.calendarEvent.deviceGroupsEnd[i];
            if(group.targetState=='??? (not set yet)'||group.targetState=='??? (noch nicht eingestellt)'){
              group.targetState=='??? (还未设置)'
            }
          }
        }
        if($translate.use().substring(0,1)=='e'){
          vm.currentLanuage="en";
          for(var i in vm.calendarEvent.deviceGroupsStart){
            var group=vm.calendarEvent.deviceGroupsStart[i];
            if(group.targetState=='??? (还未设置)'||group.targetState=='??? (noch nicht eingestellt)'){
              group.targetState=='??? (not set yet)'
            }
          }
          for(var i in vm.calendarEvent.deviceGroupsEnd){
            var group=vm.calendarEvent.deviceGroupsEnd[i];
            if(group.targetState=='??? (还未设置)'||group.targetState=='??? (noch nicht eingestellt)'){
              group.targetState=='??? (not set yet)'
            }
          }
        }
        if($translate.use().substring(0,1)=='d'){
          vm.currentLanuage="de";
          for(var i in vm.calendarEvent.deviceGroupsStart){
            var group=vm.calendarEvent.deviceGroupsStart[i];
            if(group.targetState=='??? (还未设置)'||group.targetState=='??? (not set yet)'){
              group.targetState=='??? (noch nicht eingestellt)';
            }
          }
          for(var i in vm.calendarEvent.deviceGroupsEnd){
            var group=vm.calendarEvent.deviceGroupsEnd[i];
            if(group.targetState=='??? (还未设置)'||group.targetState=='??? (not set yet)'){
              group.targetState=='??? (noch nicht eingestellt)';
            }
          }
        }



      });

      $scope.$on('$viewContentLoaded', function(){
        //Here your view content is fully loaded !!
        if($translate.use().substring(0,1)=='c'){
          vm.currentLanuage="ch";
          for(var i in vm.calendarEvent.deviceGroupsStart){
            var group=vm.calendarEvent.deviceGroupsStart[i];
            if(group.targetState=='??? (not set yet)'||group.targetState=='??? (noch nicht eingestellt)'){
              group.targetState=='??? (还未设置)'
            }
          }
          for(var i in vm.calendarEvent.deviceGroupsEnd){
            var group=vm.calendarEvent.deviceGroupsEnd[i];
            if(group.targetState=='??? (not set yet)'||group.targetState=='??? (noch nicht eingestellt)'){
              group.targetState=='??? (还未设置)'
            }
          }
        }
        if($translate.use().substring(0,1)=='e'){
          vm.currentLanuage="en";
          for(var i in vm.calendarEvent.deviceGroupsStart){
            var group=vm.calendarEvent.deviceGroupsStart[i];
            if(group.targetState=='??? (还未设置)'||group.targetState=='??? (noch nicht eingestellt)'){
              group.targetState=='??? (not set yet)'
            }
          }
          for(var i in vm.calendarEvent.deviceGroupsEnd){
            var group=vm.calendarEvent.deviceGroupsEnd[i];
            if(group.targetState=='??? (还未设置)'||group.targetState=='??? (noch nicht eingestellt)'){
              group.targetState=='??? (not set yet)'
            }
          }
        }
        if($translate.use().substring(0,1)=='d'){
          vm.currentLanuage="de";
          for(var i in vm.calendarEvent.deviceGroupsStart){
            var group=vm.calendarEvent.deviceGroupsStart[i];
            if(group.targetState=='??? (还未设置)'||group.targetState=='??? (not set yet)'){
              group.targetState=='??? (noch nicht eingestellt)';
            }
          }
          for(var i in vm.calendarEvent.deviceGroupsEnd){
            var group=vm.calendarEvent.deviceGroupsEnd[i];
            if(group.targetState=='??? (还未设置)'||group.targetState=='??? (not set yet)'){
              group.targetState=='??? (noch nicht eingestellt)';
            }
          }
        }

      });


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

      $scope.$watch('$viewContentLoaded', function(){

        vm.settingTypeEnd='Location';
        if(vm.calendarEvent.locationStart.name!=''){

          if(!vm.calendarEvent.locationStart.isInBuilding){
            $("#outsideLocationDiv").show();
            $("#tempAndHumiditySettingTable").hide();
            vm.calendarEvent.locationStart.isTempDisabled=true;
            vm.calendarEvent.locationStart.isHumidityDisabled=true;

            vm.calendarEvent.locationEnd.isInBuilding=false;
            vm.calendarEvent.locationEnd.name=vm.calendarEvent.locationStart.name;
            //$("#outsideLocationDivEnd").show();
            $("#locationSettingDivEnd").show();
            $("#tempAndHumiditySettingTableEnd").hide();
            vm.calendarEvent.locationEnd.isTempDisabled=true;
            vm.calendarEvent.locationEnd.isHumidityDisabled=true;
          }else{

            vm.calendarEvent.locationEnd.name=vm.calendarEvent.locationStart.name;

           // vm.changeLocation(vm.calendarEvent.locationStart.name);

            $("#tempAndHumiditySettingTable").show();
            $("#outsideLocationDiv").hide();

            $("#locationSettingDivEnd").show();
            $("#tempAndHumiditySettingTableEnd").show();

            vm.isDisabledTempSetting=vm.calendarEvent.locationStart.isTempDisabled;
            vm.isDisabledHumiditySetting=vm.calendarEvent.locationStart.isHumidityDisabled;

            vm.isDisabledTempSettingEnd=vm.calendarEvent.locationEnd.isTempDisabled;
            vm.isDisabledHumiditySettingEnd=vm.calendarEvent.locationEnd.isHumidityDisabled;

            if(vm.isDisabledTempSetting){
              $("#tempSettingTableRow").hide();
            }
            if( vm.isDisabledTempSettingEnd){
              $("#tempSettingTableRowEnd").hide();
            }
            if(vm.isDisabledHumiditySetting){
              $("#humiditySettingTableRow").hide();
            }
            if(vm.isDisabledHumiditySettingEnd){
              $("#humiditySettingTableRowEnd").hide();
            }

          }

        }
        if(vm.dialogData.type === 'edit'){
          vm.calendarEvent = angular.copy(vm.dialogData.calendarEvent);

          // Convert moment.js dates to javascript date object
          if ( moment.isMoment(vm.calendarEvent.startDate) )
          {
            vm.calendarEvent.startDate = vm.calendarEvent.startDate.toDate();
            vm.calendarEvent.startTime = vm.calendarEvent.startTime.toDate();
          }else{
            vm.calendarEvent.startDate=new Date(vm.calendarEvent.startDate);
            vm.calendarEvent.startTime=new Date(vm.calendarEvent.startTime);
          }

          if ( moment.isMoment(vm.calendarEvent.endDate) )
          {
            vm.calendarEvent.endDate = vm.calendarEvent.endDate.toDate();
            vm.calendarEvent.endTime = vm.calendarEvent.endTime.toDate();
          }else{
            vm.calendarEvent.endDate = new Date(vm.calendarEvent.endDate);
            vm.calendarEvent.endTime = new Date(vm.calendarEvent.endTime);
          }

        }

       // console.log(vm.calendarEvent);


      });

        //////////

        /**
         * Initialize
         */
        function init()
        {
            vm.dialogTitle = (vm.dialogData.type === 'add' ? 'Add Event' : 'Edit Event');

            // Edit
            if ( vm.dialogData.calendarEvent )
            {
                // Clone the calendarEvent object before doing anything
                // to make sure we are not going to brake the Full Calendar
                vm.calendarEvent = angular.copy(vm.dialogData.calendarEvent);

                // Convert moment.js dates to javascript date object
              if ( moment.isMoment(vm.calendarEvent.startDate) )
              {
                vm.calendarEvent.startDate = vm.calendarEvent.startDate.toDate();
                vm.calendarEvent.startTime = vm.calendarEvent.startTime.toDate();
              }else{
                vm.calendarEvent.startDate=new Date(vm.calendarEvent.startDate);
                vm.calendarEvent.startTime=new Date(vm.calendarEvent.startTime);
              }

              if ( moment.isMoment(vm.calendarEvent.endDate) )
              {
                vm.calendarEvent.endDate = vm.calendarEvent.endDate.toDate();
                vm.calendarEvent.endTime = vm.calendarEvent.endTime.toDate();
              }else{
                vm.calendarEvent.endDate = new Date(vm.calendarEvent.endDate);
                vm.calendarEvent.endTime = new Date(vm.calendarEvent.endTime);
              }


            }
            // Add
            else
            {
                // Convert moment.js dates to javascript date object
                if ( moment.isMoment(vm.dialogData.startDate) )
                {
                    vm.dialogData.startDate = vm.dialogData.startDate.toDate();
                //  console.log("time2 "+vm.dialogData.startDate);
                }

                if ( moment.isMoment(vm.dialogData.endDate) )
                {
                    vm.dialogData.endDate = vm.dialogData.endDate.toDate();
                }
              
              var initialState='??? (not set yet)';
              if($translate.use().substring(0,1)=='c'){
                vm.currentLanuage="ch";

              }
              if($translate.use().substring(0,1)=='e'){
                vm.currentLanuage="en";

              }
              if($translate.use().substring(0,1)=='d'){
                vm.currentLanuage="de";

              }
              if(vm.currentLanuage=='de'){
                initialState='??? (noch nicht eingestellt)';
              }else if(vm.currentLanuage=='de'){
                initialState='??? (还未设置)';
              }



                vm.calendarEvent = {
                    startDate        : vm.dialogData.startDate,
                    endDate          : vm.dialogData.endDate,
                    startTime        : new Date(),
                    endTime          : new Date(),
                    notifications: [],
                    locationStart:{name:"",isInBuilding:true,isTempDisabled:false,isHumidityDisabled:false,temperature:25,humidity:50},
                    locationEnd:{name:"",isInBuilding:true,isTempDisabled:true,isHumidityDisabled:true,temperature:25,humidity:50},
                    deviceGroupsStart:[{deviceNames:[],deviceActions:[],targetState:initialState}],
                    deviceGroupsEnd:[{deviceNames:[],deviceActions:[],targetState:initialState}]
                };
            }

          GetDweller(vm.user.name).then(function (result) {
            if (result != null) {
              var dweller = result;
              var permissions = dweller.permissions;

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
                  vm.devices.push({name:permission.devices[j], url:url, operations:operations, location:""});
                }
              }
              GetAllLocationsWithDevices().then(function (result) {
                if (result != null) {
                  var locations=result;

                  for (var i in locations) {
                    var location=locations[i];
                    vm.locations.push({name:location.name,temperature:25,humidity:50});
                    for(var j in vm.devices){
                      var device=vm.devices[j];
                      if(location.devices.indexOf(device.name)>=0){
                        device.location=location.name;
                      }

                    }
                  }
                }
              });

              GetAllBlinds().then(function (result) {
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
                        if(vm.currentLanuage=='en'){
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
              });

            }

          });



        }


        function saveEvent()
        {

            var response = {
                type         : vm.dialogData.type,
                calendarEvent: vm.calendarEvent
            };

            $mdDialog.hide(response);
        }

      vm.isDisabledTempSetting=false;
      vm.isDisabledHumiditySetting=false;

      vm.isDisabledTempSettingEnd=false;
      vm.isDisabledHumiditySettingEnd=false;

      vm.changeSettingType=function () {

        if(vm.settingType=='Location'){
          $("#locationSettingDiv").show();
          $("#deviceSettingDiv").hide();
        }else{
          $("#deviceSettingDiv").show();
          $("#locationSettingDiv").hide();
        }
      }


      vm.changeSettingTypeEnd=function () {

        if(vm.settingTypeEnd==''){
          $("#deviceSettingDivEnd").hide();
          $("#locationSettingDivEnd").hide();
          return;
        }

        if(vm.settingTypeEnd=='Location'){
          $("#locationSettingDivEnd").show();
          $("#deviceSettingDivEnd").hide();
        }else{
          $("#deviceSettingDivEnd").show();
          $("#locationSettingDivEnd").hide();
        }
      }

      vm.disableTempSetting=function () {

        var tableRow = document.getElementById("tempSettingTableRow");
        if(vm.isDisabledTempSetting){
          tableRow.style.display="table-row";
          vm.calendarEvent.locationStart.isTempDisabled=false;
        }else{
          tableRow.style.display="none";
          vm.calendarEvent.locationStart.isTempDisabled=true;
        }

        var tableRow = document.getElementById("tempSettingTableRowEnd");
        if(vm.isDisabledTempSetting){
          tableRow.style.display="table-row";
          vm.calendarEvent.locationEnd.isTempDisabled=false;
          vm.isDisabledTempSettingEnd=false;
        }else{
          tableRow.style.display="none";
          vm.calendarEvent.locationEnd.isTempDisabled=true;
          vm.isDisabledTempSettingEnd=true;
        }
      }

      vm.disableTempSettingEnd=function () {

        var tableRow = document.getElementById("tempSettingTableRowEnd");
        if(vm.isDisabledTempSettingEnd){
          tableRow.style.display="table-row";
          vm.calendarEvent.locationEnd.isTempDisabled=false;
        }else{
          tableRow.style.display="none";
          vm.calendarEvent.locationEnd.isTempDisabled=true;
        }

      }

      vm.disableHumiditySetting=function () {
        var tableRow = document.getElementById("humiditySettingTableRow");
        if(vm.isDisabledHumiditySetting){
          tableRow.style.display="table-row";
          vm.calendarEvent.locationStart.isHumidityDisabled=false;
        }else{
          tableRow.style.display="none";
          vm.calendarEvent.locationStart.isHumidityDisabled=true;
        }

        var tableRow = document.getElementById("humiditySettingTableRowEnd");
        if(vm.isDisabledHumiditySetting){
          tableRow.style.display="table-row";
          vm.calendarEvent.locationEnd.isHumidityDisabled=false;
          vm.isDisabledHumiditySettingEnd=false;
        }else{
          tableRow.style.display="none";
          vm.calendarEvent.locationEnd.isHumidityDisabled=true;
          vm.isDisabledHumiditySettingEnd=true;
        }
      }

      vm.disableHumiditySettingEnd=function () {
        var tableRow = document.getElementById("humiditySettingTableRowEnd");
        if(vm.isDisabledHumiditySettingEnd){
          tableRow.style.display="table-row";
          vm.calendarEvent.locationEnd.isHumidityDisabled=false;
        }else{
          tableRow.style.display="none";
          vm.calendarEvent.locationEnd.isHumidityDisabled=true;
        }
      }

      vm.showDeviceActions=function (deviceGroup,index) {

        var selectedDeviceName=deviceGroup.deviceNames[0];

        vm.sharedWampSession.call('eshl.get_home_device',[vm.currentLanuage,selectedDeviceName]).then(
          function (device) {
            var deviceActions=[];
            for(var k in device.deviceControllerList){
              var controller=device.deviceControllerList[k];
              for(var m in controller.actionList){
                var action=controller.actionList[m];
                var description=action.description;
                var commands=action.commandList;
                var widget=action.widget;
                widget.template="app/main/apps/dweller/calendar/templates/"+widget.type+".html";

                if(widget.type=='Slider'){
                  if(deviceGroup.targetState!='??? (not set yet)'&& deviceGroup.targetState!='??? (noch nicht eingestellt)' && deviceGroup.targetState!='??? (还未设置)'){
                    switch(deviceGroup.targetState){
                      case "Open:100%":
                      case "Auf:100%":
                      case "打开:100%":
                        widget.initVal=0;
                        break;
                      case "Closed:25%":
                      case "Zu:25%":
                      case "关闭:25%":
                        widget.initVal=25;
                        break;
                      case "Closed:50%":
                      case "Zu:50%":
                      case "关闭:50%":
                        widget.initVal=50;
                        break;
                      case "Closed:75%":
                      case "Zu:75%":
                      case "关闭:75%":
                        widget.initVal=75;
                        break;
                      case "Closed:100%":
                      case "Zu:100%":
                      case "关闭:100%":
                        widget.initVal=100;
                        break;
                      default:
                        break;
                    }
                  }
                }
                if(widget.type=='Switch'){
                  switch(deviceGroup.targetState){
                    case "On":
                    case "ON":
                    case "Ein":
                    case "开启":
                      widget.initVal=true;
                      break;
                    case "Off":
                    case "OFF":
                    case "Aus":
                    case "关闭":
                      widget.initVal=false;
                      break;
                    default:
                      widget.initVal=true;
                      break;
                  }
                }
                if(widget.type=='TouchSpin'){

                  if(deviceGroup.targetState.indexOf('On')>=0||deviceGroup.targetState.indexOf('Ein')>=0||deviceGroup.targetState.indexOf('开启')>=0){
                    var value=deviceGroup.targetState.match(/\d/g);
                    value = value.join("");
                    widget.initVal=value;
                  }

                }
                if(widget!=null){

                  deviceActions.push({widget:widget,description:description,commands:commands});
                }

              }

            }
            deviceGroup.deviceActions=deviceActions;


            if(index >=0){

              if(vm.calendarEvent.deviceGroupsEnd[index].deviceActions.length==0){
                angular.copy(deviceGroup.deviceActions,vm.calendarEvent.deviceGroupsEnd[index].deviceActions);
              }
             // angular.copy(deviceGroup.deviceActions,vm.calendarEvent.deviceGroupsEnd[index].deviceActions);

            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );
      }

     // vm.deviceGroups=[{deviceNames:[],deviceActions:[],targetState:'??? (not set yet)'}];

      vm.validateDevicesStart=function (deviceGroup,actionAndStateDiv,form, errorMessageDIV) {

        if(deviceGroup.deviceNames.length==0){
          form[errorMessageDIV].$error.validationError = false;
          $("#"+actionAndStateDiv).hide();
          return;
        }

        var flag=true;
        if(deviceGroup.deviceNames.length>1){
          for(var i in deviceGroup.deviceNames){
            var deviceName1=deviceGroup.deviceNames[i].substring(0,5);
            for(var j in deviceGroup.deviceNames){
              var deviceName2=deviceGroup.deviceNames[j].substring(0,5);
              if(deviceName1!=deviceName2){
                flag=false;
                break;
              }
            }
            if(!flag){
              break;
            }
          }
        }

        var index=vm.calendarEvent.deviceGroupsStart.indexOf(deviceGroup);
        if(flag){

          form[errorMessageDIV].$error.validationError = false;
          $("#"+actionAndStateDiv).show();

          vm.showDeviceActions(deviceGroup,index);


          vm.calendarEvent.deviceGroupsEnd[index].deviceNames=deviceGroup.deviceNames;

          deviceGroup.targetState=vm.calendarEvent.deviceGroupsStart[index].targetState;

         // vm.calendarEvent.deviceGroupsEnd[index].targetState='??? (not set yet)';

          $("#"+actionAndStateDiv+"_End").show();

        }else{
          form[errorMessageDIV].$error.validationError = true;

          $("#"+actionAndStateDiv).hide();
        }
       // deviceGroup.targetState=vm.calendarEvent.deviceGroupsStart[index].targetState;

      }

     // vm.targetState='??? (not set yet)';
      vm.switchChange=function (deviceGroup,switchState) {
        if(switchState){
          if(vm.currentLanuage=="en"){
            deviceGroup.targetState='On';
          }else if(vm.currentLanuage=="de"){
            deviceGroup.targetState='Ein';
          }else if(vm.currentLanuage=="ch"){
            deviceGroup.targetState='开启';
          }

        }else{
          if(vm.currentLanuage=="en"){
            deviceGroup.targetState='Off';
          }else if(vm.currentLanuage=="de"){
            deviceGroup.targetState='Aus';
          }else if(vm.currentLanuage=="ch"){
            deviceGroup.targetState='关闭';
          }

        }

      }
      vm.buttonClick=function(deviceGroup,btnTxt){
        if(btnTxt.toLowerCase().indexOf('on')>=0||btnTxt.toLowerCase().indexOf('ein')>=0||btnTxt.indexOf('开启')>=0){
          if(vm.currentLanuage=="en"){
            deviceGroup.targetState='On';
          }else if(vm.currentLanuage=="de"){
            deviceGroup.targetState='Ein';
          }else{
            deviceGroup.targetState='开启';
          }

          if(deviceGroup.deviceNames[0].indexOf("Air")>=0){
            for(var i in deviceGroup.deviceActions){
              var action=deviceGroup.deviceActions[i];
              if(action.widget.type=='TouchSpin'){
                if(vm.currentLanuage=="en"){
                  deviceGroup.targetState+=", Temperature: "+action.widget.initVal;
                }else if(vm.currentLanuage=="de"){
                  deviceGroup.targetState+=", Temperatur: "+action.widget.initVal;
                }else{
                  deviceGroup.targetState+=", 温度: "+action.widget.initVal;
                }

                break;
              }
            }
          }
        }else{
          if(vm.currentLanuage=="en"){
            deviceGroup.targetState='Off';
          }else if(vm.currentLanuage=="de"){
            deviceGroup.targetState='Aus';
          }else{
            deviceGroup.targetState='关闭';
          }

        }
      }
      vm.sliderChange=function (deviceGroup,value) {
        if(vm.currentLanuage=='en'){
          switch(value){
            case 0:
              deviceGroup.targetState="Open:100%";
              break;
            case 25:
              deviceGroup.targetState="Closed:25%";
              break;
            case 50:
              deviceGroup.targetState="Closed:50%";
              break;
            case 75:
              deviceGroup.targetState="Closed:75%";
              break;
            case 100:
              deviceGroup.targetState="Closed:100%";
              break;
            default:
              break;
          }
        }else if(vm.currentLanuage=='de'){
          switch(value){
            case 0:
              deviceGroup.targetState="Auf:100%";
              break;
            case 25:
              deviceGroup.targetState="Zu:25%";
              break;
            case 50:
              deviceGroup.targetState="Zu:50%";
              break;
            case 75:
              deviceGroup.targetState="Zu:75%";
              break;
            case 100:
              deviceGroup.targetState="Zu:100%";
              break;
            default:
              break;
          }
        }else{
          switch(value){
            case 0:
              deviceGroup.targetState="打开:100%";
              break;
            case 25:
              deviceGroup.targetState="关闭:25%";
              break;
            case 50:
              deviceGroup.targetState="关闭:50%";
              break;
            case 75:
              deviceGroup.targetState="关闭:75%";
              break;
            case 100:
              deviceGroup.targetState="关闭:100%";
              break;
            default:
              break;
          }
        }

      }

      vm.touchSpinChange=function(deviceGroup,value){
        if(vm.currentLanuage=='en'){
          deviceGroup.targetState="On, Temperature: "+value+" °C";
        }else if(vm.currentLanuage=='de'){
          deviceGroup.targetState="Ein, Temperatur: "+value+" °C";
        }else{
          deviceGroup.targetState="开启, 温度: "+value+" °C";
        }

      }

      vm.addNewDeviceGroup=function () {
        var targetState="??? (not set yet)";
        if($translate.use().substring(0,1)=='c'){
          vm.currentLanuage="ch";
          targetState="??? (还未设置)";
        }
        if($translate.use().substring(0,1)=='e'){
          vm.currentLanuage="en";
        }
        if($translate.use().substring(0,1)=='d'){
          vm.currentLanuage="de";
          targetState="??? (noch nicht eingestellt)";
        }

        console.log("targetState is "+targetState);

        var newGroup1={deviceNames:[],deviceActions:[],targetState:targetState};
        vm.calendarEvent.deviceGroupsStart.push(newGroup1);
        var newGroup2={deviceNames:[],deviceActions:[],targetState:targetState};
        vm.calendarEvent.deviceGroupsEnd.push(newGroup2);
      }

      vm.addNewDeviceGroupEnd=function () {
        var targetState="??? (not set yet)";
        if($translate.use().substring(0,1)=='c'){
          vm.currentLanuage="ch";
          targetState="??? (还未设置)";
        }
        if($translate.use().substring(0,1)=='e'){
          vm.currentLanuage="en";
        }
        if($translate.use().substring(0,1)=='d'){
          vm.currentLanuage="de";
          targetState="??? (noch nicht eingestellt)";
        }

        var newGroup={deviceNames:[],deviceActions:[],targetState:targetState};
        vm.calendarEvent.deviceGroupsEnd.push(newGroup);
      }

      vm.checkDisabled=function (deviceGroup,deviceName) {

        for(var i in vm.calendarEvent.deviceGroupsStart){
          if(deviceGroup!=vm.calendarEvent.deviceGroupsStart[i]){
            var deviceNames=vm.calendarEvent.deviceGroupsStart[i].deviceNames;
            for(var j in deviceNames){
              var name=deviceNames[j];
              if(name.indexOf("(")>-1){
                name=name.substring(0,name.indexOf("(")).trim();
              }

              if(deviceName==name){
                return true;
              }
            }
          }

        }
        return false;
      }

      vm.removeDeviceGroup=function (deviceGroup) {
        var index=vm.calendarEvent.deviceGroupsStart.indexOf(deviceGroup);
        vm.calendarEvent.deviceGroupsStart.splice(index,1);
        vm.calendarEvent.deviceGroupsEnd.splice(index,1);
      }

      vm.removeDeviceGroupEnd=function (deviceGroup) {
        var index=vm.calendarEvent.deviceGroupsEnd.indexOf(deviceGroup);
        vm.calendarEvent.deviceGroupsEnd.splice(index,1);
      }

      vm.changeLocation=function (locationName) {
        if(locationName!='Not in this building'){

          vm.calendarEvent.locationStart.isInBuilding=true;
          $("#tempAndHumiditySettingTable").show();
          $("#outsideLocationDiv").hide();
          vm.calendarEvent.locationStart.isTempDisabled=false;
          vm.calendarEvent.locationStart.isHumidityDisabled=false;

          vm.calendarEvent.locationEnd.isInBuilding=true;
          vm.calendarEvent.locationEnd.name=locationName;
          $("#locationSettingDivEnd").show();
          $("#tempAndHumiditySettingTableEnd").show();
          //$("#outsideLocationDivEnd").hide();
          vm.calendarEvent.locationEnd.isTempDisabled=false;
          vm.calendarEvent.locationEnd.isHumidityDisabled=false;
        }else{
          vm.calendarEvent.locationStart.isInBuilding=false;
          vm.calendarEvent.locationStart.name="";
          $("#outsideLocationDiv").show();
          $("#tempAndHumiditySettingTable").hide();
          vm.calendarEvent.locationStart.isTempDisabled=true;
          vm.calendarEvent.locationStart.isHumidityDisabled=true;

          vm.calendarEvent.locationEnd.isInBuilding=false;
          vm.calendarEvent.locationEnd.name="";
          $("#locationSettingDivEnd").show();
          $("#tempAndHumiditySettingTableEnd").hide();
          vm.calendarEvent.locationEnd.isTempDisabled=true;
          vm.calendarEvent.locationEnd.isHumidityDisabled=true;
        }

      }

      vm.changeLocationEnd=function (locationName) {
        if(locationName!='Not in this building'){
          vm.calendarEvent.locationEnd.isInBuilding=true;
          $("#tempAndHumiditySettingTableEnd").show();
          $("#locationSettingDivEnd").hide();
          vm.calendarEvent.locationEnd.isTempDisabled=false;
          vm.calendarEvent.locationEnd.isHumidityDisabled=false;

        }else{

          vm.calendarEvent.locationEnd.isInBuilding=false;
          vm.calendarEvent.locationEnd.name="";
          $("#locationSettingDivEnd").show();
          $("#tempAndHumiditySettingTableEnd").hide();
          vm.calendarEvent.locationEnd.isTempDisabled=true;
          vm.calendarEvent.locationEnd.isHumidityDisabled=true;
        }

      }

      init();

      vm.removeEvent=function () {
        if(vm.dialogTitle=='Add Event'){
          closeDialog();
        }else{
          removeCalendarItem(vm.user.name,vm.calendarEvent.id).then(function (result) {
            console.log(result);
          });
          var response = {
            type         : 'delete',
            calendarEvent: vm.calendarEvent,

          };
          $mdDialog.hide(response);
        }
      }


        /**
         * Close the dialog
         */
        function closeDialog()
        {
            $mdDialog.cancel();
        }


      function GetAllLocationsWithDevices() {
        return $http.get('http://localhost:8087/bos/api/locations/devices').then(handleSuccess, handleError('Error getting all locations'));
      }
      function GetAllBlinds() {
        return $http.get('http://localhost:8087/bos/api/dummyDevices/blinds').then(handleSuccess, handleError('Error getting all blinds'));
      }
      function GetDweller(name) {
        return $http.get('http://localhost:8087/bos/api/users/dweller/'+name).then(handleSuccess, handleError('Error getting the dweller'));
      }
      function removeCalendarItem(userName,id) {
        return $http.delete('http://localhost:8087/bos/api/calendar/'+userName+'/'+id).then(handleSuccess, handleError('Error removing calendar items'));
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
