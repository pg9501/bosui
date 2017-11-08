/**
 * Created by pg9501 on 29.09.2016.
 */
(function () {
  'use strict';

  angular
    .module('login')
    .controller('LoginController', LoginController);

  /** @ngInject */
 // LoginController.$inject = [ 'AuthenticationService','$state','$mdDialog', 'UserService','msNavigationServiceProvider'];
    function LoginController( AuthenticationService,$state,$mdDialog,$translate, UserService, msNavigationService,WAMPService ) {

      console.log("LoginController!!");
      var vm = this;

      vm.login = login;
      vm.cookie=false;
      (function initController() {

          // reset login status
          AuthenticationService.ClearCredentials();

        var wampSession=WAMPService.getWAMPsession();
       // console.log("wampSession is");
       // console.log(wampSession);
        if(wampSession==null){
          console.log("now open a session");
          WAMPService.openWAMPSession();
        }

      })();

      function login() {
        vm.dataLoading = true;
        AuthenticationService.Login(vm.username, vm.password, function (response) {
          response.success=true;
          if(vm.username.indexOf('admin')>=0){
            response.message='ADMINISTRATOR';
          }else if(vm.username.indexOf('operator')>=0){
            response.message='OPERATOR';
          }else{
            response.message='DWELLER';
          }
          if (response.success) {

            var role=response.message;

            if(vm.cookie){
              window.localStorage.setItem('save-cookie', 'true');
            }else{
              window.localStorage.setItem('save-cookie', 'false');
            }
            var user={};
            user.name=vm.username;
            user.password=vm.password;
            user.role=role;
            window.localStorage.setItem('user-info', JSON.stringify(user));
            window.localStorage.setItem('is-login', 'true');

            $translate.use('en');

            AuthenticationService.SetCredentials(vm.username, vm.password, role);

            if(role=='ADMINISTRATOR'){
              msNavigationService.saveItem('administration', {
                title : 'ADMINISTRATION ',
                group : true,
                weight: 1,
                hidden: function () {
                  return false;
                }
              });

              msNavigationService.saveItem('dweller', {
                title : 'DWELLERS',
                group : true,
                weight: 1,
                hidden: function () {
                  return true;
                }
              });

              msNavigationService.saveItem('optimization_goals', {
                title : 'OPTIMIZATION GOALS',
                group : true,
                weight: 2,
                hidden: function () {
                  return true;
                }
              });

              msNavigationService.saveItem('history', {
                title : 'HISTORY',
                group : true,
                weight: 3,
                hidden: function () {
                  return true;
                }
              });
              msNavigationService.saveItem('community', {
                title : 'COMMUNITY',
                group : true,
                weight: 4,
                hidden: function () {
                  return true;
                }
              });
              msNavigationService.saveItem('utility-company', {
                title : 'UTILITY COMPANY',
                group : true,
                weight: 5,
                hidden: function () {
                  return true;
                }
              });

              msNavigationService.saveItem('energy-management', {
                title : 'ENERGY MANAGEMENT',
                group : true,
                weight: 1,
                hidden: function () {
                  return true;
                }
              });

              msNavigationService.saveItem('life-assistant', {
                title : 'LIFE ASSISTANT ',
                group : true,
                weight: 2,
                hidden: function () {
                  return true;
                }
              });
              $state.go('app.administrator_locations');

            }else if(role=='OPERATOR'){

              msNavigationService.saveItem('administration', {
                title : 'ADMINISTRATION ',
                group : true,
                weight: 1,
                hidden: function () {
                  return true;
                }
              });

              // Navigation
              msNavigationService.saveItem('dweller', {
                title : 'RESIDENTS',
                group : true,
                weight: 1,
                hidden: function () {
                  return false;
                }

              });

              msNavigationService.saveItem('optimization_goals', {
                title : 'OPTIMIZATION GOALS',
                group : true,
                weight: 2,
                hidden: function () {
                  return false;
                }
              });

              msNavigationService.saveItem('history', {
                title : 'HISTORY',
                group : true,
                weight: 3,
                hidden: function () {
                  return false;
                }
              });
              msNavigationService.saveItem('community', {
                title : 'COMMUNITY',
                group : true,
                weight: 4,
                hidden: function () {
                  return false;
                }
              });
              msNavigationService.saveItem('utility-company', {
                title : 'UTILITY COMPANY',
                group : true,
                weight: 5,
                hidden: function () {
                  return false;
                }
              });

              msNavigationService.saveItem('energy-management', {
                title : 'ENERGY MANAGEMENT',
                group : true,
                weight: 1,
                hidden: function () {
                  return true;
                }
              });

              msNavigationService.saveItem('life-assistant', {
                title : 'LIFE ASSISTANT ',
                group : true,
                weight: 2,
                hidden: function () {
                  return true;
                }
              });
              $state.go('app.operator_dwellers');

            }else{
              msNavigationService.saveItem('administration', {
                title : 'ADMINISTRATION ',
                group : true,
                weight: 1,
                hidden: function () {
                  return true;
                }
              });

              msNavigationService.saveItem('dweller', {
                title : 'DWELLERS',
                group : true,
                weight: 1,
                hidden: function () {
                  return true;
                }

              });

              msNavigationService.saveItem('optimization_goals', {
                title : 'OPTIMIZATION GOALS',
                group : true,
                weight: 2,
                hidden: function () {
                  return true;
                }
              });

              msNavigationService.saveItem('history', {
                title : 'HISTORY',
                group : true,
                weight: 3,
                hidden: function () {
                  return true;
                }
              });
              msNavigationService.saveItem('community', {
                title : 'COMMUNITY',
                group : true,
                weight: 4,
                hidden: function () {
                  return true;
                }
              });
              msNavigationService.saveItem('utility-company', {
                title : 'UTILITY COMPANY',
                group : true,
                weight: 5,
                hidden: function () {
                  return true;
                }
              });

              msNavigationService.saveItem('energy-management', {
                title : 'ENERGY MANAGEMENT',
                group : true,
                weight: 1,
                hidden: function () {
                  return false;
                }
              });

              msNavigationService.saveItem('life-assistant', {
                title : 'LIFE ASSISTANT ',
                group : true,
                weight: 2,
                hidden: function () {
                  return false;
                }
              });

              $state.go('app.dweller_energy-flows');
            }




            vm.dataLoading = false;
          } else {
           // console.log("authenticate failed");
           // FlashService.Error(response.message);
            showAlert(response.message);
            vm.dataLoading = false;
          }
        });
      };

      function showAlert(msg) {
        var alert = $mdDialog.alert({
          title: 'Authentication failed',
          textContent: msg,
          ok: 'Close'
        });

        $mdDialog
          .show( alert )
          .finally(function() {
            alert = undefined;
          });
      }

      vm.register=function(){
        $state.go('registration');
      }


    }

}
)();
