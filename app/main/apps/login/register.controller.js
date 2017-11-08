/**
 * Created by pg9501 on 03.04.2017.
 */
(function () {
  'use strict';

  angular
    .module('login')
    .controller('RegisterController', RegisterController);

  RegisterController.$inject = ['UserService', '$rootScope','$state','$mdDialog'];
  function RegisterController(UserService, $rootScope, $state,$mdDialog) {
    var vm = this;

    vm.register = register;

    vm.user={};
    function register() {
      vm.dataLoading = true;
      UserService.Create(vm.user)
        .then(function (response) {
        //  console.log(response);
          if (response== 'true') {
            //FlashService.Success('Registration successful', true);
          //  console.log("Registration successful");
           // $location.path('/login');
           // $state.go('login');
            vm.dataLoading =false;
            showAlert("Attention", "The user has been created!");
          } else {
          //  console.log(vm.user);
            var json=JSON.stringify(vm.user);
           // console.log(json);
            vm.dataLoading = false;
           // FlashService.Error(response.message);
           // console.log(response.message);
            showAlert("Attention","The user has been existed!");

          }
        });
    };

    function showAlert(title,msg) {
      var alert = $mdDialog.alert({
        title: title,
        textContent: msg,
        ok: 'Close'
      });

      $mdDialog
        .show( alert )
        .finally(function() {
          alert = undefined;
        });
    }

  }

})();
