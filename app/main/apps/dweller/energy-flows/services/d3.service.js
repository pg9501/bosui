/**
 * Created by pg9501 on 21.06.2016.
 */
(function ()
{
  'use strict';

var d3=angular.module('d3', [])
  .factory('d3Service', d3Service);

  /** @ngInject */
  function d3Service($document, $window, $q, $rootScope)
  {
    var d = $q.defer(),
      d3service = {
        d3: function() { return d.promise; }
      };
    function onScriptLoad() {
      // Load client in the browser
      $rootScope.$apply(function() { d.resolve($window.d3); });
    }
    var scriptTag = $document[0].createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = true;
    scriptTag.src = 'assets/lib/d3.v3.min.js';

    // scriptTag.src = 'js/lib/d3.v3.js';

    scriptTag.onreadystatechange = function () {
      if (this.readyState == 'complete') onScriptLoad();
    }
    scriptTag.onload = onScriptLoad;

    var s = $document[0].getElementsByTagName('body')[0];
    s.appendChild(scriptTag);

    return d3service;
  }

  /*function d3Service2($document, $window, $q, $rootScope){
      var d = $q.defer(),
        d3service = {
          d3: function() { return d.promise; }
        };
      function onScriptLoad() {
        // Load client in the browser
        $rootScope.$apply(function() { d.resolve($window.d3); });
      }
      var scriptTag = $document[0].createElement('script');
      scriptTag.type = 'text/javascript';
      scriptTag.async = true;
      scriptTag.src = 'js/lib/d3.min.js';

      // scriptTag.src = 'js/lib/d3.v3.js';

      scriptTag.onreadystatechange = function () {
        if (this.readyState == 'complete') onScriptLoad();
      }
      scriptTag.onload = onScriptLoad;

      var s = $document[0].getElementsByTagName('body')[0];
      s.appendChild(scriptTag);

      return d3service;
    };

  d3.factory('energyFlowService',[function(){

  }]);*/

/*
d3.factory('d3Service', ['$document', '$window', '$q', '$rootScope',
  function($document, $window, $q, $rootScope) {
    var d = $q.defer(),
      d3service = {
        d3: function() { return d.promise; }
      };
    function onScriptLoad() {
      // Load client in the browser
      $rootScope.$apply(function() { d.resolve($window.d3); });
    }
    var scriptTag = $document[0].createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = true;
    scriptTag.src = 'bower_components/d3/d3.min.js';

    // scriptTag.src = 'js/lib/d3.v3.js';

    scriptTag.onreadystatechange = function () {
      if (this.readyState == 'complete') onScriptLoad();
    }
    scriptTag.onload = onScriptLoad;

    var s = $document[0].getElementsByTagName('body')[0];
    s.appendChild(scriptTag);

    return d3service;
  }])*/

})();
