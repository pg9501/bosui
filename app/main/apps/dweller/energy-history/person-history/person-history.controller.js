/**
 * Created by pg9501 on 29.09.2016.
 */
(function () {
  'use strict';

  angular
    .module('app.dweller.energy-history.person-history')
    .controller('PersonHistoryController', PersonHistoryController);

  /** @ngInject */
  function PersonHistoryController($document, $timeout, $scope,$http, $mdDialog,msNavigationService,WAMPService) {

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

    vm.wampSession=WAMPService.getWAMPsession();


    vm.timePeriod="";
    vm.communities=[];
    vm.community="";
    vm.personalEnergyConsumption="";
    vm.communityEnergyConsumption="";
    vm.consumptionRanking="";
    vm.personalEnergyConsumptionCost="";
    vm.communityEnergyConsumptionCost="";
    vm.costRanking="";
    vm.personalEnergyConsumptionData=[];
    vm.communityEnergyConsumptionData=[];
    vm.powerUpperLimitData=[];
    vm.electricityPrices=[];
    vm.isRenderAll=true;

    vm.startDate=new Date();
    vm.startDate.setDate(new Date().getDate() -1);
    vm.endDate=new Date();
    vm.startTime=vm.startDate;
    vm.endTime=new Date();

    vm.startTimeStamp =(vm.startTime.getTime())/ 1000 | 0;
    vm.endTimeStamp =(vm.endTime.getTime())/ 1000 | 0;

    vm.maxDate=new Date();
    vm.maxDate.setDate(new Date().getDate() -1);
    vm.minDate=new Date();
    vm.minDate.setDate(new Date().getDate() -29);

    vm.isRenderY1=false;

    var check = function() {
      vm.wampSession = WAMPService.getWAMPsession();
      if (typeof vm.wampSession != 'undefined'){
        
      }
      else {
        setTimeout(check, 500); // check again in a second
      }
    };
    check();

    vm.getHistoricalLoadLimitData=function (starttime,endtime) {

      vm.startTimeStamp =starttime/ 1000 | 0;
      vm.endTimeStamp =endtime/ 1000 | 0;

        vm.wampSession.call('wamp.subscription.get_events', [2130467936619965, 1]).then(
          function (history) {
            if (history.length !== 0) {

              var loadLimitSignals = history[0]['args'][0]['ACTIVEPOWEREXTERNAL']['powerLimits'];
              var timeList = Object.keys(loadLimitSignals);
              var powerList = Object.values(loadLimitSignals);
              vm.powerUpperLimitData = [];

              for (var i = 0; i < timeList.length; i++) {
                if (timeList[i] >= vm.startTimeStamp && timeList[i] <= vm.endTimeStamp) {
                  var upperLoadLimit = {"x": timeList[i], "y": powerList[i]['powerUpperLimit']};
                  vm.powerUpperLimitData.push(upperLoadLimit);

                }
              }
              if (vm.powerUpperLimitData.length == 0) {
                var upperLoadLimit = {"x": vm.startTimeStamp, "y": powerList[0]['powerUpperLimit']};
                vm.powerUpperLimitData.push(upperLoadLimit);

              }

              //fill in missing values
              var firstValue=vm.powerUpperLimitData[0];
              var tempArray=new Array();
              tempArray.push(firstValue);

              for(var i=1;i<vm.powerUpperLimitData.length;i++) {
                var secondValue = vm.powerUpperLimitData[i];
                if (secondValue['x'] - firstValue['x'] > 60) {
                  for(var j=firstValue['x'];j<=secondValue['x'];j+=60) {
                    var item={"x":j,"y":firstValue['y']};
                    tempArray.push(item);
                  }
                }
                tempArray.push(secondValue);
                firstValue=secondValue;
              }
              vm.powerUpperLimitData=tempArray;


              if (vm.powerUpperLimitData[0]['x'] > vm.startTimeStamp) {
                var tempArray1 = new Array();
                var tempArray2 = new Array();
                for (var time = vm.startTimeStamp; time < vm.powerUpperLimitData[0]['x']; time += 60) {
                  var upperLoadLimit = {"x": time, "y": vm.powerUpperLimitData[0]['y']};
                  tempArray1.push(upperLoadLimit);

                }
                if (tempArray1.length > 0) {
                  vm.powerUpperLimitData = tempArray1.concat(vm.powerUpperLimitData);
                }
              }

              if (vm.powerUpperLimitData[vm.powerUpperLimitData.length - 1]['x'] < vm.endTimeStamp) {
                for (var time = vm.powerUpperLimitData[vm.powerUpperLimitData.length - 1]['x'] + 60; time <= vm.endTimeStamp; time += 60) {
                  var upperLoadLimit = {"x": time, "y": powerList[powerList.length - 1]['powerUpperLimit']};
                  vm.powerUpperLimitData.push(upperLoadLimit);

                }
              }

            }
          },
          function (error) {
            console.log(error);
          }
        );
    }

    vm.getHistoricalEnergyPriceData=function (starttime,endtime,type) {

      vm.startTimeStamp =starttime/ 1000 | 0;
      vm.endTimeStamp =endtime/ 1000 | 0;

      // history eshl.signals.eps
      vm.wampSession.call('wamp.subscription.get_events', [577174112086625, 1]).then(
        function (history) {
          if (history.length !== 0) {

            var prices_activePowerExternal = history[0]['args'][0]['ACTIVEPOWEREXTERNAL']['prices'];

            var prices_pvFeedin = history[0]['args'][0]['PVACTIVEPOWERFEEDIN']['prices'];
            var prices_chpFeedin = history[0]['args'][0]['CHPACTIVEPOWERFEEDIN']['prices'];
            var prices_naturalGasPowerExternal = history[0]['args'][0]['NATURALGASPOWEREXTERNAL']['prices'];
            var timeList_electricityPrice = Object.keys(prices_activePowerExternal);
            var timeList_pvFeedin = Object.keys(prices_pvFeedin);
            var timeList_chpFeedin = Object.keys(prices_chpFeedin);
            var timeList_gasPrice = Object.keys(prices_naturalGasPowerExternal);
            var electricityPriceList = Object.values(prices_activePowerExternal);
            var pvFeedinPriceList = Object.values(prices_pvFeedin);
            var chpFeedinPriceList = Object.values(prices_chpFeedin);

            if(type.indexOf('external')>=0){
              vm.electricityPrices = [];

              for (var i = 0; i < timeList_electricityPrice.length; i++) {
                if (timeList_electricityPrice[i] >= vm.startTimeStamp && timeList_electricityPrice[i] <= vm.endTimeStamp) {
                  var electricityPrice = {"x": parseInt(timeList_electricityPrice[i]), "y": parseInt(electricityPriceList[i])};
                  vm.electricityPrices.push(electricityPrice);
                }
              }
              if (vm.electricityPrices.length == 0) {
                var electricityPrice = {"x": vm.startTimeStamp, "y": electricityPriceList[electricityPriceList.length - 1]};
                vm.electricityPrices.push(electricityPrice);
              }
              //fill in missing values
              var firstValue=vm.electricityPrices[0];
              var tempArray=new Array();
              tempArray.push(firstValue);
              for(var i=1;i<vm.electricityPrices.length;i++) {
                var secondValue = vm.electricityPrices[i];
                if (secondValue['x'] - firstValue['x'] > 60) {
                  for(var j=firstValue['x'];j<=secondValue['x'];j+=60) {
                    var item={"x":j,"y":firstValue['y']};
                    tempArray.push(item);
                  }
                }
                tempArray.push(secondValue);
                firstValue=secondValue;
              }
              vm.electricityPrices=tempArray;


            }

            if(type.indexOf('pv')>=0){
              vm.pvFeedinPrices = [];

              for (var i = 0; i < timeList_pvFeedin.length; i++) {

                if (timeList_pvFeedin[i] >= vm.startTimeStamp && timeList_pvFeedin[i] <= vm.endTimeStamp) {

                  var pvFeedinPrice = {"x": parseInt(timeList_pvFeedin[i]), "y": parseInt(pvFeedinPriceList[i])};
                  vm.pvFeedinPrices.push(pvFeedinPrice);
                }
              }
              if (vm.pvFeedinPrices.length == 0) {

                var pvFeedinPrice = {"x": vm.startTimeStamp, "y": pvFeedinPriceList[pvFeedinPriceList.length - 1]};
                vm.pvFeedinPrices.push(pvFeedinPrice);
              }
              //fill in missing values
              var firstValue=vm.pvFeedinPrices[0];
              var tempArray=new Array();
              tempArray.push(firstValue);
              for(var i=1;i<vm.pvFeedinPrices.length;i++) {
                var secondValue = vm.pvFeedinPrices[i];
                if (secondValue['x'] - firstValue['x'] > 60) {
                  for(var j=firstValue['x'];j<=secondValue['x'];j+=60) {
                    var item={"x":j,"y":firstValue['y']};
                    tempArray.push(item);
                  }
                }
                tempArray.push(secondValue);
                firstValue=secondValue;
              }
              vm.pvFeedinPrices=tempArray;

              if (vm.pvFeedinPrices[0]['x'] > vm.startTimeStamp) {
                var tempArray=new Array();
                for (var time = vm.startTimeStamp; time < vm.pvFeedinPrices[0]['x']; time += 60) {
                  var pvFeedinPrice = {"x": time, "y": vm.pvFeedinPrices[0]['y']};
                  tempArray.push(pvFeedinPrice);
                }
                if(tempArray.length>0){
                  vm.pvFeedinPrices=tempArray.concat(vm.pvFeedinPrices);
                }
              }
              if (vm.pvFeedinPrices[vm.pvFeedinPrices.length - 1]['x'] < vm.endTimeStamp) {
                for (var time = vm.pvFeedinPrices[vm.pvFeedinPrices.length - 1]['x'] + 60; time <= vm.endTimeStamp; time += 60) {
                  var pvFeedinPrice = {"x": time, "y": pvFeedinPriceList[pvFeedinPriceList.length - 1]};
                  vm.pvFeedinPrices.push(pvFeedinPrice);
                }
              }

            }

            if(type.indexOf('chp')>=0){
              vm.chpFeedinPrices = [];

              for (var i = 0; i < timeList_chpFeedin.length; i++) {
                if (timeList_chpFeedin[i] >= vm.startTimeStamp && timeList_chpFeedin[i] <= vm.endTimeStamp) {
                  var chpFeedinPrice = {"x": parseInt(timeList_chpFeedin[i]), "y": parseInt(chpFeedinPriceList[i])};
                  vm.chpFeedinPrices.push(chpFeedinPrice);
                }
              }
              if (vm.chpFeedinPrices.length == 0) {
                var chpFeedinPrice = {"x": vm.startTimeStamp, "y": chpFeedinPriceList[chpFeedinPriceList.length - 1]};
                vm.chpFeedinPrices.push(chpFeedinPrice);
              }
              //fill in missing values
              var firstValue=vm.chpFeedinPrices[0];
              var tempArray=new Array();
              tempArray.push(firstValue);
              for(var i=1;i<vm.chpFeedinPrices.length;i++) {
                var secondValue = vm.chpFeedinPrices[i];
                if (secondValue['x'] - firstValue['x'] > 60) {
                  for(var j=firstValue['x'];j<=secondValue['x'];j+=60) {
                    var item={"x":j,"y":firstValue['y']};
                    tempArray.push(item);
                  }
                }
                tempArray.push(secondValue);
                firstValue=secondValue;
              }
              vm.chpFeedinPrices=tempArray;
              if (vm.chpFeedinPrices[0]['x'] > vm.startTimeStamp) {
                var tempArray = new Array();
                for (var time = vm.startTimeStamp; time < vm.chpFeedinPrices[0]['x']; time += 60) {
                  var chpFeedinPrice = {"x": time, "y": vm.chpFeedinPrices[0]['y']};
                  tempArray.push(chpFeedinPrice);
                }
                if (tempArray.length > 0) {
                  vm.chpFeedinPrices = tempArray.concat(vm.chpFeedinPrices);
                }
              }
              if (vm.chpFeedinPrices[vm.chpFeedinPrices.length - 1]['x'] < vm.endTimeStamp) {
                for (var time = vm.chpFeedinPrices[vm.chpFeedinPrices.length - 1]['x'] + 60; time <= vm.endTimeStamp; time += 60) {
                  var chpFeedinPrice = {"x": time, "y": chpFeedinPriceList[chpFeedinPriceList.length - 1]};
                  vm.chpFeedinPrices.push(chpFeedinPrice);
                }
              }

            }

          }
        });


    }


    vm.washingMachine=[];
    vm.getHistoricalWashingMachineEnergyData=function (starttime,endtime) {

      vm.startTimeStamp =starttime/ 1000 | 0;
      vm.endTimeStamp =endtime/ 1000 | 0;

      vm.washingMachine=[];
      vm.wampSession.call('eshl.wago.v1.database.meter.query',['08','P3', starttime, endtime, 1000]).then(
        // RPC success callback
        function (history) {
          if (history.length !== 0) {
            for(var i in history){
              var record=history[i];
              var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
              if(1000*newRecord.x>=starttime && 1000*newRecord.x<=endtime){
                vm.washingMachine.push(newRecord);
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

    vm.kochfeld=[];
    vm.getHistoricalKochfeldEnergyData=function (starttime,endtime) {

      vm.startTimeStamp =starttime/ 1000 | 0;
      vm.endTimeStamp =endtime/ 1000 | 0;
      var record1=[];
      var record2=[];
      var record3=[];
      vm.kochfeld=[];
      vm.wampSession.call('eshl.wago.v1.database.meter.query',['09','P1', starttime, endtime, 1000]).then(
        // RPC success callback
        function (history) {
          if (history.length !== 0) {
            for(var i in history){
              var record=history[i];
              var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
              if(1000*newRecord.x>=starttime && 1000*newRecord.x<=endtime){
                record1.push(newRecord);
              }

            }
          }
        },
        // RPC error callback
        function (error) {
          console.log("Call failed:", error);
        }
      );
      vm.wampSession.call('eshl.wago.v1.database.meter.query',['09','P2', starttime, endtime, 1000]).then(
        // RPC success callback
        function (history) {
          if (history.length !== 0) {
            for(var i in history){
              var record=history[i];
              var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
              if(1000*newRecord.x>=starttime && 1000*newRecord.x<=endtime){
                record2.push(newRecord);
              }

            }
          }
        },
        // RPC error callback
        function (error) {
          console.log("Call failed:", error);
        }
      );
      vm.wampSession.call('eshl.wago.v1.database.meter.query',['09','P3', starttime, endtime, 1000]).then(
        // RPC success callback
        function (history) {
          if (history.length !== 0) {
            for(var i in history){
              var record=history[i];
              var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
              if(1000*newRecord.x>=starttime && 1000*newRecord.x<=endtime){
                record3.push(newRecord);
              }

            }
            for( var i in record3){
              if(record3[i].x===record2[i].x && record1[i].x===record3[i].x){
                if(1000*record3[i].x>=starttime && 1000*record3[i].x<=endtime){
                  var newRecord={"x":record3[i].x, "y":(record1[i].y+record2[i].y+record3[i].y)};
                  vm.kochfeld.push(newRecord);
                }

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

    vm.oven=[];
    vm.getHistoricalOvenEnergyData=function (starttime,endtime) {

      vm.startTimeStamp =starttime/ 1000 | 0;
      vm.endTimeStamp =endtime/ 1000 | 0;
      vm.oven=[];
      vm.wampSession.call('eshl.wago.v1.database.meter.query',['05','P3', starttime, endtime, 1000]).then(
        // RPC success callback
        function (history) {
          if (history.length !== 0) {
            for(var i in history){
              var record=history[i];
              var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
              if(1000*newRecord.x>=starttime && 1000*newRecord.x<=endtime){
                vm.oven.push(newRecord);
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

    vm.dryer=[];
    vm.getHistoricalDryerEnergyData=function (starttime,endtime) {

      vm.startTimeStamp =starttime/ 1000 | 0;
      vm.endTimeStamp =endtime/ 1000 | 0;
      vm.dryer=[];
      vm.wampSession.call('eshl.wago.v1.database.meter.query',['04','P1', starttime, endtime, 1000]).then(
        // RPC success callback
        function (history) {
          if (history.length !== 0) {
            for(var i in history){
              var record=history[i];
              var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
              if(1000*newRecord.x>=starttime && 1000*newRecord.x<=endtime){
                vm.dryer.push(newRecord);
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

    vm.dishWasher=[];
    vm.getHistoricalDishWasherEnergyData=function (starttime,endtime) {

      vm.startTimeStamp =starttime/ 1000 | 0;
      vm.endTimeStamp =endtime/ 1000 | 0;
      vm.dishWasher=[];
      vm.wampSession.call('eshl.wago.v1.database.meter.query',['04','P2', starttime, endtime, 1000]).then(
        // RPC success callback
        function (history) {
          if (history.length !== 0) {
            for(var i in history){
              var record=history[i];
              var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
              if(1000*newRecord.x>=starttime && 1000*newRecord.x<=endtime){
                vm.dishWasher.push(newRecord);
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

    vm.kaffeeMachine=[];
    vm.getHistoricalKaffeeMachineEnergyData=function (starttime,endtime) {

      vm.startTimeStamp =starttime/ 1000 | 0;
      vm.endTimeStamp =endtime/ 1000 | 0;
      vm.kaffeeMachine=[];
      vm.wampSession.call('eshl.wago.v1.database.meter.query',['07','P2', starttime, endtime, 1000]).then(
        // RPC success callback
        function (history) {
          if (history.length !== 0) {
            for(var i in history){
              var record=history[i];
              var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
              if(1000*newRecord.x>=starttime && 1000*newRecord.x<=endtime){
                vm.kaffeeMachine.push(newRecord);
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


    vm.randomArray_lasMonth=[];
    vm.randomArray_yesterday=[];
    vm.randomArray_lastThreeDays=[];
    vm.randomArray_lastWeek=[];
    GetAllJoinedCommunities().then(function (result) {

      if(result.length>0){
        var buildingNum=0;
        for(var i in result){
          for(var j in result[i].buildingTypes){
            if(result[i].buildingTypes[j].name=="Residential Building"){
              buildingNum=result[i].buildingTypes[j].numberOfBuildings;
              var random={energyValue:getRandomArbitrary(505, 532),energyRanking:getRandomArbitrary(0.15, 0.35),costValue:getRandomArbitrary(131.3, 138.3), costRanking:getRandomArbitrary(0.15, 0.35)};
              vm.randomArray_lasMonth.push(random);
              var random={energyValue:getRandomArbitrary(10, 15),energyRanking:getRandomArbitrary(0.55, 0.75),costValue:getRandomArbitrary(2.65, 2.98), costRanking:getRandomArbitrary(0.55, 0.75)};
              vm.randomArray_yesterday.push(random);
              var random={energyValue:getRandomArbitrary(38, 45),energyRanking:getRandomArbitrary(0.3, 0.45),costValue:getRandomArbitrary(10.01, 11.56),costRanking:getRandomArbitrary(0.3, 0.45)};
              vm.randomArray_lastThreeDays.push(random);
              var random={energyValue:getRandomArbitrary(90, 96),energyRanking:getRandomArbitrary(0.3, 0.45),costValue:getRandomArbitrary(23.89, 26.8),costRanking:getRandomArbitrary(0.3, 0.45)};
              vm.randomArray_lastWeek.push(random);
              break;
            }
          }
          vm.communities.push({"name":result[i].name,"buildingNum":buildingNum});
        }
      }

    });

    vm.personalEnergyConsumptionData = [];
    vm.getHistoricalPersonalEnergyData=function (starttime,endtime) {

      vm.personalEnergyConsumptionData = [];
      vm.getHistoricalKaffeeMachineEnergyData(starttime,endtime);
      vm.getHistoricalDishWasherEnergyData(starttime,endtime);
      vm.getHistoricalDryerEnergyData(starttime,endtime);
      vm.getHistoricalOvenEnergyData(starttime,endtime);
      vm.getHistoricalKochfeldEnergyData(starttime,endtime);
      vm.getHistoricalWashingMachineEnergyData(starttime,endtime);

      var timeout = setInterval(function()
      {
        if(vm.kaffeeMachine.length>2 && vm.dishWasher.length>2 && vm.dryer.length>2 && vm.oven.length>2 && vm.kochfeld.length>2 && vm.washingMachine.length>2){
          clearInterval(timeout);
          vm.isRenderAll=false;
          for(var i in vm.kaffeeMachine){
            var newRecord={"x":0,"y":0};
            newRecord.x=vm.kaffeeMachine[i].x;
            newRecord.y=vm.kaffeeMachine[i].y+vm.dishWasher[i].y+vm.dryer[i].y+vm.oven[i].y+vm.kochfeld[i].y+vm.washingMachine[i].y;
            vm.personalEnergyConsumptionData.push(newRecord);
          }

          var maxPersonalConsumption=vm.personalEnergyConsumptionData.length>0?Math.max.apply(Math,vm.personalEnergyConsumptionData.map(function(o){return o.y;})):0;

          var maxArr=[];
          maxArr.push(maxPersonalConsumption);

          var maxY=Math.max.apply(Math,maxArr);

          var minPersonalConsumption=vm.personalEnergyConsumptionData.length>0?Math.min.apply(Math,vm.personalEnergyConsumptionData.map(function(o){return o.y;})):0;

          var minArr=[];
          minArr.push(minPersonalConsumption);

          var minY=Math.min.apply(Math,minArr);

          var maxLoadLimit=Math.max.apply(Math,vm.powerUpperLimitData.map(function(o){return o.y;}));

          var thresholdValue=Math.max(Math.abs(minY),Math.abs(maxY));

          if( Math.abs(maxLoadLimit)>=thresholdValue){
            vm.isRenderY1=false;
          }else{
            vm.isRenderY1=true;
          }
        }

      }, 100);

    };

    function getRandomArbitrary(min, max) {
      return Math.random() * (max - min) + min;
    }

    vm.energyMedal="";
    vm.costMedal="";
    vm.changeCommunity=function () {
      var buildingNum=0;
      var index=0;
      for(var i in vm.communities){
        if(vm.communities[i].name==vm.community){
          buildingNum=vm.communities[i].buildingNum;
          index=i;
          break;
        }
      }
      if(vm.timePeriod=="Last month"){
        var random1=vm.randomArray_lasMonth[index].energyValue;
        vm.communityEnergyConsumption=Math.floor(random1)+" kWh";
        var random2=vm.randomArray_lasMonth[index].energyRanking;
        var ranking1=Math.round(random2*buildingNum);
        vm.consumptionRanking=ranking1+"/"+buildingNum;
        if(random2<0.3){
          vm.energyMedal="assets/images/"+"like.png";
        }else if(random2<0.5){
          vm.energyMedal="assets/images/"+"happy.png";
        }else if(random2<0.7){
          vm.energyMedal="assets/images/"+"confused.png";
        }else{
          vm.energyMedal="assets/images/"+"depression.png";
        }
        var random3=vm.randomArray_lasMonth[index].costValue;
        vm.communityEnergyConsumptionCost=Math.floor(random3)+" Euro";
        var random2=vm.randomArray_lasMonth[index].costRanking;
        var ranking1=Math.round(random2*buildingNum);
        vm.costRanking=ranking1+"/"+buildingNum;

        if(random2<0.3){
          vm.costMedal="assets/images/"+"like.png";
        }else if(random2<0.5){
          vm.costMedal="assets/images/"+"happy.png";
        }else if(random2<0.7){
          vm.costMedal="assets/images/"+"confused.png";
        }else{
          vm.costMedal="assets/images/"+"depression.png";
        }

      }else if(vm.timePeriod=='Yesterday'){
        var random1=vm.randomArray_yesterday[index].energyValue;
        vm.communityEnergyConsumption=Math.floor(random1)+" kWh";
        var random2=vm.randomArray_yesterday[index].energyRanking;
        var ranking1=Math.round(random2*buildingNum);
        vm.consumptionRanking=ranking1+"/"+buildingNum;
        if(random2<0.3){
          vm.energyMedal="assets/images/"+"like.png";
        }else if(random2<0.5){
          vm.energyMedal="assets/images/"+"happy.png";
        }else if(random2<0.7){
          vm.energyMedal="assets/images/"+"confused.png";
        }else{
          vm.energyMedal="assets/images/"+"depression.png";
        }
        var random3=vm.randomArray_yesterday[index].costValue;
        vm.communityEnergyConsumptionCost=Math.floor(random3)+" Euro";
        var random2=vm.randomArray_yesterday[index].costRanking;
        var ranking2=Math.round(random2*buildingNum);
        vm.costRanking=ranking2+"/"+buildingNum;
        if(random2<0.3){
          vm.costMedal="assets/images/"+"like.png";
        }else if(random2<0.5){
          vm.costMedal="assets/images/"+"happy.png";
        }else if(random2<0.7){
          vm.costMedal="assets/images/"+"confused.png";
        }else{
          vm.costMedal="assets/images/"+"depression.png";
        }
      } else if(vm.timePeriod=='Last three days') {

        var random1=vm.randomArray_lastThreeDays[index].energyValue;
        vm.communityEnergyConsumption=Math.floor(random1)+" kWh";
        var random2=vm.randomArray_lastThreeDays[index].energyRanking;
        var ranking1=Math.round(random2*buildingNum);
        vm.consumptionRanking=ranking1+"/"+buildingNum;
        if(random2<0.3){
          vm.energyMedal="assets/images/"+"like.png";
        }else if(random2<0.5){
          vm.energyMedal="assets/images/"+"happy.png";
        }else if(random2<0.7){
          vm.energyMedal="assets/images/"+"confused.png";
        }else{
          vm.energyMedal="assets/images/"+"depression.png";
        }

        var random3=vm.randomArray_lastThreeDays[index].costValue;
        vm.communityEnergyConsumptionCost=Math.floor(random3)+" Euro";

        var random2=vm.randomArray_lastThreeDays[index].costRanking;
        var ranking2=Math.round(random2*buildingNum);
        vm.costRanking=ranking2+"/"+buildingNum;
        if(random2<0.3){
          vm.costMedal="assets/images/"+"like.png";
        }else if(random2<0.5){
          vm.costMedal="assets/images/"+"happy.png";
        }else if(random2<0.7){
          vm.costMedal="assets/images/"+"confused.png";
        }else{
          vm.costMedal="assets/images/"+"depression.png";
        }
      }else if(vm.timePeriod=='Last week') {
        var random1=vm.randomArray_lastWeek[index].energyValue;
        vm.communityEnergyConsumption=Math.floor(random1)+" kWh";
        var random2=vm.randomArray_lastWeek[index].energyRanking;
        var ranking1=Math.round(random2*buildingNum);
        if(random2<0.3){
          vm.energyMedal="assets/images/"+"like.png";
        }else if(random2<0.5){
          vm.energyMedal="assets/images/"+"happy.png";
        }else if(random2<0.7){
          vm.energyMedal="assets/images/"+"confused.png";
        }else{
          vm.energyMedal="assets/images/"+"depression.png";
        }
        vm.consumptionRanking=ranking1+"/"+buildingNum;
        var random3=vm.randomArray_lastWeek[index].costValue;
        vm.communityEnergyConsumptionCost=Math.floor(random3)+" Euro";
        var random2=vm.randomArray_lastWeek[index].costRanking;
        var ranking2=Math.round(random2*buildingNum);
        vm.costRanking=ranking2+"/"+buildingNum;
        if(random2<0.3){
          vm.costMedal="assets/images/"+"like.png";
        }else if(random2<0.5){
          vm.costMedal="assets/images/"+"happy.png";
        }else if(random2<0.7){
          vm.costMedal="assets/images/"+"confused.png";
        }else{
          vm.costMedal="assets/images/"+"depression.png";
        }
      }
    }

    vm.timePeriod="";
    vm.changeTimePeriod=function () {

      var buildingNum=0;
      var index=0;
      for(var i in vm.communities){
        if(vm.communities[i].name==vm.community){
          buildingNum=vm.communities[i].buildingNum;
          index=i;
          break;
        }
      }

      if(vm.timePeriod=='Last month'){
        vm.personalEnergyConsumption="424 kWh";
        vm.personalEnergyConsumptionCost="110.2 Euro";

        var random1=vm.randomArray_lasMonth[index].energyValue;
        vm.communityEnergyConsumption=Math.floor(random1)+" kWh";
        var random2=vm.randomArray_lasMonth[index].energyRanking;
        var ranking1=Math.round(random2*buildingNum);
        vm.consumptionRanking=ranking1+"/"+buildingNum;
        if(random2<0.3){
          vm.energyMedal="assets/images/"+"like.png";
        }else if(random2<0.5){
          vm.energyMedal="assets/images/"+"happy.png";
        }else if(random2<0.7){
          vm.energyMedal="assets/images/"+"confused.png";
        }else{
          vm.energyMedal="assets/images/"+"depression.png";
        }
        var random3=vm.randomArray_lasMonth[index].costValue;
        vm.communityEnergyConsumptionCost=Math.floor(random3)+" Euro";
        var random2=vm.randomArray_lasMonth[index].costRanking;
        var ranking1=Math.round(random2*buildingNum);
        vm.costRanking=ranking1+"/"+buildingNum;

        if(random2<0.3){
          vm.costMedal="assets/images/"+"like.png";
        }else if(random2<0.5){
          vm.costMedal="assets/images/"+"happy.png";
        }else if(random2<0.7){
          vm.costMedal="assets/images/"+"confused.png";
        }else{
          vm.costMedal="assets/images/"+"depression.png";
        }

        vm.isRenderAll=true;
        vm.personalEnergyConsumptionData=[];
        vm.communityEnergyConsumptionData=[];
        vm.powerUpperLimitData=[];
        vm.electricityPrices=[];
        vm.startDate.setDate(vm.startDate.getDate()-30);

        vm.startTime.setFullYear(vm.startDate.getFullYear());
        vm.startTime.setMonth(vm.startDate.getMonth());
        vm.startTime.setDate(vm.startDate.getDate());
        var starttime=vm.startTime.getTime();
        vm.endTime.setFullYear(vm.endDate.getFullYear());
        vm.endTime.setMonth(vm.endDate.getMonth());
        vm.endTime.setDate(vm.endDate.getDate());
        var endtime=vm.endTime.getTime();
        vm.startTimeStamp =starttime/ 1000 | 0;
        vm.endTimeStamp =endtime/ 1000 | 0;

        return;
      }

     /* vm.startDate = new Date();
      vm.endDate=new Date();*/

      vm.startDate = vm.selectedDate;
      vm.endDate.setDate(vm.startDate.getDate()+1);

      vm.isRenderAll=true;

      if(vm.timePeriod=='Yesterday'){
        vm.personalEnergyConsumption="11 kWh";
        vm.personalEnergyConsumptionCost="2.9 Euro";

        var random1=vm.randomArray_yesterday[index].energyValue;
        vm.communityEnergyConsumption=Math.floor(random1)+" kWh";
        var random2=vm.randomArray_yesterday[index].energyRanking;
        var ranking1=Math.round(random2*buildingNum);
        vm.consumptionRanking=ranking1+"/"+buildingNum;
        if(random2<0.3){
          vm.energyMedal="assets/images/"+"like.png";
        }else if(random2<0.5){
          vm.energyMedal="assets/images/"+"happy.png";
        }else if(random2<0.7){
          vm.energyMedal="assets/images/"+"confused.png";
        }else{
          vm.energyMedal="assets/images/"+"depression.png";
        }
        var random3=vm.randomArray_yesterday[index].costValue;
        vm.communityEnergyConsumptionCost=Math.floor(random3)+" Euro";
        var random2=vm.randomArray_yesterday[index].costRanking;
        var ranking2=Math.round(random2*buildingNum);
        vm.costRanking=ranking2+"/"+buildingNum;
        if(random2<0.3){
          vm.costMedal="assets/images/"+"like.png";
        }else if(random2<0.5){
          vm.costMedal="assets/images/"+"happy.png";
        }else if(random2<0.7){
          vm.costMedal="assets/images/"+"confused.png";
        }else{
          vm.costMedal="assets/images/"+"depression.png";
        }

        //vm.startDate.setDate(vm.startDate.getDate()-1);
      }else if(vm.timePeriod=='Last three days'){
        vm.personalEnergyConsumption="35 kWh";
        vm.personalEnergyConsumptionCost="9.1 Euro";

        var random1=vm.randomArray_lastThreeDays[index].energyValue;
        vm.communityEnergyConsumption=Math.floor(random1)+" kWh";
        var random2=vm.randomArray_lastThreeDays[index].energyRanking;
        var ranking1=Math.round(random2*buildingNum);
        vm.consumptionRanking=ranking1+"/"+buildingNum;
        if(random2<0.3){
          vm.energyMedal="assets/images/"+"like.png";
        }else if(random2<0.5){
          vm.energyMedal="assets/images/"+"happy.png";
        }else if(random2<0.7){
          vm.energyMedal="assets/images/"+"confused.png";
        }else{
          vm.energyMedal="assets/images/"+"depression.png";
        }

        var random3=vm.randomArray_lastThreeDays[index].costValue;
        vm.communityEnergyConsumptionCost=Math.floor(random3)+" Euro";

        var random2=vm.randomArray_lastThreeDays[index].costRanking;
        var ranking2=Math.round(random2*buildingNum);
        vm.costRanking=ranking2+"/"+buildingNum;
        if(random2<0.3){
          vm.costMedal="assets/images/"+"like.png";
        }else if(random2<0.5){
          vm.costMedal="assets/images/"+"happy.png";
        }else if(random2<0.7){
          vm.costMedal="assets/images/"+"confused.png";
        }else{
          vm.costMedal="assets/images/"+"depression.png";
        }

        vm.startDate.setDate(vm.startDate.getDate()-3);
      }else if(vm.timePeriod=='Last week'){
        vm.personalEnergyConsumption="89 kWh";
        vm.personalEnergyConsumptionCost="23.2 Euro";

        var random1=vm.randomArray_lastWeek[index].energyValue;
        vm.communityEnergyConsumption=Math.floor(random1)+" kWh";
        var random2=vm.randomArray_lastWeek[index].energyRanking;
        var ranking1=Math.round(random2*buildingNum);
        if(random2<0.3){
          vm.energyMedal="assets/images/"+"like.png";
        }else if(random2<0.5){
          vm.energyMedal="assets/images/"+"happy.png";
        }else if(random2<0.7){
          vm.energyMedal="assets/images/"+"confused.png";
        }else{
          vm.energyMedal="assets/images/"+"depression.png";
        }
        vm.consumptionRanking=ranking1+"/"+buildingNum;
        var random3=vm.randomArray_lastWeek[index].costValue;
        vm.communityEnergyConsumptionCost=Math.floor(random3)+" Euro";
        var random2=vm.randomArray_lastWeek[index].costRanking;
        var ranking2=Math.round(random2*buildingNum);
        vm.costRanking=ranking2+"/"+buildingNum;
        if(random2<0.3){
          vm.costMedal="assets/images/"+"like.png";
        }else if(random2<0.5){
          vm.costMedal="assets/images/"+"happy.png";
        }else if(random2<0.7){
          vm.costMedal="assets/images/"+"confused.png";
        }else{
          vm.costMedal="assets/images/"+"depression.png";
        }


        vm.startDate.setDate(vm.startDate.getDate()-7);
      }

      vm.startTime.setFullYear(vm.startDate.getFullYear());
      vm.startTime.setMonth(vm.startDate.getMonth());
      vm.startTime.setDate(vm.startDate.getDate());
      var starttime=vm.startTime.getTime();
      vm.endTime.setFullYear(vm.endDate.getFullYear());
      vm.endTime.setMonth(vm.endDate.getMonth());
      vm.endTime.setDate(vm.endDate.getDate());
      var endtime=vm.endTime.getTime();

      var paramterArr=[];
      paramterArr.push("external");
      vm.getHistoricalLoadLimitData(starttime,endtime);
      vm.getHistoricalEnergyPriceData(starttime,endtime,paramterArr);
      vm.getHistoricalPersonalEnergyData(starttime,endtime);
    }


    function GetAllJoinedCommunities() {
      return $http.get('http://localhost:8087/bos/api/communities/joined').then(handleSuccess, handleError('Error getting all joined communities'));
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
