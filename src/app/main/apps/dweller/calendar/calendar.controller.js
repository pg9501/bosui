(function ()
{
    'use strict';

    angular
        .module('app.dweller.calendar')
        .controller('CalendarController', CalendarController);

    /** @ngInject */
    function CalendarController($mdDialog, $document,$http,$rootScope,$scope,$cookies,$translate,msNavigationService,msUtils,deviceService)
    {
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
      vm.events = [[]];

      vm.user=$cookies.getObject('globals').currentUser;

      vm.currentLanuage="en";


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
        for(var i in vm.events[0]){
          var event=vm.events[0][i];

          if(event.title!=null){
            if(vm.currentLanuage=='en'){
              event.title=event.title.replace(/Standort/g,"Location");
              event.title=event.title.replace(/地点/g,"Location");
              event.title=event.title.replace(/Temperatur/g,"Temperature");
              event.title=event.title.replace(/温度/g,"Temperature");
              event.title=event.title.replace(/Feuchtigkeit/g,"Humidity");
              event.title=event.title.replace(/湿度/g,"Humidity");
              event.title=event.title.replace(/Geräte/g,"Devices");
              event.title=event.title.replace(/设备/g,"Devices");
              event.title=event.title.replace(/Zustand/g,"State");
              event.title=event.title.replace(/状态/g,"State");

            }else if(vm.currentLanuage=='de'){
              event.title=event.title.replace(/Location/g,"Standort");
              event.title=event.title.replace(/地点/g,"Standort");
              event.title=event.title.replace(/Temperature/g,"Temperatur");
              event.title=event.title.replace(/温度/g,"Temperatur");
              event.title=event.title.replace(/Humidity/g,"Feuchtigkeit");
              event.title=event.title.replace(/湿度/g,"Feuchtigkeit");
              event.title=event.title.replace(/Devices/g,"Geräte");
              event.title=event.title.replace(/设备/g,"Geräte");
              event.title=event.title.replace(/State/g,"Zustand");
              event.title=event.title.replace(/状态/g,"Zustand");
            }else{
              event.title=event.title.replace(/Location/g,"地点");
              event.title=event.title.replace(/Standort/g,"地点");
              event.title=event.title.replace(/Temperature/g,"温度");
              event.title=event.title.replace(/Temperatur/g,"温度");
              event.title=event.title.replace(/Humidity/g,"湿度");
              event.title=event.title.replace(/Feuchtigkeit/g,"湿度");
              event.title=event.title.replace(/Devices/g,"设备");
              event.title=event.title.replace(/Geräte/g,"设备");
              event.title=event.title.replace(/State/g,"状态");
              event.title=event.title.replace(/Zustand/g,"状态");
            }
          }

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

        // Data
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();

      getAllCalendarItems(vm.user.username) .then(function (result) {
        console.log(result);
        if($translate.use().substring(0,1)=='c'){
          vm.currentLanuage="ch";
        }
        if($translate.use().substring(0,1)=='e'){
          vm.currentLanuage="en";
        }
        if($translate.use().substring(0,1)=='d'){
          vm.currentLanuage="de";
        }
        if(result!=null){
          for(var i in result){
            var event= JSON.parse(result[i].calendarEvent);
            if(event.title!=null){
              if(vm.currentLanuage=='en'){
                event.title=event.title.replace(/Standort/g,"Location");
                event.title=event.title.replace(/地点/g,"Location");
                event.title=event.title.replace(/Temperatur/g,"Temperature");
                event.title=event.title.replace(/温度/g,"Temperature");
                event.title=event.title.replace(/Feuchtigkeit/g,"Humidity");
                event.title=event.title.replace(/湿度/g,"Humidity");
                event.title=event.title.replace(/Geräte/g,"Devices");
                event.title=event.title.replace(/设备/g,"Devices");
                event.title=event.title.replace(/Zustand/g,"State");
                event.title=event.title.replace(/状态/g,"State");

              }else if(vm.currentLanuage=='de'){
                event.title=event.title.replace(/Location/g,"Standort");
                event.title=event.title.replace(/地点/g,"Standort");
                event.title=event.title.replace(/Temperature/g,"Temperatur");
                event.title=event.title.replace(/温度/g,"Temperatur");
                event.title=event.title.replace(/Humidity/g,"Feuchtigkeit");
                event.title=event.title.replace(/湿度/g,"Feuchtigkeit");
                event.title=event.title.replace(/Devices/g,"Geräte");
                event.title=event.title.replace(/设备/g,"Geräte");
                event.title=event.title.replace(/State/g,"Zustand");
                event.title=event.title.replace(/状态/g,"Zustand");
               
              }else{
                event.title=event.title.replace(/Location/g,"地点");
                event.title=event.title.replace(/Standort/g,"地点");
                event.title=event.title.replace(/Temperature/g,"温度");
                event.title=event.title.replace(/Temperatur/g,"温度");
                event.title=event.title.replace(/Humidity/g,"湿度");
                event.title=event.title.replace(/Feuchtigkeit/g,"湿度");
                event.title=event.title.replace(/Devices/g,"设备");
                event.title=event.title.replace(/Geräte/g,"设备");
                event.title=event.title.replace(/State/g,"状态");
                event.title=event.title.replace(/Zustand/g,"状态");
              }
            }


            vm.events[0].push(event);
          }



        }
      });

        /*vm.events = [
            [
                {
                    id   : 1,
                    title: 'All Day Event',
                    start: new Date(y, m, 1),
                    end  : new Date(y, m, 1)
                },
                {
                    id   : 2,
                    title: 'Long Event',
                    start: new Date(y, m, d - 5),
                    end  : new Date(y, m, d - 2)
                },
                {
                    id   : 3,
                    title: 'Some Event',
                    start: new Date(y, m, d - 3, 16, 0),
                    end  : null
                },
                {
                    id   : 4,
                    title: 'Repeating Event',
                    start: new Date(y, m, d + 4, 16, 0),
                    end  : null
                },
                {
                    id   : 5,
                    title: 'Birthday Party',
                    start: new Date(y, m, d + 1, 19, 30),
                    end  : new Date(y, m, d + 1, 22, 30)
                },
                {
                    id   : 6,
                    title: 'All Day Event',
                    start: new Date(y, m, d + 8, 16, 0),
                    end  : null
                },
                {
                    id   : 7,
                    title: 'Long Event',
                    start: new Date(y, m, d + 12, 16, 0),
                    end  : null
                },
                {
                    id   : 8,
                    title: 'Repeating Event',
                    start: new Date(y, m, d + 14, 2, 0),
                    end  : null
                },
                {
                    id   : 14,
                    title: 'Conference',
                    start: new Date(y, m, d + 17, 4, 0),
                    end  : null
                },
                {
                    id   : 15,
                    title: 'Meeting',
                    start: new Date(y, m, d + 22, 4, 0),
                    end  : new Date(y, m, d + 24, 4, 0)
                }
            ]
        ];*/

        vm.calendarUiConfig = {
            calendar: {
              height: 1000,
                editable          : true,
                eventLimit        : true,
                header            : '',
                handleWindowResize: false,
                aspectRatio       : 1,
                dayNames          : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                dayNamesShort     : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                viewRender        : function (view)
                {
                    vm.calendarView = view;
                    vm.calendar = vm.calendarView.calendar;
                    vm.currentMonthShort = vm.calendar.getDate().format('MMM');
                },
                columnFormat      : {
                    month: 'ddd',
                    week : 'ddd D',
                    day  : 'ddd M'
                },
                eventClick        : eventDetail,
                selectable        : true,
                selectHelper      : true,
                select            : select
            }
        };

        // Methods
        vm.addEvent = addEvent;
        vm.next = next;
        vm.prev = prev;

        //////////

        /**
         * Go to next on current view (week, month etc.)
         */
        function next()
        {
            vm.calendarView.calendar.next();
        }

        /**
         * Go to previous on current view (week, month etc.)
         */
        function prev()
        {
            vm.calendarView.calendar.prev();
        }

        /**
         * Show event detail
         *
         * @param calendarEvent
         * @param e
         */
        function eventDetail(calendarEvent, e)
        {
            showEventDetailDialog(calendarEvent, e);
        }

        /**
         * Add new event in between selected dates
         *
         * @param start
         * @param end
         * @param e
         */
        function select(start, end,e)
        {
         // var start = new Date(),
         //   end = new Date();
         // console.log("time1 "+start);
            showEventFormDialog('add', false, start, end, e);
        }

        /**
         * Add event
         *
         * @param e
         */
        function addEvent(e)
        {
            var startDate = new Date(),
                endDate = new Date();
          endDate.setDate(startDate.getDate()+1);

            showEventFormDialog('add', false, startDate, endDate, e);
        }

        /**
         * Show event detail dialog
         * @param calendarEvent
         * @param e
         */
        function showEventDetailDialog(calendarEvent, e)
        {
            $mdDialog.show({
                controller         : 'EventDetailDialogController',
                controllerAs       : 'vm',
                templateUrl        : 'app/main/apps/dweller/calendar/dialogs/event-detail/event-detail-dialog.html',
                parent             : angular.element($document.body),
                targetEvent        : e,
                clickOutsideToClose: true,
                locals             : {
                    calendarEvent      : calendarEvent,
                    showEventFormDialog: showEventFormDialog,
                    event              : e
                }
            });
        }

        /**
         * Show event add/edit form dialog
         *
         * @param type
         * @param calendarEvent
         * @param start
         * @param end
         * @param e
         */
        function showEventFormDialog(type, calendarEvent, start, end, e)
        {
            var dialogData = {
                type         : type,
                calendarEvent: calendarEvent,
                startDate        : start,
                endDate          : end
            };

          if ( type === 'edit' ){
            dialogData.calendarEvent=calendarEvent.eventData;
            dialogData.calendarEvent.id=calendarEvent.id;
          }

            $mdDialog.show({
                controller         : 'EventFormDialogController',
                controllerAs       : 'vm',
                templateUrl        : 'app/main/apps/dweller/calendar/dialogs/event-form/event-form-dialog.html',
                parent             : angular.element($document.body),
                targetEvent        : e,
                clickOutsideToClose: true,
                locals             : {
                  deviceService: deviceService,
                    dialogData: dialogData
                }
            }).then(function (response)
            {
              if ( response.type === 'delete' ){
                var id=response.calendarEvent.id;
                for(var i in vm.events[0]){
                  if(vm.events[0][i].id==id){
                    vm.events[0].splice(i,1);
                    break;
                  }
                }
              }else{

                if($translate.use().substring(0,1)=='c'){
                  vm.currentLanuage="ch";
                }
                if($translate.use().substring(0,1)=='e'){
                  vm.currentLanuage="en";
                }
                if($translate.use().substring(0,1)=='d'){
                  vm.currentLanuage="de";
                }

                var yStart=response.calendarEvent.startDate.getFullYear();
                var mStart=response.calendarEvent.startDate.getMonth();
                var dStart=response.calendarEvent.startDate.getDate();
                var hStart=response.calendarEvent.startTime.getHours();
                var minStart=response.calendarEvent.startTime.getMinutes();

                var startDate=new Date(yStart,mStart,dStart,hStart,minStart);

                var yEnd=response.calendarEvent.endDate.getFullYear();
                var mEnd=response.calendarEvent.endDate.getMonth();
                var dEnd=response.calendarEvent.endDate.getDate();
                var hEnd=response.calendarEvent.endTime.getHours();
                var minEnd=response.calendarEvent.endTime.getMinutes();

                var endDate=new Date(yEnd,mEnd,dEnd,hEnd,minEnd);

                var title=response.calendarEvent.title;

                if(title==null){
                  title='';
                  response.calendarEvent.title='';
                }

                if(response.calendarEvent.title!=''){
                  title+=" ( ";
                }
                var location="Location";
                var temperature="Temperature";
                var humidity="Humidity";
                var devices="Devices";
                var stateStr="State";
                if(vm.currentLanuage=='de'){
                  location="Standort";
                  temperature="Temperatur";
                  humidity="Feuchtigkeit";
                  devices="Geräte";
                  stateStr="Zustand";
                }else if(vm.currentLanuage=='ch'){
                  location="地点";
                  temperature="温度";
                  humidity="湿度";
                  devices="设备";
                  stateStr="状态";
                }
                if(response.calendarEvent.locationStart.name!=""){
                  title+=location+": "+response.calendarEvent.locationStart.name;
                  if(!response.calendarEvent.locationStart.isTempDisabled){
                    title+=", "+temperature+": "+response.calendarEvent.locationStart.temperature;
                  }
                  if(!response.calendarEvent.locationStart.isHumidityDisabled){
                    title+=", "+humidity+": "+response.calendarEvent.locationStart.humidity;
                  }
                  title+=", ";
                }

                for(var i in response.calendarEvent.deviceGroupsStart){
                  var deviceGroup=response.calendarEvent.deviceGroupsStart[i];
                  var deviceNames=deviceGroup.deviceNames.toString();
                  if(deviceNames=='' || deviceNames==null){
                    continue;
                  }
                  var state=deviceGroup.targetState;

                  title+=devices+" [ "+deviceNames+" ]: "+stateStr+" [ "+state+" ] ";
                  if(i<response.calendarEvent.deviceGroupsStart.length-1){
                    title+=", ";
                  }

                }
                if(response.calendarEvent.title!='') {
                  title += " )";
                }

                if(title.indexOf('(  )')>=0){
                  title=title.substring(0,title.indexOf('(  )'));
                }

                if ( response.type === 'add' )
                {
                  var id=msUtils.guidGenerator();



                  // Add new
                  var event={
                    id   : id,
                    title: title,
                    start: startDate,
                    end  : endDate,
                    eventData:response.calendarEvent
                  };

                  vm.events[0].push(event);

                  addCalendarItem(vm.user.username,id,JSON.stringify(event)) .then(function (result) {
                    console.log(result);
                  });
                }
                else
                {
                  for ( var i = 0; i < vm.events[0].length; i++ )
                  {
                    // Update
                    if ( vm.events[0][i].id === response.calendarEvent.id )
                    {
                      var event={
                        title: title,
                        start: startDate,
                        end  : endDate,
                        eventData:response.calendarEvent
                      };

                      vm.events[0][i] =event;

                      updateCalendarItem(vm.user.username,response.calendarEvent.id,JSON.stringify(event)) .then(function (result) {
                        console.log(result);
                      });

                      break;
                    }
                  }
                }


              }




            });
        }


      function getAllCalendarItems(userName) {
        return $http.get('http://localhost:8087/bos/api/calendar/'+userName).then(handleSuccess, handleError('Error getting calendar items'));
      }
      function addCalendarItem(userName,id,event) {
        return $http.post('http://localhost:8087/bos/api/calendar/'+userName+'/'+id, event).then(handleSuccess, handleError('Error adding calendar items'));
      }
      function updateCalendarItem(userName,id,event) {
        return $http.put('http://localhost:8087/bos/api/calendar/'+userName+'/'+id, event).then(handleSuccess, handleError('Error updating calendar items'));
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
