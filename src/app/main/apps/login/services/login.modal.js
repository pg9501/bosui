/**
 * Created by pg9501 on 30.03.2017.
 */

(function ()
{
  'use strict';

  var login=angular.module('loginModalModule', [])
    .factory('loginModal', loginModal);

  /** @ngInject */
  function loginModal($rootScope, $mdDialog){

    function assignCurrentUser(user) {
      $rootScope.currentUser = user;
      console.log("$rootScope.currentUser is ");
      console.log(user);
      return user;
    }
    return function() {
      var instance = $mdDialog.show({
        templateUrl: 'app/main/apps/login/login.html',
        controller: 'LoginController'
      });
      return instance.then(assignCurrentUser);
    };


  }

})();
