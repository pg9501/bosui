/**
 * Created by pg9501 on 30.03.2017.
 */

(function ()
{
  'use strict';

  var login=angular.module('loginServiceModule', ['angular-jwt'])
    .factory('loginService', loginService);

  /** @ngInject */
  function loginService($rootScope, $http, store, jwtHelper){

    return {
      login: login,
      logout: logout
    };

    function login(user, callback) {
      $http({
        url: 'http://localhost:8000/authenticate',
        method: 'POST',
        data: { 'username' : user.name , 'pwd':user.pwd}
      }).then(function(response) {
        console.log("response from the http server is");
        console.log(response);
        $rootScope.jwt = response.data.id_token;
        store.set('jwt', response.data.id_token);
        callback(null, jwtHelper.decodeToken(response.data.id_token));
      }, function(error) {
        console.log(error);
        callback(error, null);
      });
    }

    function logout(user, callback) {
      delete $rootScope.jwt;
      store.remove('jwt');
      delete $rootScope.currentUser;
    }


  }

})();
