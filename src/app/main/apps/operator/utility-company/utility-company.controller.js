/**
 * Created by pg9501 on 12.05.2017.
 */
(function () {
    'use strict';

    angular
      .module('app.operator.utility-company')
      .controller('OperatorUtilityCompanyController', OperatorUtilityCompanyController);

    /** @ngInject */
    function OperatorUtilityCompanyController($document,$mdSidenav, $timeout,$window, $scope, $rootScope,$translate,msNavigationService) {

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

      var vm=this;
      vm.closeLeft=function () {
        $mdSidenav('left').close()
          .then(function () {

          });
      }
      vm.toggleLeft=buildDelayedToggler('left');

      /**
       * Supplies a function that will continue to operate until the
       * time is up.
       */
      function debounce(func, wait, context) {
        var timer;

        return function debounced() {
          var context = $scope,
            args = Array.prototype.slice.call(arguments);
          $timeout.cancel(timer);
          timer = $timeout(function() {
            timer = undefined;
            func.apply(context, args);
          }, wait || 10);
        };
      }


      /**
       * Build handler to open/close a SideNav; when animation finishes
       * report completion in console
       */
      function buildDelayedToggler(navID) {
        return debounce(function() {
          // Component lookup should always be available since we are not using `ng-if`
          $mdSidenav(navID)
            .toggle()
            .then(function () {

            });
        }, 200);
      }


      $window.onresize=function(){
        vm.containerWidth=$('#pdfContainer').width();

      };



      $timeout(function(){
        vm.containerWidth=$('#pdfContainer').width();

      });


      var today = new Date();

      var aMonth = today.getMonth()-1;
      vm.invoices= [];
      var month = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
      var month_chn = new Array("一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月");
      var month_de = new Array("Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember");
      var year=1900+today.getYear();
      for (var i=0; i<12; i++) {
        vm.invoices.push({"month":month[aMonth]+", "+year,"src":"/assets/invoice.pdf"});
        aMonth--;
        if (aMonth < 0) {
          aMonth = 11;
          year--;
        }
      }
      $scope.selectedInvoice="";

      $scope.relativity = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/149125/relativity.pdf';
      $scope.material = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/149125/material-design-2.pdf';

      $rootScope.$on('$translateChangeSuccess', function () {

        vm.invoices=[];

        if($translate.use().substring(0,1)=='c'){
          for (var i=0; i<12; i++) {
            vm.invoices.push({"month":month_chn[aMonth]+", "+year,"src":"/assets/invoice.pdf"});
            aMonth--;
            if (aMonth < 0) {
              aMonth = 11;
              year--;
            }
          }
        }

        if($translate.use().substring(0,1)=='e'){
          for (var i=0; i<12; i++) {
            vm.invoices.push({"month":month[aMonth]+", "+year,"src":"/assets/invoice.pdf"});
            aMonth--;
            if (aMonth < 0) {
              aMonth = 11;
              year--;
            }
          }
        }

        if($translate.use().substring(0,1)=='d'){
          for (var i=0; i<12; i++) {
            vm.invoices.push({"month":month_de[aMonth]+", "+year,"src":"/assets/invoice.pdf"});
            aMonth--;
            if (aMonth < 0) {
              aMonth = 11;
              year--;
            }
          }
        }


      });

      vm.openInvoice=function (month) {
        for(var i in vm.invoices){
          if(vm.invoices[i].month==month){
            vm.selectedInvoice=vm.invoices[i];
            break;
          }
        }

      }


    }

  }
)();
