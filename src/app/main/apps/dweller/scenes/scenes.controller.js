/**
 * Created by pg9501 on 29.09.2016.
 */
(function () {
  'use strict';

  angular
    .module('app.dweller.scenes')

    .controller('ScenesController', ScenesController);

  /** @ngInject */
  function ScenesController($rootScope, $translate, $scope,$cookies,$http,$window, $mdDialog,msNavigationService,WAMPService) {

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

    //update clock time every second on the navigation bar
    $scope.getDate = new Date();
    setInterval(function(){
      $scope.$apply(function(){
        $scope.getDate = new Date();
      });
    }, 1000);

    var vm=this;

    vm.wampSession=WAMPService.getWAMPsession();

    vm.tabs = [
      //{ title: 'One'}
      // { title: 'Two'}
    ];

    vm.ctrl = {
      val: 0
    };

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

    var user=$cookies.getObject('globals').currentUser;
    vm.dweller={};
    vm.devicesWithControl=[];
    vm.scenes=[];
    vm.devices=[];

    var check = function(){
      vm.wampSession=WAMPService.getWAMPsession();
      if (typeof vm.wampSession != 'undefined') {
        // run when condition is met
        GetDweller(user.username).then(function (result) {
          if (result != null) {
            vm.dweller = result;
            var permissions = vm.dweller.permissions;
            for (var i in permissions) {
              var permission = permissions[i];
              var devices = permission.devices;

              var operations = permission.operations;
              if(operations==null){
                continue;
              }
              if (operations.indexOf("CONTROL_DEVICE") > -1) {
                for (var dev in devices) {
                  vm.devicesWithControl.push(devices[dev]);
                }

              }
            }

            vm.wampSession.call('eshl.get_all_devices',[vm.currentLanuage]).then(
              // RPC success callback
              function (devices) {

                for(var i in devices){
                  var device=devices[i];
                  var location='';
                  var floor='';
                  var room='';
                  var id=device['uid'];
                  var name=device['deviceName'];

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
                      //.log("device location is "+infoValue);
                      location=infoValue;
                      floor=location.substring(0,location.indexOf(":"));
                      room=location.substring(location.indexOf(":")+1).trim();
                    }
                  }
                  var actions=[];
                  for(var k in device.deviceControllerList){
                    var controller=device.deviceControllerList[k];
                    for(var m in controller.actionList){
                      var action=controller.actionList[m];
                      var description=action.description;
                      var commands=action.commandList;
                      var widget=action.widget;
                      widget.template="app/main/apps/dweller/scenes/templates/"+widget.type+".html";
                      //console.log(widget);
                      if(widget!=null){

                        actions.push({widget:widget,description:description,commands:commands});
                      }

                    }

                  }
                  if(vm.devicesWithControl.indexOf(id)>-1){
                    vm.devices.push({deviceId:id,name:name, image:image,location:location,floor:floor,room:room,actions:actions,targetState:"???(not set yet)",commands:[]});

                  }

                }

                GetScenesForDweller(user.username).then(function (result) {

                  if(result!=null && result.length>0){
                    for(var i in result){
                      var scene=result[i];
                      if(scene.name==null){
                        continue;
                      }
                      var devicesInScene=[];
                      for(var j in scene.devicesInScene){
                        var deviceId=scene.devicesInScene[j].deviceId;
                        if(deviceId==null){
                          continue;
                        }
                        var targetState="???(not set yet)";

                        for(var m in scene.devicesInScene[j].commands){
                          var command=scene.devicesInScene[j].commands[m];
                          if(m==0){
                            targetState=command.widgetState;
                          }else{
                            targetState+="<br> "+command.widgetState;
                          }

                        }

                        for(var dev in vm.devices){
                          var device=vm.devices[dev];
                          if(device.deviceId==deviceId){
                            var image=device.image;
                            if(device.name.indexOf("Light")>-1){
                              if(targetState.indexOf("ON")>-1){
                                var imageName="Light_on";
                                // var imageName="Blinds_50";
                                image='assets/images/energy-flows/'+imageName+".png";

                              }
                            }else if(device.name.indexOf("Air Conditioner")>-1){
                              var numb = targetState.match(/\d/g);
                              if(numb!=null) {
                                numb = numb.join("");
                                //console.log(device.actions);
                                for(var act in device.actions){
                                  var action=device.actions[act];
                                  if(action.description.indexOf("Set temperature")>=0){
                                    var widget=action.widget;
                                    widget.initVal=numb;
                                    break;
                                  }
                                }

                              }
                            }


                            devicesInScene.push({deviceId:device.deviceId, name:device.name,image:image,location:device.location,actions:device.actions,targetState:targetState,commands:scene.devicesInScene[j].commands});

                          }
                        }
                      }
                      vm.scenes.push({name:scene.name,owner:user.username,image:scene.image,devicesInScene:devicesInScene});
                    }

                   // console.log("vm.scenes");
                    //console.log(vm.scenes);
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


    vm.checkScene=function (scene) {
      var flag=false;
      for(var i in scene.devicesInScene){
        if(scene.devicesInScene[i].targetState.indexOf("???")<0){
          flag=true;
          break;
        }
      }
      return !flag;
    };

    vm.triggerScene=function (scene) {

      for(var i in scene.devicesInScene){
        var deviceInScene=scene.devicesInScene[i];
        var commands=deviceInScene.commands;
        if(deviceInScene.deviceId.indexOf("Light")>=0){
          var deviceID=deviceInScene.deviceId;
          for(var j in vm.lightStates) {
            var lightID = Object.keys(vm.lightStates[j])[0];
            if (lightID === deviceID) {
              vm.lightStates[j][lightID]=deviceInScene.targetState.toLowerCase();
              break;
            }
          }


          /*for(var j in commands){
            var commandString=commands[j].commandString;
            var command=commandString.split(" ")[0];
            var param=commandString.split(" ")[1];
            vm.wampSession.call(command,[param]).then(
              // RPC success callback
              function (result) {
                console.log(result);
              }

            );
          }*/



        }else if(deviceInScene.deviceId.indexOf("Blind")>=0){
          var deviceID=deviceInScene.deviceId;
          for(var j in commands){
            var targetState=commands[j].widgetState;
            var sliderValue=0;
            switch (targetState){
              case 'Open: 100%':
              case 'Auf: 100%':
              case '打开: 100%':
                    sliderValue=0;
                    break;
              case 'Closed: 25%':
              case 'Zu: 25%':
              case '关闭: 25%':
                sliderValue=25;
                    break;
              case 'Closed: 50%':
              case 'Zu: 50%':
              case '关闭: 50%':
                sliderValue=50;
                    break;
              case 'Closed: 75%':
              case 'Zu: 75%':
              case '关闭: 75%':
                sliderValue=75;
                    break;
              case 'Closed: 100%':
              case 'Zu: 100%':
              case '关闭: 100%':
                sliderValue=100;
                    break;
              default:
                sliderValue=0;
                    break;
            }
          //  deviceInScene.actions[0].widget.initVal=sliderValue;

            for(var k in vm.blindStates) {
              var blindID = Object.keys(vm.blindStates[k])[0];
              if (blindID === deviceID) {
                vm.blindStates[k][blindID]=sliderValue;
              }
            }

         /*   UpdateBlindInitVal(deviceInScene.deviceId,sliderValue).then(function (result) {
              console.log(result);

            });*/

          }
        }else if(deviceInScene.deviceId.indexOf("Air Conditioner")>=0){
          //console.log(deviceInScene.targetState);
          var numb = deviceInScene.targetState.match(/\d/g);
          if(numb!=null){
            numb = numb.join("");
            /*UpdateAirConditionerTemp(numb).then(function (result) {
              console.log(result);

            });*/
            $window.localStorage.setItem('stage-storage-temp-air-conditioner', numb);
          }

        }



      }
      $window.localStorage.setItem('stage-storage-light-states', angular.toJson(vm.lightStates));

      $window.localStorage.setItem('stage-storage-blind-states', angular.toJson(vm.blindStates));

      $mdDialog.show(
        $mdDialog.alert()
          .clickOutsideToClose(true)
          .title('This scene has been triggered.')
          .textContent('The devices in this scene have been set to target states!')
          .ariaLabel('Alert Dialog Demo')
          .ok('Got it!')
      );

      var scene=vm.scenes[vm.selectedIndex];

      UpdateScene(scene).then(function (result) {
        console.log(result);

      });


    }



    vm.availableActionTemplate="app/main/apps/dweller/scenes/templates/button.html";

    vm.selectedIndex = "";

    vm.buttonClick=function(deviceInScene,action){

      var widget=action.widget;
      var commands=[];

      if(widget.text.indexOf("ON")>-1 || widget.text.indexOf("SAVE")>-1){
        if(deviceInScene.targetState.indexOf("ON")>-1){
          //return;
          deviceInScene.commands=[];
        }



        for(var i in action.commands){
          if(action.commands[i].widgetState=='ON'){
            commands.push(action.commands[i]);
          }
          var widgetState=action.commands[i].widgetState;

          if(widgetState.indexOf(":")>0){
            for(var j in deviceInScene.actions){

              if(deviceInScene.actions[j].description.indexOf(widgetState.substring(0,widgetState.indexOf(":")).toLowerCase())>=0){
                action.commands[i].widgetState=widgetState.substring(0,widgetState.indexOf(":")+1);

                if(deviceInScene.actions[j].widget.type=="TouchSpin"){
                  action.widget.text="SAVE";
                  action.commands[i].widgetState+=deviceInScene.actions[j].widget.initVal+deviceInScene.actions[j].widget.postfix;
                }

                break;
              }
            }
            action.commands[i].widgetState+="";
            commands.push(action.commands[i]);
          }
        }
        for(var i in  deviceInScene.commands){
          if(deviceInScene.commands[i].widgetState=='OFF'){
            deviceInScene.commands.splice(i,1);
            i--;
          }
        }
      }else if(widget.text.indexOf("OFF")>-1){
        if(deviceInScene.targetState.indexOf("OFF")>-1){
          return;
        }

        for(var ac in deviceInScene.actions) {

          if (deviceInScene.actions[ac].widget.text == "SAVE") {
            deviceInScene.actions[ac].widget.text="TURN ON";
            break;
          }
        }
        for(var i in action.commands){
          if(action.commands[i].widgetState=='OFF'){
            commands.push(action.commands[i]);
          }
        }

        deviceInScene.commands=[];

        /*for(var i in  deviceInScene.commands){
          if(deviceInScene.commands[i].widgetState=='ON'){
            deviceInScene.commands.splice(i,1);
            i--;
          }
        }*/

      }
      for(var i in commands){
        var command=commands[i];
        deviceInScene.commands.push(command);
      }

      var state="???(not set yet)";
      for(var m in deviceInScene.commands){
        var command=deviceInScene.commands[m];
        if(m==0){
          state=command.widgetState;
        }else{
          state+="<br> "+command.widgetState;
        }

      }

      deviceInScene.targetState=state;

      var scene=vm.scenes[vm.selectedIndex];

      UpdateScene(scene).then(function (result) {
        console.log(result);

      });
    }

    vm.switchChange=function (switchState,deviceInScene,action) {

      var command={};
      var imageName="";

      if(switchState){
        imageName="Light_on";
        for(var i in action.commands){
          if(action.commands[i].widgetState=='ON'){
            command=action.commands[i];
          }
        }
        for(var i in  deviceInScene.commands){
          if(deviceInScene.commands[i].widgetState=='OFF'){
            deviceInScene.commands.splice(i,1);
            i--;
          }
        }
      }else{
        imageName="Light_off";
        for(var i in action.commands){
          if(action.commands[i].widgetState=='OFF'){
            command=action.commands[i];
          }
        }

        for(var i in  deviceInScene.commands){
          if(deviceInScene.commands[i].widgetState=='ON'){
            deviceInScene.commands.splice(i,1);
            i--;
          }
        }
      }

      deviceInScene.commands.push(command);
      var state="???(not set yet)";
      for(var m in deviceInScene.commands){
        var command=deviceInScene.commands[m];
        if(m==0){
          state=command.widgetState;
        }else{
          state+="<br> "+command.widgetState;
        }

      }

      deviceInScene.targetState=state;

      var image='assets/images/energy-flows/'+imageName+".png";
      deviceInScene.image=image;


      var scene=vm.scenes[vm.selectedIndex];

      /*UpdateScene(scene).then(function (result) {
        console.log(result);

      });*/
    }

    vm.touchSpinChange=function (deviceInScene) {

      for(var act in deviceInScene.actions){
        var action=deviceInScene.actions[act];
        if(action.description.indexOf("Set temperature")>=0){
          var widget=action.widget;

          if(deviceInScene.targetState.toLowerCase()!=='off'){
            deviceInScene.targetState="ON<br> Temperature: "+widget.initVal+"&deg;C";
          }
          break;
        }
      }

      var numb = deviceInScene.targetState.match(/\d/g);
      if(numb!=null) {
        numb = numb.join("");
      }

      for(var i in deviceInScene.commands){
        var command=deviceInScene.commands[i];
        if(command.widgetState.indexOf('Temperature')>=0){
          command.widgetState="Temperature: "+numb+"&deg;C";
          break;
        }
      }

      /*var scene=vm.scenes[vm.selectedIndex];

      UpdateScene(scene).then(function (result) {
        console.log(result);

      });*/

    }
    vm.removeScene=function (ev,scene) {
      var confirm = $mdDialog.confirm()
        .title('Confirmation')
        .textContent('Do you really want to remove this scene?')
        .ariaLabel('Lucky day')
        .targetEvent(ev)
        .ok('Yes')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function() {
        RemoveScene(user.username,scene.name).then(function (result) {
          var index=vm.scenes.indexOf(scene);
          vm.scenes.splice(index,1);
        });
      }, function() {

      });

    }

    vm.removeDeviceFromScene=function (ev,scene,deviceInScene) {


      var confirm = $mdDialog.confirm()
        .title('Confirmation')
        .textContent('Do you really want to remove '+deviceInScene.deviceId+' from the scene?')
        .ariaLabel('Lucky day')
        .targetEvent(ev)
        .ok('Yes')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function() {
        var index=scene.devicesInScene.indexOf(deviceInScene);
        scene.devicesInScene.splice(index,1);
        UpdateScene(scene).then(function (result) {
          console.log(result);

        });
      }, function() {

      });
    }

    vm.addScene=function (ev) {
      var confirm = $mdDialog.prompt()
        .title('Please input a scene name.')
       // .textContent('Please input a scene name.')
       // .placeholder('Dog name')
        .ariaLabel('Dog name')
       // .initialValue('Buddy')
        .targetEvent(ev)
        .ok('Save')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function(result) {

        var sceneName=result;
        var scene={name:sceneName,owner:user.username,image:"",devicesInScene:[]};
        AddScene(scene).then(function (result) {
          vm.scenes.push(scene);

        });
      }, function() {

      });

    }

    vm.sliderChange=function (deviceInScene,action) {

      var sliderValue=action.widget.initVal;
      var state="";
      if(sliderValue=='0'){
        state='Open: '+"100%";
      }else{
        state='Closed: '+sliderValue+"%";
      }
      deviceInScene.targetState=state;
      var imageName="Blind_"+sliderValue;
      var image='assets/images/energy-flows/'+imageName+".png";
      deviceInScene.image=image;
      deviceInScene.commands=action.commands;

      deviceInScene.commands[0].widgetState=state;
      deviceInScene.commands[0].commandString="";


      var scene=vm.scenes[vm.selectedIndex];

     /* UpdateScene(scene).then(function (result) {
        console.log(result);

      });*/

     /* UpdateBlindInitVal(deviceInScene.deviceId,sliderValue).then(function (result) {
        console.log(result);

      });*/
    }

    function GetDweller(name) {
      return $http.get('http://localhost:8087/bos/api/users/dweller/'+name).then(handleSuccess, handleError('Error getting the dweller'));
    }
    function GetScenesForDweller(dwellerName) {
      return $http.get('http://localhost:8087/bos/api/scenes/'+dwellerName).then(handleSuccess, handleError('Error getting all scenes'));
    }
    function AddScene(scene) {
      return $http.post('http://localhost:8087/bos/api/scenes/',scene).then(handleSuccess, handleError('Error adding scene'));
    }
    function UpdateScene(scene) {
      return $http.put('http://localhost:8087/bos/api/scenes/',scene).then(handleSuccess, handleError('Error updating scene'));
    }
    function RemoveScene(dwellerName,sceneName) {
      return $http.delete('http://localhost:8087/bos/api/scenes/'+dwellerName+"/"+sceneName).then(handleSuccess, handleError('Error removing the scene'));
    }
    function UpdateBlindInitVal(blindName,initVal) {
      return $http.put('http://localhost:8087/bos/api/dummyDevices/blinds/'+blindName+"/"+initVal).then(handleSuccess, handleError('Error updating blind initVal'));
    }
    function UpdateAirConditionerTemp(value) {
      return $http.put('http://localhost:8087/bos/api/airConditionerTemp/'+value).then(handleSuccess, handleError('Error updating air conditioner temp'));
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
