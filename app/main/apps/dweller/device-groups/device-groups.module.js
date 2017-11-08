(function ()
{
    'use strict';

    angular
      .module('app.dweller.device-groups', ['xeditable'])
        .config(config);


    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider,msApiProvider, msNavigationServiceProvider)
    {
        $stateProvider.state('app.dweller_device-groups', {
            url    : '/dweller/device-groups',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/apps/dweller/device-groups/device-groups.html',
                    controller : 'DeviceGroupsController as vm'
                }
            },
            resolve: {

            }
        });

      // Translation
      $translatePartialLoaderProvider.addPart('app/main/apps/dweller/device-groups');


      
    }

})();
