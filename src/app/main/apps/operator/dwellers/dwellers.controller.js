/**
 * Created by pg9501 on 29.09.2016.
 */
(function () {
  'use strict';

  angular
    .module('app.operator.dwellers')
    .controller('OperatorDwellersController', OperatorDwellersController);

  /** @ngInject */
  function OperatorDwellersController($rootScope, $translate, $scope,$cookies, $mdDialog,$http,msNavigationService,WAMPService) {

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
          return false;
        }

      });
      msNavigationService.saveItem('optimization_goals', {
        title : 'OPTIMIZATION',
        group : true,
        weight: 2,
        hidden: function () {
          return false;
        }
      });
      msNavigationService.saveItem('history', {
        title : 'HISTORY',
        group : true,
        weight: 3,
        hidden: function () {
          return false;
        }
      });
      msNavigationService.saveItem('community', {
        title : 'COMMUNITY',
        group : true,
        weight: 4,
        hidden: function () {
          return false;
        }
      });
      msNavigationService.saveItem('utility-company', {
        title : 'UTILITY COMPANY',
        group : true,
        weight: 5,
        hidden: function () {
          return false;
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

    //var permission={devices:["Dishwasher","Washing Machine"],operations:["VIEW_DEVICE_GENERAL_INFORMATION","VIEW_DEVICE_CHANNEL_INFORMATION"]};
    var permission={devices:[],operations:[]};
    var vm=this;
    vm.newDweller={name:"",phone:"",email:"",note:"",role:"DWELLER",permissions:[permission]};
    vm.selectedStep_addDweller=0;
    vm.selectedStep_updateDweller=0;
    vm.devices=[];
    vm.locations=[];
    vm.operations=["VIEW_DEVICE_GENERAL_INFORMATION","VIEW_DEVICE_CHANNEL_INFORMATION","CONTROL_DEVICE","SET_DOF"];
    vm.wampSession=WAMPService.getWAMPsession();
    vm.selectedDweller="";
    vm.dwellers=[];
    vm.isEdit=false;
    vm.selectedDevices=[];

    vm.floors=[];
    vm.rooms=[];

    vm.currentLanuage="en";
    vm.user=$cookies.getObject('globals').currentUser;

    /*var check = function(){
      vm.wampSession=WAMPService.getWAMPsession();
      if (typeof vm.wampSession != 'undefined') {
        GetAllLocations().then(function (result) {

          if(result.locations!= null){
            for(var i in result.locations){
              var locationName=result.locations[i];
              vm.locations.push({name:locationName,devices:[],selectedDevices:[]});
            }

            vm.wampSession.call('eshl.get_all_devices',[vm.currentLanuage]).then(
              // RPC success callback
              function (devices) {

                for(var i in devices){
                  var device=devices[i];
                  var location='';
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
                      location=infoValue;
                    }
                  }
                  vm.devices.push({id:id,name:name, image:image,location:location,generalInfoList:generalInfoList});
                }

                for(var i in vm.locations) {
                  var locationName = vm.locations[i].name;
                  var count = 0;
                  for (var j in vm.devices) {
                    if(vm.devices[j].location==locationName){
                      vm.locations[i].devices.push(vm.devices[j]);
                    }
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
    }*/

    var check = function(){
      vm.wampSession=WAMPService.getWAMPsession();
      if (typeof vm.wampSession != 'undefined') {
        var index=vm.user.username.indexOf("_");
        var adminName='admin';
        if(index>=0){
          var postfix=vm.user.username.substring(index);
          adminName+=postfix;
        }
       // console.log("oper is "+vm.user);
        //console.log("admin is "+adminName);
        adminName="admin";
        GetFloors(adminName).then(function (result) {

          if(result!= null){
            vm.floors=result;
            for(var i in vm.floors){
              var floor=result[i];
              for(var j in floor.rooms){
                var room=floor.rooms[j];
                room.selectedDevices=[];
              }
            }

            vm.wampSession.call('eshl.get_all_devices',[vm.currentLanuage]).then(
              // RPC success callback
              function (devices) {

                var localDevicesStorage = window.localStorage.getItem('stage-storage-local-devices');
                var localDevices=[];
                if (localDevicesStorage === null || localDevicesStorage.length === 0)
                {
                  localDevices=[
                    {"deviceName":"Coffee System_2","uid":"Coffee System_2","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":""}],"deviceImage":"CoffeeSystem"},
                    {"deviceName":"Air Conditioner_2","uid":"Air Conditioner_2","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":""}],"deviceImage":"AirConditioner"},
                    {"deviceName":"Light_2","uid":"Light_2","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":""}],"deviceImage":"Light_off"},
                  ];

                }else{
                  localDevices =JSON.parse(window.localStorage['stage-storage-local-devices']);
                }
                for(var i in localDevices){
                  devices.push(localDevices[i]);
                }

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
                      location=infoValue;
                      floor=location.substring(0,location.indexOf(":"));
                      room=location.substring(location.indexOf(":")+1).trim();
                    }
                  }
                  vm.devices.push({id:id,name:name, image:image,location:location,floor:floor,room:room,generalInfoList:generalInfoList});
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
    check();


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

    });



    GetAllDwellers().then(function (result) {

      if(result!=null){
        vm.dwellers=result;
      }

    });

    vm.editDweller=function (name) {
      vm.isEdit=true;
    };
    vm.changeDweller=function () {
      vm.newDweller=vm.getDwellerObjByName(vm.selectedDweller);
    }
    vm.removeDweller=function (event,name) {
      var confirm = $mdDialog.confirm()
        .title('Confirmation')
        .textContent('Would you like to remove this dweller?')
        .ariaLabel('Lucky day')
        .targetEvent(event)
        .ok('Remove')
        .cancel('Cancel');

      var isSuccessful=true;
      $mdDialog.show(confirm).then(function() {

        RemoveDweller(vm.selectedDweller).then(function (result) {
          if(result=='false'){
            isSuccessful=false;
          }
          var alert;
          if(isSuccessful){
            alert = $mdDialog.alert({
              title: 'Attention',
              textContent: 'The dweller has been removed successfully!',
              ok: 'Close'
            });

            for(var i in vm.dwellers){
              if(vm.selectedDweller==vm.dwellers[i].name){
                vm.dwellers.splice(i,1);
                break;
              }
            }
            vm.isEdit=false;

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


        });


      }, function() {

      });
    }
    vm.getDwellerObjByName=function (name) {

      for(var i in vm.dwellers){
        if(vm.dwellers[i].name==name){
          return vm.dwellers[i];
        }
      }
      return null;
    }

    vm.addPermission=function(dweller){
      var newPermission={devices:[],operations:[]};
      dweller.permissions.push(newPermission);
    }

    vm.deletePermission=function (dweller,permission) {
      var idx = dweller.permissions.indexOf(permission);
      dweller.permissions.splice(idx, 1);
    }
    vm.convertArrToStr=function (arr) {
      var str="";
      for(var i in arr){
        if(i<arr.length-1){
          str+=arr[i]+", ";
        }else {
          str+=arr[i];
        }

      }
      return str;
    }

    vm.showOperations=function (event,permission) {
      $mdDialog.show({
          controller: OperationDialogController,
          locals:{permission:permission,selectedOperations:permission.operations},
          templateUrl: 'app/main/apps/operator/dwellers/operations.html',
          parent: angular.element(document.body),
          targetEvent: event,
          clickOutsideToClose:true
        })
        .then(function(answer) {
          $scope.status = 'You said the information was "' + answer + '".';
        }, function() {
          $scope.status = 'You cancelled the dialog.';
        });
    };
    function OperationDialogController($scope, $mdDialog,permission,selectedOperations) {
      $scope.active = true;
      $scope.operations=vm.operations;
      //$scope.selectedOperations=selectedOperations;
      $scope.toggle = function (item) {
        if($scope.checkDisabled(item)){
          return;
        }
        switch (item){
          case "VIEW_DEVICE_GENERAL_INFORMATION":
            var idx = selectedOperations.indexOf(item);
            if (idx > -1) {
              selectedOperations.splice(idx, 1);
            }
            else {
              selectedOperations.push(item);
            }
            break;
          case "VIEW_DEVICE_CHANNEL_INFORMATION":
            var idx = selectedOperations.indexOf(item);
            if (idx > -1) {
              selectedOperations.splice(idx, 1);
              var idx1=selectedOperations.indexOf("VIEW_DEVICE_GENERAL_INFORMATION");
              selectedOperations.splice(idx1, 1);
            }
            else {
              selectedOperations.push(item);
              var idx1=selectedOperations.indexOf("VIEW_DEVICE_GENERAL_INFORMATION");
              if(idx1<0){
                selectedOperations.push("VIEW_DEVICE_GENERAL_INFORMATION");
              }

            }
            break;
          case "CONTROL_DEVICE":
            var idx = selectedOperations.indexOf(item);
            if (idx > -1) {
              selectedOperations.splice(idx, 1);
              var idx1=selectedOperations.indexOf("VIEW_DEVICE_GENERAL_INFORMATION");
              selectedOperations.splice(idx1, 1);
              var idx2=selectedOperations.indexOf("VIEW_DEVICE_CHANNEL_INFORMATION");
              selectedOperations.splice(idx2, 1);
            }
            else {
              selectedOperations.push(item);
              var idx1=selectedOperations.indexOf("VIEW_DEVICE_GENERAL_INFORMATION");
              if(idx1<0){
                selectedOperations.push("VIEW_DEVICE_GENERAL_INFORMATION");
              }
              var idx2=selectedOperations.indexOf("VIEW_DEVICE_CHANNEL_INFORMATION");
              if(idx2<0){
                selectedOperations.push("VIEW_DEVICE_CHANNEL_INFORMATION");
              }

            }
            break;
          case "SET_DOF":
            var idx = selectedOperations.indexOf(item);
            if (idx > -1) {
              selectedOperations.splice(idx, 1);
              var idx1=selectedOperations.indexOf("VIEW_DEVICE_GENERAL_INFORMATION");
              selectedOperations.splice(idx1, 1);
              var idx2=selectedOperations.indexOf("VIEW_DEVICE_CHANNEL_INFORMATION");
              selectedOperations.splice(idx2, 1);
              var idx3=selectedOperations.indexOf("CONTROL_DEVICE");
              selectedOperations.splice(idx3, 1);
            }
            else {
              selectedOperations.push(item);
              var idx1=selectedOperations.indexOf("VIEW_DEVICE_GENERAL_INFORMATION");
              if(idx1<0){
                selectedOperations.push("VIEW_DEVICE_GENERAL_INFORMATION");
              }
              var idx2=selectedOperations.indexOf("VIEW_DEVICE_CHANNEL_INFORMATION");
              if(idx2<0){
                selectedOperations.push("VIEW_DEVICE_CHANNEL_INFORMATION");
              }
              var idx3=selectedOperations.indexOf("CONTROL_DEVICE");
              if(idx3<0){
                selectedOperations.push("CONTROL_DEVICE");
              }
            }
            break;
          default:
                break;


        }

       /* var idx = selectedOperations.indexOf(item);
         if (idx > -1) {
         selectedOperations.splice(idx, 1);
         }
         else {
         selectedOperations.push(item);
         }*/

      };
      $scope.checkDisabled=function (operation) {
        switch (operation){
          case "VIEW_DEVICE_GENERAL_INFORMATION":
            var idx=selectedOperations.indexOf("VIEW_DEVICE_CHANNEL_INFORMATION");
            if(idx>-1){
              return true;
            }
            return false;
          case "VIEW_DEVICE_CHANNEL_INFORMATION":
            var idx=selectedOperations.indexOf("CONTROL_DEVICE");
            if(idx>-1){
              return true;
            }
            return false;
          case "CONTROL_DEVICE":
            var idx=selectedOperations.indexOf("SET_DOF");
            if(idx>-1){
              return true;
            }
            return false;
          default:
                return false;
        }
      }

      $scope.exists = function (item) {
        return selectedOperations.indexOf(item) > -1;
      };

      $scope.cancel = function() {
        $mdDialog.cancel();
      };
      $scope.save = function() {

        var operations=[];
        for(var i in selectedOperations){
          operations[i]=selectedOperations[i];
        }
        permission.operations=operations;

        $mdDialog.cancel();




      };
      $scope.toggleAll = function() {
        if ( selectedOperations.length === vm.operations.length) {
          selectedOperations = [];
        } else if (selectedOperations.length === 0 || selectedOperations.length > 0) {
          selectedOperations = vm.operations;
        }
      };
      $scope.isIndeterminate = function() {
        return (selectedOperations.length !== 0 &&
        selectedOperations.length !== vm.operations.length);
      };
      $scope.isChecked = function() {
        return selectedOperations.length === vm.operations.length;
      };

    }

   vm.showDevices=function (event,permission) {

     $mdDialog.show({
         controller: DeviceDialogController,
         locals:{permission:permission},
         templateUrl: 'app/main/apps/operator/dwellers/devices.html',
         parent: angular.element(document.body),
         targetEvent: event,
         clickOutsideToClose:true
       })
       .then(function(answer) {
         $scope.status = 'You said the information was "' + answer + '".';
       }, function() {
         $scope.status = 'You cancelled the dialog.';
       });
   };

    function DeviceDialogController($scope, $mdDialog,permission) {


      $scope.hide = function() {
        $mdDialog.hide();
      };

      $scope.cancel = function() {
        $mdDialog.cancel();
      };

      $scope.toggle = function (item, list) {
        /*console.log("event.currentTarget.attributes['ng-disabled'].value");
        console.log(event.currentTarget.attributes['ng-disabled'].value);
        if(event.currentTarget.attributes['ng-disabled'].value){
          return;
        }*/
        if($scope.checkDisabled(item.id)){
          return;
        }
        var idx = list.indexOf(item);
        if (idx > -1) {
          list.splice(idx, 1);
        }
        else {
          list.push(item);
        }
      };

      $scope.initSelectedDevices=function () {
        /*for(var k in vm.locations){
          vm.locations[k].selectedDevices=[];
        }
        var selectedDevices=[];
        for(var i in permission.devices){
          var deviceID=permission.devices[i];
          for(var j in vm.devices){
            if(deviceID==vm.devices[j].id){
              var selectedDevice=vm.devices[j];
              var locationName=selectedDevice.location;
              for(var k in vm.locations){
                if(locationName==vm.locations[k].name){
                  vm.locations[k].selectedDevices.push(selectedDevice);
                  break;
                }
              }
              break;
            }
          }
        }*/

        for(var i in vm.floors){
          for(var j in vm.floors[i].rooms){
            var room=vm.floors[i].rooms[j];
            room.selectedDevices=[];
          }
        }

        console.log("vm.floors is");
        console.log(vm.floors);

        var selectedDevices=[];
        for(var i in permission.devices) {
          var deviceID = permission.devices[i];
          for (var j in vm.devices) {
            if (deviceID === vm.devices[j].id) {
              var selectedDevice = vm.devices[j];
              var floorName=selectedDevice.floor;
              var roomName=selectedDevice.room;
              for(var k in vm.floors){
                var floor=vm.floors[k];
                for(var m in floor.rooms){
                  var room=floor.rooms[m];
                  if(floor.name===floorName && room.name===roomName){
                    room.selectedDevices.push(selectedDevice.id);
                    break;
                  }
                }
              }
              break;
            }
          }
        }


      };
      $scope.initSelectedDevices();
      $scope.save = function() {
        var selectedDeviceIDs=[];
        for(var i in $scope.rooms){
          var location=$scope.rooms[i];
          for(var j in location.selectedDevices){
            var selectedDevice=location.selectedDevices[j];
            selectedDeviceIDs.push(selectedDevice);
          }
        }
        permission.devices=selectedDeviceIDs;
        $mdDialog.cancel();
      };
      $scope.checkDisabled=function (deviceID) {
        if(vm.newDweller.permissions[0].devices.length==0){
          return false;
        }
        if(permission.devices.indexOf(deviceID)>-1){
          return false;
        }

      /*  console.log("vm.newDweller.permissions");
        console.log(vm.newDweller.permissions);
        console.log("permission is");
        console.log(permission);*/
        var isDisabled=false;
        for(var i in vm.newDweller.permissions){
         // console.log("vm.newDweller.permissions[i].devices");
         //console.log(vm.newDweller.permissions[i].devices);
            if(vm.newDweller.permissions[i].devices.indexOf(deviceID)>-1){

              isDisabled=true;
            }
        }
        return isDisabled;
      };

     // $scope.locations=vm.locations;
      $scope.floors=vm.floors;
      $scope.rooms=[];
      $scope.devices=vm.devices;
      $scope.active = true;

      $scope.changeFloor=function (selectedFloor) {
        for(var i in vm.floors){
          if(vm.floors[i].name===selectedFloor){
            $scope.rooms=vm.floors[i].rooms;
            break;
          }
        }
      };


      $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
      };

      $scope.isIndeterminate = function(location) {
        return (location.selectedDevices.length !== 0 &&
        location.selectedDevices.length !== location.devices.length);
      };

      $scope.isAllLocationsIndeterminate = function() {
        var selectedDeviceNum=0;
        var allDeviceNum=0;
        for(var i in $scope.locations){
          var location=$scope.locations[i];
          allDeviceNum+=location.devices.length;
          selectedDeviceNum+=location.selectedDevices.length;
        }
        return (selectedDeviceNum !== 0 &&
        selectedDeviceNum !== allDeviceNum);
      };

      $scope.isChecked = function(location) {
        return location.selectedDevices.length === location.devices.length;
      };

      $scope.isAllLocationsChecked = function() {
        var selectedDeviceNum=0;
        var allDeviceNum=0;
        /*for(var i in $scope.locations){
          var location=$scope.locations[i];
          allDeviceNum+=location.devices.length;
          selectedDeviceNum+=location.selectedDevices.length;
        }*/
        for(var i in $scope.rooms){
          var location=$scope.rooms[i];
          allDeviceNum+=location.devices.length;
          selectedDeviceNum+=location.selectedDevices.length;
        }
        return selectedDeviceNum === allDeviceNum;
      };

      $scope.toggleAllLocations = function() {
        var selectedDeviceNum=0;
        var allDeviceNum=0;
        for(var k in $scope.floors){
          var floor=$scope.floors[k];
          for(var j in floor.rooms){
            var location=floor.rooms[j];
            allDeviceNum+=location.devices.length;
            selectedDeviceNum+=location.selectedDevices.length;
          }


          if ( selectedDeviceNum === allDeviceNum) {
            for(var i in floor.rooms){
              floor.rooms[i].selectedDevices=[];
            }
          } else if (selectedDeviceNum === 0 || selectedDeviceNum > 0) {

            for(var i in floor.rooms){
              floor.rooms[i].selectedDevices=floor.rooms[i].devices;
            }
          }
        }
      };
      $scope.toggleAll = function(location) {
        if ( location.selectedDevices.length === location.devices.length) {
          location.selectedDevices = [];
        } else if (location.selectedDevices.length === 0 || location.selectedDevices.length > 0) {
          location.selectedDevices = location.devices;
        }
      };

    }

    // Data
    vm.stepper_updateDweller = {
      step1: {completed:false, disabled:false},
      step2: {completed:false, disabled:true},
      step3: {completed:false, disabled:true}
    };

    vm.stepper_addDweller = {
      step1: {completed:false, disabled:false},
      step2: {completed:false, disabled:true},
      step3: {completed:false, disabled:true}
    };


    vm.goToStep2_updateDweller=function () {
      vm.selectedStep_updateDweller=1;
      vm.stepper_updateDweller.step1.completed=true;
      vm.stepper_updateDweller.step2.disabled=false;
    }
    vm.goToStep2_addDweller=function () {
      vm.selectedStep_addDweller=1;
      vm.stepper_addDweller.step1.completed=true;
      vm.stepper_addDweller.step2.disabled=false;
    }

    vm.goToStep3_updateDweller=function () {
      vm.selectedStep_updateDweller=2;
      vm.stepper_updateDweller.step2.completed=true;
      vm.stepper_updateDweller.step3.disabled=false;
    }
    vm.goToStep3_addDweller=function () {
      vm.selectedStep_addDweller=2;
      vm.stepper_addDweller.step2.completed=true;
      vm.stepper_addDweller.step3.disabled=false;
    }

    vm.submit_addDweller=function () {
      var isSuccessful=true;
      AddDweller(vm.newDweller).then(function (result) {
        if(result=='false'){
          isSuccessful=false;
        }
        var alert;
        if(isSuccessful){
          alert = $mdDialog.alert({
            title: 'Attention',
            textContent: 'The dweller has been added successfully!',
            ok: 'Close'
          });
          vm.stepper_addDweller.step3.completed=true;
          permission={devices:[],operations:[]};
          vm.newDweller={name:"",password:"",phone:"",email:"",note:"",role:"DWELLER",permissions:[permission]};
          vm.selectedStep_addDweller=0;
          vm.stepper_addDweller = {
            step1: {completed:false, disabled:false},
            step2: {completed:false, disabled:true},
            step3: {completed:false, disabled:true}
          };
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


      });
    };

    vm.submit_updateDweller=function () {
      var isSuccessful=true;
      vm.getDwellerObjByName(vm.selectedDweller).role="DWELLER";
      UpdateDweller(vm.getDwellerObjByName(vm.selectedDweller)).then(function (result) {
        if(result=='false'){
          isSuccessful=false;
        }
        var alert;
        if(isSuccessful){
          alert = $mdDialog.alert({
            title: 'Attention',
            textContent: 'The dweller has been updated successfully!',
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


      });
    };

    function GetAllLocations() {
      return $http.get('http://localhost:8087/bos/api/locations/').then(handleSuccess, handleError('Error getting all locations'));
    }
    function GetFloors(admin) {
      return $http.get('http://localhost:8087/bos/api/floors/'+admin).then(handleSuccess, handleError('Error getting all locations'));
    }
    function GetAllDwellers() {
      return $http.get('http://localhost:8087/bos/api/users/dweller').then(handleSuccess, handleError('Error getting all dwellers'));
    }
    function AddDweller(dweller) {
      return $http.post('http://localhost:8087/bos/api/users/dweller',dweller).then(handleSuccess, handleError('Error add a dweller'));
    }
    function UpdateDweller(dweller) {
      return $http.put('http://localhost:8087/bos/api/users/dweller',dweller).then(handleSuccess, handleError('Error update dweller'));
    }
    function RemoveDweller(name) {
      return $http.delete('http://localhost:8087/bos/api/users/'+name).then(handleSuccess, handleError('Error remove dweller'));
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
