/**
 * Created by pg9501 on 12.05.2017.
 */
(function () {
    'use strict';

    angular
      .module('app.operator.optimization-goals')
      .controller('OperatorOptimizationGoalsController', OperatorOptimizationGoalsController);

    /** @ngInject */
    function OperatorOptimizationGoalsController($document, $timeout,$window, $scope,fuseTheming, $mdDialog,$http,msNavigationService) {

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
      vm.activeTheme=fuseTheming.themes.active.theme; //get currently active theme
      $scope.$watch(watchSource, function(current, previous){ //watch theme changing and update the active theme in this controller
        vm.activeTheme=fuseTheming.themes.active.theme;

      });
      function watchSource(){
        return fuseTheming.themes.active.theme;
      }

      vm.maxValues=[1,1,1,1];
      vm.values=[0,0,0,0];

      vm.sliders = [{
        value: vm.values[0],
        options: {
          id: 0,
          showSelectionBar: true,
          // getPointerColor: function () {
          //   return vm.activeTheme.accent.color;
          // },
          floor: 0,
          ceil: 1,
          step: 0.1,
          minLimit: 0,
          maxLimit: vm.maxValues[0],
          precision: 1,
          enforceStep: false,
          onEnd: function(id) {
            var valueSum=0;
            for(var i in vm.sliders){
              valueSum+=vm.sliders[i].value;
            }
            var remainValue=1-valueSum;
            if(isNaN(remainValue)){
              remainValue=0;
              vm.sliders[id].options.maxLimit=vm.sliders[id].value;
            }else{
              remainValue=remainValue.toFixed(1);
              for(var i in vm.sliders){
                if(i!==id){
                  vm.sliders[i].options.maxLimit=parseFloat(vm.sliders[i].value)+parseFloat(remainValue);
                  /*if(vm.sliders[i].value<remainValue){
                    vm.sliders[i].options.maxLimit=remainValue;
                  }else{
                    vm.sliders[i].options.maxLimit=vm.sliders[i].value;
                  }*/
                }
              }
            }

          }
        }
      },
        {
          value: vm.values[1],
          options: {
            id: 1,
            showSelectionBar: true,
            // getPointerColor: function () {
            //   return vm.activeTheme.accent.color;
            // },
            floor: 0,
            ceil: 1,
            step: 0.1,
            minLimit: 0,
            maxLimit: vm.maxValues[1],
            precision: 1,
            enforceStep: false,
            onEnd: function(id) {
              var valueSum=0;
              for(var i in vm.sliders){
                valueSum+=vm.sliders[i].value;
              }
              var remainValue=1-valueSum;
              if(isNaN(remainValue)){
                remainValue=0;
                vm.sliders[id].options.maxLimit=vm.sliders[id].value;
              }else{
                remainValue=remainValue.toFixed(1);
                for(var i in vm.sliders){
                  if(i!==id){
                    vm.sliders[i].options.maxLimit=parseFloat(vm.sliders[i].value)+parseFloat(remainValue);
                   /* if(vm.sliders[i].value<remainValue){
                      vm.sliders[i].options.maxLimit=remainValue;
                    }else{
                      vm.sliders[i].options.maxLimit=vm.sliders[i].value;
                    }*/
                  }
                }
              }

            }
          }
        },
        {
          value: vm.values[2],
          options: {
            id: 2,
            showSelectionBar: true,
            // getPointerColor: function () {
            //   return vm.activeTheme.accent.color;
            // },
            floor: 0,
            ceil: 1,
            step: 0.1,
            minLimit: 0,
            maxLimit: vm.maxValues[2],
            precision: 1,
            enforceStep: false,
            onEnd: function(id) {
              var valueSum=0;
              for(var i in vm.sliders){
                valueSum+=vm.sliders[i].value;
              }
              var remainValue=1-valueSum;
              if(isNaN(remainValue)){
                remainValue=0;
                vm.sliders[id].options.maxLimit=vm.sliders[id].value;
              }else{
                remainValue=remainValue.toFixed(1);
                for(var i in vm.sliders){
                  if(i!==id){
                    vm.sliders[i].options.maxLimit=parseFloat(vm.sliders[i].value)+parseFloat(remainValue);
                   /* if(vm.sliders[i].value<remainValue){
                      vm.sliders[i].options.maxLimit=remainValue;
                    }else{
                      vm.sliders[i].options.maxLimit=vm.sliders[i].value;
                    }*/
                  }
                }
              }

            }
          }
        },
        {
          value: vm.values[3],
          options: {
            id: 3,
            showSelectionBar: true,
           // readOnly: true,
          /*  getPointerColor: function () {
              return vm.activeTheme.accent.color;
            },*/
            floor: 0,
            ceil: 1,
            step: 0.1,
            minLimit: 0,
            maxLimit: vm.maxValues[3],
            precision: 1,
            enforceStep: false,
            onEnd: function(id) {
              var valueSum=0;
              for(var i in vm.sliders){
                valueSum+=vm.sliders[i].value;
              }
              var remainValue=1-valueSum;
              if(isNaN(remainValue)){
                remainValue=0;
                vm.sliders[id].options.maxLimit=vm.sliders[id].value;
              }else{
                remainValue=remainValue.toFixed(1);
                for(var i in vm.sliders){
                  if(i!==id){
                    vm.sliders[i].options.maxLimit=parseFloat(vm.sliders[i].value)+parseFloat(remainValue);
                    /*if(vm.sliders[i].value<remainValue){
                      vm.sliders[i].options.maxLimit=remainValue;
                    }else{
                      vm.sliders[i].options.maxLimit=vm.sliders[i].value;
                    }*/
                  }
                }
              }

            }
          }
        }];


      vm.optimizationGoals=[{"name":"Maximal Self-consumption of Photovoltaic Generation","widget":{"type":"Slider","min_value":0,"max_value":vm.maxValues[0],"step":0.1,"mode":"HORIZONTAL","initVal":0,"inverted":0},"value":0},
        {"name":"Minimal Costs","widget":{"type":"Slider","min_value":0,"max_value":vm.maxValues[2],"step":0.1,"mode":"HORIZONTAL","initVal":0,"inverted":0},"value":0},
        {"name":"Minimal Energy Consumption","widget":{"type":"Slider","min_value":0,"max_value":vm.maxValues[3],"step":0.1,"mode":"HORIZONTAL","initVal":0,"inverted":0},"value":0},
        {"name":"Minimal CO2 Emissions","widget":{"type":"Slider","min_value":0,"max_value":vm.maxValues[1],"step":0.1,"mode":"HORIZONTAL","initVal":0,"inverted":0},"value":0}];

      vm.changed=false;


      vm.change=function (index,value) {
        console.log("index is ");
        console.log(index);
        console.log(vm.values);
        var valueSum=0;
        for(var i in vm.values){
          valueSum+=vm.values[i];
        }
        var remainValue=1-valueSum;
        for(var i in vm.maxValues){
          if(i!==index){
            vm.maxValues[i]=remainValue;
          }
        }
      };

      /*GetAllOptimizationGoals().then(function (result) {

        if(result!=null && result.length>0){
          vm.optimizationGoals=result;

        }

      });*/

      vm.update=function (goals) {
        var isSuccessful=true;
        var goalStrList=[];
        for(var i in goals){
          var name=goals[i].name;
          var value=goals[i].value;
          goalStrList.push({key:name,value:value});
        }
        UpdateAllOptimizationGoals(goalStrList).then(function (result) {
          if(result=='false'){
            isSuccessful=false;
          }
          var alert;
          if(isSuccessful){
            alert = $mdDialog.alert({
              title: 'Attention',
              textContent: 'The optimization goals have been saved successfully!',
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
          vm.changed=false;

        });
      }

      function GetAllOptimizationGoals() {
        return $http.get('http://localhost:8087/bos/api/optimizationGoals/').then(handleSuccess, handleError('Error getting all optimization goals'));
      }
      function UpdateAllOptimizationGoals(goals) {
        return $http.put('http://localhost:8087/bos/api/optimizationGoals/',goals).then(handleSuccess, handleError('Error updating all optimization goals'));
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
