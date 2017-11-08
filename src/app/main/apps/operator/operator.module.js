(function ()
{
    'use strict';

    angular
      .module('app.operator', ['app.operator.dwellers','app.operator.optimization-goals','app.operator.history','app.operator.community','app.operator.utility-company'])
        .config(config);



    /** @ngInject */

    function config(msNavigationServiceProvider)
    {
      var $cookies;
      angular.injector(['ngCookies']).invoke(['$cookies', function(_$cookies_) {
        $cookies = _$cookies_;
      }]);

      // Navigation
      msNavigationServiceProvider.saveItem('dweller', {
        title : 'DWELLERS',
        group : true,
        weight: 1,
        translate: 'DWELLERS_NAV',
        hidden: function () {
          return false;
        }

      });

      // Navigation
      msNavigationServiceProvider.saveItem('dweller.allDwellers', {
        title : 'All Dwellers',
        icon  : 'icon-account-multiple',
        state : 'app.operator_dwellers',
        translate: 'DWELLERS.ALL_DWELLERS_NAV',
        weight: 1
      });

      // Navigation
      msNavigationServiceProvider.saveItem('dweller.addDweller', {
        title : 'Add A Dweller',
        icon  : 'icon-account-plus',
        state : 'app.operator_add_dweller',
        translate:'DWELLERS.ADD_DWELLERS_NAV',
        weight: 2
      });

      msNavigationServiceProvider.saveItem('optimization_goals', {
        title : 'OPTIMIZATION',
        group : true,
        weight: 2,
        translate: 'OPTIMIZATION_NAV',
        hidden: function () {
          return false;
        }
      });

      msNavigationServiceProvider.saveItem('optimization_goals.all_optimization_goals', {
        title : 'Optimization Goals',
        icon  : 'icon-chart-line',
        state : 'app.operator_optimization_goals',
        translate: 'OPTIMIZATION_GOALS.OPTIMIZATION_GOALS_NAV',
        weight: 1
      });

      msNavigationServiceProvider.saveItem('history', {
        title : 'HISTORY',
        group : true,
        weight: 3,
        translate: 'HISTORY_NAV',
        hidden: function () {
          return false;
        }
      });
      msNavigationServiceProvider.saveItem('history.building', {
        title : 'Building History',
        icon  : 'icon-bank',
        state : 'app.operator_building_history',
        translate: 'BUILDING_HISTORY.BUILDING_HISTORY_NAV',
        weight: 1
      });

      /*// Navigation
      msNavigationServiceProvider.saveItem('history.community', {
        title : 'Community History',
        icon  : 'icon-city',
        state : 'app.operator_community_history',
        translate: 'COMMUNITY_HISTORY.COMMUNITY_HISTORY_NAV',
        weight: 2
      });*/

      msNavigationServiceProvider.saveItem('community', {
        title : 'COMMUNITY',
        group : true,
        weight: 4,
        translate: 'COMMUNITY_NAV',
        hidden: function () {
          return false;
        }
      });
      msNavigationServiceProvider.saveItem('community.communityOverview', {
        title : 'Community Overview',
        icon  : 'icon-city',
        state : 'app.operator_communityOverview',
        translate: 'COMMUNITY_OVERVIEW.COMMUNITY_OVERVIEW_NAV',
        weight: 1
      });
      msNavigationServiceProvider.saveItem('community.buildingComparisons', {
        title : 'Building Comparisons',
        icon  : 'icon-poll-box',
        state : 'app.operator_buildingComparisons',
        translate: 'BUILDING_COMPARISONS.BUILDING_COMPARISONS_NAV',
        weight: 2
      });

      msNavigationServiceProvider.saveItem('community.deviceComparisons', {
        title : 'Device Comparisons',
        icon  : 'icon-poll',
        state : 'app.operator_deviceComparisons',
        translate: 'DEVICE_COMPARISONS.DEVICE_COMPARISONS_NAV',
        weight: 3
      });

      msNavigationServiceProvider.saveItem('utility-company', {
        title : 'UTILITY COMPANY',
        group : true,
        weight: 5,
        translate: 'UTILITY_COMPANY_NAV',
        hidden: function () {
          return false;
        }
      });
      msNavigationServiceProvider.saveItem('utility-company.invoices', {
        title : 'Invoices',
        icon  : 'icon-file-document',
        state : 'app.operator_utility_company_invoices',
        translate: 'INVOICES.INVOICES_NAV',
        weight: 1
      });


    }

})();
