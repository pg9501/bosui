/**
 * Created by pg9501 on 12.05.2017.
 */
(function ()
{
  'use strict';

  angular
    .module('app.operator.community', ['d3','ngMaterial','mdPickers'])
    .config(config);


  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
  {
    $stateProvider.state('app.operator_buildingComparisons', {
      url    : '/operator/building-comparisons',
      views  : {
        'content@app': {
          templateUrl: 'app/main/apps/operator/community/views/building-comparisons/buildingComparisons.html',
          controller : 'BuildingComparisonsController as vm'
        }
      },
      resolve: {

      }
    });

    $stateProvider.state('app.operator_deviceComparisons', {
      url    : '/operator/device-comparisons',
      views  : {
        'content@app': {
          templateUrl: 'app/main/apps/operator/community/views/device-comparisons/deviceComparisons.html',
          controller : 'DeviceComparisonsController as vm'
        }
      },
      resolve: {

      }
    });

    $stateProvider.state('app.operator_communityOverview', {
      url    : '/operator/community-overview',
      views  : {
        'content@app': {
          templateUrl: 'app/main/apps/operator/community/views/community-overview/communityOverview.html',
          controller : 'CommunityOverviewController as vm'
        }
      },
      resolve: {

      }
    });

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/apps/operator/community');



  }

})();
