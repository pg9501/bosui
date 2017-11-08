/**
 * Created by pg9501 on 22.06.2016.
 */

(function ()
  {
    'use strict';

    angular
      .module('app.dweller.energy-flows')
      .directive('integer', function() {
      return {
        require: 'ngModel',
        link: function(scope, ele, attr, ctrl) {
          ctrl.$parsers.unshift(function(viewValue) {
            if (viewValue === '' || viewValue === null || typeof viewValue === 'undefined') {
              return null;
            }
            return parseInt(viewValue, 10);
          });
        }
      };
    })
})();
