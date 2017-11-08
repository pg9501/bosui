(function ()
{
    'use strict';

    angular
        .module('app.dweller.calendar', [
            'ui.calendar',
          'mdPickers',
          'app.dweller.energy-flows'
        ])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider.state('app.dweller_calendar', {
            url      : '/dweller/calendar',
            views    : {
                'content@app': {
                    templateUrl: 'app/main/apps/dweller/calendar/calendar.html',
                    controller : 'CalendarController as vm'
                }
            },
            bodyClass: 'calendar'
        });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/apps/dweller/calendar');

       
    }
})();
