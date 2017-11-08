(function ()
{
    'use strict';

    angular
      .module('app.dweller.energy-prediction', [])
        .config(config);


    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        $stateProvider.state('app.dweller_energy-prediction', {
            url    : '/dweller/energy-prediction',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/apps/dweller/energy-prediction/energy-prediction.html',
                    controller : 'EnergyPredictionController as vm'
                }
            },
            resolve: {

            }
        });

      // Translation
      $translatePartialLoaderProvider.addPart('app/main/apps/dweller/energy-prediction');

       
    }

})();
