/**
 * Created by pg9501 on 29.09.2016.
 */
(function () {
  'use strict';

  angular
    .module('app.dweller.energy-history.device-history')
    .controller('DeviceHistoryController', DeviceHistoryController);

  /** @ngInject */
  function DeviceHistoryController($document, $timeout, $scope,$cookies, $mdDialog,$http,msNavigationService,WAMPService) {

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

    vm.timePeriod="Yesterday";
    vm.communities=[];
    vm.community="";
    vm.devices=[];
    vm.deviceSampleData_yesterday=[];
    vm.deviceSampleData_lastThreeDays=[];
    vm.deviceSampleData_lastWeek=[];
    vm.deviceSampleData_lastMonth=[];
    vm.device="";
    vm.deviceEnergyConsumption="";
    vm.communityEnergyConsumption="";
    vm.consumptionRanking="";
    vm.deviceEnergyConsumptionCost="";
    vm.communityEnergyConsumptionCost="";
    vm.costRanking="";
    vm.deviceEnergyConsumptionData=[];
    vm.communityEnergyConsumptionData=[];

    vm.isRenderAll=true;

    vm.electricityPrices = [];
    vm.pvFeedinPrices = [];
    vm.chpFeedinPrices = [];
    vm.powerUpperLimitData = [];
    vm.powerLowerLimitData = [];

    vm.startDate=new Date();
    vm.startDate.setDate(new Date().getDate() -1);
    vm.endDate=new Date();
    vm.startTime=vm.startDate;
    vm.endTime=new Date();

    vm.maxDate=new Date();
    vm.maxDate.setDate(new Date().getDate() -1);
    vm.minDate=new Date();
    vm.minDate.setDate(new Date().getDate() -29);

    vm.startTimeStamp =(vm.startTime.getTime())/ 1000 | 0;
    vm.endTimeStamp =(vm.endTime.getTime())/ 1000 | 0;

    vm.isRenderY1=false;
    var user=$cookies.getObject('globals').currentUser;
    vm.dweller={};
    vm.devicesWithControl=[];
    vm.devicesWithoutControl=[];

    var check = function() {
      vm.wampSession = WAMPService.getWAMPsession();
      if (typeof vm.wampSession != 'undefined'){
      }
      else {
        setTimeout(check, 500); // check again in a second
      }
    };
    check();


    GetDweller(user.username).then(function (result) {
      if(result!=null){
        vm.dweller=result;
        var permissions=vm.dweller.permissions;
        for(var i in permissions) {
          var permission = permissions[i];
          var devices = permission.devices;

          var operations = permission.operations;
          if(operations.indexOf("CONTROL_DEVICE")>-1){
            for(var dev in devices){
              vm.devicesWithControl.push(devices[dev]);
            }

          }else if(operations.indexOf("VIEW_DEVICE_CHANNEL_INFORMATION")>-1){
            for(var dev in devices){
              vm.devicesWithoutControl.push(devices[dev]);
            }

          }
        }

        for(var dev in vm.devicesWithControl){
          vm.devices.push(vm.devicesWithControl[dev]);
        }
        for(var dev in vm.devicesWithoutControl){
          vm.devices.push(vm.devicesWithoutControl[dev]);
        }

        for(var i in vm.devices){
          switch(vm.devices[i]){
            case "Washing Machine":
              vm.deviceSampleData_yesterday.push({energyValue:0.9,energyRanking:getRandomArbitrary(0.15, 0.35),costValue:0.2, costRanking:getRandomArbitrary(0.15, 0.35)});
              vm.deviceSampleData_lastThreeDays.push({energyValue:1.3,energyRanking:getRandomArbitrary(0.15, 0.35),costValue:0.3, costRanking:getRandomArbitrary(0.15, 0.35)});
              vm.deviceSampleData_lastWeek.push({energyValue:3.6,energyRanking:getRandomArbitrary(0.15, 0.35),costValue:0.9, costRanking:getRandomArbitrary(0.15, 0.35)});
              vm.deviceSampleData_lastMonth.push({energyValue:14.4,energyRanking:getRandomArbitrary(0.15, 0.35),costValue:3.7, costRanking:getRandomArbitrary(0.15, 0.35)});
                  break;
            case "Dishwasher":
              vm.deviceSampleData_yesterday.push({energyValue:1.2,energyRanking:getRandomArbitrary(0.35, 0.55),costValue:0.3, costRanking:getRandomArbitrary(0.35, 0.55)});
              vm.deviceSampleData_lastThreeDays.push({energyValue:2.4,energyRanking:getRandomArbitrary(0.35, 0.55),costValue:0.6, costRanking:getRandomArbitrary(0.35, 0.55)});
              vm.deviceSampleData_lastWeek.push({energyValue:6.1,energyRanking:getRandomArbitrary(0.35, 0.55),costValue:1.5, costRanking:getRandomArbitrary(0.35, 0.55)});
              vm.deviceSampleData_lastMonth.push({energyValue:24.6,energyRanking:getRandomArbitrary(0.35, 0.55),costValue:6.4, costRanking:getRandomArbitrary(0.35, 0.55)});
              break;
            case "Coffee System":
              vm.deviceSampleData_yesterday.push({energyValue:0.2,energyRanking:getRandomArbitrary(0.55, 0.75),costValue:0.1, costRanking:getRandomArbitrary(0.55, 0.75)});
              vm.deviceSampleData_lastThreeDays.push({energyValue:0.6,energyRanking:getRandomArbitrary(0.55, 0.75),costValue:0.2, costRanking:getRandomArbitrary(0.55, 0.75)});
              vm.deviceSampleData_lastWeek.push({energyValue:1.5,energyRanking:getRandomArbitrary(0.55, 0.75),costValue:0.4, costRanking:getRandomArbitrary(0.55, 0.75)});
              vm.deviceSampleData_lastMonth.push({energyValue:6.3,energyRanking:getRandomArbitrary(0.55, 0.75),costValue:1.6, costRanking:getRandomArbitrary(0.55, 0.75)});
              break;
            case "Oven":
              vm.deviceSampleData_yesterday.push({energyValue:0.3,energyRanking:getRandomArbitrary(0.25, 0.65),costValue:0.1, costRanking:getRandomArbitrary(0.25, 0.65)});
              vm.deviceSampleData_lastThreeDays.push({energyValue:0.9,energyRanking:getRandomArbitrary(0.25, 0.65),costValue:0.3, costRanking:getRandomArbitrary(0.25, 0.65)});
              vm.deviceSampleData_lastWeek.push({energyValue:2.1,energyRanking:getRandomArbitrary(0.25, 0.65),costValue:0.5, costRanking:getRandomArbitrary(0.25, 0.65)});
              vm.deviceSampleData_lastMonth.push({energyValue:9.2,energyRanking:getRandomArbitrary(0.25, 0.65),costValue:2.4, costRanking:getRandomArbitrary(0.25, 0.65)});
              break;
            case "Air Conditioner":
              vm.deviceSampleData_yesterday.push({energyValue:9.6,energyRanking:getRandomArbitrary(0.15, 0.35),costValue:2.5, costRanking:getRandomArbitrary(0.15, 0.35)});
              vm.deviceSampleData_lastThreeDays.push({energyValue:28.8,energyRanking:getRandomArbitrary(0.15, 0.35),costValue:7.5, costRanking:getRandomArbitrary(0.15, 0.35)});
              vm.deviceSampleData_lastWeek.push({energyValue:67.2,energyRanking:getRandomArbitrary(0.15, 0.35),costValue:17.4, costRanking:getRandomArbitrary(0.15, 0.35)});
              vm.deviceSampleData_lastMonth.push({energyValue:288,energyRanking:getRandomArbitrary(0.15, 0.35),costValue:74.9, costRanking:getRandomArbitrary(0.15, 0.35)});
              break;
            case "Tumble Dryer":
              vm.deviceSampleData_yesterday.push({energyValue:3.1,energyRanking:getRandomArbitrary(0.35, 0.85),costValue:0.8, costRanking:getRandomArbitrary(0.35, 0.85)});
              vm.deviceSampleData_lastThreeDays.push({energyValue:3.5,energyRanking:getRandomArbitrary(0.35, 0.85),costValue:0.9, costRanking:getRandomArbitrary(0.35, 0.85)});
              vm.deviceSampleData_lastWeek.push({energyValue:6.2,energyRanking:getRandomArbitrary(0.35, 0.85),costValue:1.6, costRanking:getRandomArbitrary(0.35, 0.85)});
              vm.deviceSampleData_lastMonth.push({energyValue:14.4,energyRanking:getRandomArbitrary(0.35, 0.85),costValue:3.7, costRanking:getRandomArbitrary(0.35, 0.85)});
              break;
            case "Hob Induction":
              vm.deviceSampleData_yesterday.push({energyValue:1.6 ,energyRanking:getRandomArbitrary(0.35, 0.55),costValue:0.4, costRanking:getRandomArbitrary(0.35, 0.55)});
              vm.deviceSampleData_lastThreeDays.push({energyValue:4.8,energyRanking:getRandomArbitrary(0.35, 0.55),costValue:1.3, costRanking:getRandomArbitrary(0.35, 0.55)});
              vm.deviceSampleData_lastWeek.push({energyValue:11.2,energyRanking:getRandomArbitrary(0.35, 0.55),costValue:2.9, costRanking:getRandomArbitrary(0.35, 0.55)});
              vm.deviceSampleData_lastMonth.push({energyValue:48.4,energyRanking:getRandomArbitrary(0.35, 0.55),costValue:12.6, costRanking:getRandomArbitrary(0.35, 0.55)});
              break;
            case "Photovoltaic":
              vm.deviceSampleData_yesterday.push({energyValue:8.3  ,energyRanking:getRandomArbitrary(0.55, 0.65),costValue:1.2, costRanking:getRandomArbitrary(0.55, 0.65)});
              vm.deviceSampleData_lastThreeDays.push({energyValue:17.8,energyRanking:getRandomArbitrary(0.55, 0.65),costValue:2.3, costRanking:getRandomArbitrary(0.55, 0.65)});
              vm.deviceSampleData_lastWeek.push({energyValue:58.1,energyRanking:getRandomArbitrary(0.55, 0.65),costValue:8.1, costRanking:getRandomArbitrary(0.55, 0.65)});
              vm.deviceSampleData_lastMonth.push({energyValue:212.5,energyRanking:getRandomArbitrary(0.55, 0.65),costValue:29.7, costRanking:getRandomArbitrary(0.55, 0.65)});
              break;
            case "µCHP":
              vm.deviceSampleData_yesterday.push({energyValue:5.9  ,energyRanking:getRandomArbitrary(0.25, 0.45),costValue:1.5, costRanking:getRandomArbitrary(0.25, 0.45)});
              vm.deviceSampleData_lastThreeDays.push({energyValue:16.7,energyRanking:getRandomArbitrary(0.25, 0.45),costValue:4.3, costRanking:getRandomArbitrary(0.25, 0.45)});
              vm.deviceSampleData_lastWeek.push({energyValue:41.3,energyRanking:getRandomArbitrary(0.25, 0.45),costValue:10.7, costRanking:getRandomArbitrary(0.25, 0.45)});
              vm.deviceSampleData_lastMonth.push({energyValue:175.5,energyRanking:getRandomArbitrary(0.25, 0.45),costValue:45.6, costRanking:getRandomArbitrary(0.25, 0.45)});
              break;
            default:
              vm.deviceSampleData_yesterday.push({energyValue:0.9,energyRanking:getRandomArbitrary(0.55, 0.65),costValue:0.2, costRanking:getRandomArbitrary(0.55, 0.65)});
              vm.deviceSampleData_lastThreeDays.push({energyValue:1.3,energyRanking:getRandomArbitrary(0.55, 0.65),costValue:0.3, costRanking:getRandomArbitrary(0.55, 0.65)});
              vm.deviceSampleData_lastWeek.push({energyValue:3.6,energyRanking:getRandomArbitrary(0.55, 0.65),costValue:0.9, costRanking:getRandomArbitrary(0.55, 0.65)});
              vm.deviceSampleData_lastMonth.push({energyValue:14.4,energyRanking:getRandomArbitrary(0.55, 0.65),costValue:3.7, costRanking:getRandomArbitrary(0.55, 0.65)});
              break;
          }
        }

      }
    });


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
            var powerLowerLimitData = [];

            for (var i = 0; i < timeList.length; i++) {
              if (timeList[i] >= vm.startTimeStamp && timeList[i] <= vm.endTimeStamp) {
                var upperLoadLimit = {"x": timeList[i], "y": powerList[i]['powerUpperLimit']};
                vm.powerUpperLimitData.push(upperLoadLimit);
                var lowerLoadLimit = {"x": timeList[i], "y": powerList[i]['powerLowerLimit']};
                powerLowerLimitData.push(lowerLoadLimit);
              }
            }
            if (vm.powerUpperLimitData.length == 0) {
              var upperLoadLimit = {"x": vm.startTimeStamp, "y": powerList[0]['powerUpperLimit']};
              vm.powerUpperLimitData.push(upperLoadLimit);
              var lowerLoadLimit = {"x": vm.startTimeStamp, "y": powerList[0]['powerLowerLimit']};
              powerLowerLimitData.push(lowerLoadLimit);
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
            var firstValue=powerLowerLimitData[0];
            var tempArray=new Array();
            tempArray.push(firstValue);
            for(var i=1;i<powerLowerLimitData.length;i++) {
              var secondValue = powerLowerLimitData[i];
              if (secondValue['x'] - firstValue['x'] > 60) {
                for(var j=firstValue['x'];j<=secondValue['x'];j+=60) {
                  var item={"x":j,"y":firstValue['y']};
                  tempArray.push(item);
                }
              }
              tempArray.push(secondValue);
              firstValue=secondValue;

            }
            powerLowerLimitData=tempArray;


            if (vm.powerUpperLimitData[0]['x'] > vm.startTimeStamp) {
              var tempArray1 = new Array();
              var tempArray2 = new Array();
              for (var time = vm.startTimeStamp; time < vm.powerUpperLimitData[0]['x']; time += 60) {
                var upperLoadLimit = {"x": time, "y": vm.powerUpperLimitData[0]['y']};
                tempArray1.push(upperLoadLimit);

                var lowerLoadLimit = {"x": time, "y": powerLowerLimitData[0]['y']};
                tempArray2.push(lowerLoadLimit);
              }
              if (tempArray1.length > 0) {
                vm.powerUpperLimitData = tempArray1.concat(vm.powerUpperLimitData);
              }
              if (tempArray2.length > 0) {
                powerLowerLimitData = tempArray2.concat(powerLowerLimitData);
              }
            }

            if (vm.powerUpperLimitData[vm.powerUpperLimitData.length - 1]['x'] < vm.endTimeStamp) {
              for (var time = vm.powerUpperLimitData[vm.powerUpperLimitData.length - 1]['x'] + 60; time <= vm.endTimeStamp; time += 60) {
                var upperLoadLimit = {"x": time, "y": powerList[powerList.length - 1]['powerUpperLimit']};
                vm.powerUpperLimitData.push(upperLoadLimit);

                var lowerLoadLimit = {"x": time, "y": -powerList[powerList.length - 1]['powerLowerLimit']};
                powerLowerLimitData.push(lowerLoadLimit);
              }
            }

            if(vm.device=="PV"||vm.device=="CHP"){
              vm.powerLowerLimitData=powerLowerLimitData;
            }else{
              vm.powerLowerLimitData=[];
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

    vm.getHistoricalDeviceEnergyData=function (starttime,endtime,deviceName) {

      vm.startTimeStamp =starttime/ 1000 | 0;
      vm.endTimeStamp =endtime/ 1000 | 0;

      vm.deviceEnergyConsumptionData=[];
      var clampNum="";
      var pNum="";
      if(deviceName=="Hob Induction" || deviceName=="CHP" || deviceName=="PV"){
        var record1=[];
        var record2=[];
        var record3=[];
        var rcp="";

        switch(deviceName){
          case "Hob Induction":
            clampNum="09";
            rcp="eshl.wago.v1.database.meter.query";
            break;
          case "CHP":
            clampNum="02";
            rcp="eshl.wago.v1.database.wiz.query";
            break;
          case "PV":
            rcp="eshl.wago.v1.database.wiz.query";
            clampNum="04";
            break;

          default:
            clampNum="09";
            rcp="eshl.wago.v1.database.meter.query";
            break;

        }
        vm.wampSession.call(rcp,[clampNum,'P1', starttime, endtime, vm.pointNum]).then(
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
        vm.wampSession.call(rcp,[clampNum,'P2', starttime, endtime, vm.pointNum]).then(
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
        vm.wampSession.call(rcp,[clampNum,'P3', starttime, endtime, vm.pointNum]).then(
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
                    vm.isRenderAll=false;
                    vm.deviceEnergyConsumptionData.push(newRecord);
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
      }else{
        switch(deviceName){
          case "Washing Machine":
            clampNum="08";
            pNum="P3";
            break;
          case "Oven":
            clampNum="05";
            pNum="P3";
            break;
          case "Tumble Dryer":
            clampNum="04";
            pNum="P1";
            break;
          case "Dishwasher":
            clampNum="04";
            pNum="P2";
            break;
          case "Coffee System":
            clampNum="07";
            pNum="P2";
            break;
          case "Extractor Hood":
            clampNum="07";
            pNum="P1";
            break;
          case "Freezer":
            clampNum="06";
            pNum="P2";
            break;
          case "Air Conditioner":
            clampNum="10";
            pNum="P2";
            break;
          case "Fridge":
            clampNum="05";
            pNum="P2";
            break;
          default:
            clampNum="08";
            pNum="P3";
                break;

        }
        vm.wampSession.call('eshl.wago.v1.database.meter.query',[clampNum,pNum, starttime, endtime, vm.pointNum]).then(
          // RPC success callback
          function (history) {
            if (history.length !== 0) {
              for(var i in history){
                var record=history[i];
                var newRecord={"x":record[0] / 1000 | 0,"y":record[1]};
                if(1000*newRecord.x>=starttime && 1000*newRecord.x<=endtime){
                  vm.isRenderAll=false;
                  vm.deviceEnergyConsumptionData.push(newRecord);
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


    }

    vm.pointNum=1000;



    vm.changeTimePeriod=function () {

      if(vm.device==""){
        return;
      }

      var buildingNum=0;
      var index=0;
      for(var i in vm.communities){
        if(vm.communities[i].name==vm.community){
          buildingNum=vm.communities[i].buildingNum;
          index=i;
          break;
        }
      }
      var index_device=0;
      for(var i in vm.devices){
        if(vm.devices[i]==vm.device){
          index_device=i;
          break;
        }
      }

      var communityEnergyFactor=0;
      var communityCostFactor=0;
      var deviceEnergyRanking=0;
      var deviceCostRanking=0;
      if(vm.timePeriod=='Last month'){
        vm.deviceEnergyConsumption=vm.deviceSampleData_lastMonth[index_device].energyValue+" kWh";
        var deviceEnergyRanking=vm.deviceSampleData_lastMonth[index_device].energyRanking;
        if(deviceEnergyRanking<0.4){
          communityEnergyFactor=1.6;
        }else if(deviceEnergyRanking<0.5){
          communityEnergyFactor=1.2;
        }else{
          communityEnergyFactor=0.6;
        }
        vm.deviceEnergyConsumptionCost=vm.deviceSampleData_lastMonth[index_device].costValue+" Euro";
        var deviceCostRanking=vm.deviceSampleData_lastMonth[index_device].costRanking;
        if(deviceCostRanking<0.4){
          communityCostFactor=1.6;
        }else if(deviceCostRanking<0.5){
          communityCostFactor=1.2;
        }else{
          communityCostFactor=0.6;
        }
        if(vm.community!=""){
          var random1=communityEnergyFactor*parseFloat(vm.deviceEnergyConsumption);
          vm.communityEnergyConsumption=random1.toFixed(2)+" kWh";
          var random2=deviceEnergyRanking;
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
          var random3=communityCostFactor*parseFloat(vm.deviceEnergyConsumptionCost);
          vm.communityEnergyConsumptionCost=random3.toFixed(2)+" Euro";
          var random2=deviceCostRanking;
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
        }


        vm.isRenderAll=true;
        vm.deviceEnergyConsumptionData=[];
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

      vm.pointNum=1000;

      if(vm.timePeriod=='Yesterday'){
        vm.deviceEnergyConsumption=vm.deviceSampleData_yesterday[index_device].energyValue+" kWh";
        deviceEnergyRanking=vm.deviceSampleData_yesterday[index_device].energyRanking;

        vm.deviceEnergyConsumptionCost=vm.deviceSampleData_yesterday[index_device].costValue+" Euro";
        deviceCostRanking=vm.deviceSampleData_yesterday[index_device].costRanking;

      //  vm.startDate.setDate(vm.startDate.getDate()-1);
      }else if(vm.timePeriod=='Last three days'){
        vm.deviceEnergyConsumption=vm.deviceSampleData_lastThreeDays[index_device].energyValue+" kWh";
        deviceEnergyRanking=vm.deviceSampleData_lastThreeDays[index_device].energyRanking;

        vm.deviceEnergyConsumptionCost=vm.deviceSampleData_lastThreeDays[index_device].costValue+" Euro";
        deviceCostRanking=vm.deviceSampleData_lastThreeDays[index_device].costRanking;


        vm.startDate.setDate(vm.startDate.getDate()-3);
      }else if(vm.timePeriod=='Last week'){
        vm.deviceEnergyConsumption=vm.deviceSampleData_lastWeek[index_device].energyValue+" kWh";
        deviceEnergyRanking=vm.deviceSampleData_lastWeek[index_device].energyRanking;

        vm.deviceEnergyConsumptionCost=vm.deviceSampleData_lastWeek[index_device].costValue+" Euro";
        deviceCostRanking=vm.deviceSampleData_lastWeek[index_device].costRanking;


        vm.startDate.setDate(vm.startDate.getDate()-7);
      }

      if(vm.community!=""){
        if(deviceEnergyRanking<0.4){
          communityEnergyFactor=1.6;
        }else if(deviceEnergyRanking<0.5){
          communityEnergyFactor=1.2;
        }else{
          communityEnergyFactor=0.6;
        }

        if(deviceCostRanking<0.4){
          communityCostFactor=1.6;
        }else if(deviceCostRanking<0.5){
          communityCostFactor=1.2;
        }else{
          communityCostFactor=0.6;
        }

        var random1=communityEnergyFactor*parseFloat(vm.deviceEnergyConsumption);
        vm.communityEnergyConsumption=random1.toFixed(2)+" kWh";
        var random2=deviceEnergyRanking;
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
        var random3=communityCostFactor*parseFloat(vm.deviceEnergyConsumptionCost);
        vm.communityEnergyConsumptionCost=random3.toFixed(2)+" Euro";
        var random2=deviceCostRanking;
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
      if(vm.device=="PV"){
        paramterArr.push("pv");
      }else if(vm.device=="CHP"){
        paramterArr.push("chp");
      }else{
        vm.pvFeedinPrices = [];
        vm.chpFeedinPrices = [];
      }
      vm.getHistoricalLoadLimitData(starttime,endtime);
      vm.getHistoricalEnergyPriceData(starttime,endtime,paramterArr);

      vm.getHistoricalDeviceEnergyData(starttime,endtime,vm.device);


    };



    function getRandomArbitrary(min, max) {
      return Math.random() * (max - min) + min;
    }

    vm.type1="Consumption";
    vm.type2="Cost";
    vm.hasMinusYaxis=false;
    //vm.lastDevice="";
    vm.changeDevice=function () {
      if(vm.device=="CHP"||vm.device=="PV"){
        vm.type1="Generation";
        vm.type2="Profit";
        vm.hasMinusYaxis=true;

      }else{

        vm.type1="Consumption";
        vm.type2="Cost";
        vm.hasMinusYaxis=false;
      }
     // vm.lastDevice=vm.device;
      vm.changeTimePeriod();
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
      var index_device=0;
      for(var i in vm.devices){
        if(vm.devices[i]==vm.device){
          index_device=i;
          break;
        }
      }

      var communityEnergyFactor=0;
      var communityCostFactor=0;
      var deviceEnergyRanking=0;
      var deviceCostRanking=0;
      if(vm.timePeriod=="Last month"){
        vm.deviceEnergyConsumption=vm.deviceSampleData_lastMonth[index_device].energyValue+" kWh";
        var deviceEnergyRanking=vm.deviceSampleData_lastMonth[index_device].energyRanking;
        if(deviceEnergyRanking<0.4){
          communityEnergyFactor=1.6;
        }else if(deviceEnergyRanking<0.5){
          communityEnergyFactor=1.2;
        }else{
          communityEnergyFactor=0.6;
        }
        vm.deviceEnergyConsumptionCost=vm.deviceSampleData_lastMonth[index_device].costValue+" Euro";
        var deviceCostRanking=vm.deviceSampleData_lastMonth[index_device].costRanking;
        if(deviceCostRanking<0.4){
          communityCostFactor=1.6;
        }else if(deviceCostRanking<0.5){
          communityCostFactor=1.2;
        }else{
          communityCostFactor=0.6;
        }
        if(vm.community!=""){
          var random1=communityEnergyFactor*parseFloat(vm.deviceEnergyConsumption);
          vm.communityEnergyConsumption=random1.toFixed(2)+" kWh";
          var random2=deviceEnergyRanking;
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
          var random3=communityCostFactor*parseFloat(vm.deviceEnergyConsumptionCost);
          vm.communityEnergyConsumptionCost=random3.toFixed(2)+" Euro";
          var random2=deviceCostRanking;
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
        }

      }else{
        if(vm.timePeriod=='Yesterday'){
          vm.deviceEnergyConsumption=vm.deviceSampleData_yesterday[index_device].energyValue+" kWh";
          deviceEnergyRanking=vm.deviceSampleData_yesterday[index_device].energyRanking;

          vm.deviceEnergyConsumptionCost=vm.deviceSampleData_yesterday[index_device].costValue+" Euro";
          deviceCostRanking=vm.deviceSampleData_yesterday[index_device].costRanking;

        }else if(vm.timePeriod=='Last three days'){
          vm.deviceEnergyConsumption=vm.deviceSampleData_lastThreeDays[index_device].energyValue+" kWh";
          deviceEnergyRanking=vm.deviceSampleData_lastThreeDays[index_device].energyRanking;

          vm.deviceEnergyConsumptionCost=vm.deviceSampleData_lastThreeDays[index_device].costValue+" Euro";
          deviceCostRanking=vm.deviceSampleData_lastThreeDays[index_device].costRanking;

        }else if(vm.timePeriod=='Last week'){
          vm.deviceEnergyConsumption=vm.deviceSampleData_lastWeek[index_device].energyValue+" kWh";
          deviceEnergyRanking=vm.deviceSampleData_lastWeek[index_device].energyRanking;

          vm.deviceEnergyConsumptionCost=vm.deviceSampleData_lastWeek[index_device].costValue+" Euro";
          deviceCostRanking=vm.deviceSampleData_lastWeek[index_device].costRanking;

        }

        if(vm.community!=""){
          if(deviceEnergyRanking<0.4){
            communityEnergyFactor=1.6;
          }else if(deviceEnergyRanking<0.5){
            communityEnergyFactor=1.2;
          }else{
            communityEnergyFactor=0.6;
          }

          if(deviceCostRanking<0.4){
            communityCostFactor=1.6;
          }else if(deviceCostRanking<0.5){
            communityCostFactor=1.2;
          }else{
            communityCostFactor=0.6;
          }

          var random1=communityEnergyFactor*parseFloat(vm.deviceEnergyConsumption);
          vm.communityEnergyConsumption=random1.toFixed(2)+" kWh";
          var random2=deviceEnergyRanking;
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
          var random3=communityCostFactor*parseFloat(vm.deviceEnergyConsumptionCost);
          vm.communityEnergyConsumptionCost=random3.toFixed(2)+" Euro";
          var random2=deviceCostRanking;
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
        }
      }


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
              var random={energyValue:getRandomArbitrary(905, 932),energyRanking:getRandomArbitrary(0.15, 0.35),costValue:getRandomArbitrary(99.1, 110.6), costRanking:getRandomArbitrary(0.15, 0.35)};
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

    function GetDweller(name) {
      return $http.get('http://localhost:8087/bos/api/users/dweller/'+name).then(handleSuccess, handleError('Error getting the dweller'));
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
