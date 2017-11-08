(function ()
{
    'use strict';

    angular
      .module('app.administrator', ['app.administrator.locations','app.administrator.devices','app.administrator.floor-plan'])
        .config(config);



    /** @ngInject */

    function config(msNavigationServiceProvider)
    {
      var $cookies;
      angular.injector(['ngCookies']).invoke(['$cookies', function(_$cookies_) {
        $cookies = _$cookies_;
      }]);

      // Navigation
      msNavigationServiceProvider.saveItem('administration', {
        title : 'Building Configuration',
        group : true,
        weight: 1,
        translate: "BUILDING_CONFIGURATION_NAV",
        hidden: function () {

          return false;
        }

      });

      // Navigation
      msNavigationServiceProvider.saveItem('administration.locations', {
        title : 'Locations',
        icon  : 'icon-map-marker-multiple',
        state : 'app.administrator_locations',
        translate: 'LOCATIONS.LOCATIONS_NAV',
        weight: 1
      });

      // Navigation
      msNavigationServiceProvider.saveItem('administration.devices', {
        title : 'Devices',
        icon  : 'icon-xbox-controller',
        state : 'app.administrator_devices',
        translate: 'DEVICES_ADMIN.DEVICES_NAV',
        weight: 2
      });

      // Navigation
      msNavigationServiceProvider.saveItem('administration.floor-plan', {
        title : 'Floor Plan',
        icon  : 'icon-bank',
        state : 'app.administrator_floor-plan',
        translate: 'FLOOR_PLAN.FLOOR_PLAN_NAV',
        weight: 3
      });


    }

})();
