/**
 * Created by pg9501 on 06.07.2017.
 */
(function ()
{
  'use strict';

  angular
    .module('app.dweller.scenes')
    .controller('addDeviceController', addDeviceController)
    .directive('addDeviceToScene', addDeviceToSceneDirective);

  /** @ngInject */
  function addDeviceController($scope, $timeout,$http,$cookies)
  {
    var vm = this;
    vm.devices=$scope.devices;
    vm.scene=$scope.scene;
    vm.devicesInScene=vm.scene.devicesInScene;
    vm.locationDevices=[];
    vm.floors=[];
    vm.roomsInFloor=[];
    vm.devicesInRoom=[];
    vm.selectedFloor='';
    vm.selectedRoom='';
    vm.selectedDevices='';
    vm.user=$cookies.getObject('globals').currentUser;

    // Methods
    vm.addNewDevices = addNewDevices;

    /////
    
    var index=vm.user.username.indexOf("_");
    var adminName='admin';
    if(index>=0){
      var postfix=vm.dweller.name.substring(index);
      adminName+=postfix;
    }
    GetFloors(adminName).then(function (result) {

      if (result != null) {
        var floors=result;
        for (var i in result) {
          var floor = result[i];
          for(var j in floor.rooms){
            var room=floor.rooms[j];
            var accessibleDevices=[];
            for(var k in room.devices){
              var deviceID=room.devices[k];
              for(var dev in vm.devices){
                if(vm.devices[dev].deviceId===deviceID){
                  accessibleDevices.push({id:deviceID,image:vm.devices[dev].image});
                  break;
                }
              }

            }
            room.devices=accessibleDevices;
          }
        }

        for(var i in floors){
          var floor=floors[i];
          var num=0;
          for(var j in floor.rooms){
            num+=floor.rooms[j].devices.length;
          }
          if(num>0){
            vm.floors.push(floor);
          }
        }

      }
    });


    /*GetAllLocations().then(function (result) {
      if(result!=null){
        var locations=result.locations;

        for(var i in locations){

          var location=locations[i];
          var devicesInLocation=[];
          for(var j in vm.devices){
            if(vm.devices[j].location==location){
              devicesInLocation.push(vm.devices[j]);
            }
          }
          if(devicesInLocation.length>0){
            vm.locationDevices.push({location:location,devices:devicesInLocation});
          }

        }
      }
      //console.log(vm.locationDevices);
    });*/

    vm.changeFloor=function () {
      for(var i in vm.floors){
        if(vm.floors[i].name===vm.selectedFloor){
          vm.roomsInFloor=vm.floors[i].rooms;
          break;
        }
      }
    };

    vm.changeRoom=function () {
      for(var i in vm.roomsInFloor){
        if(vm.roomsInFloor[i].name===vm.selectedRoom){
          vm.devicesInRoom=vm.roomsInFloor[i].devices;
          break;
        }
      }
    }

    vm.checkDisabled=function(deviceId){

      for(var i in vm.devicesInScene){
        if(vm.devicesInScene[i].deviceId==deviceId){
          return true;
        }
      }
      return false;

    }

    /**
     * Add New Device
     */
    function addNewDevices()
    {
      if ( vm.selectedDevices .length==0 )
      {
        return;
      }

      for(var i in vm.selectedDevices){
        var deviceId=vm.selectedDevices[i];
        for(var j in vm.devices){
          var device=vm.devices[j];
          if(device.deviceId==deviceId){
            device.targetState="???(not specify yet)";
            device.commands=[];
            console.log("device is ");
            console.log(device);
            vm.devicesInScene.push(device);
            break;
          }
        }
      }

     // console.log(vm.scene);

      UpdateScene(vm.scene).then(function (result) {
        console.log(result);

      });

      $timeout(function ()
      {
        $scope.scrollListContentBottom();
      });

      vm.selectedDevices = [];
      $scope.toggleForm();
    }

    function GetAllLocations() {
      return $http.get('http://localhost:8087/bos/api/locations/').then(handleSuccess, handleError('Error getting all locations'));
    }
    function GetFloors(admin) {
      return $http.get('http://localhost:8087/bos/api/floors/'+admin).then(handleSuccess, handleError('Error getting all locations'));
    }
    function UpdateScene(scene) {
      return $http.put('http://localhost:8087/bos/api/scenes/',scene).then(handleSuccess, handleError('Error updating scene'));
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

  /** @ngInject */
  function addDeviceToSceneDirective($document, $window, $timeout)
  {
    return {
      restrict   : 'E',
      controller : 'addDeviceController as vm',
      templateUrl: 'app/main/apps/dweller/scenes/directives/add-device-to-scene/add-device-to-scene.html',
      scope      : {
        devices: '=',
        scene:'='
      },
      link       : function (scope, iElement)
      {
        scope.formActive = false;
        scope.toggleForm = toggleForm;
        scope.scrollListContentBottom = scrollListContentBottom;

        var buttonEl = iElement.find('.ms-sb-add-card-button'),
          formEl = iElement.find('.ms-sb-add-card-form'),
          listCards = iElement.parent().prev().find('.list-cards');

        /**
         * Click Event
         */
        buttonEl.on('click', toggleForm);

        /**
         * Toggle Form
         */
        function toggleForm()
        {
          scope.$evalAsync(function ()
          {
            scope.formActive = !scope.formActive;

            if ( scope.formActive )
            {
              $timeout(function ()
              {
                formEl.find('input').focus();

                scrollListContentBottom();
              });

              $document.on('click', outSideClick);
            }
            else
            {
             // PerfectScrollbar.update(listCards[0]);
              $document.off('click', outSideClick);
            }

            $timeout(function ()
            {
              // IE list-content max-height hack
              if ( angular.element('html').hasClass('explorer') )
              {
                angular.element($window).trigger('resize');
              }
            });

          });
        }

        /**
         * Scroll List to the Bottom
         */
        function scrollListContentBottom()
        {
          //listCards[0].scrollTop = listCards[0].scrollHeight;
        }

        /**
         * Click Outside Event Handler
         * @param event
         */
        var outSideClick = function (event)
        {
          var isChild = formEl.has(event.target).length > 0;
          var isSelf = formEl[0] === event.target;
          var isInside = isChild || isSelf;

          if ( !isInside )
          {
            toggleForm();
          }
        };
      }
    };
  }
})();
