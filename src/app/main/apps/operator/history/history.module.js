/**
 * Created by pg9501 on 12.05.2017.
 */
(function ()
{
  'use strict';

  angular
    .module('app.operator.history', ['ngMaterial','mdPickers'])
    .config(config);


  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
  {
    $stateProvider.state('app.operator_building_history', {
      url    : '/operator/building-history',
      views  : {
        'content@app': {
          templateUrl: 'app/main/apps/operator/history/building-history.html',
          controller : 'OperatorHistoryController as vm'
        }
      },
      resolve: {

      }
    });

   /* $stateProvider.state('app.operator_community_history', {
      url    : '/operator-community-history',
      views  : {
        'content@app': {
          templateUrl: 'app/main/apps/operator/history/community-history.html',
          controller : 'OperatorHistoryController as vm'
        }
      },
      resolve: {

      }
    });*/

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/apps/operator/history');



  }

})();
