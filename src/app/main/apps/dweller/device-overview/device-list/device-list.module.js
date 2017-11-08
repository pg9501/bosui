(function ()
{
    'use strict';

    angular
      .module('app.dweller.device-overview.device-list', ['app.dweller.energy-flows'])
        .config(config);


    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        $stateProvider.state('app.dweller_device-overview_device-list', {
            url    : '/dweller/device-overview-device-list',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/apps/dweller/device-overview/device-list/device-list.html',
                    controller : 'DeviceOverviewDeviceListController as vm'
                }
            },
            resolve: {

            }
        });

      // Translation
      $translatePartialLoaderProvider.addPart('app/main/apps/dweller/device-overview/device-list');
      
    }

})();
