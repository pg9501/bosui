(function ()
{
    'use strict';

    angular
      .module('app.dweller.energy-history.person-history', ['ngMaterial'])
        .config(config);


    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        $stateProvider.state('app.dweller_person-history', {
            url    : '/dweller/person-history',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/apps/dweller/energy-history/person-history/person-history.html',
                    controller : 'PersonHistoryController as vm'
                }
            },
            resolve: {

            }
        });

      // Translation
      $translatePartialLoaderProvider.addPart('app/main/apps/dweller/energy-history/person-history');

    }

})();
