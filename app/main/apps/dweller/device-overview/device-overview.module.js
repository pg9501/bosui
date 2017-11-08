(function ()
{
    'use strict';

    angular
      .module('app.dweller.device-overview', [
        'app.dweller.device-overview.device-list',
        'app.dweller.device-overview.floor-plan'])
        .config(config);


  /** @ngInject */
  function config(msNavigationServiceProvider)
  {
   

  }

})();
