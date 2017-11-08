(function ()
{
    'use strict';

    angular
      .module('app.dweller.device-overview.floor-plan', ['ngMaterial','app.dweller.energy-flows'])
        .config(config);


    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        $stateProvider.state('app.dweller_device-overview_floor-plan', {
            url    : '/dweller/device-overview-floor-plan',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/apps/dweller/device-overview/floor-plan/floor-plan.html',
                    controller : 'DeviceOverviewFloorPlanController as vm'
                }
            },
            resolve: {

            }
        });

      // Translation
      $translatePartialLoaderProvider.addPart('app/main/apps/dweller/device-overview/floor-plan');

    }

})();
