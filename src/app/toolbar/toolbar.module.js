(function ()
{
    'use strict';

    angular
        .module('app.toolbar', [])
        .config(config);

    /** @ngInject */
    function config($translateProvider,$translatePartialLoaderProvider)
    {
      
      $translateProvider.useSanitizeValueStrategy('escaped');

      $translatePartialLoaderProvider.addPart('app/toolbar');
    }
})();
