(function ()
{
    'use strict';

    angular
      .module('app.dweller.weather-forecast', ['app.dweller.energy-flows'])
        .config(config);


    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        $stateProvider.state('app.dweller_weather-forecast', {
            url    : '/dweller/weather-forecast',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/apps/dweller/weather-forecast/weather-forecast.html',
                    controller : 'WeatherForecastController as vm'
                }
            },
            resolve: {

            }
        });

      // Translation
      $translatePartialLoaderProvider.addPart('app/main/apps/dweller/weather-forecast');


    }

})();
