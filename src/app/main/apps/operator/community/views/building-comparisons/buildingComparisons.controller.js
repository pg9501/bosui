/**
 * Created by pg9501 on 12.05.2017.
 */
(function () {
    'use strict';

    angular
      .module('app.operator.community')
      .controller('BuildingComparisonsController', BuildingComparisonsController);

    /** @ngInject */
    function BuildingComparisonsController($document, $timeout,$window, $scope, $mdDialog,$http,$translate,msNavigationService) {

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
      vm.comparisonContents=[
        "Energy Consumption",
        "Energy Generation",
        "Net Energy Use",
      /*  "Energy Consumption Cost",
        "Energy Generation Profit",
        "Net Energy Use Cost",*/
        "Greenhouse Gas Emission"
      ];
      vm.comparisonModes=[
        "Per Person",
        "Per Square Meter"
      ];

      vm.buildingComparison={
        "StartDate":"",
        "EndDate":"",
        "Month":"",
        "ComparisonContent":"",
        "ComparisonMode":"",
        "Community":""
      };

      vm.buildingComparionValues={
        "Energy Consumption":{"buildingValue":100,"communityValue":89,"rankingValue":"21/145","unit":"W","medal":""},
        "Energy Generation":{"buildingValue":100,"communityValue":89,"rankingValue":"33/145","unit":"W","medal":""},
        "Net Energy Use":{"buildingValue":100,"communityValue":89,"rankingValue":"45/145","unit":"W","medal":""},
        "Energy Consumption Cost":{"buildingValue":10,"communityValue":9,"rankingValue":"24/145","unit":"Euro","medal":""},
        "Energy Generation Profit":{"buildingValue":10,"communityValue":9,"rankingValue":"46/145","unit":"Euro","medal":""},
        "Net Energy Cost":{"buildingValue":10,"communityValue":9,"rankingValue":"25/145","unit":"Euro","medal":""},
        "Greenhouse Gas Emission":{"buildingValue":130,"communityValue":139,"rankingValue":"37/145","unit":"","medal":""}
      };

      vm.monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

      vm.getMonthNames=function () {

      }

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


      /*vm.toggle=function(item){
        var idx = vm.buildingComparison.ComparisonContents.indexOf(item);
        if (idx > -1) {
          vm.buildingComparison.ComparisonContents.splice(idx, 1);
        }
        else {
          vm.buildingComparison.ComparisonContents.push(item);
        }
      };*/

      vm.calculate=function(){
        $mdDialog.show({
            controller: DialogController,
            locals:{buildingComparison:vm.buildingComparison},
            clickOutsideToClose: true,
            parent: angular.element(document.body),
            template: createBuildingComparisonTemplate(vm.buildingComparison),
            targetEvent: $window.event
          })
          .then(function(answer) {
            $scope.alert = 'You said the information was "' + answer + '".';
          }, function() {
            $scope.alert = 'You cancelled the dialog.';
          });
      };

      function DialogController($scope, $mdDialog) {

        $scope.close = function() {
          $mdDialog.hide();
        };

        $scope.data=  [{"agence":"CTM","secteur":"Safi","statutImp":"operationnel"}];
        $scope.exportToPDF=function () {

          /*for(var i in vm.buildingComparison.ComparisonContents){

              var divID='barCharDiv'+i;
              var canvasID='canvas'+i;

              var canvas = document.getElementById(canvasID);

              var svg = document.getElementById(divID);
              var svgWider = svg.innerHTML;
              canvg(canvas, svgWider);


          }*/

          var margins = {
            top: 80,
            bottom: 60,
            left: 40,
            width: 522
          };

          var doc = new jsPDF('p', 'pt', 'letter');
            doc.internal.scaleFactor = 1.5;

          var options = {
            pagesplit: true,
            background:'white',
            format : 'PNG'
          };
          doc.addHTML($('#exportthis'),15, 15,options,function() {
            doc.save('sample-file.pdf');
          });





        /*  var pdf = new jsPDF('p', 'pt', [580, 630]);

          html2canvas($('#exportthis'), {
            onrendered: function(canvas) {
              document.body.appendChild(canvas);
              var ctx = canvas.getContext('2d');
              //ctx.scale(2, 2);
              var imgData = canvas.toDataURL("image/png", 1.0);
              var width = canvas.width;
              var height = canvas.clientHeight;
              pdf.addImage(imgData, 'PNG', 20, 20, (width - 10), (height));

            }
          });

          html2canvas($('#fieldset2'), {
            allowTaint: true,
            onrendered: function(canvas) {
              var ctx = canvas.getContext('2d');
              var imgData = canvas.toDataURL("image/png", 1.0);
              var htmlH = $("#fieldset2").height() + 100;
              var width = canvas.width;
              var height = canvas.clientHeight;
              pdf.addPage(580, htmlH);
              pdf.addImage(imgData, 'PNG', 20, 20, (width - 40), (height));
              pdf.save('sample.pdf');
            }
          });*/



         /* html2canvas(document.getElementById('exportthis'), {
            onrendered: function (canvas) {
              var data = canvas.toDataURL();
              var docDefinition = {
                content: [{
                  image: data,
                  width: 500,
                }]
              };
              console.log("dataaaaaaaaaaa");
              console.log(data);
              pdfMake.createPdf(docDefinition).download("test.pdf");
            }
          });*/


         /* var doc = new jsPDF('p', 'mm');

          html2canvas($('#exportthis'), {
            onrendered: function (canvas) {

              var imgData = canvas.toDataURL("image/png", 1.0);
              doc.addImage(imgData, 'PNG', 0, 0);

              doc.save('file.pdf');﻿
              //doc.output('datauri');

            }
          });*/






        }




        }



      function createBuildingComparisonTemplate(buildingComparison){

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
          '<h2>&nbsp;&nbsp; {{"BUILDING_COMPARISONS.BUILDING_ENERGY_COMPARISON"|translate}}'+' </h2>'+
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


        var templateContent=createBuildingComparisonContentTemplate(buildingComparison);
        var templateTail=
          '</div>'+
          '</md-dialog-content>'+
          '</form>'+
          '</md-dialog>';

        return templateHead+templateContent+templateTail;
      }
      var convertDate=function (date) {
        return (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
      }

      function createBuildingComparisonContentTemplate(buildingComparison){

        var content='';
        content+=
         // "<div layout='row' layout-align='space-between center'><div><h3><b>"+ "Time Period "+": "+convertDate(buildingComparison.StartDate)+" -- "+convertDate(buildingComparison.EndDate)+" </b></h3></div>" +

          "<div layout='row' layout-align='space-between center'><div><h3><b>"+ "{{'BUILDING_COMPARISONS.MY_BUILDING'|translate}} &nbsp; vs. &nbsp; "+buildingComparison.Community+" </b></h3></div>" +
          "<div><md-button class='md-icon-button' aria-label='md-button'><md-icon md-font-icon='icon-export' class='md-accent' ng-click='exportToPDF()'></md-icon><md-tooltip>{{'BUILDING_COMPARISONS.EXPORT_REPORT'|translate}}</md-tooltip></md-button>" +
          "<md-button class='md-icon-button' aria-label='md-button'><md-icon md-font-icon='icon-facebook-box' class='md-accent' ng-click=''></md-icon><md-tooltip>{{'BUILDING_COMPARISONS.SHARE_REPORT_FACEBOOK'|translate}}</md-tooltip></md-button>" +
          "<md-button class='md-icon-button' aria-label='md-button'><md-icon md-font-icon='icon-twitter-box' class='md-accent' ng-click=''></md-icon><md-tooltip>{{'BUILDING_COMPARISONS.SHARE_REPORT_TWITTER'|translate}}</md-tooltip></md-button>"+
          "<md-button class='md-icon-button' aria-label='md-button'><md-icon md-font-icon='icon-google-plus-box' class='md-accent' ng-click=''></md-icon><md-tooltip>{{'BUILDING_COMPARISONS.SHARE_REPORT_GOOGLE'|translate}}</md-tooltip></md-button>"+
          "</div>" +
          "</div>"+
          "<div ><h3><b>"+"{{'BUILDING_COMPARISONS.TIME_PERIOD'|translate}} "+": "+buildingComparison.Month+" </b></h3></div>";

        var xTitleUnit1="";
        var xTitleUnit2="";
     //   for(var i in buildingComparison.ComparisonContents){
          var comparisonContent=buildingComparison.ComparisonContent;
          var mode=buildingComparison.ComparisonMode;
         /* if(mode=='Power Per Person'){
           // mode='/person/day';
            xTitleUnit='KWH/person';
          }else if(mode=='Power Per Square Meter'){
            //mode='/m<sup>2</sup>/day';
            xTitleUnit='KWH/m<sup>2</sup>';
          }else if(mode=='Cost Per Person'){
            xTitleUnit='Cent/person';
          }else if(mode=='Cost Per Square Meter'){
            xTitleUnit='Cent/m<sup>2</sup>';
          }*/


          var data1=[];
          var data2=[];
          var medal1="confused";
          var medal2="confused";
          switch(comparisonContent){
           /* case "Energy Consumption Cost":
            case "Energy Generation Profit":
            case "Net Energy Use Cost":
              xTitleUnit='Cent/person';
              var num=0;
              var number=0;
              for(var j in vm.communities){
                if(vm.communities[j].name==buildingComparison.Community){
                  num=vm.communities[j].buildingNum;
                  number=vm.communities[j].buildingNum;
                }
              }

              var data = [];
              var n = 1;
              while (num > 0 && n <10) {
                var a = Math.round(Math.random() * (15 - 1)) + 1;
                num -= a;

                data.push({x:10*n,y:a});
                n++;
              }
              var ranking=Math.round(Math.random()*20)+Math.round(Math.random() * (15 - 1)) + 1;
              if(ranking<=number/5){
                medal="like";
              }else if(ranking<=number/2){
                medal="happy";
              }else if(ranking<3*number/4){
                medal="confused";
              }else{
                medal="depression";
              }
              vm.buildingComparionValues[comparisonContent]={"buildingValue":data[2].y,"communityValue":data[4].y,"rankingValue":ranking+"/"+number,"unit":""};

              break;*/
            case "Energy Consumption":
            case "Energy Generation":
            case "Net Energy Use":
              if(mode=='Per Person'){
                xTitleUnit1='KWH/person';
                xTitleUnit2='cent/person';
              }else{
                xTitleUnit1='KWH/m<sup>2</sup>';
                xTitleUnit2='Cent/m<sup>2</sup>';
              }

              var num=0;
              var number=0;
              for(var j in vm.communities){
                if(vm.communities[j].name==buildingComparison.Community){
                  num=vm.communities[j].buildingNum;
                  number=vm.communities[j].buildingNum;
                }
              }

              var n = 1;
              while (num > 0 && n <10) {
                var a = Math.round(Math.random() * (15 - 1)) + 1;
                num -= a;

                data1.push({x:n,y:a});
                n++;
              }
              var ranking1=Math.round(Math.random()*22)+Math.round(Math.random() * (15 - 1)) + 1;

              if(ranking1<=number/5){
                medal1="like";
              }else if(ranking1<=number/2){
                medal1="happy";
              }else if(ranking1<3*number/4){
                medal1="confused";
              }else{
                medal1="depression";
              }
              vm.buildingComparionValues[comparisonContent]={"buildingValue":data1[2].y,"communityValue":data1[4].y,"rankingValue":ranking1+"/"+number,"unit":xTitleUnit1,"medal":medal1};

              var n = 1;
              num=number;
              while (num > 0 && n <10) {
                var a = Math.round(Math.random() * (15 - 1)) + 1;
                num -= a;

                data2.push({x:n,y:a});
                n++;
              }
              var ranking2=Math.round(Math.random()*20)+Math.round(Math.random() * (15 - 1)) + 1;
              if(ranking2<=number/5){
                medal2="like";
              }else if(ranking2<=number/2){
                medal2="happy";
              }else if(ranking2<3*number/4){
                medal2="confused";
              }else{
                medal2="depression";
              }
              vm.buildingComparionValues[comparisonContent+" Cost"]={"buildingValue":data2[2].y,"communityValue":data2[4].y,"rankingValue":ranking2+"/"+number,"unit":xTitleUnit2,"medal":medal2};
              break;
            case "Greenhouse Gas Emission":
              if(mode=='Per Person'){
                xTitleUnit1="kg/person";
              }else{
                xTitleUnit1="kg/m<sup>2</sup>";
              }

              var num=0;
              var number=0;
              for(var j in vm.communities){
                if(vm.communities[j].name==buildingComparison.Community){
                  num=vm.communities[j].buildingNum;
                  number=vm.communities[j].buildingNum;
                }
              }

              var n = 1;
              while (num > 0 && n <10) {
                var a = Math.round(Math.random() * (15 - 1)) + 1;
                num -= a;

                data1.push({x:n,y:a});
                n++;
              }
              var ranking=Math.round(Math.random()*24)+Math.round(Math.random() * (15 - 1)) + 1;
              if(ranking<=number/5){
                medal1="like";
              }else if(ranking<=number/2){
                medal1="happy";
              }else if(ranking<3*number/4){
                medal1="confused";
              }else{
                medal1="depression";
              }
              vm.buildingComparionValues[comparisonContent]={"buildingValue":data1[2].y,"communityValue":data1[4].y,"rankingValue":ranking+"/"+number,"unit":xTitleUnit1,"medal":medal1};
              break;
            default:

                  break;
          }
        //  xTitleUnit+=mode;
          var xTitle1=comparisonContent+" ("+xTitleUnit1+")";
          xTitle1 = xTitle1.split(' ').join('_');
          xTitle1=xTitle1.replace("<sup>2</sup>","2");

          var xTitle2=comparisonContent+" ("+xTitleUnit2+")";
          xTitle2 = xTitle2.split(' ').join('_');
          xTitle2=xTitle2.replace("<sup>2</sup>","2");
          var divID1='barCharDiv1';
          var divID2='barCharDiv2';
          var canvasID='canvas'+i;
          var fieldsetID='fieldset'+i;



        var type=comparisonContent;
        if($translate.use().substring(0,1)=='c'){
          if(comparisonContent==="Energy Consumption"){
            type="电能消耗";
          }
          if(comparisonContent==="Energy Generation"){
            type="电能生成";
          }
          if(comparisonContent==="Net Energy Use"){
            type="净能源使用";
          }
          if(comparisonContent==="Greenhouse Gas Emission"){
            type="温室气体生成";
          }
        }

        if($translate.use().substring(0,1)=='d'){
          if(comparisonContent==="Energy Consumption"){
            type="Energieverbrauch";
          }
          if(comparisonContent==="Energy Generation"){
            type="Energieerzeugung";
          }
          if(comparisonContent==="Net Energy Use"){
            type="Nettoverbrauch";
          }
          if(comparisonContent==="Greenhouse Gas Emission"){
            type="Treibhausgasemission";
          }
        }

          /*content+="<fieldset id="+fieldsetID+" style='border-style: solid;border-width: 1px;height: 100%; margin-top: 20px' flex> <legend ><b>"+comparisonContent+"</b></legend>";*/
          content+="<div layout='column' >";
          content+="<div ><h3><b>"+type+":</b></h3></div>";
          content+="<div layout='row' style='margin-top: 5px' flex><div flex='45'>{{'BUILDING_COMPARISONS.AVERAGE_POWER_IN_BUILDING'|translate}}:</div>"+"<div>"+vm.buildingComparionValues[comparisonContent].buildingValue+" "+vm.buildingComparionValues[comparisonContent].unit+"</div></div>";
          content+="<div layout='row' style='margin-top: 5px' flex><div flex='45'>{{'BUILDING_COMPARISONS.AVERAGE_POWER_IN_COMMUNITY'|translate}}:</div>"+"<div>"+vm.buildingComparionValues[comparisonContent].communityValue+" "+vm.buildingComparionValues[comparisonContent].unit+"</div></div>";
          content+="<div layout='row' style='margin-top: 5px' flex><div flex='45'>{{'BUILDING_COMPARISONS.POWER_RANKING'|translate}}:</div>"+"<div>"+vm.buildingComparionValues[comparisonContent].rankingValue+"</div><div style='margin-left: 10px'><img src='assets/images/"+vm.buildingComparionValues[comparisonContent].medal+".png' /></div></div>";
          content+="<div id="+divID1+" building-comparison-bar-chart container-id="+divID1+" data="+JSON.stringify(data1)+" title="+xTitle1+" ></div>";
          if(comparisonContent!="Greenhouse Gas Emission"){
            content+="<div layout='row' style='margin-top: 5px' flex><div flex='45'>{{'BUILDING_COMPARISONS.AVERAGE_COST_IN_BUILDING'|translate}}:</div>"+"<div>"+vm.buildingComparionValues[comparisonContent+" Cost"].buildingValue+" "+vm.buildingComparionValues[comparisonContent+" Cost"].unit+"</div></div>";
            content+="<div layout='row' style='margin-top: 5px' flex><div flex='45'>{{'BUILDING_COMPARISONS.AVERAGE_COST_IN_COMMUNITY'|translate}}:</div>"+"<div>"+vm.buildingComparionValues[comparisonContent+" Cost"].communityValue+" "+vm.buildingComparionValues[comparisonContent+" Cost"].unit+"</div></div>";
            content+="<div layout='row' style='margin-top: 5px' flex><div flex='45'>{{'BUILDING_COMPARISONS.COST_RANKING'|translate}}:</div>"+"<div>"+vm.buildingComparionValues[comparisonContent+" Cost"].rankingValue+"</div><div style='margin-left: 10px'><img src='assets/images/"+vm.buildingComparionValues[comparisonContent+" Cost"].medal+".png' /></div></div>";
            content+="<div id="+divID2+" building-comparison-bar-chart container-id="+divID2+" data="+JSON.stringify(data2)+" title="+xTitle2+" ></div>";
          }

          /*content+="<div><canvas id="+canvasID+"></canvas></div>";*/
         /* content+="</fieldset>";*/
          content+="</div>";


        /*  content+="<tr><td><h3><b>"+ comparisonContent+" in my building: </b></h3></td><td><h3>"+100+mode+"</h3></td></tr>";
          content+="<tr><td><h3><b>Average"+ comparisonContent+" in the community: </b></h3></td><td><h3>"+100+mode+"</h3></td></tr>";
          content+="<tr><td><h3><b>"+ "Ranking in the community: </b></h3></td><td><h3>"+22/150+"</h3></td></tr>";*/
     //   }

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
