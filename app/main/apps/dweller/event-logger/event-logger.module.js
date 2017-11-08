(function ()
{
    'use strict';

    angular
      .module('app.dweller.event-logger', ['datatables'])
        .config(config);


    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        $stateProvider.state('app.dweller_event-logger', {
            url    : '/dweller/event-logger',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/apps/dweller/event-logger/event-logger.html',
                    controller : 'EventLoggerController as vm'
                }
            },
            resolve: {

            }
        });

      // Translation
      $translatePartialLoaderProvider.addPart('app/main/apps/dweller/event-logger');

        
    }

})();
