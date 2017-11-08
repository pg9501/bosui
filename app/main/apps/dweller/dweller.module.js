(function ()
{
    'use strict';

        angular
        .module('app.dweller', ['app.dweller.calendar','app.dweller.device-groups','app.dweller.device-overview','app.dweller.electric-vehicle',
          'app.dweller.energy-flows','app.dweller.energy-history','app.dweller.energy-prediction','app.dweller.event-logger','app.dweller.notes',
          'app.dweller.scenes','app.dweller.weather-forecast'])
        .config(config);


    /** @ngInject */
    function config( msNavigationServiceProvider)
    {

      // Navigation
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
        state    : 'app.dweller_energy-flows',
        /*stateParams: {
         'param1': 'page'
         },*/
        translate: 'ENERGY_OVERVIEW.ENERGY_OVERVIEW_NAV',
        weight   : 1
      });



      // Navigation
      msNavigationServiceProvider.saveItem('energy-management.device-overview', {
        title : 'Device Overview',
        icon  : 'icon-monitor-multiple',
        translate: 'DEVICE_OVERVIEW.DEVICE_OVERVIEW_NAV',
        weight: 2
      });


      msNavigationServiceProvider.saveItem('energy-management.device-overview.floor-plan', {
        title : 'Floor Plan',
        icon  : 'icon-bank',
        translate: 'FLOOR_PLAN.FLOOR_PLAN_NAV',
        state:'app.dweller_device-overview_floor-plan'
      });

      msNavigationServiceProvider.saveItem('energy-management.device-overview.device-list', {
        title: 'Device List',
        icon  : 'icon-format-list-bulleted',
        translate: 'DEVICE_LIST.DEVICE_LIST_NAV',
        state: 'app.dweller_device-overview_device-list'
      });

      msNavigationServiceProvider.saveItem('energy-management.energy-history', {
        title : 'Energy History',
        icon  : 'icon-history',
        translate: 'ENERGY_HISTORY_NAV',
        weight: 3
      });

      msNavigationServiceProvider.saveItem('energy-management.energy-history.person-history', {
        title : 'Personal History',
        icon  : 'icon-account',
        translate: 'PERSON_HISTORY.PERSON_HISTORY_NAV',
        state : 'app.dweller_person-history'

      });

      msNavigationServiceProvider.saveItem('energy-management.energy-history.device-history', {
        title : 'Device History',
        icon  : 'icon-controller-xbox',
        translate: 'DEVICE_HISTORY.DEVICE_HISTORY_NAV',
        state : 'app.dweller_device-history'

      });

      // Navigation
      msNavigationServiceProvider.saveItem('energy-management.device-groups', {
        title : 'Device Groups',
        icon  : 'icon-group',
        state : 'app.dweller_device-groups',
        translate: 'DEVICE_GROUPS.DEVICE_GROUPS_NAV',
        weight: 4
      });

      // Navigation
      msNavigationServiceProvider.saveItem('energy-management.scenes', {
        title : 'Scenes',
        icon  : 'icon-package-variant-closed',
        state : 'app.dweller_scenes',
        translate: 'SCENES.SCENES_NAV',
        weight: 5
      });


      // Navigation
      msNavigationServiceProvider.saveItem('energy-management.calendar', {
        title : 'Calendar',
        icon  : 'icon-calendar-today',
        state : 'app.dweller_calendar',
        translate: 'CALENDAR.CALENDAR',
        weight: 6
      });

      // Navigation
      msNavigationServiceProvider.saveItem('energy-management.energy-prediction', {
        title : 'Energy Prediction',
        icon  : 'icon-transfer',
        state : 'app.dweller_energy-prediction',
        translate: 'ENERGY_PREDICTION.ENERGY_PREDICTION_NAV',
        weight: 7
      });

      // Navigation
      msNavigationServiceProvider.saveItem('energy-management.event-logger', {
        title : 'Event Logger',
        icon  : 'icon-document',
        state : 'app.dweller_event-logger',
        translate: 'EVENT_LOGGER.EVENT_LOGGER_NAV',
        weight: 8
      });

      // Navigation
      msNavigationServiceProvider.saveItem('energy-management.electric-vehicle', {
        title : 'Electric Vehicle',
        icon  : 'icon-car',
        state : 'app.dweller_electric-vehicle',
        translate: 'ELECTRIC_VEHICLE.ELECTRIC_VEHICLE_NAV',
        weight: 9
      });


      // Navigation
      msNavigationServiceProvider.saveItem('life-assistant', {
        title : 'LIFE ASSISTANT ',
        group : true,
        translate: 'LIFE_ASSISTANT_NAV',
        weight: 2
      });

      // Navigation
      msNavigationServiceProvider.saveItem('life-assistant.notes', {
        title : 'Notes',
        icon  : 'icon-lightbulb',
        state : 'app.dweller_notes',
        translate: 'NOTES.NOTES',
        weight: 2
      });


      // Navigation
      msNavigationServiceProvider.saveItem('life-assistant.weather-forecast', {
        title : 'Weather Forecast',
        icon  : 'icon-white-balance-sunny',
        state : 'app.dweller_weather-forecast',
        translate: 'WEATHER_FORECAST.WEATHER_FORECAST_NAV',
        weight: 3
      });






    }
})();
