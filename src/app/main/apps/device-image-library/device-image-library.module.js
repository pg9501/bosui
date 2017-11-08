(function ()
{
    'use strict';

    angular
      .module('app.device-image-library', [])
        .config(config);


    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        $stateProvider.state('app.device-image-library', {
            url    : '/device-image-library',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/apps/device-image-library/device-image-library.html',
                    controller : 'DeviceImageLibraryController as vm'
                }
            },
            resolve: {

            }
        });

      // Translation
      $translatePartialLoaderProvider.addPart('app/main/apps/device-image-library');

        // Navigation
     /* msNavigationServiceProvider.saveItem('energy-management.device-image-library', {
        title : 'Device Image Library',
        icon  : 'icon-image-filter',
        state : 'app.device-image-library',
        translate: 'DEVICE_IMAGE_LIBRARY.DEVICE_IMAGE_LIBRARY_NAV',
        weight: 5
      });*/
      
      
    }

})();
