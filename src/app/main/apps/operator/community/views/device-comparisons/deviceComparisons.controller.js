/**
 * Created by pg9501 on 12.05.2017.
 */
(function () {
    'use strict';

    angular
      .module('app.operator.community')
      .controller('DeviceComparisonsController', DeviceComparisonsController);

    /** @ngInject */
    function DeviceComparisonsController($document, $timeout,$window, $scope, $mdDialog,$http,$translate,msNavigationService) {

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
      vm.communities=[];
      vm.comparisonModes=[
        "Per Person",
        "Per Usage"
      ];

      vm.buildingComparison={
        "Month":"",
        "Device":"",
        "ComparisonMode":"",
        "Community":""
      };

      var today = new Date();

      var aMonth = today.getMonth()-1;
      vm.months= [];
      var month = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
      var year=1900+today.getYear();
      for (var i=0; i<12; i++) {
        vm.months.push(month[aMonth]+", "+year);
        aMonth--;
        if (aMonth < 0) {
          aMonth = 11;
          year--;
        }
      }

      vm.devices=["Washing Machine","Dishwasher","Coffee Machine","Air Conditioner","µCHP","Hob Induction","Oven","Tumble Dryer","Freezer","Fridge"];

      vm.calculate=function(){
        $mdDialog.show({
            controller: DialogController,
            locals:{deviceComparison:vm.deviceComparison},
            clickOutsideToClose: true,
            parent: angular.element(document.body),
            template: createDeviceComparisonTemplate(vm.deviceComparison),
            targetEvent: $window.event
          })
          .then(function(answer) {
            $scope.alert = 'You said the information was "' + answer + '".';
          }, function() {
            $scope.alert = 'You cancelled the dialog.';
          });
      };

      function DialogController($scope, $mdDialog) {

        $scope.close = function () {
          $mdDialog.hide();
        };
      }

      function createDeviceComparisonTemplate(deviceComparison){

        var templateHead=' <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.22/pdfmake.min.js"></script>'+
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js"></script>'+
            '<script type="text/javascript" src="http://canvg.github.io/canvg/canvg.js"></script> '+
            '<script type="text/javascript" src="http://canvg.github.io/canvg/StackBlur.js"></script>'+
            '<script type="text/javascript" src="http://canvg.github.io/canvg/rgbcolor.js"></script>'+
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.min.js"></script>'+
            '<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.debug.js"></script>'+
            '<md-dialog id="dialog" aria-label="Mango (Fruit)" style="width: 40%; height: 65%">'+
            '<form>'+
            '<md-toolbar class="md-accent-bg">'+
            '<div  class="md-accent-bg md-toolbar-tools">'+
            '<div class="md-table-thumbs" style="float: left;" >'+
            '<div style="background-image:url(assets/images/scale.png);"></div>'+
            // '<img src='+deviceInfo.href+' width="50" height="50" class="md-avatar"/>'+
            '</div>'+
            '<h2>&nbsp;&nbsp; {{"DEVICE_COMPARISONS.DEVICE_ENERGY_COMPARISON"|translate}}'+' </h2>'+
            '<span flex></span>'+
            '<md-button class="md-icon-button" ng-click="close()">'+
            '<md-icon md-svg-src="assets/images/svg/ic_close_24px.svg" aria-label="Close dialog"></md-icon>'+
            '</md-button>'+
            '</div>'+
            '</md-toolbar>'+
            '<md-dialog-content>'+
            '<div id="editor"></div>'+
            '<div id="exportthis" layout="column" layout-align="start">'
          ;


        var templateContent=createDeviceComparisonContentTemplate(deviceComparison);
        var templateTail=
          '</div>'+
          '</md-dialog-content>'+
          '</form>'+
          '</md-dialog>';

        return templateHead+templateContent+templateTail;
      };

      vm.deviceComparionValue={"deviceValue":100,"communityValue":89,"rankingValue":"21/145","unit":"W"};

      function createDeviceComparisonContentTemplate(deviceComparison){

        var content='';
        content+=
          "<div layout='row' layout-align='space-between center'><div><h3><b>"+ "{{'BUILDING_COMPARISONS.MY_BUILDING'|translate}} &nbsp; vs. &nbsp; "+deviceComparison.Community+" </b></h3></div>" +
          "<div><md-button class='md-icon-button' aria-label='md-button'><md-icon md-font-icon='icon-export' class='md-accent' ng-click='exportToPDF()'></md-icon><md-tooltip>{{'BUILDING_COMPARISONS.EXPORT_REPORT'|translate}}</md-tooltip></md-button>" +
          "<md-button class='md-icon-button' aria-label='md-button'><md-icon md-font-icon='icon-facebook-box' class='md-accent' ng-click=''></md-icon><md-tooltip>{{'BUILDING_COMPARISONS.SHARE_REPORT_FACEBOOK'|translate}}</md-tooltip></md-button>" +
          "<md-button class='md-icon-button' aria-label='md-button'><md-icon md-font-icon='icon-twitter-box' class='md-accent' ng-click=''></md-icon><md-tooltip>{{'BUILDING_COMPARISONS.SHARE_REPORT_TWITTER'|translate}}</md-tooltip></md-button>"+
          "<md-button class='md-icon-button' aria-label='md-button'><md-icon md-font-icon='icon-google-plus-box' class='md-accent' ng-click=''></md-icon><md-tooltip>{{'BUILDING_COMPARISONS.SHARE_REPORT_GOOGLE'|translate}}</md-tooltip></md-button>"+
          "</div>" +
          "</div>"+
          "<div ><h3><b>"+"{{'BUILDING_COMPARISONS.TIME_PERIOD'|translate}} "+": "+deviceComparison.Month+" </b></h3></div>";

        var comparisonContent=deviceComparison.Device;

        var mode=deviceComparison.ComparisonMode;
        var xTitleUnit="";
        if(mode=='Power Per Person'){
          xTitleUnit='KWH/person';
        }else if(mode=='Power Per Usage'){
          xTitleUnit='KWH/usage';
        }else if(mode=='Usages Per Person'){
          xTitleUnit='usages/person';
        }else if(mode=='Cost Per Person'){
          xTitleUnit='cent/person';
        }

        var medal="";
        var num=0;
        var number=0;
        for(var j in vm.communities){
          if(vm.communities[j].name==deviceComparison.Community){
            num=vm.communities[j].buildingNum;
            number=vm.communities[j].buildingNum;
          }
        }

        var data = [];
        var n = 1;
        while (num > 0 && n <10) {
          var a = Math.round(Math.random() * (15 - 1)) + 1;
          num -= a;

          data.push({x:n,y:a});
          n++;
        }
        var ranking=Math.round(Math.random()*24)+Math.round(Math.random() * (15 - 1)) + 1;
        if(ranking<=number/5){
          medal="like";
        }else if(ranking<=number/2){
          medal="happy";
        }else if(ranking<3*number/4){
          medal="confused";
        }else{
          medal="depression";
        }
        vm.deviceComparionValue={"deviceValue":data[2].y,"communityValue":data[4].y,"rankingValue":ranking+"/"+number,"unit":""};
        var xTitle=comparisonContent+" ("+xTitleUnit+")";
        xTitle = xTitle.split(' ').join('_');
        var type1="Average "+mode.split(' ')[0].toLowerCase()+" in my building";
        var type2="Average "+mode.split(' ')[0].toLowerCase()+" in the community";
        var type3=mode.split(' ')[0]+" ranking in the community";
        if($translate.use().substring(0,1)=='c'){
          if(mode.split(' ')[0]==='Cost'){
            type1="在本建筑的平均电能花费";
            type2="社区的平均电能花费";
            type3="电能花费在社区的排名";
          }
          if(mode.split(' ')[0]==='Power'){
            type1="在本建筑的平均电能消耗";
            type2="社区的平均电能消耗";
            type3="电能使用在社区的排名";
          }
        }
        if($translate.use().substring(0,1)=='d'){
          if(mode.split(' ')[0]==='Cost'){
            type1="Durchschnittskosten in meinem Gebäude";
            type2="Durchschnittskosten in der Gemeinschaft";
            type3="Kosten-Ranking in der Gemeinschaft";
          }
          if(mode.split(' ')[0]==='Power'){
            type1="Die Leistung in meinem Gebäude";
            type2="Durchschnittliche Leistung in der Gemeinschaft";
            type3="Leistung-Ranking in der Gemeinschaft";
          }
        }
        var divID='barCharDiv';
        content+="<fieldset style='border-style: solid;border-width: 1px;height: 100%; margin-top: 20px' flex> <legend ><b>"+comparisonContent+" (unit"+" : "+xTitleUnit+")</b></legend>";
        content+="<div layout='row' style='margin-top: 5px' flex><div flex='45'> "+type1+" :</div>"+"<div>"+vm.deviceComparionValue.deviceValue+" "+vm.deviceComparionValue.unit+"</div></div>";
        content+="<div layout='row' style='margin-top: 5px' flex><div flex='45'> "+type2+" :</div>"+"<div>"+vm.deviceComparionValue.communityValue+" "+vm.deviceComparionValue.unit+"</div></div>";
        content+="<div layout='row' style='margin-top: 5px' flex><div flex='45'>"+type3+" :</div>"+"<div>"+vm.deviceComparionValue.rankingValue+"</div><div style='margin-left: 10px'><img src='assets/images/"+medal+".png' /></div></div>";
        content+="<div id="+divID+" building-comparison-bar-chart container-id="+divID+" data="+JSON.stringify(data)+" title="+xTitle+" ></div>";
        content+="</fieldset>";

        return content;
      }

      GetAllJoinedCommunities().then(function (result) {

        if(result.length>0){
          var buildingNum=0;
          for(var i in result){
            for(var j in result[i].buildingTypes){
              if(result[i].buildingTypes[j].name=="Residential Building"){
                buildingNum=result[i].buildingTypes[j].numberOfBuildings;
                break;
              }
            }
            vm.communities.push({"name":result[i].name,"buildingNum":buildingNum});
          }
        }

      });


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
