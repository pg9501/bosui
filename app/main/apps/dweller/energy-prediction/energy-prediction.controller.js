/**
 * Created by pg9501 on 29.09.2016.
 */
(function () {
  'use strict';

  angular
    .module('app.dweller.energy-prediction')
    .controller('EnergyPredictionController', EnergyPredictionController);

  /** @ngInject */
  function EnergyPredictionController($document, $timeout, $scope, $mdDialog, $http,msNavigationService,WAMPService) {

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

    vm.startDate=new Date();
    vm.startTime=vm.startDate;
    vm.endDate=new Date();
    vm.endDate.setDate(new Date().getDate() + 1);
    vm.endTime=vm.endDate;

    vm.startTimeStamp =(vm.startTime.getTime())/ 1000 | 0;

    vm.endTimeStamp =(vm.endTime.getTime())/ 1000 | 0;


    vm.isRenderAll=true;
    vm.isRenderY1=false;

    vm.electricityPrices = [];
    vm.pvFeedinPrices = [];
    vm.chpFeedinPrices = [];
    vm.powerUpperLimitData = [];
    vm.powerLowerLimitData = [];

    vm.pvEnergyGenerationData = [];
    vm.chpEnergyConGenData = [];
    vm.buildingBaseLoadData = [];
    vm.buildingEnergyNetUseData = [];

    vm.isElectricityPriceChecked=true;
    vm.isLoadLimitChecked=true;
    vm.isPVFeedinChecked=true;
    vm.isCHPFeedinChecked=true;

    vm.isPVGenerationChecked=true;
    vm.isCHPConGenChecked=true;
    vm.isBaseLoadChecked=true;
    vm.isNetEnergyUseChecked=true;

    vm.baseLoadMsg=[];
    vm.pvGenMsg=[];
    vm.chpConGenMsg=[];
    vm.epsMsg=[];
    vm.plsMsg=[];

    vm.netEnergyData=[];



    function predictionHandler (args) {
      var msg = args[0];
      //console.log(msg);
      var scheduleMsg=msg['schedules'];
      vm.epsMsg=msg['priceSignals'];
      vm.plsMsg=msg['powerLimitSignals'];



     // if(vm.isBaseLoadChecked){
        vm.baseLoadMsg=scheduleMsg['BASELOAD'];
        baseLoadHandler(vm.baseLoadMsg);
    // }
     // if(vm.isPVGenerationChecked){
        vm.pvGenMsg=scheduleMsg['PVSYSTEM'];
        pvGenerationHandler(vm.pvGenMsg);
     // }
     // if(vm.isCHPConGenChecked){
        vm.chpConGenMsg=scheduleMsg['CHPPLANT'];
        chpConGenHandler(vm.chpConGenMsg);
     // }

     // if(vm.isElectricityPriceChecked){
        epsHandler (vm.epsMsg,['external']);
     // }
     // if(vm.isPVFeedinChecked){
        epsHandler (vm.epsMsg,['pv']);
     // }
     // if(vm.isCHPFeedinChecked){
        epsHandler (vm.epsMsg,['chp']);
     // }

     // if(vm.isLoadLimitChecked){
        plsHandler (vm.plsMsg);
     // }
     // if(vm.isNetEnergyUseChecked){
        netEnergyUseHandler ();
      vm.netEnergyData=vm.buildingEnergyNetUseData;
     // }

    }
    function netEnergyUseHandler () {
      vm.buildingEnergyNetUseData = [];
      var tempNetData=[];
      for (var i = 0; i < vm.buildingBaseLoadData.length; i++) {
          var time=vm.buildingBaseLoadData[i].x;
          var power=vm.buildingBaseLoadData[i].y;

        for(var j =0;j<vm.pvEnergyGenerationData.length-1;j++){
          if(time>=vm.pvEnergyGenerationData[j].x && time<vm.pvEnergyGenerationData[j+1].x){
            power+=vm.pvEnergyGenerationData[j].y;
            break;
          }
        }
        for(var j =0;j<vm.chpEnergyConGenData.length-1;j++){
          if(time>=vm.chpEnergyConGenData[j].x && time<vm.chpEnergyConGenData[j+1].x){
            power+=vm.chpEnergyConGenData[j].y;
            break;
          }
        }

          var net = {"x": time, "y": power};
          tempNetData.push(net);

        }

      for(var i=0;i<tempNetData.length-1;i++){
        var time1=tempNetData[i].x;
        var value1=tempNetData[i].y;
        var time2=tempNetData[i+1].x;
        var value2=tempNetData[i+1].y;

        var net={"x": time1, "y":value1};
        vm.buildingEnergyNetUseData.push(net);

        if((value1!==value2)&& (time1!==time2)){
          var net={"x": time2, "y":value1};
          vm.buildingEnergyNetUseData.push(net);
        }

        var net={"x": time2, "y":value2};
        vm.buildingEnergyNetUseData.push(net);



      }

    }
    function chpConGenHandler (msg) {
      var prediction_chpConGen=msg['ACTIVEPOWER'];
      var timeList = Object.keys(prediction_chpConGen);
      var chpConGenList = Object.values(prediction_chpConGen);
      vm.chpEnergyConGenData = [];
      for (var i = 0; i < timeList.length-1; i++) {
        if (timeList[i] >= vm.startTimeStamp && timeList[i] <= vm.endTimeStamp) {
          //var chpConGen = {"x": timeList[i], "y": chpConGenList[i]};
          //vm.chpEnergyConGenData.push(chpConGen);

          var time1=timeList[i];
          var value1=chpConGenList[i];
          var time2=timeList[i+1];
          var value2=chpConGenList[i+1];

          var  chpConGen={"x": time1, "y":value1};
          vm.chpEnergyConGenData.push(chpConGen);

          var  chpConGen={"x": time2, "y":value1};
          vm.chpEnergyConGenData.push(chpConGen);

          var  chpConGen={"x": time2, "y":value2};
          vm.chpEnergyConGenData.push(chpConGen);

          /*for(var time=time1;time<=time2;time++){
            var  chpConGen={"x": time, "y":value1};
            vm.chpEnergyConGenData.push(chpConGen);
          }*/


        }
      }

    }
    function pvGenerationHandler(msg) {
      var prediction_pvGeneration=msg['ACTIVEPOWER'];
      var timeList = Object.keys(prediction_pvGeneration);
      var pvGenList = Object.values(prediction_pvGeneration);
      vm.pvEnergyGenerationData = [];
      for (var i = 0; i < timeList.length-1; i++) {
        if (timeList[i] >= vm.startTimeStamp && timeList[i] <= vm.endTimeStamp) {
          //var pvGen = {"x": timeList[i], "y": pvGenList[i]};
          //vm.pvEnergyGenerationData.push(pvGen);

          var time1=timeList[i];
          var value1=pvGenList[i];
          var time2=timeList[i+1];
          var value2=pvGenList[i+1];

          var  pvGen={"x": time1, "y":value1};
          vm.pvEnergyGenerationData.push(pvGen);

          var  pvGen={"x": time2, "y":value1};
          vm.pvEnergyGenerationData.push(pvGen);

          var  pvGen={"x": time2, "y":value2};
          vm.pvEnergyGenerationData.push(pvGen);



          /*for(var time=time1;time<=time2;time++){
            var  pvGen={"x": time, "y":value1};
            vm.pvEnergyGenerationData.push(pvGen);
          }*/
        }
      }

    }
    function baseLoadHandler(msg) {
      //console.log(msg);
      var prediction_baseLoad = msg['ACTIVEPOWER'];
      var timeList = Object.keys(prediction_baseLoad);
      var baseLoadList = Object.values(prediction_baseLoad);
      vm.buildingBaseLoadData = [];
      for (var i = 0; i < timeList.length-1; i++) {
        if (timeList[i] >= vm.startTimeStamp && timeList[i] <= vm.endTimeStamp) {

          var time1=timeList[i];
          var value1=baseLoadList[i];
          var time2=timeList[i+1];
          var value2=baseLoadList[i+1];

          var  baseLoad={"x": time1, "y":value1};
          vm.buildingBaseLoadData.push(baseLoad);

          var  baseLoad={"x": time2, "y":value1};
          vm.buildingBaseLoadData.push(baseLoad);

          var  baseLoad={"x": time2, "y":value2};
          vm.buildingBaseLoadData.push(baseLoad);

         /* for(var time=time1;time<=time2;time++){
            var  baseLoad={"x": time, "y":value1};
            vm.buildingBaseLoadData.push(baseLoad);
          }*/

          //var baseLoad = {"x": timeList[i], "y": baseLoadList[i]};
          //vm.buildingBaseLoadData.push(baseLoad);
        }
      }

    }
    function epsHandler (msg,type) {

      var prices_activePowerExternal = msg['ACTIVEPOWEREXTERNAL']['prices'];

      var prices_pvFeedin = msg['PVACTIVEPOWERFEEDIN']['prices'];
      var prices_chpFeedin = msg['CHPACTIVEPOWERFEEDIN']['prices'];
      var timeList_electricityPrice = Object.keys(prices_activePowerExternal);
      var timeList_pvFeedin = Object.keys(prices_pvFeedin);
      var timeList_chpFeedin = Object.keys(prices_chpFeedin);
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
    function plsHandler (msg) {


      var loadLimitSignals = msg['ACTIVEPOWEREXTERNAL']['powerLimits'];
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

          var lowerLoadLimit = {"x": time, "y": powerList[powerList.length - 1]['powerLowerLimit']};
          vm.powerLowerLimitData.push(lowerLoadLimit);
        }
      }

      /* vm.powerUpperLimit=vm.powerUpperLimitData[0]['y'];
       vm.powerLowerLimit=vm.powerLowerLimitData[0]['y'];*/

      var maxPvEnergyGeneration=vm.pvEnergyGenerationData.length>0?Math.max.apply(Math,vm.pvEnergyGenerationData.map(function(o){return o.y;})):0;
      var maxChpEnergyConGen=vm.chpEnergyConGenData.length>0?Math.max.apply(Math,vm.chpEnergyConGenData.map(function(o){return o.y;})):0;
      var maxBuildingBaseLoad=vm.buildingBaseLoadData.length>0?Math.max.apply(Math,vm.buildingBaseLoadData.map(function(o){return o.y;})):0;
      var maxBuildingEnergyNetUse=vm.buildingEnergyNetUseData.length>0?Math.max.apply(Math,vm.buildingEnergyNetUseData.map(function(o){return o.y;})):0;

      var maxArr=[];
      maxArr.push(maxPvEnergyGeneration);
      maxArr.push(maxChpEnergyConGen);
      maxArr.push(maxBuildingBaseLoad);
      maxArr.push(maxBuildingEnergyNetUse);


      var maxY=Math.max.apply(Math,maxArr);

      var minPvEnergyGeneration=vm.pvEnergyGenerationData.length>0?Math.min.apply(Math,vm.pvEnergyGenerationData.map(function(o){return o.y;})):0;
      var minChpEnergyConGen=vm.chpEnergyConGenData.length>0?Math.min.apply(Math,vm.chpEnergyConGenData.map(function(o){return o.y;})):0;
      var minBuildingBaseLoad=vm.buildingBaseLoadData.length>0?Math.min.apply(Math,vm.buildingBaseLoadData.map(function(o){return o.y;})):0;
      var minBuildingEnergyNetUse=vm.buildingEnergyNetUseData.length>0?Math.min.apply(Math,vm.buildingEnergyNetUseData.map(function(o){return o.y;})):0;

      var minArr=[];
      minArr.push(minPvEnergyGeneration);
      minArr.push(minChpEnergyConGen);
      minArr.push(minBuildingBaseLoad);
      minArr.push(minBuildingEnergyNetUse);

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


    var check = function() {
      vm.wampSession = WAMPService.getWAMPsession();
      if (typeof vm.wampSession != 'undefined'){
        // SUBSCRIBE to a topic and receive events
        vm.wampSession.subscribe('eshl.optimisation.results', predictionHandler).then(
          function (subscription) {
            console.log("subscription.id");
            console.log(subscription.id);

            vm.wampSession.call('wamp.subscription.get_events', [subscription.id, 20]).then(
              function (history) {
                if (history.length !== 0) {
                  //handling past data here
                  console.log("history eshl.optimisation.results received!");
                  //console.log(history);
                  predictionHandler (history[0].args);
                }
              },
              function (error) {
                console.log(error);
              }
            );

          }


        );

      }
      else {
        setTimeout(check, 500); // check again in a second
      }
    };
    check();


    vm.checkElectricityPrice=function () {
      vm.isElectricityPriceChecked=!vm.isElectricityPriceChecked;
      if(vm.isElectricityPriceChecked){
        epsHandler (vm.epsMsg,['external']);
      }else{
        vm.electricityPrices = [];
      }
    }

    vm.checkLoadLimit=function () {
      vm.isLoadLimitChecked=!vm.isLoadLimitChecked;
      if(vm.isLoadLimitChecked){
        plsHandler (vm.plsMsg);
      }else{
        vm.powerUpperLimitData = [];
        vm.powerLowerLimitData = [];
      }
    }

    vm.checkPVFeedin=function () {
      vm.isPVFeedinChecked=!vm.isPVFeedinChecked;
      if(vm.isPVFeedinChecked){
        epsHandler (vm.epsMsg,['pv']);
      }else{
        vm.pvFeedinPrices = [];
      }
    }
    vm.checkCHPFeedin=function () {
      vm.isCHPFeedinChecked=!vm.isCHPFeedinChecked;
      if(vm.isCHPFeedinChecked){
        epsHandler (vm.epsMsg,['chp']);
      }else{
        vm.chpFeedinPrices = [];
      }
    }
    vm.checkPVGeneration=function () {
      vm.isPVGenerationChecked=!vm.isPVGenerationChecked;
      if(vm.isPVGenerationChecked){
        pvGenerationHandler(vm.pvGenMsg);
      }else{
        vm.pvEnergyGenerationData = [];
      }
    }
    vm.checkCHPConGen=function () {
      vm.isCHPConGenChecked=!vm.isCHPConGenChecked;
      if(vm.isCHPConGenChecked){
        chpConGenHandler(vm.chpConGenMsg);
      }else{
        vm.chpEnergyConGenData = [];
      }
    }
    vm.checkBaseLoad=function () {
      vm.isBaseLoadChecked=!vm.isBaseLoadChecked;
      if(vm.isBaseLoadChecked){
        baseLoadHandler(vm.baseLoadMsg);
      }else{
        vm.buildingBaseLoadData = [];
      }
    }
    vm.checkNetEnergyUse=function () {
      vm.isNetEnergyUseChecked=!vm.isNetEnergyUseChecked;
      if(vm.isNetEnergyUseChecked){
        netEnergyUseHandler ();
      }else{
        vm.buildingEnergyNetUseData = [];
      }
    }


  }

}
)();
