/**
 * Created by pg9501 on 10.07.2017.
 */
(function ()
{
  'use strict';

  angular
    .module('app.dweller.scenes')
    .directive('ngTouchSpin', ['$timeout', '$interval', '$document', function($timeout, $interval, $document) {
      'use strict';

      var key_codes = {
        left  : 37,
        right : 39
      };

      var setScopeValues = function (scope, attrs) {
        scope.min = attrs.min || 0;
        scope.max = attrs.max || 100;
        scope.step = attrs.step || 1;
        scope.prefix = attrs.prefix || undefined;
        scope.postfix = attrs.postfix || undefined;
        scope.decimals = attrs.decimals || 0;
        scope.stepInterval = attrs.stepInterval || 100;
        scope.stepIntervalDelay = attrs.stepIntervalDelay || 300;
        scope.initval = attrs.initval || '';
        scope.val = attrs.value || scope.initval;
      };

      return {
        restrict: 'EA',
        require: '?ngModel',
        scope: true,
        replace: true,
        link: function (scope, element, attrs, ngModel) {
          setScopeValues(scope, attrs);

          var $body = $document.find('body');
          var timeout, timer, helper = true, oldval = scope.val, clickStart;

          ngModel.$setViewValue(scope.val);
          scope.focused = false;

          scope.decrement = function () {
            oldval = scope.val;
            var value = parseFloat(parseFloat(Number(scope.val)) - parseFloat(scope.step)).toFixed(scope.decimals);

            if (value < scope.min) {
              value = parseFloat(scope.min).toFixed(scope.decimals);
              scope.val = value;
              ngModel.$setViewValue(value);
              return;
            }

            scope.val = value;
            ngModel.$setViewValue(value);
          };

          scope.increment = function () {
            oldval = scope.val;
            var value = parseFloat(parseFloat(Number(scope.val)) + parseFloat(scope.step)).toFixed(scope.decimals);

            if (value > scope.max) return;

            scope.val = value;
            ngModel.$setViewValue(value);
          };

          scope.startSpinUp = function () {



            scope.checkValue();
           // scope.increment();

            clickStart = Date.now();
            scope.stopSpin();

            $timeout(function() {
              timer = $interval(function() {
                scope.increment();
              }, scope.stepInterval);
            }, scope.stepIntervalDelay);
          };

          scope.startSpinDown = function () {

            scope.checkValue();
          //  scope.decrement();

            clickStart = Date.now();

            var timeout = $timeout(function() {
              timer = $interval(function() {
                scope.decrement();
              }, scope.stepInterval);
            }, scope.stepIntervalDelay);
          };

          scope.stopSpin = function () {

            if (Date.now() - clickStart > scope.stepIntervalDelay) {
              $timeout.cancel(timeout);
              $interval.cancel(timer);
            } else {
              $timeout(function() {
                $timeout.cancel(timeout);
                $interval.cancel(timer);
              }, scope.stepIntervalDelay);
            }
          };

          scope.checkValue = function () {
            var val;

            if (scope.val !== '' && !scope.val.match(/^-?(?:\d+|\d*\.\d+)$/i)) {
              val = oldval !== '' ? parseFloat(oldval).toFixed(scope.decimals) : parseFloat(scope.min).toFixed(scope.decimals);
              scope.val = val;
              ngModel.$setViewValue(val);
            }

            scope.focused = false;
          };

          scope.focus = function () {
            scope.focused = true;
          };

          ngModel.$render = function () {
            scope.val = ngModel.$viewValue;
          };

          $body.bind('keydown', function(event) {
            if (!scope.focused) {
              return;
            }

            event.preventDefault();

            var which = event.which;

            if (which === key_codes.right) {
              scope.increment();
            } else if (which === key_codes.left) {
              scope.decrement();
            }

            scope.$apply();
          });

        },
        template:
        '<div class="input-group" style="height: 38px;width: auto">' +
        '  <span class="input-group-btn" style="height: 100%" ng-show="!verticalButtons">' +
        '    <button style="height: 100%" class="btn btn-default" ng-mousedown="startSpinDown()" ng-mouseup="stopSpin()"><md-icon class=" md-accent" md-font-icon="icon-minus" ></button>' +
        '  </span>' +
        '  <span class="input-group-addon" style="height: 100%" ng-show="prefix" ng-bind="prefix"></span>' +
        '  <input type="text" ng-model="val" style="height: 100%;padding-left:5px;border-top-style: solid;border-bottom-style: solid;border-left-style: solid;border-right-style: solid;border-width: 1px; border-color: lightgrey" class="form-control" ng-blur="checkValue()" ng-focus="focus()">' +
        '  <span class="input-group-addon" style="height: 100%" ng-show="postfix" ng-bind="postfix"></span>' +
        '  <span class="input-group-btn" style="height: 100%" ng-show="!verticalButtons">' +
        '    <button style="height: 100%" class="btn btn-default" ng-mousedown="startSpinUp()" ng-mouseup="stopSpin()"><md-icon class=" md-accent" md-font-icon="icon-plus" ></md-icon></button>' +
        '  </span>' +
        '</div>'
      };

    }]);
})();
