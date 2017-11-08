(function ()
{
    'use strict';

    angular
      .module('app.operator.dwellers', ['ngMaterial', 'md-steppers','login'])
        .config(config);


    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        $stateProvider.state('app.operator_dwellers', {
            url    : '/operator/edit-dweller',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/apps/operator/dwellers/dwellers.html',
                    controller : 'OperatorDwellersController as vm'
                }
            },
            resolve: {

            }
        });

      $stateProvider.state('app.operator_add_dweller', {
        url    : '/operator/add-dweller',
        views  : {
          'content@app': {
            templateUrl: 'app/main/apps/operator/dwellers/addDweller.html',
            controller : 'OperatorDwellersController as vm'
          }
        },
        resolve: {

        }
      });

      // Translation
      $translatePartialLoaderProvider.addPart('app/main/apps/operator/dwellers');



    }

})();
