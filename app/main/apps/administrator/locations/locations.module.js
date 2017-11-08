(function ()
{
    'use strict';

    angular
      .module('app.administrator.locations', [])
        .config(config);


    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        $stateProvider.state('app.administrator_locations', {
            url    : '/administrator/locations',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/apps/administrator/locations/locations.html',
                    controller : 'AdministratorLocationsController as vm'
                }
            },
            resolve: {

            }
        });

      // Translation
      $translatePartialLoaderProvider.addPart('app/main/apps/administrator/locations');



    }

})();
