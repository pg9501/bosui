(function ()
{
    'use strict';

    angular
        .module('app.administrator.locations')
        .controller('msSbAddLocationController', msSbAddLocationController)
        .directive('msSbAddLocation', msSbAddLocationDirective);

    /** @ngInject */
    function msSbAddLocationController($scope, $timeout,$http, msUtils)
    {
        var vm = this;

        vm.newRoomName = '';
        vm.floorId = $scope.msFloorId;
        vm.building = $scope.msBuilding;
        vm.roomsInFloor = vm.building.rooms;

        vm.admin=$scope.msAdminName;
      vm.floor=null;

     // console.log("vm.floorId is "+vm.floorId);



        // Methods
        vm.addNewRoom = addNewRoom;

        /////

        /**
         * Add New Room
         */
        function addNewRoom()
        {
            if ( vm.newRoomName === '' )
            {
                return;
            }
          /*var newRoomId= msUtils.guidGenerator();
          var newRoom={name:vm.newRoomName,devices:[]};

            vm.roomsInFloor.push({
              id               : newRoomId,
              room             : newRoom
            });


          vm.floor.idRooms.push(newRoomId);

          var rooms=[];
          for(var i in vm.floor.idRooms){
            var roomId=vm.floor.idRooms[i];
            var room=null;
            for(var j in vm.roomsInFloor){
              if(vm.roomsInFloor[j].id==roomId){
                room=vm.roomsInFloor[j].room;
                break;
              }
            }
           // var deviceName= vm.devicesInGroup.getById(deviceId).name;
            if(room!=null){
              rooms.push(room);
            }
          }*/
          for(var i in vm.building.floors){
            if(vm.building.floors[i].id==vm.floorId){
              vm.floor=vm.building.floors[i];
              break;
            }
          }
          var newRoom={name:vm.newRoomName,devices:[]};
          vm.floor.rooms.push(newRoom);
          var newFloor={id:vm.floor.id, name:vm.floor.name,admin:vm.admin,rooms:vm.floor.rooms};

         // console.log("newFloor is ");
         // console.log(newFloor);

          UpdateFloor(newFloor).then(function (result) {
            console.log(result);
          });

            $timeout(function ()
            {
                $scope.scrollListContentBottom();
            });

            vm.newRoomName = '';

        }

      function UpdateFloor(floor) {
        return $http.put('http://localhost:8087/bos/api/floors/',floor).then(handleSuccess, handleError('Error adding device groups'));
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
    function msSbAddLocationDirective($document, $window, $timeout)
    {
        return {
            restrict   : 'E',
            controller : 'msSbAddLocationController as vm',
            templateUrl: 'app/main/apps/administrator/locations/directives/ms-sb-add-location/ms-sb-add-location.html',
            scope      : {
                msFloorId: '=',
                msAdminName: '=',
                msBuilding:'='
            },
            link       : function (scope, iElement)
            {
                scope.formActive = false;
                scope.toggleForm = toggleForm;
                scope.scrollListContentBottom = scrollListContentBottom;

                var buttonEl = iElement.find('.ms-sb-add-location-button'),
                    formEl = iElement.find('.ms-sb-add-location-form'),
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
