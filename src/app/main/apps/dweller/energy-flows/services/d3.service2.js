/**
 * Created by pg9501 on 21.06.2016.
 */
(function ()
{
  'use strict';

  var d3=angular.module('d3_2', [])
    .factory('d3Service2', d3Service2);

  /** @ngInject */
  function d3Service2($document, $window, $q, $rootScope){
      var d = $q.defer(),
        d3service2 = {
          d3: function() { return d.promise; }
        };
      function onScriptLoad() {
        // Load client in the browser
        $rootScope.$apply(function() { d.resolve($window.d3); });
      }
      var scriptTag = $document[0].createElement('script');
      scriptTag.type = 'text/javascript';
      scriptTag.async = true;
      scriptTag.src = '../bower_components/d3/d3.min.js';

      // scriptTag.src = 'js/lib/d3.v3.js';

      scriptTag.onreadystatechange = function () {
        if (this.readyState == 'complete') onScriptLoad();
      }
      scriptTag.onload = onScriptLoad;

      var s = $document[0].getElementsByTagName('body')[0];
      s.appendChild(scriptTag);

      return d3service2;
    }

})();
