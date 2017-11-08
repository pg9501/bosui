(function ()
{
    'use strict';

    angular
        .module('app.dweller.device-groups')
        .controller('msSbAddCardController', msSbAddCardController)
        .directive('msSbAddCard', msSbAddCardDirective);

    /** @ngInject */
    function msSbAddCardController($scope, $timeout,$http, msUtils)
    {
        var vm = this;

        vm.newDevice = '';
        vm.groupId = $scope.msGroupId;
        vm.board = $scope.msBoard;
        vm.devicesInGroup = vm.board.devices;
        vm.allDevices=$scope.msAllDevices;
        vm.dwellerName=$scope.msDwellerName;

      for(var i in vm.board.groups){
        if(vm.board.groups[i].id==vm.groupId){
          vm.group=vm.board.groups[i];
          break;
        }
      }

        // Methods
        vm.addNewDevice = addNewDevice;

        /////


      vm.checkDisabled=function(deviceName){


        var deviceID="";
        for(var i in vm.devicesInGroup){
          if(vm.devicesInGroup[i].name==deviceName){
            deviceID=vm.devicesInGroup[i].id;
            break;
          }
        }
        if(deviceID!=""){
          if(vm.group.idDevices.indexOf(deviceID)> -1){
            return true;
          }else{
            return false;
          }
        }
      }

        /**
         * Add New Device
         */
        function addNewDevice()
        {
            if ( vm.newDevice === '' )
            {
                return;
            }
          var newDeviceId="";

          var newDeviceName=vm.newDevice.slice(0,vm.newDevice.indexOf('(')).trim();
          for(var i in vm.devicesInGroup){
            if(vm.devicesInGroup[i].name==newDeviceName){
              newDeviceId=vm.devicesInGroup[i].id;

              break;
            }
          }


          if(newDeviceId===""){
            newDeviceId = msUtils.guidGenerator();
            var location="";
            var state="";
            var power="";
            var image="";

            for(var i in vm.allDevices){
              if(vm.allDevices[i].name==newDeviceName){
                location=vm.allDevices[i].location;
                state=vm.allDevices[i].state;
                power=vm.allDevices[i].power;
                image=vm.allDevices[i].image;
                break;
              }
            }


            vm.devicesInGroup.push({
              id               : newDeviceId,
              name             : newDeviceName,
              image            : image,
              location      : location,
              state: state,
              power       : power
            });
          }


          vm.group.idDevices.push(newDeviceId);

          var devices=[];
          for(var i in vm.group.idDevices){
            var deviceId=vm.group.idDevices[i];
            var deviceName="";
            for(var j in vm.devicesInGroup){
              if(vm.devicesInGroup[j].id==deviceId){
                deviceName=vm.devicesInGroup[j].name;
                break;
              }
            }
           // var deviceName= vm.devicesInGroup.getById(deviceId).name;
            if(deviceName!=null){
              devices.push(deviceName);
            }
          }
          var deviceGroup={groupName:vm.group.name,dwellerName:vm.dwellerName,devices:devices};

          UpdateDeviceGroup(deviceGroup).then(function (result) {
            console.log(result);
          });

            $timeout(function ()
            {
                $scope.scrollListContentBottom();
            });

            vm.newDevice = '';

        }

      function UpdateDeviceGroup(deviceGroup) {
        return $http.put('http://localhost:8087/bos/api/deviceGroups/',deviceGroup).then(handleSuccess, handleError('Error adding device groups'));
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
    function msSbAddCardDirective($document, $window, $timeout)
    {
        return {
            restrict   : 'E',
            controller : 'msSbAddCardController as vm',
            templateUrl: 'app/main/apps/dweller/device-groups/directives/ms-sb-add-card/ms-sb-add-card.html',
            scope      : {
                msGroupId: '=',
                msDwellerName: '=',
                msBoard:'=',
                msAllDevices:'='
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
                            PerfectScrollbar.update(listCards[0]);
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
                    listCards[0].scrollTop = listCards[0].scrollHeight;
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
