(function ()
{
    'use strict';

    angular
      .module('app.dweller.scenes', [])
      .filter('htmlCode',function($sce){
        return function(input){
          return $sce.trustAsHtml(input);
        }
      })
        .config(config);


    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        $stateProvider.state('app.dweller_scenes', {
            url    : '/dweller/scenes',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/apps/dweller/scenes/scenes.html',
                    controller : 'ScenesController as vm'
                }
            },
            resolve: {

            }
        });

      // Translation
      $translatePartialLoaderProvider.addPart('app/main/apps/dweller/scenes');

       
    }

})();
