/**
 * Created by pg9501 on 29.09.2016.
 */
(function () {
  'use strict';

  angular
    .module('app.dweller.electric-vehicle')
    .controller('ElectricVehicleController', ElectricVehicleController);

  /** @ngInject */
  function ElectricVehicleController($document, $timeout, $scope,$http, $mdDialog,msNavigationService) {

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

    vm.currentDate=new Date();

    vm.evData=[];

    vm.save=function (ev) {
      console.log("new ev data is");
      console.log(vm.evData);


      var newDateTime=new Date();
      newDateTime.setYear(vm.evData.departureDate.getFullYear());
      newDateTime.setMonth(vm.evData.departureDate.getMonth());
      newDateTime.setDate(vm.evData.departureDate.getDate());
      newDateTime.setHours(vm.evData.departureTime.getHours());
      newDateTime.setMinutes(vm.evData.departureTime.getMinutes());
      newDateTime.setSeconds(vm.evData.departureTime.getSeconds());

      var newEVData={autoID:vm.evData.autoID, departureTime:newDateTime.toLocaleString(), distance:vm.evData.distance, minRange:vm.evData.minRange, isChargingImmediately: vm.evData.isChargingImmediately};

      updateElectricVehicle(newEVData).then(function (result) {
        console.log(result);
        $mdDialog.show(
          $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Confirmation')
            .textContent('The configuration for the next drive has been saved.')
            .ariaLabel('Alert Dialog Demo')
            .ok('Ok')
            .targetEvent(ev)
        );
      });

      $('#saveBtn').attr("disabled", true);
    }


    var isFirstLoaded=true;
    getElectricVehicle('ElectricVehicle').then(function (result) {

      if(result!=null){
        vm.evData=result;
        if(vm.evData.departureTime===''){
          vm.evData.departureDate=new Date();
          vm.evData.departureTime=new Date();
        }else{
          vm.evData.departureDate=new Date(vm.evData.departureTime);
          vm.evData.departureTime=new Date(vm.evData.departureTime);
        }



        $scope.$watch("vm.evData", function(){

          if(isFirstLoaded){
            isFirstLoaded=false;

            $('#saveBtn').attr("disabled", true);

          }else{

            if(vm.evData.departureDate=== null){

              $scope.evForm.date.$error.wrongFormat1=true;
              $('#saveBtn').attr("disabled", true);
              return;
            }else if(vm.evData.departureDate instanceof Date){
              var date=new Date();
              date.setHours(vm.evData.departureDate.getHours());
              date.setMinutes(vm.evData.departureDate.getMinutes());
              date.setSeconds(vm.evData.departureDate.getSeconds());
              date.setMilliseconds(vm.evData.departureDate.getMilliseconds());

              if(vm.evData.departureDate.getTime() < date.getTime()){

                $scope.evForm.date.$error.wrongFormat2=true;
                $('#saveBtn').attr("disabled", true);
                return;
              }
            }else{

              $scope.evForm.date.$error.wrongFormat2=true;
              $('#saveBtn').attr("disabled", true);
              return;
            }

           if(vm.evData.departureTime ==null){

              $scope.evForm.time.$error.wrongFormat1=true;
             $('#saveBtn').attr("disabled", true);
             return;
            } else{
             var date=vm.evData.departureDate;

             date.setHours(vm.evData.departureTime.getHours());
             date.setMinutes(vm.evData.departureTime.getMinutes());
             date.setSeconds(vm.evData.departureTime.getSeconds());
             date.setMilliseconds(vm.evData.departureTime.getMilliseconds());
             if(date.getTime()<=(new Date()).getTime()){

               $scope.evForm.time.$error.wrongFormat2=true;
               $('#saveBtn').attr("disabled", true);
               return;
             }
            }


            $scope.evForm.date.$error.wrongFormat1=false;
            $scope.evForm.date.$error.wrongFormat2=false;
            $scope.evForm.time.$error.wrongFormat1=false;
            $scope.evForm.time.$error.wrongFormat2=false;
            $('#saveBtn').attr("disabled", false);

            if($scope.evForm.$invalid){
              $('#saveBtn').attr("disabled", true);
            }else{
              $('#saveBtn').attr("disabled", false);
            }



          }

        }, true);
      }

    });





    function getElectricVehicle(autoID){
      return $http.get('http://localhost:8087/bos/api/electricVehicle/'+autoID).then(handleSuccess, handleError('Error adding ElectricVehicle'));
    }
    function updateElectricVehicle(ev){
      return $http.put('http://localhost:8087/bos/api/electricVehicle',ev).then(handleSuccess, handleError('Error updating ElectricVehicle'));
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
