/**
 * Created by pg9501 on 12.05.2017.
 */
(function () {
    'use strict';

    angular
      .module('app.operator.history')
      .controller('OperatorHistoryController',OperatorHistoryController);

    /** @ngInject */
    function OperatorHistoryController($document, $timeout,$window, $scope,$mdDialog,$http,msNavigationService,WAMPService) {

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
      vm.wampSession=WAMPService.getWAMPsession();

      var date1 = new Date("05/25/2017 16:00:00");
      var milliseconds1 = date1.getTime();

      var date2 = new Date("05/26/2017 16:00:00");
      var milliseconds2 = date2.getTime();

      /*vm.wampSession.call('eshl.wago.v1.database.wiz.query',[2,'P2', milliseconds1, milliseconds2, 100]).then(
        // RPC success callback
        function (history) {
          console.log("history");
          console.log(history);
        },
        // RPC error callback
        function (error) {
          console.log("Call failed:", error);
        }
      );*/

      vm.minDate = new Date();
      vm.minDate.setDate(new Date().getDate() -7);
      vm.maxDate = new Date();

      //vm.minDate=currentDate.getFullYear()+"-0"+(currentDate.getMonth()+1)+"-"+currentDate.getDate()+"T"+"00:00:00";
     /* vm.minDate="2017-05-24T00:00:00";
      console.log("vm.minDate");
      console.log(vm.minDate);*/

      vm.startDate=new Date();
      vm.startDate.setDate(new Date().getDate() -1);
      vm.endDate=new Date();
      vm.startTime=vm.startDate;
      vm.endTime=new Date();
      vm.maxDate=new Date();

      vm.isRenderAll=true;

      vm.isElectricityPriceChecked=false;
      vm.isLoadLimitChecked=false;
      vm.isPVFeedinChecked=false;
      vm.isCHPFeedinChecked=false;
      vm.isBuildingNetChecked=false;
      vm.isBuildingConChecked=false;
      vm.isBuildingGenChecked=false;
      vm.isCommunityNetChecked=false;
      vm.isCommunityConChecked=false;
      vm.isCommunityGenChecked=false;

      vm.electricityPrices = [];
      vm.pvFeedinPrices = [];
      vm.chpFeedinPrices = [];
      vm.powerUpperLimitData = [];
      vm.powerLowerLimitData = [];

      vm.startTimeStamp =(vm.startTime.getTime())/ 1000 | 0;

      vm.endTimeStamp =(vm.endTime.getTime())/ 1000 | 0;

      vm.getHistoricalLoadLimitData=function (starttime,endtime) {
        vm.isRenderAll=false;

        vm.startTimeStamp =starttime/ 1000 | 0;
        vm.endTimeStamp =endtime/ 1000 | 0;

        if(vm.isLoadLimitChecked){

          vm.wampSession.call('wamp.subscription.get_events', [2130467936619965, 1]).then(
            function (history) {
              if (history.length !== 0) {

                var loadLimitSignals = history[0]['args'][0]['ACTIVEPOWEREXTERNAL']['powerLimits'];
                var timeList = Object.keys(loadLimitSignals);
                var powerList = Object.values(loadLimitSignals);
                vm.powerUpperLimitData = [];
                vm.powerLowerLimitData = [];



                  for (var i = 0; i < timeList.length; i++) {
                    if (timeList[i] >= vm.startTimeStamp && timeList[i] <= vm.endTimeStamp) {
                      var upperLoadLimit = {"x": timeList[i], "y": powerList[i]['powerUpperLimit']};
                      vm.powerUpperLimitData.push(upperLoadLimit);
                      var lowerLoadLimit = {"x": timeList[i], "y": powerList[i]['powerLowerLimit']};
                      vm.powerLowerLimitData.push(lowerLoadLimit);
                    //  console.log(powerList[i]['powerLowerLimit']);

                    }
                  }
                  if (vm.powerUpperLimitData.length == 0) {
                    var upperLoadLimit = {"x": vm.startTimeStamp, "y": powerList[0]['powerUpperLimit']};
                    vm.powerUpperLimitData.push(upperLoadLimit);

                    var lowerLoadLimit = {"x": vm.startTimeStamp, "y": powerList[0]['powerLowerLimit']};
                    vm.powerLowerLimitData.push(lowerLoadLimit);

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

                  //fill in missing values
                  var firstValue=vm.powerLowerLimitData[0];
                  var tempArray=new Array();
                  tempArray.push(firstValue);
                  for(var i=1;i<vm.powerLowerLimitData.length;i++) {
                    var secondValue = vm.powerLowerLimitData[i];
                    if (secondValue['x'] - firstValue['x'] > 60) {
                      for(var j=firstValue['x'];j<=secondValue['x'];j+=60) {
                        var item={"x":j,"y":firstValue['y']};
                        tempArray.push(item);
                      }
                    }
                    tempArray.push(secondValue);
                    firstValue=secondValue;

                  }
                  vm.powerLowerLimitData=tempArray;


                  if (vm.powerUpperLimitData[0]['x'] > vm.startTimeStamp) {
                    var tempArray1 = new Array();
                    var tempArray2 = new Array();
                    for (var time = vm.startTimeStamp; time < vm.powerUpperLimitData[0]['x']; time += 60) {
                      var upperLoadLimit = {"x": time, "y": vm.powerUpperLimitData[0]['y']};
                      tempArray1.push(upperLoadLimit);

                      var lowerLoadLimit = {"x": time, "y": vm.powerLowerLimitData[0]['y']};
                      tempArray2.push(lowerLoadLimit);
                    }
                    if (tempArray1.length > 0) {
                      vm.powerUpperLimitData = tempArray1.concat(vm.powerUpperLimitData);
                    }
                    if (tempArray2.length > 0) {
                      vm.powerLowerLimitData = tempArray2.concat(vm.powerLowerLimitData);
                    }
                  }

                  if (vm.powerUpperLimitData[vm.powerUpperLimitData.length - 1]['x'] < vm.endTimeStamp) {
                    for (var time = vm.powerUpperLimitData[vm.powerUpperLimitData.length - 1]['x'] + 60; time <= vm.endTimeStamp; time += 60) {
                      var upperLoadLimit = {"x": time, "y": powerList[powerList.length - 1]['powerUpperLimit']};
                      vm.powerUpperLimitData.push(upperLoadLimit);

                      var lowerLoadLimit = {"x": time, "y": -powerList[powerList.length - 1]['powerLowerLimit']};
                      vm.powerLowerLimitData.push(lowerLoadLimit);
                    }
                  }

                 /* vm.powerUpperLimit=vm.powerUpperLimitData[0]['y'];
                  vm.powerLowerLimit=vm.powerLowerLimitData[0]['y'];*/

                var maxBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.max.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
                var maxBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.max.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;
                var maxBuildingNet=vm.buildingNetEnergyData.length>0?Math.max.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;
                var maxCommunityNet=vm.communityNetEnergyData.length>0?Math.max.apply(Math,vm.communityNetEnergyData.map(function(o){return o.y;})):0;
                var maxCommunityConsumption=vm.communityEnergyConsumptionData.length>0?Math.max.apply(Math,vm.communityEnergyConsumptionData.map(function(o){return o.y;})):0;
                var maxCommunityGeneration=vm.communityEnergyGenerationData.length>0?Math.max.apply(Math,vm.communityEnergyGenerationData.map(function(o){return o.y;})):0;

                var maxArr=[];
                maxArr.push(maxBuildingGeneration);
                maxArr.push(maxBuildingConsumption);
                maxArr.push(maxBuildingNet);
                maxArr.push(maxCommunityGeneration);
                maxArr.push(maxCommunityConsumption);
                maxArr.push(maxCommunityNet);

                var maxY=Math.max.apply(Math,maxArr);

                var minBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.min.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
                var minBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.min.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;
                var minBuildingNet=vm.buildingNetEnergyData.length>0?Math.min.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;
                var minCommunityNet=vm.communityNetEnergyData.length>0?Math.min.apply(Math,vm.communityNetEnergyData.map(function(o){return o.y;})):0;
                var minCommunityConsumption=vm.communityEnergyConsumptionData.length>0?Math.min.apply(Math,vm.communityEnergyConsumptionData.map(function(o){return o.y;})):0;
                var minCommunityGeneration=vm.communityEnergyGenerationData.length>0?Math.min.apply(Math,vm.communityEnergyGenerationData.map(function(o){return o.y;})):0;

                var minArr=[];
                minArr.push(minBuildingGeneration);
                minArr.push(minBuildingConsumption);
                minArr.push(minBuildingNet);
                minArr.push(minCommunityGeneration);
                minArr.push(minCommunityConsumption);
                minArr.push(minCommunityNet);

                var minY=Math.min.apply(Math,minArr);

                var maxLoadLimit=Math.max.apply(Math,vm.powerUpperLimitData.map(function(o){return o.y;}));
                var minLoadLimit=Math.min.apply(Math,vm.powerLowerLimitData.map(function(o){return o.y;}));

                var thresholdValue=Math.max(Math.abs(minY),Math.abs(maxY));

                if( Math.abs(maxLoadLimit)<=thresholdValue && Math.abs( minLoadLimit)<=thresholdValue){
                  vm.isRenderY1=false;
                }else{
                  vm.isRenderY1=true;
                }

              }
            },
            function (error) {
              console.log(error);
            }
          );
        }


      }

      vm.getHistoricalEnergyPriceData=function (starttime,endtime,type) {

        vm.isRenderAll=false;

        vm.startTimeStamp =starttime/ 1000 | 0;
        vm.endTimeStamp =endtime/ 1000 | 0;

          // history eshl.signals.eps
          vm.wampSession.call('wamp.subscription.get_events', [577174112086625, 1]).then(
            function (history) {
              if (history.length !== 0) {

             //   console.log("history eshl.signals.eps!");

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

                    /*if (vm.electricityPrices[0]['x'] > vm.startTimeStamp) {
                     var tempArray=new Array();
                     for (var time = vm.startTimeStamp; time < vm.electricityPrices[0]['x']; time += 60) {
                     var electricityPrice = {"x": time, "y":  vm.electricityPrices[0]['y']};
                     // vm.electricityPrices.push(electricityPrice);
                     tempArray.push(electricityPrice);
                     }
                     if(tempArray.length>0){
                     vm.electricityPrices=tempArray.concat(vm.electricityPrices);
                     }

                     }
                     if (vm.electricityPrices[vm.electricityPrices.length - 1]['x'] < vm.endTimeStamp) {
                     for (var time = vm.electricityPrices[vm.electricityPrices.length - 1]['x'] + 60; time <= vm.endTimeStamp; time += 60) {
                     var electricityPrice = {"x": time, "y": vm.electricityPrices[vm.electricityPrices.length - 1]['y']};
                     vm.electricityPrices.push(electricityPrice);
                     }
                     }*/

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

      vm.buildingNetEnergyData = [];

      vm.getHistoricalBuildingNetEnergyData=function (starttime,endtime) {
        vm.isRenderAll=false;
        vm.startTimeStamp =starttime/ 1000 | 0;
        vm.endTimeStamp =endtime/ 1000 | 0;

        var record1=[];
        var record2=[];
        var record3=[];
        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['01','P1', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              vm.buildingNetEnergyData = [];
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                record1.push(newRecord);
              }
            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );

        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['01','P2', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              vm.buildingNetEnergyData = [];
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                record2.push(newRecord);
              }

            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );

        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['01','P3', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              vm.buildingNetEnergyData = [];
              var tempNetData=[];
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                record3.push(newRecord);
              }

              for( var i in record3){
                if(record3[i].x===record2[i].x && record1[i].x===record3[i].x){
                  if(1000*record3[i].x>=starttime && 1000*record3[i].x<=endtime){
                    var newRecord={"x":record3[i].x, "y":record1[i].y+record2[i].y+record3[i].y};
                   // vm.buildingNetEnergyData.push(newRecord);
                    tempNetData.push(newRecord);
                  }

                }

              }

              for(var i=0;i<tempNetData.length-1;i++){

                var time1=tempNetData[i].x;
                var value1=tempNetData[i].y;
                var time2=tempNetData[i+1].x;
                var value2=tempNetData[i+1].y;

                var net={"x": time1, "y":value1};
                vm.buildingNetEnergyData.push(net);

                if((value1!==value2)&& (time1!==time2)){
                  var net={"x": time2, "y":value1};
                  vm.buildingNetEnergyData.push(net);
                }

                var net={"x": time2, "y":value2};
                vm.buildingNetEnergyData.push(net);

              }

              var maxPowerLimit=vm.powerUpperLimitData.length>0?Math.max.apply(Math,vm.powerUpperLimitData.map(function(o){return o.y;})):0;
              var maxBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.max.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
              var maxBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.max.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;

              var maxArr=[];
              maxArr.push(maxPowerLimit);
              maxArr.push(maxBuildingGeneration);
              maxArr.push(maxBuildingConsumption);

              var maxY=Math.max.apply(Math,maxArr);

              var minPowerLimit=vm.powerLowerLimitData.length>0?Math.min.apply(Math,vm.powerLowerLimitData.map(function(o){return o.y;})):0;
              var minBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.min.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
              var minBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.min.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;

              var minArr=[];
              minArr.push(minPowerLimit);
              minArr.push(minBuildingGeneration);
              minArr.push(minBuildingConsumption);

              var minY=Math.min.apply(Math,minArr);
              var thresholdValue=Math.max(Math.abs(minY),Math.abs(maxY));

              var maxBuildingNet=Math.max.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;}));
              var minBuildingNet=Math.min.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;}));

              if(Math.abs(maxBuildingNet)<=thresholdValue && Math.abs(minBuildingNet)<=thresholdValue){
                vm.isRenderY1=false;
              }else{
                vm.isRenderY1=true;
              }

            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );


      }

      vm.buildingEnergyGenerationData = [];
      vm.getHistoricalBuildingEnergyGenerationData=function (starttime,endtime) {
        vm.isRenderAll=false;
        vm.startTimeStamp =starttime/ 1000 | 0;
        vm.endTimeStamp =endtime/ 1000 | 0;
        var chpEnergyGenerationData = [];

        var chp_record1=[];
        var chp_record2=[];
        var chp_record3=[];

        vm.buildingEnergyGenerationData = [];

        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['02','P1', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                if(1000*newRecord.x>=starttime && 1000*newRecord.x<=endtime){
                  if(newRecord.y>0){
                    newRecord.y=0;
                  }
                  chp_record1.push(newRecord);
                }

              }
            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );
        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['02','P2', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                if(1000*newRecord.x>=starttime && 1000*newRecord.x<=endtime){
                  if(newRecord.y>0){
                    newRecord.y=0;
                  }
                  chp_record2.push(newRecord);
                }

              }
            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );
        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['02','P3', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                if(1000*newRecord.x>=starttime && 1000*newRecord.x<=endtime){
                  if(newRecord.y>0){
                    newRecord.y=0;
                  }
                  chp_record3.push(newRecord);
                }


              }
              for( var i in chp_record3){
                if(chp_record3[i].x===chp_record2[i].x && chp_record1[i].x===chp_record3[i].x){
                  if(1000*chp_record3[i].x>=starttime && 1000*chp_record3[i].x<=endtime){
                    var newRecord={"x":chp_record3[i].x, "y":chp_record1[i].y+chp_record2[i].y+chp_record3[i].y};
                    if(newRecord.y>0){
                      newRecord.y=0;
                    }
                    chpEnergyGenerationData.push(newRecord);
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

        var pvEnergyGenerationData = [];

        var pv_record1=[];
        var pv_record2=[];
        var pv_record3=[];

        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['04','P1', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                if(1000*newRecord.x>=starttime && 1000*newRecord.x<=endtime){
                  if(newRecord.y>0){
                    newRecord.y=0;
                  }
                  pv_record1.push(newRecord);
                }

              }
            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );
        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['04','P2', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                if(1000*newRecord.x>=starttime && 1000*newRecord.x<=endtime){
                  if(newRecord.y>0){
                    newRecord.y=0;
                  }
                  pv_record2.push(newRecord);
                }

              }
            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );
        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['04','P3', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                if(1000*newRecord.x>=starttime && 1000*newRecord.x<=endtime){
                  if(newRecord.y>0){
                    newRecord.y=0;
                  }
                  pv_record3.push(newRecord);
                }

              }
              for( var i in pv_record3){
                if(pv_record3[i].x===pv_record2[i].x && pv_record1[i].x===pv_record3[i].x){
                  if(1000*pv_record3[i].x>=starttime && 1000*pv_record3[i].x<=endtime){
                    var newRecord={"x":pv_record3[i].x, "y":pv_record1[i].y+pv_record2[i].y+pv_record3[i].y};
                    if(newRecord.y>0){
                      newRecord.y=0;
                    }
                    pvEnergyGenerationData.push(newRecord);
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

        var timeout = setInterval(function()
        {
          if(pvEnergyGenerationData.length>2 && chpEnergyGenerationData.length>2) {
            clearInterval(timeout);
            var tempGenData=[];
            for(var i in chpEnergyGenerationData){
              if(chpEnergyGenerationData[i].x==pvEnergyGenerationData[i].x)
              var newRecord={"x":chpEnergyGenerationData[i].x,"y":chpEnergyGenerationData[i].y+pvEnergyGenerationData[i].y};
              //vm.buildingEnergyGenerationData.push(newRecord);
              tempGenData.push(newRecord);
            }

            for(var i=0;i<tempGenData.length-1;i++){

              var time1=tempGenData[i].x;
              var value1=tempGenData[i].y;
              var time2=tempGenData[i+1].x;
              var value2=tempGenData[i+1].y;

              var gen={"x": time1, "y":value1};
              vm.buildingEnergyGenerationData.push(gen);

              if((value1!==value2)&& (time1!==time2)){
                var gen={"x": time2, "y":value1};
                vm.buildingEnergyGenerationData.push(gen);
              }

              var gen={"x": time2, "y":value2};
              vm.buildingEnergyGenerationData.push(gen);

            }

            var maxPowerLimit=vm.powerUpperLimitData.length>0?Math.max.apply(Math,vm.powerUpperLimitData.map(function(o){return o.y;})):0;
            var maxBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.max.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;
            var maxBuildingNet=vm.buildingNetEnergyData.length>0?Math.max.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;

            var maxArr=[];
            maxArr.push(maxPowerLimit);
            maxArr.push(maxBuildingConsumption);
            maxArr.push(maxBuildingNet);

            var maxY=Math.max.apply(Math,maxArr);

            var minPowerLimit=vm.powerLowerLimitData.length>0?Math.min.apply(Math,vm.powerLowerLimitData.map(function(o){return o.y;})):0;
            var minBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.min.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;
            var minBuildingNet=vm.buildingNetEnergyData.length>0?Math.min.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;

            var minArr=[];
            minArr.push(minPowerLimit);
            minArr.push(minBuildingConsumption);
            minArr.push(minBuildingNet);

            var minY=Math.min.apply(Math,minArr);

            var maxBuildingGeneration=Math.max.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;}));
            var minBuildingGeneration=Math.min.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;}));


            var thresholdValue=Math.max(Math.abs(minY),Math.abs(maxY));
            if(Math.abs(maxBuildingGeneration)<=thresholdValue && Math.abs(minBuildingGeneration)<=thresholdValue){
              vm.isRenderY1=false;
            }else{
              vm.isRenderY1=true;
            }
          }
        }, 100);

      }

      vm.buildingEnergyConsumptionData = [];
      vm.getHistoricalBuildingEnergyConsumptionData=function (starttime,endtime) {
        vm.isRenderAll=false;
        vm.startTimeStamp =starttime/ 1000 | 0;
        vm.endTimeStamp =endtime/ 1000 | 0;
        vm.buildingEnergyConsumptionData = [];


        var record1=[];
        var record2=[];
        var record3=[];
        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['01','P1', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                record1.push(newRecord);
              }
            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );

        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['01','P2', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                record2.push(newRecord);
              }

            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );

        var buildingNet=[];
        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['01','P3', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                record3.push(newRecord);
              }

              for( var i in record3){
                if(record3[i].x===record2[i].x && record1[i].x===record3[i].x){
                  if(1000*record3[i].x>=starttime && 1000*record3[i].x<=endtime){
                    var newRecord={"x":record3[i].x, "y":record1[i].y+record2[i].y+record3[i].y};
                    buildingNet.push(newRecord);
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


        var chpEnergyGenerationData = [];

        var chp_record1=[];
        var chp_record2=[];
        var chp_record3=[];

        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['02','P1', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                if(newRecord.y>0){
                  newRecord.y=0;
                }
                chp_record1.push(newRecord);
              }
            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );
        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['02','P2', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                if(newRecord.y>0){
                  newRecord.y=0;
                }
                chp_record2.push(newRecord);
              }
            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );
        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['02','P3', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                chp_record3.push(newRecord);
              }
              for( var i in chp_record3){
                if(chp_record3[i].x===chp_record2[i].x && chp_record1[i].x===chp_record3[i].x){
                  if(1000*chp_record3[i].x>=starttime && 1000*chp_record3[i].x<=endtime){
                    var newRecord={"x":chp_record3[i].x, "y":chp_record1[i].y+chp_record2[i].y+chp_record3[i].y};
                    if(newRecord.y>0){
                      newRecord.y=0;
                    }
                    chpEnergyGenerationData.push(newRecord);
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

        var pvEnergyGenerationData = [];

        var pv_record1=[];
        var pv_record2=[];
        var pv_record3=[];

        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['04','P1', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                if(newRecord.y>0){
                  newRecord.y=0;
                }
                pv_record1.push(newRecord);
              }
            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );
        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['04','P2', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                if(newRecord.y>0){
                  newRecord.y=0;
                }
                pv_record2.push(newRecord);
              }
            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );
        var buildingGeneration=[];
        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['04','P3', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                pv_record3.push(newRecord);
              }
              for( var i in pv_record3){
                if(pv_record3[i].x===pv_record2[i].x && pv_record1[i].x===pv_record3[i].x){
                  if(1000*pv_record3[i].x>=starttime && 1000*pv_record3[i].x<=endtime){
                    var newRecord={"x":pv_record3[i].x, "y":pv_record1[i].y+pv_record2[i].y+pv_record3[i].y};
                    if(newRecord.y>0){
                      newRecord.y=0;
                    }
                    pvEnergyGenerationData.push(newRecord);
                  }

                }
              }

              var timeout = setInterval(function()
              {
                if(pvEnergyGenerationData.length>2 && chpEnergyGenerationData.length>2) {

                  for(var i in chpEnergyGenerationData){
                    if(chpEnergyGenerationData[i].x==pvEnergyGenerationData[i].x)
                      var newRecord={"x":chpEnergyGenerationData[i].x,"y":chpEnergyGenerationData[i].y+pvEnergyGenerationData[i].y};
                    buildingGeneration.push(newRecord);
                  }

                  var tempConData=[];
                  if(buildingNet.length>2 && buildingGeneration.length>2) {
                    clearInterval(timeout);
                    for(var i in buildingNet){
                      if(buildingNet[i].x==buildingGeneration[i].x){
                        var newRecord={"x":buildingNet[i].x, "y":buildingNet[i].y-buildingGeneration[i].y};
                        //vm.buildingEnergyConsumptionData.push(newRecord);
                        tempConData.push(newRecord);
                      }
                    }

                    for(var i=0;i<tempConData.length-1;i++){

                      var time1=tempConData[i].x;
                      var value1=tempConData[i].y;
                      var time2=tempConData[i+1].x;
                      var value2=tempConData[i+1].y;

                      var con={"x": time1, "y":value1};
                      vm.buildingEnergyConsumptionData.push(con);

                      if((value1!==value2)&& (time1!==time2)){
                        var con={"x": time2, "y":value1};
                        vm.buildingEnergyConsumptionData.push(con);
                      }

                      var con={"x": time2, "y":value2};
                      vm.buildingEnergyConsumptionData.push(con);

                    }

                    var maxPowerLimit=vm.powerUpperLimitData.length>0?Math.max.apply(Math,vm.powerUpperLimitData.map(function(o){return o.y;})):0;
                    var maxBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.max.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
                    var maxBuildingNet=vm.buildingNetEnergyData.length>0?Math.max.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;

                    var maxArr=[];
                    maxArr.push(maxPowerLimit);
                    maxArr.push(maxBuildingGeneration);
                    maxArr.push(maxBuildingNet);

                    var maxY=Math.max.apply(Math,maxArr);

                    var minPowerLimit=vm.powerLowerLimitData.length>0?Math.min.apply(Math,vm.powerLowerLimitData.map(function(o){return o.y;})):0;
                    var minBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.min.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
                    var minBuildingNet=vm.buildingNetEnergyData.length>0?Math.min.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;

                    var minArr=[];
                    minArr.push(minPowerLimit);
                    minArr.push(minBuildingGeneration);
                    minArr.push(minBuildingNet);

                    var minY=Math.min.apply(Math,minArr);

                    var maxBuildingCon=Math.max.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;}));
                    var minBuildingCon=Math.min.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;}));

                    var thresholdValue=Math.max(Math.abs(minY),Math.abs(maxY));

                    if(Math.abs(maxBuildingCon)<=thresholdValue && Math.abs(minBuildingCon)<=thresholdValue){
                      vm.isRenderY1=false;
                    }else{
                      vm.isRenderY1=true;
                    }
                    clearInterval(timeout);
                  }
                }
              }, 100);




            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );

       /* var timeout = setInterval(function()
        {
          console.log("buildingNet");
          console.log(buildingNet.length);

          if(buildingNet.length>2 && buildingGeneration.length>2) {
            clearInterval(timeout);
            for(var i in buildingNet){
              if(buildingNet[i].x==buildingGeneration[i].x){
                var newRecord={"x":buildingNet[i].x, "y":buildingNet[i].y-buildingGeneration[i].y};
                vm.buildingEnergyConsumptionData.push(newRecord);
              }
            }
            console.log(vm.buildingEnergyConsumptionData);
          }
        }, 100);*/


      }

      vm.communityNetEnergyData = [];
      vm.getHistoricalCommunityNetEnergyData=function (starttime,endtime) {
        vm.isRenderAll=false;
        vm.startTimeStamp =starttime/ 1000 | 0;
        vm.endTimeStamp =endtime/ 1000 | 0;

        vm.communityNetEnergyData=[];
        var record1=[];
        var record2=[];
        var record3=[];
        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['01','P1', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                record1.push(newRecord);
              }
            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );

        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['01','P2', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                record2.push(newRecord);
              }

            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );

        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['01','P3', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                record3.push(newRecord);
              }

              var tempNetData=[];
              for( var i in record3){
                if(record3[i].x===record2[i].x && record1[i].x===record3[i].x){
                  if(1000*record3[i].x>=starttime && 1000*record3[i].x<=endtime){
                    var newRecord={"x":record3[i].x, "y":vm.randomArray1[i]+(record1[i].y+record2[i].y+record3[i].y)};
                    //vm.communityNetEnergyData.push(newRecord);
                    tempNetData.push(newRecord);
                  }

                }

              }

              for(var i=0;i<tempNetData.length-1;i++){

                var time1=tempNetData[i].x;
                var value1=tempNetData[i].y;
                var time2=tempNetData[i+1].x;
                var value2=tempNetData[i+1].y;

                var net={"x": time1, "y":value1};
                vm.communityNetEnergyData.push(net);

                if((value1!==value2)&& (time1!==time2)){
                  var net={"x": time2, "y":value1};
                  vm.communityNetEnergyData.push(net);
                }

                var net={"x": time2, "y":value2};
                vm.communityNetEnergyData.push(net);

              }

              var maxPowerLimit=vm.powerUpperLimitData.length>0?Math.max.apply(Math,vm.powerUpperLimitData.map(function(o){return o.y;})):0;
              var maxBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.max.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;
              var maxBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.max.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
              var maxBuildingNet=vm.buildingNetEnergyData.length>0?Math.max.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;
              var maxCommunityGeneration=vm.communityEnergyGenerationData.length>0?Math.max.apply(Math,vm.communityEnergyGenerationData.map(function(o){return o.y;})):0;
              var maxCommunityConsumption=vm.communityEnergyConsumptionData.length>0?Math.max.apply(Math,vm.communityEnergyConsumptionData.map(function(o){return o.y;})):0;

              var maxArr=[];
              maxArr.push(maxPowerLimit);
              maxArr.push(maxBuildingConsumption);
              maxArr.push(maxBuildingGeneration);
              maxArr.push(maxBuildingNet);
              maxArr.push(maxCommunityGeneration);
              maxArr.push(maxCommunityConsumption);

              var maxY=Math.max.apply(Math,maxArr);

              var minPowerLimit=vm.powerLowerLimitData.length>0?Math.min.apply(Math,vm.powerLowerLimitData.map(function(o){return o.y;})):0;
              var minBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.min.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;
              var minBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.min.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
              var minBuildingNet=vm.buildingNetEnergyData.length>0?Math.min.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;
              var minCommunityGeneration=vm.communityEnergyGenerationData.length>0?Math.min.apply(Math,vm.communityEnergyGenerationData.map(function(o){return o.y;})):0;
              var minCommunityConsumption=vm.communityEnergyConsumptionData.length>0?Math.min.apply(Math,vm.communityEnergyConsumptionData.map(function(o){return o.y;})):0;

              var minArr=[];
              minArr.push(minPowerLimit);
              minArr.push(minBuildingConsumption);
              minArr.push(minBuildingGeneration);
              minArr.push(minBuildingNet);
              minArr.push(minCommunityGeneration);
              minArr.push(minCommunityConsumption);

              var minY=Math.min.apply(Math,minArr);
              var thresholdValue=Math.max(Math.abs(minY),Math.abs(maxY));

              var maxCommunityNet=Math.max.apply(Math,vm.communityNetEnergyData.map(function(o){return o.y;}));
              var minCommunityNet=Math.min.apply(Math,vm.communityNetEnergyData.map(function(o){return o.y;}));

              if(Math.abs(maxCommunityNet)<=thresholdValue && Math.abs(minCommunityNet)<=thresholdValue){
                vm.isRenderY1=false;
              }else{
                vm.isRenderY1=true;
              }

            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );
      }

      vm.communityEnergyGenerationData = [];
      vm.getHistoricalCommunityEnergyGenerationData=function (starttime,endtime) {

        vm.isRenderAll=false;
        vm.startTimeStamp =starttime/ 1000 | 0;
        vm.endTimeStamp =endtime/ 1000 | 0;
        var chpEnergyGenerationData = [];

        var chp_record1=[];
        var chp_record2=[];
        var chp_record3=[];

        vm.communityEnergyGenerationData = [];

        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['02','P1', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                if(newRecord.y>0){
                  newRecord.y=0;
                }
                chp_record1.push(newRecord);
              }
            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );
        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['02','P2', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                if(newRecord.y>0){
                  newRecord.y=0;
                }
                chp_record2.push(newRecord);
              }
            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );
        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['02','P3', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                chp_record3.push(newRecord);
              }
              for( var i in chp_record3){
                if(chp_record3[i].x===chp_record2[i].x && chp_record1[i].x===chp_record3[i].x){
                  if(1000*chp_record3[i].x>=starttime && 1000*chp_record3[i].x<=endtime){
                    var newRecord={"x":chp_record3[i].x, "y":vm.randomArray2[i]+(chp_record1[i].y+chp_record2[i].y+chp_record3[i].y)};
                    if(newRecord.y>0){
                      newRecord.y=0;
                    }
                    chpEnergyGenerationData.push(newRecord);
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

        var pvEnergyGenerationData = [];

        var pv_record1=[];
        var pv_record2=[];
        var pv_record3=[];

        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['04','P1', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                if(newRecord.y>0){
                  newRecord.y=0;
                }
                pv_record1.push(newRecord);
              }
            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );
        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['04','P2', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                if(newRecord.y>0){
                  newRecord.y=0;
                }
                pv_record2.push(newRecord);
              }
            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );
        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['04','P3', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                pv_record3.push(newRecord);
              }
              for( var i in pv_record3){
                if(pv_record3[i].x===pv_record2[i].x && pv_record1[i].x===pv_record3[i].x){
                  if(1000*pv_record3[i].x>=starttime && 1000*pv_record3[i].x<=endtime){
                    var newRecord={"x":pv_record3[i].x, "y":vm.randomArray2[i]+(pv_record1[i].y+pv_record2[i].y+pv_record3[i].y)};
                    if(newRecord.y>0){
                      newRecord.y=0;
                    }
                    pvEnergyGenerationData.push(newRecord);
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

        var timeout = setInterval(function()
        {
          if(pvEnergyGenerationData.length>2 && chpEnergyGenerationData.length>2) {
            clearInterval(timeout);
            var tempGenData=[];
            for(var i in chpEnergyGenerationData){
              if(chpEnergyGenerationData[i].x==pvEnergyGenerationData[i].x)
                var newRecord={"x":chpEnergyGenerationData[i].x,"y":chpEnergyGenerationData[i].y+pvEnergyGenerationData[i].y};
                //vm.communityEnergyGenerationData.push(newRecord);
              tempGenData.push(newRecord);
            }

            for(var i=0;i<tempGenData.length-1;i++){

              var time1=tempGenData[i].x;
              var value1=tempGenData[i].y;
              var time2=tempGenData[i+1].x;
              var value2=tempGenData[i+1].y;

              var gen={"x": time1, "y":value1};
              vm.communityEnergyGenerationData.push(gen);

              if((value1!==value2)&& (time1!==time2)){
                var gen={"x": time2, "y":value1};
                vm.communityEnergyGenerationData.push(gen);
              }

              var gen={"x": time2, "y":value2};
              vm.communityEnergyGenerationData.push(gen);

            }

            var maxPowerLimit=vm.powerUpperLimitData.length>0?Math.max.apply(Math,vm.powerUpperLimitData.map(function(o){return o.y;})):0;
            var maxBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.max.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;
            var maxBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.max.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
            var maxBuildingNet=vm.buildingNetEnergyData.length>0?Math.max.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;
            var maxCommunityNet=vm.communityNetEnergyData.length>0?Math.max.apply(Math,vm.communityNetEnergyData.map(function(o){return o.y;})):0;
            var maxCommunityConsumption=vm.communityEnergyConsumptionData.length>0?Math.max.apply(Math,vm.communityEnergyConsumptionData.map(function(o){return o.y;})):0;

            var maxArr=[];
            maxArr.push(maxPowerLimit);
            maxArr.push(maxBuildingConsumption);
            maxArr.push(maxBuildingGeneration);
            maxArr.push(maxBuildingNet);
            maxArr.push(maxCommunityNet);
            maxArr.push(maxCommunityConsumption);

            var maxY=Math.max.apply(Math,maxArr);

            var minPowerLimit=vm.powerLowerLimitData.length>0?Math.min.apply(Math,vm.powerLowerLimitData.map(function(o){return o.y;})):0;
            var minBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.min.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;
            var minBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.min.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
            var minBuildingNet=vm.buildingNetEnergyData.length>0?Math.min.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;
            var minCommunityNet=vm.communityNetEnergyData.length>0?Math.min.apply(Math,vm.communityNetEnergyData.map(function(o){return o.y;})):0;
            var minCommunityConsumption=vm.communityEnergyConsumptionData.length>0?Math.min.apply(Math,vm.communityEnergyConsumptionData.map(function(o){return o.y;})):0;

            var minArr=[];
            minArr.push(minPowerLimit);
            minArr.push(minBuildingConsumption);
            minArr.push(minBuildingGeneration);
            minArr.push(minBuildingNet);
            minArr.push(minCommunityNet);
            minArr.push(minCommunityConsumption);

            var minY=Math.min.apply(Math,minArr);

            var maxCommunityGeneration=Math.max.apply(Math,vm.communityEnergyGenerationData.map(function(o){return o.y;}));
            var minCommunityGeneration=Math.min.apply(Math,vm.communityEnergyGenerationData.map(function(o){return o.y;}));


            var thresholdValue=Math.max(Math.abs(minY),Math.abs(maxY));
            if(Math.abs(maxCommunityGeneration)<=thresholdValue && Math.abs(minCommunityGeneration)<=thresholdValue){
              vm.isRenderY1=false;
            }else{
              vm.isRenderY1=true;
            }
          }
        }, 100);
      }

      vm.communityEnergyConsumptionData = [];
      vm.getHistoricalCommunityEnergyConsumptionData=function (starttime,endtime) {

        vm.isRenderAll=false;
        vm.startTimeStamp =starttime/ 1000 | 0;
        vm.endTimeStamp =endtime/ 1000 | 0;
        vm.communityEnergyConsumptionData = [];


        var record1=[];
        var record2=[];
        var record3=[];
        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['01','P1', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                record1.push(newRecord);
              }
            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );

        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['01','P2', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                record2.push(newRecord);
              }

            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );

        var buildingNet=[];
        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['01','P3', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                record3.push(newRecord);
              }

              for( var i in record3){
                if(record3[i].x===record2[i].x && record1[i].x===record3[i].x){
                  if(1000*record3[i].x>=starttime && 1000*record3[i].x<=endtime){
                    var newRecord={"x":record3[i].x, "y":vm.randomArray1[i]+(record1[i].y+record2[i].y+record3[i].y)};
                    buildingNet.push(newRecord);
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


        var chpEnergyGenerationData = [];

        var chp_record1=[];
        var chp_record2=[];
        var chp_record3=[];

        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['02','P1', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                if(newRecord.y>0){
                  newRecord.y=0;
                }
                chp_record1.push(newRecord);
              }
            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );
        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['02','P2', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                if(newRecord.y>0){
                  newRecord.y=0;
                }
                chp_record2.push(newRecord);
              }
            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );
        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['02','P3', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                chp_record3.push(newRecord);
              }
              for( var i in chp_record3){
                if(chp_record3[i].x===chp_record2[i].x && chp_record1[i].x===chp_record3[i].x){
                  if(1000*chp_record3[i].x>=starttime && 1000*chp_record3[i].x<=endtime){
                    var newRecord={"x":chp_record3[i].x, "y":vm.randomArray2[i]+(chp_record1[i].y+chp_record2[i].y+chp_record3[i].y)};
                    if(newRecord.y>0){
                      newRecord.y=0;
                    }
                    chpEnergyGenerationData.push(newRecord);
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

        var pvEnergyGenerationData = [];

        var pv_record1=[];
        var pv_record2=[];
        var pv_record3=[];

        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['04','P1', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                if(newRecord.y>0){
                  newRecord.y=0;
                }
                pv_record1.push(newRecord);
              }
            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );
        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['04','P2', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                if(newRecord.y>0){
                  newRecord.y=0;
                }
                pv_record2.push(newRecord);
              }
            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );
        var buildingGeneration=[];
        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['04','P3', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                pv_record3.push(newRecord);
              }
              for( var i in pv_record3){
                if(pv_record3[i].x===pv_record2[i].x && pv_record1[i].x===pv_record3[i].x){
                  if(1000*pv_record3[i].x>=starttime && 1000*pv_record3[i].x<=endtime){
                    var newRecord={"x":pv_record3[i].x, "y":vm.randomArray2[i]+(pv_record1[i].y+pv_record2[i].y+pv_record3[i].y)};
                    if(newRecord.y>0){
                      newRecord.y=0;
                    }
                    pvEnergyGenerationData.push(newRecord);
                  }

                }
              }

              var timeout = setInterval(function()
              {
                if(pvEnergyGenerationData.length>2 && chpEnergyGenerationData.length>2) {

                  for(var i in chpEnergyGenerationData){
                    if(chpEnergyGenerationData[i].x==pvEnergyGenerationData[i].x)
                      var newRecord={"x":chpEnergyGenerationData[i].x,"y":chpEnergyGenerationData[i].y+pvEnergyGenerationData[i].y};
                    buildingGeneration.push(newRecord);
                  }

                  if(buildingNet.length>2 && buildingGeneration.length>2) {
                    clearInterval(timeout);
                    var tempConData=[];
                    for(var i in buildingNet){
                      if(buildingNet[i].x==buildingGeneration[i].x){
                        var newRecord={"x":buildingNet[i].x, "y":buildingNet[i].y-buildingGeneration[i].y};
                        //vm.communityEnergyConsumptionData.push(newRecord);
                        tempConData.push(newRecord);
                      }
                    }

                    for(var i=0;i<tempConData.length-1;i++){

                      var time1=tempConData[i].x;
                      var value1=tempConData[i].y;
                      var time2=tempConData[i+1].x;
                      var value2=tempConData[i+1].y;

                      var con={"x": time1, "y":value1};
                      vm.communityEnergyConsumptionData.push(con);

                      if((value1!==value2)&& (time1!==time2)){
                        var con={"x": time2, "y":value1};
                        vm.communityEnergyConsumptionData.push(con);
                      }

                      var con={"x": time2, "y":value2};
                      vm.communityEnergyConsumptionData.push(con);

                    }

                    var maxPowerLimit=vm.powerUpperLimitData.length>0?Math.max.apply(Math,vm.powerUpperLimitData.map(function(o){return o.y;})):0;
                    var maxBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.max.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;
                    var maxBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.max.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
                    var maxBuildingNet=vm.buildingNetEnergyData.length>0?Math.max.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;
                    var maxCommunityNet=vm.communityNetEnergyData.length>0?Math.max.apply(Math,vm.communityNetEnergyData.map(function(o){return o.y;})):0;
                    var maxCommunityGeneration=vm.communityEnergyGenerationData.length>0?Math.max.apply(Math,vm.communityEnergyGenerationData.map(function(o){return o.y;})):0;

                    var maxArr=[];
                    maxArr.push(maxPowerLimit);
                    maxArr.push(maxBuildingConsumption);
                    maxArr.push(maxBuildingGeneration);
                    maxArr.push(maxBuildingNet);
                    maxArr.push(maxCommunityNet);
                    maxArr.push(maxCommunityGeneration);

                    var maxY=Math.max.apply(Math,maxArr);

                    var minPowerLimit=vm.powerLowerLimitData.length>0?Math.min.apply(Math,vm.powerLowerLimitData.map(function(o){return o.y;})):0;
                    var minBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.min.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;
                    var minBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.min.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
                    var minBuildingNet=vm.buildingNetEnergyData.length>0?Math.min.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;
                    var minCommunityNet=vm.communityNetEnergyData.length>0?Math.min.apply(Math,vm.communityNetEnergyData.map(function(o){return o.y;})):0;
                    var minCommunityGeneration=vm.communityEnergyGenerationData.length>0?Math.min.apply(Math,vm.communityEnergyGenerationData.map(function(o){return o.y;})):0;

                    var minArr=[];
                    minArr.push(minPowerLimit);
                    minArr.push(minBuildingConsumption);
                    minArr.push(minBuildingGeneration);
                    minArr.push(minBuildingNet);
                    minArr.push(minCommunityNet);
                    minArr.push(minCommunityGeneration);

                    var minY=Math.min.apply(Math,minArr);

                    var maxBuildingCon=Math.max.apply(Math,vm.communityEnergyConsumptionData.map(function(o){return o.y;}));
                    var minBuildingCon=Math.min.apply(Math,vm.communityEnergyConsumptionData.map(function(o){return o.y;}));

                    var thresholdValue=Math.max(Math.abs(minY),Math.abs(maxY));

                    if(Math.abs(maxBuildingCon)<=thresholdValue && Math.abs(minBuildingCon)<=thresholdValue){
                      vm.isRenderY1=false;
                    }else{
                      vm.isRenderY1=true;
                    }
                    clearInterval(timeout);
                  }
                }
              }, 100);




            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );
      }

      vm.isRenderY1=false;

      vm.getHistoricalData=function () {
        vm.startTime.setFullYear(vm.startDate.getFullYear());
        vm.startTime.setMonth(vm.startDate.getMonth());
        vm.startTime.setDate(vm.startDate.getDate());
        var starttime=vm.startTime.getTime();
        vm.endTime.setFullYear(vm.endDate.getFullYear());
        vm.endTime.setMonth(vm.endDate.getMonth());
        vm.endTime.setDate(vm.endDate.getDate());
        var endtime=vm.endTime.getTime();


        if(vm.isLoadLimitChecked){
          vm.getHistoricalLoadLimitData(starttime,endtime);
        }
        var paramterArr=[];
        var flag=false;
        if(vm.isElectricityPriceChecked){
          paramterArr.push("external");
          flag=true;
        }
        if(vm.isCHPFeedinChecked){
          paramterArr.push("chp");
          flag=true;
        }
        if(vm.isPVFeedinChecked){
          paramterArr.push("pv");
          flag=true;
        }
        if(flag){
          vm.getHistoricalEnergyPriceData(starttime,endtime,paramterArr);
        }
        if(vm.isBuildingConChecked){
          vm.getHistoricalBuildingEnergyConsumptionData(starttime,endtime);
        }
        if(vm.isBuildingGenChecked){
          vm.getHistoricalBuildingEnergyGenerationData(starttime,endtime);
        }
        if(vm.isBuildingNetChecked){
          vm.getHistoricalBuildingNetEnergyData(starttime,endtime);
        }
        if(vm.isCommunityConChecked){
          vm.getHistoricalCommunityEnergyConsumptionData(starttime,endtime);
        }
        if(vm.isCommunityGenChecked){
          vm.getHistoricalCommunityEnergyGenerationData(starttime,endtime);
        }
        if(vm.isCommunityNetChecked){
          vm.getHistoricalCommunityNetEnergyData(starttime,endtime);
        }

        vm.isButtonDisabled=true;
      }

      vm.checkElectricityPrice=function () {

        vm.startTime.setFullYear(vm.startDate.getFullYear());
        vm.startTime.setMonth(vm.startDate.getMonth());
        vm.startTime.setDate(vm.startDate.getDate());
        var starttime=vm.startTime.getTime();
        vm.endTime.setFullYear(vm.endDate.getFullYear());
        vm.endTime.setMonth(vm.endDate.getMonth());
        vm.endTime.setDate(vm.endDate.getDate());
        var endtime=vm.endTime.getTime();
        vm.isRenderY1=false;
        vm.isElectricityPriceChecked=!vm.isElectricityPriceChecked;
        if(vm.isElectricityPriceChecked){
          vm.getHistoricalEnergyPriceData(starttime,endtime,["external"]);
        }else{
          console.log("uncheck!!!");
          vm.electricityPrices = [];
        }

      };
      vm.checkLoadLimit=function () {

        vm.startTime.setFullYear(vm.startDate.getFullYear());
        vm.startTime.setMonth(vm.startDate.getMonth());
        vm.startTime.setDate(vm.startDate.getDate());
        var starttime=vm.startTime.getTime();
        vm.endTime.setFullYear(vm.endDate.getFullYear());
        vm.endTime.setMonth(vm.endDate.getMonth());
        vm.endTime.setDate(vm.endDate.getDate());
        var endtime=vm.endTime.getTime();

        vm.isLoadLimitChecked=!vm.isLoadLimitChecked;
        if(vm.isLoadLimitChecked){
          vm.getHistoricalLoadLimitData(starttime,endtime);
        }else{
          var maxBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.max.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
          var maxBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.max.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;
          var maxBuildingNet=vm.buildingNetEnergyData.length>0?Math.max.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;
          var maxCommunityNet=vm.communityNetEnergyData.length>0?Math.max.apply(Math,vm.communityNetEnergyData.map(function(o){return o.y;})):0;
          var maxCommunityConsumption=vm.communityEnergyConsumptionData.length>0?Math.max.apply(Math,vm.communityEnergyConsumptionData.map(function(o){return o.y;})):0;
          var maxCommunityGeneration=vm.communityEnergyGenerationData.length>0?Math.max.apply(Math,vm.communityEnergyGenerationData.map(function(o){return o.y;})):0;

          var maxArr=[];
          maxArr.push(maxBuildingGeneration);
          maxArr.push(maxBuildingConsumption);
          maxArr.push(maxBuildingNet);
          maxArr.push(maxCommunityGeneration);
          maxArr.push(maxCommunityConsumption);
          maxArr.push(maxCommunityNet);

          var maxY=Math.max.apply(Math,maxArr);

          var minBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.min.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
          var minBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.min.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;
          var minBuildingNet=vm.buildingNetEnergyData.length>0?Math.min.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;
          var minCommunityNet=vm.communityNetEnergyData.length>0?Math.min.apply(Math,vm.communityNetEnergyData.map(function(o){return o.y;})):0;
          var minCommunityConsumption=vm.communityEnergyConsumptionData.length>0?Math.min.apply(Math,vm.communityEnergyConsumptionData.map(function(o){return o.y;})):0;
          var minCommunityGeneration=vm.communityEnergyGenerationData.length>0?Math.min.apply(Math,vm.communityEnergyGenerationData.map(function(o){return o.y;})):0;

          var minArr=[];
          minArr.push(minBuildingGeneration);
          minArr.push(minBuildingConsumption);
          minArr.push(minBuildingNet);
          minArr.push(minCommunityGeneration);
          minArr.push(minCommunityConsumption);
          minArr.push(minCommunityNet);

          var minY=Math.min.apply(Math,minArr);

          var maxLoadLimit=Math.max.apply(Math,vm.powerUpperLimitData.map(function(o){return o.y;}));
          var minLoadLimit=Math.min.apply(Math,vm.powerLowerLimitData.map(function(o){return o.y;}));

          var thresholdValue=Math.max(Math.abs(minY),Math.abs(maxY));

          if( Math.abs(maxLoadLimit)<=thresholdValue && Math.abs(minLoadLimit)<=thresholdValue){
            vm.isRenderY1=false;
          }else{
            vm.isRenderY1=true;
          }

          vm.powerUpperLimitData = [];
          vm.powerLowerLimitData = [];
        }

      };
      vm.checkPVFeedin=function () {

        vm.startTime.setFullYear(vm.startDate.getFullYear());
        vm.startTime.setMonth(vm.startDate.getMonth());
        vm.startTime.setDate(vm.startDate.getDate());
        var starttime=vm.startTime.getTime();
        vm.endTime.setFullYear(vm.endDate.getFullYear());
        vm.endTime.setMonth(vm.endDate.getMonth());
        vm.endTime.setDate(vm.endDate.getDate());
        var endtime=vm.endTime.getTime();
        vm.isRenderY1=false;
        vm.isPVFeedinChecked=!vm.isPVFeedinChecked;
        if(vm.isPVFeedinChecked){
          vm.getHistoricalEnergyPriceData(starttime,endtime,["pv"]);
        }else{
          vm.pvFeedinPrices=[];
        }

      };
      vm.checkCHPFeedin=function () {

        vm.startTime.setFullYear(vm.startDate.getFullYear());
        vm.startTime.setMonth(vm.startDate.getMonth());
        vm.startTime.setDate(vm.startDate.getDate());
        var starttime=vm.startTime.getTime();
        vm.endTime.setFullYear(vm.endDate.getFullYear());
        vm.endTime.setMonth(vm.endDate.getMonth());
        vm.endTime.setDate(vm.endDate.getDate());
        var endtime=vm.endTime.getTime();
        vm.isRenderY1=false;

        vm.isCHPFeedinChecked=!vm.isCHPFeedinChecked;
        if(vm.isCHPFeedinChecked){
          vm.getHistoricalEnergyPriceData(starttime,endtime,["chp"]);
        }else{
          vm.chpFeedinPrices=[];
        }

      };
      vm.checkBuildingNet=function () {

        vm.startTime.setFullYear(vm.startDate.getFullYear());
        vm.startTime.setMonth(vm.startDate.getMonth());
        vm.startTime.setDate(vm.startDate.getDate());
        var starttime=vm.startTime.getTime();
        vm.endTime.setFullYear(vm.endDate.getFullYear());
        vm.endTime.setMonth(vm.endDate.getMonth());
        vm.endTime.setDate(vm.endDate.getDate());
        var endtime=vm.endTime.getTime();

        vm.isBuildingNetChecked=!vm.isBuildingNetChecked;
        if(vm.isBuildingNetChecked){
          vm.getHistoricalBuildingNetEnergyData(starttime,endtime);
        }else{

          var maxPowerLimit=vm.powerUpperLimitData.length>0?Math.max.apply(Math,vm.powerUpperLimitData.map(function(o){return o.y;})):0;
          var minPowerLimit=vm.powerLowerLimitData.length>0?Math.min.apply(Math,vm.powerLowerLimitData.map(function(o){return o.y;})):0;

          var maxBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.max.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
          var maxBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.max.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;
          var maxCommunityNet=vm.communityNetEnergyData.length>0?Math.max.apply(Math,vm.communityNetEnergyData.map(function(o){return o.y;})):0;
          var maxCommunityConsumption=vm.communityEnergyConsumptionData.length>0?Math.max.apply(Math,vm.communityEnergyConsumptionData.map(function(o){return o.y;})):0;
          var maxCommunityGeneration=vm.communityEnergyGenerationData.length>0?Math.max.apply(Math,vm.communityEnergyGenerationData.map(function(o){return o.y;})):0;

          var maxArr=[];
          maxArr.push(maxPowerLimit);
          maxArr.push(maxBuildingGeneration);
          maxArr.push(maxBuildingConsumption);
          maxArr.push(maxCommunityGeneration);
          maxArr.push(maxCommunityConsumption);
          maxArr.push(maxCommunityNet);

          var maxY=Math.max.apply(Math,maxArr);

          var minBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.min.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
          var minBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.min.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;
          var minCommunityNet=vm.communityNetEnergyData.length>0?Math.min.apply(Math,vm.communityNetEnergyData.map(function(o){return o.y;})):0;
          var minCommunityConsumption=vm.communityEnergyConsumptionData.length>0?Math.min.apply(Math,vm.communityEnergyConsumptionData.map(function(o){return o.y;})):0;
          var minCommunityGeneration=vm.communityEnergyGenerationData.length>0?Math.min.apply(Math,vm.communityEnergyGenerationData.map(function(o){return o.y;})):0;

          var minArr=[];
          minArr.push(minPowerLimit);
          minArr.push(minBuildingGeneration);
          minArr.push(minBuildingConsumption);
          minArr.push(minCommunityGeneration);
          minArr.push(minCommunityConsumption);
          minArr.push(minCommunityNet);



          var minY=Math.min.apply(Math,minArr);

          var maxBuildingNet=Math.max.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;}));
          var minBuildingNet=Math.min.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;}));

          var thresholdValue=Math.max(Math.abs(minY),Math.abs(maxY));

          if(Math.abs(maxBuildingNet)<=thresholdValue && Math.abs(minBuildingNet)<=thresholdValue){
            vm.isRenderY1=false;
          }else{
            vm.isRenderY1=true;
          }

          vm.buildingNetEnergyData=[];

         /* vm.isRenderY1=true;
          setTimeout(function (){
            vm.isRenderY1=false;
          }, 1000);*/
        }

      };
      vm.checkBuildingCon=function () {

        vm.startTime.setFullYear(vm.startDate.getFullYear());
        vm.startTime.setMonth(vm.startDate.getMonth());
        vm.startTime.setDate(vm.startDate.getDate());
        var starttime=vm.startTime.getTime();
        vm.endTime.setFullYear(vm.endDate.getFullYear());
        vm.endTime.setMonth(vm.endDate.getMonth());
        vm.endTime.setDate(vm.endDate.getDate());
        var endtime=vm.endTime.getTime();

        vm.isBuildingConChecked=!vm.isBuildingConChecked;
        if(vm.isBuildingConChecked){
          vm.getHistoricalBuildingEnergyConsumptionData(starttime,endtime);
        }else{
          var maxPowerLimit=vm.powerUpperLimitData.length>0?Math.max.apply(Math,vm.powerUpperLimitData.map(function(o){return o.y;})):0;
          var minPowerLimit=vm.powerLowerLimitData.length>0?Math.min.apply(Math,vm.powerLowerLimitData.map(function(o){return o.y;})):0;

          var maxBuildingNet=vm.buildingNetEnergyData.length>0?Math.max.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;
          var maxBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.max.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
          var maxCommunityNet=vm.communityNetEnergyData.length>0?Math.max.apply(Math,vm.communityNetEnergyData.map(function(o){return o.y;})):0;
          var maxCommunityConsumption=vm.communityEnergyConsumptionData.length>0?Math.max.apply(Math,vm.communityEnergyConsumptionData.map(function(o){return o.y;})):0;
          var maxCommunityGeneration=vm.communityEnergyGenerationData.length>0?Math.max.apply(Math,vm.communityEnergyGenerationData.map(function(o){return o.y;})):0;

          var maxArr=[];
          maxArr.push(maxPowerLimit);
          maxArr.push(maxBuildingNet);
          maxArr.push(maxBuildingGeneration);
          maxArr.push(maxCommunityGeneration);
          maxArr.push(maxCommunityConsumption);
          maxArr.push(maxCommunityNet);

          var maxY=Math.max.apply(Math,maxArr);

          var minBuildingNet=vm.buildingNetEnergyData.length>0?Math.min.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;
          var minBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.min.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
          var minCommunityNet=vm.communityNetEnergyData.length>0?Math.min.apply(Math,vm.communityNetEnergyData.map(function(o){return o.y;})):0;
          var minCommunityConsumption=vm.communityEnergyConsumptionData.length>0?Math.min.apply(Math,vm.communityEnergyConsumptionData.map(function(o){return o.y;})):0;
          var minCommunityGeneration=vm.communityEnergyGenerationData.length>0?Math.min.apply(Math,vm.communityEnergyGenerationData.map(function(o){return o.y;})):0;

          var minArr=[];
          minArr.push(minPowerLimit);
          minArr.push(minBuildingNet);
          minArr.push(minBuildingGeneration);
          minArr.push(minCommunityGeneration);
          minArr.push(minCommunityConsumption);
          minArr.push(minCommunityNet);

          var minY=Math.min.apply(Math,minArr);

          var maxBuildingCon=Math.max.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;}));
          var minBuildingCon=Math.min.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;}));

          var thresholdValue=Math.max(Math.abs(minY),Math.abs(maxY));

          if(Math.abs(maxBuildingCon)<=thresholdValue && Math.abs(minBuildingCon)<=thresholdValue){
            vm.isRenderY1=false;
          }else{
            vm.isRenderY1=true;
          }
          vm.buildingEnergyConsumptionData=[];
        }
      };
      vm.checkBuildingGen=function () {

        vm.startTime.setFullYear(vm.startDate.getFullYear());
        vm.startTime.setMonth(vm.startDate.getMonth());
        vm.startTime.setDate(vm.startDate.getDate());
        var starttime=vm.startTime.getTime();
        vm.endTime.setFullYear(vm.endDate.getFullYear());
        vm.endTime.setMonth(vm.endDate.getMonth());
        vm.endTime.setDate(vm.endDate.getDate());
        var endtime=vm.endTime.getTime();

        vm.isBuildingGenChecked=!vm.isBuildingGenChecked;
        if(vm.isBuildingGenChecked){
          vm.getHistoricalBuildingEnergyGenerationData(starttime,endtime);
        }else{
          var maxPowerLimit=vm.powerUpperLimitData.length>0?Math.max.apply(Math,vm.powerUpperLimitData.map(function(o){return o.y;})):0;
          var minPowerLimit=vm.powerLowerLimitData.length>0?Math.min.apply(Math,vm.powerLowerLimitData.map(function(o){return o.y;})):0;

          var maxBuildingNet=vm.buildingNetEnergyData.length>0?Math.max.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;
          var maxBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.max.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;
          var maxCommunityNet=vm.communityNetEnergyData.length>0?Math.max.apply(Math,vm.communityNetEnergyData.map(function(o){return o.y;})):0;
          var maxCommunityConsumption=vm.communityEnergyConsumptionData.length>0?Math.max.apply(Math,vm.communityEnergyConsumptionData.map(function(o){return o.y;})):0;
          var maxCommunityGeneration=vm.communityEnergyGenerationData.length>0?Math.max.apply(Math,vm.communityEnergyGenerationData.map(function(o){return o.y;})):0;

          var maxArr=[];
          maxArr.push(maxPowerLimit);
          maxArr.push(maxBuildingNet);
          maxArr.push(maxBuildingConsumption);
          maxArr.push(maxCommunityGeneration);
          maxArr.push(maxCommunityConsumption);
          maxArr.push(maxCommunityNet);

          var maxY=Math.max.apply(Math,maxArr);

          var minBuildingNet=vm.buildingNetEnergyData.length>0?Math.min.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;
          var minBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.min.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;
          var minCommunityNet=vm.communityNetEnergyData.length>0?Math.min.apply(Math,vm.communityNetEnergyData.map(function(o){return o.y;})):0;
          var minCommunityConsumption=vm.communityEnergyConsumptionData.length>0?Math.min.apply(Math,vm.communityEnergyConsumptionData.map(function(o){return o.y;})):0;
          var minCommunityGeneration=vm.communityEnergyGenerationData.length>0?Math.min.apply(Math,vm.communityEnergyGenerationData.map(function(o){return o.y;})):0;

          var minArr=[];
          minArr.push(minPowerLimit);
          minArr.push(minBuildingNet);
          minArr.push(minBuildingConsumption);
          minArr.push(minCommunityGeneration);
          minArr.push(minCommunityConsumption);
          minArr.push(minCommunityNet);

          var minY=Math.min.apply(Math,minArr);

          var maxBuildingGeneration=Math.max.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;}));
          var minBuildingGeneration=Math.min.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;}));

          var thresholdValue=Math.max(Math.abs(minY),Math.abs(maxY));

          if(Math.abs(maxBuildingGeneration)<=thresholdValue && Math.abs(minBuildingGeneration)<=thresholdValue){
            vm.isRenderY1=false;
          }else{
            vm.isRenderY1=true;
          }
          vm.buildingEnergyGenerationData=[];
        }
      };
      vm.checkCommunityNet=function () {
        vm.startTime.setFullYear(vm.startDate.getFullYear());
        vm.startTime.setMonth(vm.startDate.getMonth());
        vm.startTime.setDate(vm.startDate.getDate());
        var starttime=vm.startTime.getTime();
        vm.endTime.setFullYear(vm.endDate.getFullYear());
        vm.endTime.setMonth(vm.endDate.getMonth());
        vm.endTime.setDate(vm.endDate.getDate());
        var endtime=vm.endTime.getTime();
        vm.isCommunityNetChecked=!vm.isCommunityNetChecked;
        if(vm.isCommunityNetChecked){
          vm.getHistoricalCommunityNetEnergyData(starttime,endtime);
        }else{
          var maxPowerLimit=vm.powerUpperLimitData.length>0?Math.max.apply(Math,vm.powerUpperLimitData.map(function(o){return o.y;})):0;
          var maxBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.max.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;
          var maxBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.max.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
          var maxBuildingNet=vm.buildingNetEnergyData.length>0?Math.max.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;
          var maxCommunityGeneration=vm.communityEnergyGenerationData.length>0?Math.max.apply(Math,vm.communityEnergyGenerationData.map(function(o){return o.y;})):0;
          var maxCommunityConsumption=vm.communityEnergyConsumptionData.length>0?Math.max.apply(Math,vm.communityEnergyConsumptionData.map(function(o){return o.y;})):0;

          var maxArr=[];
          maxArr.push(maxPowerLimit);
          maxArr.push(maxBuildingConsumption);
          maxArr.push(maxBuildingGeneration);
          maxArr.push(maxBuildingNet);
          maxArr.push(maxCommunityGeneration);
          maxArr.push(maxCommunityConsumption);

          var maxY=Math.max.apply(Math,maxArr);

          var minPowerLimit=vm.powerLowerLimitData.length>0?Math.min.apply(Math,vm.powerLowerLimitData.map(function(o){return o.y;})):0;
          var minBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.min.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;
          var minBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.min.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
          var minBuildingNet=vm.buildingNetEnergyData.length>0?Math.min.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;
          var minCommunityGeneration=vm.communityEnergyGenerationData.length>0?Math.min.apply(Math,vm.communityEnergyGenerationData.map(function(o){return o.y;})):0;
          var minCommunityConsumption=vm.communityEnergyConsumptionData.length>0?Math.min.apply(Math,vm.communityEnergyConsumptionData.map(function(o){return o.y;})):0;

          var minArr=[];
          minArr.push(minPowerLimit);
          minArr.push(minBuildingConsumption);
          minArr.push(minBuildingGeneration);
          minArr.push(minBuildingNet);
          minArr.push(minCommunityGeneration);
          minArr.push(minCommunityConsumption);

          var minY=Math.min.apply(Math,minArr);
          var thresholdValue=Math.max(Math.abs(minY),Math.abs(maxY));

          var maxCommunityNet=Math.max.apply(Math,vm.communityNetEnergyData.map(function(o){return o.y;}));
          var minCommunityNet=Math.min.apply(Math,vm.communityNetEnergyData.map(function(o){return o.y;}));

          if(Math.abs(maxCommunityNet)<=thresholdValue && Math.abs(minCommunityNet)<=thresholdValue){
            vm.isRenderY1=false;
          }else{
            vm.isRenderY1=true;
          }
          vm.communityNetEnergyData=[];
        }
      };
      vm.checkCommunityCon=function () {
        vm.startTime.setFullYear(vm.startDate.getFullYear());
        vm.startTime.setMonth(vm.startDate.getMonth());
        vm.startTime.setDate(vm.startDate.getDate());
        var starttime=vm.startTime.getTime();
        vm.endTime.setFullYear(vm.endDate.getFullYear());
        vm.endTime.setMonth(vm.endDate.getMonth());
        vm.endTime.setDate(vm.endDate.getDate());
        var endtime=vm.endTime.getTime();
        vm.isCommunityConChecked=!vm.isCommunityConChecked;
        if(vm.isCommunityConChecked){
          vm.getHistoricalCommunityEnergyConsumptionData(starttime,endtime);
        }else{
          var maxPowerLimit=vm.powerUpperLimitData.length>0?Math.max.apply(Math,vm.powerUpperLimitData.map(function(o){return o.y;})):0;
          var maxBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.max.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;
          var maxBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.max.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
          var maxBuildingNet=vm.buildingNetEnergyData.length>0?Math.max.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;
          var maxCommunityNet=vm.communityNetEnergyData.length>0?Math.max.apply(Math,vm.communityNetEnergyData.map(function(o){return o.y;})):0;
          var maxCommunityGeneration=vm.communityEnergyGenerationData.length>0?Math.max.apply(Math,vm.communityEnergyGenerationData.map(function(o){return o.y;})):0;

          var maxArr=[];
          maxArr.push(maxPowerLimit);
          maxArr.push(maxBuildingConsumption);
          maxArr.push(maxBuildingGeneration);
          maxArr.push(maxBuildingNet);
          maxArr.push(maxCommunityNet);
          maxArr.push(maxCommunityGeneration);

          var maxY=Math.max.apply(Math,maxArr);

          var minPowerLimit=vm.powerLowerLimitData.length>0?Math.min.apply(Math,vm.powerLowerLimitData.map(function(o){return o.y;})):0;
          var minBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.min.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;
          var minBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.min.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
          var minBuildingNet=vm.buildingNetEnergyData.length>0?Math.min.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;
          var minCommunityNet=vm.communityNetEnergyData.length>0?Math.min.apply(Math,vm.communityNetEnergyData.map(function(o){return o.y;})):0;
          var minCommunityGeneration=vm.communityEnergyGenerationData.length>0?Math.min.apply(Math,vm.communityEnergyGenerationData.map(function(o){return o.y;})):0;

          var minArr=[];
          minArr.push(minPowerLimit);
          minArr.push(minBuildingConsumption);
          minArr.push(minBuildingGeneration);
          minArr.push(minBuildingNet);
          minArr.push(minCommunityNet);
          minArr.push(minCommunityGeneration);

          var minY=Math.min.apply(Math,minArr);

          var maxBuildingCon=Math.max.apply(Math,vm.communityEnergyConsumptionData.map(function(o){return o.y;}));
          var minBuildingCon=Math.min.apply(Math,vm.communityEnergyConsumptionData.map(function(o){return o.y;}));

          var thresholdValue=Math.max(Math.abs(minY),Math.abs(maxY));

          if(Math.abs(maxBuildingCon)<=thresholdValue && Math.abs(minBuildingCon)<=thresholdValue){
            vm.isRenderY1=false;
          }else{
            vm.isRenderY1=true;
          }
          vm.communityEnergyConsumptionData=[];
        }
      };
      vm.checkCommunityGen=function () {
        vm.startTime.setFullYear(vm.startDate.getFullYear());
        vm.startTime.setMonth(vm.startDate.getMonth());
        vm.startTime.setDate(vm.startDate.getDate());
        var starttime=vm.startTime.getTime();
        vm.endTime.setFullYear(vm.endDate.getFullYear());
        vm.endTime.setMonth(vm.endDate.getMonth());
        vm.endTime.setDate(vm.endDate.getDate());
        var endtime=vm.endTime.getTime();
        vm.isCommunityGenChecked=!vm.isCommunityGenChecked;
        if(vm.isCommunityGenChecked){
          vm.getHistoricalCommunityEnergyGenerationData(starttime,endtime);
        }else{
          var maxPowerLimit=vm.powerUpperLimitData.length>0?Math.max.apply(Math,vm.powerUpperLimitData.map(function(o){return o.y;})):0;
          var maxBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.max.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;
          var maxBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.max.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
          var maxBuildingNet=vm.buildingNetEnergyData.length>0?Math.max.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;
          var maxCommunityNet=vm.communityNetEnergyData.length>0?Math.max.apply(Math,vm.communityNetEnergyData.map(function(o){return o.y;})):0;
          var maxCommunityConsumption=vm.communityEnergyConsumptionData.length>0?Math.max.apply(Math,vm.communityEnergyConsumptionData.map(function(o){return o.y;})):0;

          var maxArr=[];
          maxArr.push(maxPowerLimit);
          maxArr.push(maxBuildingConsumption);
          maxArr.push(maxBuildingGeneration);
          maxArr.push(maxBuildingNet);
          maxArr.push(maxCommunityNet);
          maxArr.push(maxCommunityConsumption);

          var maxY=Math.max.apply(Math,maxArr);

          var minPowerLimit=vm.powerLowerLimitData.length>0?Math.min.apply(Math,vm.powerLowerLimitData.map(function(o){return o.y;})):0;
          var minBuildingConsumption=vm.buildingEnergyConsumptionData.length>0?Math.min.apply(Math,vm.buildingEnergyConsumptionData.map(function(o){return o.y;})):0;
          var minBuildingGeneration=vm.buildingEnergyGenerationData.length>0?Math.min.apply(Math,vm.buildingEnergyGenerationData.map(function(o){return o.y;})):0;
          var minBuildingNet=vm.buildingNetEnergyData.length>0?Math.min.apply(Math,vm.buildingNetEnergyData.map(function(o){return o.y;})):0;
          var minCommunityNet=vm.communityNetEnergyData.length>0?Math.min.apply(Math,vm.communityNetEnergyData.map(function(o){return o.y;})):0;
          var minCommunityConsumption=vm.communityEnergyConsumptionData.length>0?Math.min.apply(Math,vm.communityEnergyConsumptionData.map(function(o){return o.y;})):0;

          var minArr=[];
          minArr.push(minPowerLimit);
          minArr.push(minBuildingConsumption);
          minArr.push(minBuildingGeneration);
          minArr.push(minBuildingNet);
          minArr.push(minCommunityNet);
          minArr.push(minCommunityConsumption);

          var minY=Math.min.apply(Math,minArr);

          var maxCommunityGeneration=Math.max.apply(Math,vm.communityEnergyGenerationData.map(function(o){return o.y;}));
          var minCommunityGeneration=Math.min.apply(Math,vm.communityEnergyGenerationData.map(function(o){return o.y;}));


          var thresholdValue=Math.max(Math.abs(minY),Math.abs(maxY));
          if(Math.abs(maxCommunityGeneration)<=thresholdValue && Math.abs(minCommunityGeneration)<=thresholdValue){
            vm.isRenderY1=false;
          }else{
            vm.isRenderY1=true;
          }
        }
        vm.communityEnergyGenerationData=[];
      };
      vm.isButtonDisabled=true;

      vm.randomArray1=[];
      vm.randomArray2=[];


      vm.changeDateTime=function () {
        vm.isRenderAll=true;
        if(vm.isElectricityPriceChecked || vm.isLoadLimitChecked || vm.isPVFeedinChecked || vm.isCHPFeedinChecked
          || vm.isBuildingConChecked || vm.isBuildingGenChecked || vm.isBuildingNetChecked || vm.isCommunityConChecked || vm.isCommunityGenChecked || vm.isCommunityNetChecked){
          vm.isButtonDisabled=false;
        }

        vm.startTime.setFullYear(vm.startDate.getFullYear());
        vm.startTime.setMonth(vm.startDate.getMonth());
        vm.startTime.setDate(vm.startDate.getDate());
        var starttime=vm.startTime.getTime();
        vm.endTime.setFullYear(vm.endDate.getFullYear());
        vm.endTime.setMonth(vm.endDate.getMonth());
        vm.endTime.setDate(vm.endDate.getDate());
        var endtime=vm.endTime.getTime();

        vm.wampSession.call('eshl.wago.v1.database.wiz.query',['02','P1', starttime, endtime, 100]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var random1=getRandomInt(-1000,1000);
                var random2=getRandomInt(-800,800);
                while(random1<random2){
                  random1=getRandomInt(-1000,1000);
                  random2=getRandomInt(-800,800);
                }
                vm.randomArray1.push(random1);
                vm.randomArray2.push(random2);
              }
            }

          },
          // RPC error callback
          function (error) {
            console.log("Call failed:", error);
          }
        );
      }

      function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      vm.changeDateTime();

      /*vm.powerUpperLimitData="";
      vm.powerLowerLimitData="";
      vm.electricityPrices="";
      vm.pvFeedinPrices="";
      vm.chpFeedinPrices="";*/


    }

  }
)();
