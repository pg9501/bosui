(function ()
{
    'use strict';

    angular
      .module('app.administrator.devices', ['login'])
        .config(config);


    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        $stateProvider.state('app.administrator_devices', {
            url    : '/administrator/devices',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/apps/administrator/devices/devices.html',
                    controller : 'AdministratorDevicesController as vm'
                }
            },
            resolve: {

            }
        });

      // Translation
      $translatePartialLoaderProvider.addPart('app/main/apps/administrator/devices');



    }

})();
