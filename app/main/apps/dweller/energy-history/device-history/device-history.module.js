(function ()
{
    'use strict';

    angular
      .module('app.dweller.energy-history.device-history', [])
        .config(config);


    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        $stateProvider.state('app.dweller_device-history', {
            url    : '/dweller/device-history',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/apps/dweller/energy-history/device-history/device-history.html',
                    controller : 'DeviceHistoryController as vm'
                }
            },
            resolve: {

            }
        });

      // Translation
      $translatePartialLoaderProvider.addPart('app/main/apps/dweller/energy-history/device-history');
      
    }

})();
