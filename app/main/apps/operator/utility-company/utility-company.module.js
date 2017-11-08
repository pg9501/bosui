/**
 * Created by pg9501 on 12.05.2017.
 */
(function ()
{
  'use strict';

  angular
    .module('app.operator.utility-company', ['ngMaterial','pdf-viewer'])
    .config(config);


  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
  {
    $stateProvider.state('app.operator_utility_company_invoices', {
      url    : '/operator/invoices',
      views  : {
        'content@app': {
          templateUrl: 'app/main/apps/operator/utility-company/invoices.html',
          controller : 'OperatorUtilityCompanyController as vm'
        }
      },
      resolve: {

      }
    });

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/apps/operator/utility-company');



  }

})();
