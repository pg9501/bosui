/**
 * Created by pg9501 on 12.05.2017.
 */
(function ()
{
  'use strict';

  angular
    .module('app.operator.optimization-goals', ['rzModule'])
    .config(config);


  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
  {
    $stateProvider.state('app.operator_optimization_goals', {
      url    : '/operator/optimization-goals',
      views  : {
        'content@app': {
          templateUrl: 'app/main/apps/operator/optimization-goals/optimization-goals.html',
          controller : 'OperatorOptimizationGoalsController as vm'
        }
      },
      resolve: {

      }
    });

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/apps/operator/optimization-goals');



  }

})();
