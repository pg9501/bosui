(function ()
{
    'use strict';

        angular
        .module('app.dweller.energy-flows', ['d3_2','ngMaterial','angular-svg-round-progressbar','chart.js','angularMoment','vxWamp','login'])
        .config(config)
         // .factory('deviceStateService', function() {
          .factory('deviceService', function() {
            var factory = {};
            factory.deviceStates ={
              powerConsumption: [],
              powerGeneration: [],
              heatGeneration: [],
              coldGeneration: [],
              gasConsumption: []
            };
            factory.idleHomeDevice={
              device: []
            };
            factory.weatherData={
              current:[],
              prediction:[]
            };
            factory.wampSession=[];
           /* factory.sendCommandToServer=function(msg){

            };*/
            factory.generateJsonFromJavaObj=function(obj){

            };
           // return deviceStateService;
            return factory;
          });


    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider
            .state('app.dweller_energy-flows', {
                url    : '/dweller/energy-flows',
                views  : {
                    'content@app': {
                        templateUrl: 'app/main/apps/dweller/energy-flows/energy-flows.html',
                        controller : 'EnergyFlowsController as vm'
                    }
                },
                resolve: {
                    TariffData: function (msApi)
                    {
                      return msApi.resolve('energy-flows.tariff@get');
                    },
                    PowerUpperLimitData: function (msApi)
                    {
                      return msApi.resolve('energy-flows.load-limit@get');
                    },
                    PowerConsumptionData: function (msApi)
                    {
                        return msApi.resolve('energy-flows.power-consumption@get');
                    },
                    PowerGenerationData: function (msApi)
                    {
                        return msApi.resolve('energy-flows.power-generation@get');
                    },
                    HeatGenerationData: function (msApi)
                    {
                        return msApi.resolve('energy-flows.heat-generation@get');
                    },
                    ColdGenerationData: function (msApi)
                    {
                        return msApi.resolve('energy-flows.cold-generation@get');
                    },
                    GasConsumptionData: function (msApi)
                    {
                        return msApi.resolve('energy-flows.gas-consumption@get');
                    }
                },
              bodyClass: 'eshl-live'
            });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/apps/dweller/energy-flows');

        // Api
        msApiProvider.register('energy-flows.tariff', ['app/data/energy-flows/tariff.json']);
        msApiProvider.register('energy-flows.load-limit', ['app/data/energy-flows/load-limit.json']);
        msApiProvider.register('energy-flows.power-consumption', ['app/data/energy-flows/power-consumption.json']);
        msApiProvider.register('energy-flows.power-generation', ['app/data/energy-flows/power-generation.json']);
        msApiProvider.register('energy-flows.heat-generation', ['app/data/energy-flows/heat-generation.json']);
        msApiProvider.register('energy-flows.cold-generation', ['app/data/energy-flows/cold-generation.json']);
        msApiProvider.register('energy-flows.gas-consumption', ['app/data/energy-flows/gas-consumption.json']);

       /* // Navigation
       msNavigationServiceProvider.saveItem('energy-management', {
            title : 'ENERGY MANAGEMENT',
            group : true,
            translate: 'ENERGY_MANAGEMENT_NAV',
            weight: 1,
         hidden: function () {
           return false;
         }
        });

        msNavigationServiceProvider.saveItem('energy-management.energy-flows', {
            title    : 'Energy Overview',
            icon     : 'icon-home',
            state    : 'app.energy-flows',
            translate: 'ENERGY_OVERVIEW.ENERGY_OVERVIEW_NAV',
            weight   : 1
        });*/







    }
})();
