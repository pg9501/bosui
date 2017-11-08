(function ()
{
    'use strict';

    angular
      .module('app.administrator.floor-plan', ['ngMaterial','login'])
        .config(config);


    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        $stateProvider.state('app.administrator_floor-plan', {
            url    : '/administrator/floor-plan',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/apps/administrator/floor-plan/floor-plan.html',
                    controller : 'AdministratorFloorPlanController as vm'
                }
            },
            resolve: {

            }
        });

      // Translation
      $translatePartialLoaderProvider.addPart('app/main/apps/administrator/floor-plan');

    }

})();
