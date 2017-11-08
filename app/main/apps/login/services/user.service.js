/**
 * Created by pg9501 on 31.03.2017.
 */
(function () {
  'use strict';

  angular
    .module('login')
    .factory('UserService', UserService);

  UserService.$inject = ['$http'];
  function UserService($http) {
    var service = {};

    service.GetAll = GetAll;
    service.GetUserByUsername = GetUserByUsername;
    service.GetRoleByUsername = GetRoleByUsername;
    service.Create = Create;
    service.Update = Update;
    service.Delete = Delete;

    return service;

    function GetAll() {
      return $http.get('/api/users').then(handleSuccess, handleError('Error getting all users'));
    }

    function GetUserByUsername(username) {
      return $http.get('http://localhost:8087/bos/api/users/' + username).then(handleSuccess, handleError('Error getting user by username'));
    }

    function GetRoleByUsername(username) {
      return $http.get('http://localhost:8087/bos/api/users/role' + username).then(handleSuccess, handleError('Error getting user by username'));
    }

    function Create(user) {
      var data = JSON.stringify(user);
      console.log(data);
      return $http.post('http://localhost:8087/bos/api/users/', data).then(handleSuccess, handleError('Error creating user'));
    }

    function Update(user) {
      return $http.put('/api/users/' + user.id, user).then(handleSuccess, handleError('Error updating user'));
    }

    function Delete(id) {
      return $http.delete('/api/users/' + id).then(handleSuccess, handleError('Error deleting user'));
    }

    // private functions

    function handleSuccess(res) {
     // return res.data;
     // console.log("res is");
     // console.log(res);

        return res.data;

    }

    function handleError(error) {
      return function () {
        return { success: false, message: error };
      };
    }
  }

})();
