(function ()
{
    'use strict';

    angular
      .module('app.dweller.energy-history', ['app.dweller.energy-history.person-history','app.dweller.energy-history.device-history'])
        .config(config);


    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {

     
    }

})();
