/**
 * Created by pg9501 on 12.10.2016.
 */
(function () {
  'use strict';

  angular
    .module('app.dweller.energy-flows')
    .directive('resizable', function () {
      return {
        restrict: 'A',
        scope: {
          callback: '&onResize'
        },
        link: function postLink (scope, ele, attrs) {
          ele.resizable();
         // ele.draggable();
          ele.on('resizestop', function (evt, ui) {
            if (scope.callback) {
              scope.callback();
            }
          });
        }
      }
    })
})();
