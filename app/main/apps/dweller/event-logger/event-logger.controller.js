/**
 * Created by pg9501 on 29.09.2016.
 */
(function () {
  'use strict';

  angular
    .module('app.dweller.event-logger')
    .controller('EventLoggerController', EventLoggerController);

  /** @ngInject */
  function EventLoggerController($document, $timeout, $scope,$http,msNavigationService, $mdDialog,DTOptionsBuilder, DTColumnDefBuilder) {

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

    var vm=this;

    vm.user=JSON.parse(window.localStorage.getItem('user-info'));

    vm.statuses =[];

    vm.dtInstance = {};
    vm.dtOptions = {
      dom         : 'rt<"bottom"<"left"<"length"l>><"right"<"info"i><"pagination"p>>>',
      columnDefs  : [
        {
          // Target the image column
          targets: 0,
          //width  : '20px',
          filterable        : false,
          sortable          : false
        },

        {
          // Target the device name column
          targets           : 1,
          filterable        : true,
          sortable          : true
        },
        {
          // Target the location column
          targets           : 2,
          filterable        : true,
          sortable          : true
        },
        {
          // Target the time column
          targets           : 3,
          responsivePriority: 1,
          filterable        : true,
          sortable          : true
        },
        {
          // Target the action column
          targets           : 4,
          filterable        : true,
          sortable          : true
        },
        {
          // Target the executor column
          targets           : 5,
          filterable        : true,
          sortable          : true
        }
      ],
      initComplete: function ()
      {
        var api = this.api(),
          searchBox = angular.element('body').find('#event-logger-search');

        // Bind an external input as a table wide search box
        if ( searchBox.length > 0 )
        {
          searchBox.on('keyup', function (event)
          {
            api.search(event.target.value).draw();
          });
        }
      },
      pagingType  : 'simple',
      lengthMenu  : [10, 20, 30, 50, 100],
      pageLength  : 20,
     // scroller: true,
     // scrollY     : 'auto',
      responsive  : true,
      order         : [3, 'desc']
    };

    vm.eventLoggers=[];
    // Methods

    getEventLogger(vm.user.name).then(function (result) {

      if(result!=null){
        vm.eventLoggers=result;

        console.log(vm.eventLoggers);
      }
      for(var i in vm.eventLoggers){
        var deviceID=vm.eventLoggers[i].deviceID;
        var action=vm.eventLoggers[i].action.toLowerCase().replace(/ /g, "");
        if(vm.eventLoggers[i].operationMode!=null){
          var operationMode=vm.eventLoggers[i].operationMode.replace("_"," ");
          vm.eventLoggers[i].operationMode=operationMode;
        }

        var imgName=deviceID.replace(" ","");

        if(deviceID.indexOf("Light")>=0){
          if(action.indexOf("on")>=0){
            imgName="Light_on";
          }else{
            imgName="Light_off";
          }
        }
        if(deviceID.indexOf("Blind")>=0){
          if(action.indexOf("open:100%")>=0){
            imgName="Blind_0";
          }else if(action.indexOf("closed:25%")>=0){
            imgName="Blind_25";
          } else if(action.indexOf("closed:50%")>=0){
            imgName="Blind_50";
          } else if(action.indexOf("closed:75%")>=0){
            imgName="Blind_75";
          } else if(action.indexOf("closed:100%")>=0){
            imgName="Blind_100";
          }else{
            imgName="Blind_50";
          }
        }

        var imgSrc="assets/images/energy-flows/"+imgName+".png";

        if(deviceID.indexOf("Air")>=0){
          vm.eventLoggers[i].action=vm.eventLoggers[i].action.replace("�C","°C");
        }

        vm.eventLoggers[i].deviceImage=imgSrc;
      }

    });

    function getEventLogger(user){
      return $http.get('http://localhost:8087/bos/api/eventLogger/'+user).then(handleSuccess, handleError('Error getting eventLogger'));
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
