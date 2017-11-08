/**
 * Created by pg9501 on 22.05.2017.
 */
(function ()
{
  'use strict';

  angular
    .module('app.operator.optimization-goals')
    .directive('sliderWidget', function() {
      return {
        restrict: 'E',
        scope: {
          goal: "=",
          changed: "="

        },
        template:

        '<div layout="row" layout-align="start center">'+
        '<md-slider-container style="width: 200px;margin-bottom: -20px">'+
          '<md-slider flex min="{{goal.widget.min_value}}" max="{{goal.widget.max_value}}" step="{{goal.widget.step}}" ng-model="goal.value" aria-label="red" id="goal-slider" ng-change="change()">'+
          '</md-slider>'+

        /*  '<md-input-container>'+
          '<input flex type="text" ng-model="goal.value" aria-label="red" ng-disabled="true" style="width: 50px" aria-controls="goal-slider">'+
          '</md-input-container>'+*/
            '</md-slider-container>'+
        '<label style="margin-left: 10px;">Weight: <u>{{goal.value}}</u></label>'+
        '</div>',
        controller: ["$scope", function ($scope) {
          $scope.goal.value = parseInt($scope.goal.value, 10);
          $scope.change=function () {
            $scope.changed=true;
          }
        }]
      };
    })
})();
