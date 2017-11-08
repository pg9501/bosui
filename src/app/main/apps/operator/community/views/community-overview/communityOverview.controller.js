/**
 * Created by pg9501 on 12.05.2017.
 */
(function () {
    'use strict';

    angular
      .module('app.operator.community')
      .controller('CommunityOverviewController', CommunityOverviewController);

    /** @ngInject */
    function CommunityOverviewController($document, $timeout,$window, $scope, $mdDialog,$http,$translate,msNavigationService) {

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

      var vm = this;

      GetAllJoinedCommunities().then(function (result) {


        if(result.length>0){
          for(var i in result){
            result[i].image="assets/images/ecommerce/product-image-placeholder.png";
          }
          vm.joinedCommunities=result;
          console.log(vm.joinedCommunities);
        }

      });

      GetAllUnjoinedCommunities().then(function (result) {

        if(result.length>0){
          for(var i in result){
            result[i].image="assets/images/ecommerce/product-image-placeholder.png";
          }
          vm.unjoinedCommunities=result;
        }
      });

      vm.joinedCommunities= [
       /* {
          "name": "Community 1",
          "householdNum": "158",
          "joinedDate": "02/5/2016",
          "state": "Connected",
          "action": "Disconnect",
          "icon": "assets/images/ecommerce/product-image-placeholder.png"
        },
        {
          "name": "Community 2",
          "householdNum": "89",
          "joinedDate": "01/10/2016",
          "state": "Connected",
          "action": "Disconnect",
          "icon": "assets/images/ecommerce/product-image-placeholder.png"
        },
        {
          "name": "Community 3",
          "householdNum": "57",
          "joinedDate": "01/12/2016",
          "state": "Disconnected",
          "action": "Connect",
          "icon": "assets/images/ecommerce/product-image-placeholder.png"
        }*/
      ];

      vm.unjoinedCommunities= [
       /* {
          "name": "Community 4",
          "householdNum": "158",
          "action": "Join",
          "icon": "assets/images/ecommerce/product-image-placeholder.png"
        },
        {
          "name": "Community 5",
          "householdNum": "89",
          "action": "Join",
          "icon": "assets/images/ecommerce/product-image-placeholder.png"
        },
        {
          "name": "Community 6",
          "householdNum": "57",
          "action": "Join",
          "icon": "assets/images/ecommerce/product-image-placeholder.png"
        }*/
      ];

      vm.gotoCommunityAction=function (community, action,event) {

        if(action=="Disconnect"){
          community.connectionState="Disconnected";
          community.actions=["Connect","Leave"];
          UpdateCommunity(community);

        }else if(action =="Connect"){
          community.connectionState="Connected";
          community.actions=["Disconnect","Leave"];
          UpdateCommunity(community);
        }else if(action=="Leave"){

          var confirm = $mdDialog.confirm()
            .title('Confirmation')
            .textContent('Are you sure to leave this community?')
            .ariaLabel('Lucky day')
            .targetEvent(event)
            .ok('Yes')
            .cancel('Cancel');

          $mdDialog.show(confirm).then(function() {
            for(var i in vm.joinedCommunities){
              if(vm.joinedCommunities[i].name==community.name){
                vm.joinedCommunities.splice(i,1);
                community.connectionState="Disconnected";
                community.actions=["Join"];
                vm.unjoinedCommunities.push(community);
                UpdateCommunity(community);
              }
            }
          }, function() {
              return;
          });


        }else if(action=="Join"){
          for(var i in vm.unjoinedCommunities){
            if(vm.unjoinedCommunities[i].name==community.name){
              vm.unjoinedCommunities.splice(i,1);
              community.connectionState="Disconnected";
              community.actions=["Connect","Leave"];
              vm.joinedCommunities.push(community);
              UpdateCommunity(community);
            }
          }
        }


      }


      vm.builingTypeMoreInfo=function(community, buildingType){


        $mdDialog.show({
            controller: DialogController,
            locals:{community:community,buildingType:buildingType},
            clickOutsideToClose: true,
            parent: angular.element(document.body),
            template: createBuildingTypeDetailsTemplate(community,buildingType),
            targetEvent: $window.event
          })
          .then(function(answer) {
            $scope.alert = 'You said the information was "' + answer + '".';
          }, function() {
            $scope.alert = 'You cancelled the dialog.';
          });
      }
      vm.communityMoreInfo=function(community){

        $mdDialog.show({
            controller: DialogController,
            locals:{community:community},
            clickOutsideToClose: true,
            parent: angular.element(document.body),
            template: createCommunityDetailsTemplate(community),
            targetEvent: $window.event
          })
          .then(function(answer) {
            $scope.alert = 'You said the information was "' + answer + '".';
          }, function() {
            $scope.alert = 'You cancelled the dialog.';
          });
      }
      function DialogController($scope, $mdDialog) {

        $scope.close = function() {
          $mdDialog.hide();
        };

      };
      function createCommunityDetailsTemplate(community){

        var templateHead='<link rel="stylesheet" type="text/css" href="app/main/apps/dweller/energy-flows/energy-flows.scss" />'+
          '<md-dialog id="dialog" aria-label="Mango (Fruit)" style="width: 40%; height: 53%">'+
          '<form>'+
          '<md-toolbar class="md-accent-bg">'+
          '<div class="md-accent-bg md-toolbar-tools">'+
          '<div class="md-table-thumbs" style="float: left;" >'+
          '<div style="background-image:url('+community.image+');"></div>'+
          // '<img src='+deviceInfo.href+' width="50" height="50" class="md-avatar"/>'+
          '</div>'+
          '<h2>&nbsp;&nbsp;'+community.name+'</h2>'+
          '<span flex></span>'+
          '<md-button class="md-icon-button" ng-click="close()">'+
          '<md-icon md-svg-src="assets/images/svg/ic_close_24px.svg" aria-label="Close dialog"></md-icon>'+
          '</md-button>'+
          '</div>'+
          '</md-toolbar>'+
          '<md-dialog-content>'+
          '<table width="100%" style="font-family:sans-serif"><tr>';

        var content='';
        for(var i in community.otherCommunityInfo){
          var info=community.otherCommunityInfo[i];
          //console.log(state);
          var infoName=info.name;
          var infoValue=info.value;
          if(infoName==='Joined Date'){
            continue;
          }
          if(info.unit != null){
            var unit=info.unit;
            if(unit == "square metre"){
              unit="m<sup>2</sup>";
            }
            infoValue+=" "+unit;
          }
          content+="<tr style='font-size: small'><td style='font-weight:bold'><h3>"+ infoName.replace(/_/g ," ")+":</h3> </td><td><h3>"+infoValue+"</h3></td></tr>";
        }


        var templateContent='<td width="50%" valign="top"><table width="100%">'+content+'</table></td>';
        var templateTail=
          '</tr></table>'+
          '</md-dialog-content>'+
          '</form>'+
          '</md-dialog>';

        return templateHead+templateContent+templateTail;
      }

      function createBuildingTypeDetailsTemplate(community,buildingType){

        var type='';
        if($translate.use().substring(0,1)=='c'){
          if(buildingType.name=='Residential Building'){
            type='居民楼';
          };
          if(buildingType.name=='Commercial Building'){
            type='商业楼';
          };
          if(buildingType.name=='Office Building'){
            type='办公楼';
          };
        }
        if($translate.use().substring(0,1)=='e'){
          type=buildingType.name+"s";
        }

        var templateHead='<link rel="stylesheet" type="text/css" href="app/main/apps/dweller/energy-flows/energy-flows.scss" />'+
          '<md-dialog id="dialog" aria-label="Mango (Fruit)" style="width: 40%; height: 53%">'+
          '<form>'+
          '<md-toolbar class="md-accent-bg">'+
          '<div class="md-accent-bg md-toolbar-tools">'+
          '<div class="md-table-thumbs" style="float: left;" >'+
          '<div style="background-image:url('+community.image+');"></div>'+
          // '<img src='+deviceInfo.href+' width="50" height="50" class="md-avatar"/>'+
          '</div>'+
          '<h2>&nbsp;&nbsp;'+community.name+': '+type+'</h2>'+
          '<span flex></span>'+
          '<md-button class="md-icon-button" ng-click="close()">'+
          '<md-icon md-svg-src="assets/images/svg/ic_close_24px.svg" aria-label="Close dialog"></md-icon>'+
          '</md-button>'+
          '</div>'+
          '</md-toolbar>'+
          '<md-dialog-content>'+
          '<table width="100%" style="font-family:sans-serif"><tr>';


        var templateContent='<td width="50%" valign="top"><table width="100%">'+createBuildingTypeInfoTemplate(buildingType)+'</table></td>';
        var templateTail=
          '</tr></table>'+
          '</md-dialog-content>'+
          '</form>'+
          '</md-dialog>';

        return templateHead+templateContent+templateTail;
      }
      function createBuildingTypeInfoTemplate(buildingType){

        var content='';
        content+="<tr style='font-size: small'><td style='font-weight:bold'><h3>"+ "number of building"+": </h3></td><td><h3>"+buildingType.numberOfBuildings+"</h3></td></tr>";
        for(var i in buildingType.otherInfo){
          var info=buildingType.otherInfo[i];
          //console.log(state);
          var infoName=info.name;
          var infoValue=info.value;
          if(info.unit != null){
            var unit=info.unit;
            if(unit == "square metre"){
              unit="m<sup>2</sup>";
            }
            infoValue+=" "+unit;
          }
          content+="<tr style='font-size: small'><td style='font-weight:bold'><h3>"+ infoName.replace(/_/g ," ")+":</h3> </td><td><h3>"+infoValue+"</h3></td></tr>";
        }

        return content;
      }
      vm.changeGranularity=function (community) {
        UpdateCommunity(community);
      }
      function GetAllJoinedCommunities() {
        return $http.get('http://localhost:8087/bos/api/communities/joined').then(handleSuccess, handleError('Error getting all joined communities'));
      }
      function GetAllUnjoinedCommunities() {
        return $http.get('http://localhost:8087/bos/api/communities/unjoined').then(handleSuccess, handleError('Error getting all unjoined communities'));
      }
      function UpdateCommunity(community) {
        return $http.put('http://localhost:8087/bos/api/communities/',community).then(handleSuccess, handleError('Error getting all joined communities'));
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
