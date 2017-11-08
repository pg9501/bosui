(function ()
{
    'use strict';

    angular
      .module('app.dweller.electric-vehicle', [])
        .config(config);


    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        $stateProvider.state('app.dweller_electric-vehicle', {
            url    : '/dweller/electric-vehicle',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/apps/dweller/electric-vehicle/electric-vehicle.html',
                    controller : 'ElectricVehicleController as vm'
                }
            },
            resolve: {

            }
        });

      // Translation
      $translatePartialLoaderProvider.addPart('app/main/apps/dweller/electric-vehicle');

        
    }

})();
