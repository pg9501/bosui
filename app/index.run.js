(function ()
{
    'use strict';

    angular
        .module('fuse')
        .run(runBlock);

    /** @ngInject */
    function runBlock($rootScope, $timeout, $state,$cookies, $http, AuthenticationService)
    {

      console.log("runBlockkkkkkkkkk!");
      window.localStorage.setItem('is-login', 'false');
      var saveCookie=window.localStorage.getItem('save-cookie');
      var user=JSON.parse(window.localStorage.getItem('user-info'));

      if(saveCookie=='true'){
        AuthenticationService.SetCredentials(user.name, user.password, user.role);
      }

      // keep user logged in after page refresh
      $rootScope.globals = $cookies.getObject('globals') || {};
      if ($rootScope.globals.currentUser) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata;
      }

      $state.go('login');


      // Activate loading indicator
        var stateChangeStartEvent = $rootScope.$on('$stateChangeStart', function (event, toState, toParams)
        {
            $rootScope.loadingProgress = true;

          var requireLogin = toState.data.requireLogin;

          if (requireLogin && typeof $rootScope.globals.currentUser === 'undefined') {
            event.preventDefault();



            console.log("stateChangeStartEvent!");
            var loggedIn = $rootScope.globals.currentUser;
            if (!loggedIn) {
              console.log("not logged in!");
              $state.go('login');
            }else{
              console.log("toState.name");
              console.log(toState.name);
              $state.go(toState.name, toParams);
            }



          //  $state.go('login');

           /* $mdDialog.show({
              templateUrl: 'app/main/apps/login/login.html',
              controller: 'LoginController',
              controllerAs: 'vm'
            });

            loginModal()
              .then(function () {
                console.log("loginModal");
                return $state.go(toState.name, toParams);
              })
              .catch(function () {
                console.log("go to login");
                return $state.go('login');
              });*/


          }

        });

        // De-activate loading indicator
        var stateChangeSuccessEvent = $rootScope.$on('$stateChangeSuccess', function ()
        {
            $timeout(function ()
            {
                $rootScope.loadingProgress = false;
            });
        });

        // Store state in the root scope for easy access
        $rootScope.state = $state;

        // Cleanup
        $rootScope.$on('$destroy', function ()
        {
            stateChangeStartEvent();
            stateChangeSuccessEvent();
        });
    }
})();
