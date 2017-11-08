(function ()
{
    'use strict';

    angular
      .module('login', [])
        .config(config);


    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider,$httpProvider, msNavigationServiceProvider)
    {

      //console.log("this is the login!!!!");

    /*  $httpProvider.interceptors.push(function ($timeout, $q, $injector) {
        var loginModal, $http, $state;

        // this trick must be done so that we don't receive
        // `Uncaught Error: [$injector:cdep] Circular dependency found`
        $timeout(function () {
          loginModal = $injector.get('loginModal');
          $http = $injector.get('$http');
          $state = $injector.get('$state');
        });

        return {
          responseError: function (rejection) {
            if (rejection.status !== 401) {
              return rejection;
            }

            var deferred = $q.defer();

            loginModal()
              .then(function () {
                deferred.resolve( $http(rejection.config) );
              })
              .catch(function () {
                $state.go('login');
                deferred.reject(rejection);
              });

            return deferred.promise;
          }
        };
      });*/

    //  window.location.href = 'app/main/apps/login/login.html';

     // window.location.href = 'app/main/apps/energy-flows';



      /*  $stateProvider.state('login', {
            url    : '/login',
          data: {
            requireLogin: false
          },
          views  : {
            'login@': {
            templateUrl: 'app/main/apps/login/login.html'
            }
          },
            controller : 'LoginController as vm',
            resolve: {

            }
        });*/

      $stateProvider.state('app.login', {
        url    : '/login',
        views  : {
          'content@app': {
            templateUrl: 'app/main/apps/login/login.html',
            controller : 'LoginController as vm'
          }
        },
        resolve: {

        }
      });


      // Translation
      $translatePartialLoaderProvider.addPart('app/main/apps/login');


    }

})();
