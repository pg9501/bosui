/**
 * Created by pg9501 on 27.04.2017.
 */

(function ()
{
  'use strict';

  angular.module('app.core')
    .factory('WAMPService', WAMPService);

  /** @ngInject */
  function WAMPService($rootScope, $http){

    var service = {};
    service.openWAMPSession=openWAMPSession;
    service.getWAMPsession = getWAMPsession;

    openWAMPSession();
    return service;


    // the WAMP connection to the Router
    var connection;
    var wampSession;

    connection.onclose = function (reason, details) {

      console.log(wsuri+ " connection was lost or could not be established!");
    }


    function openWAMPSession(){
      var wsuri = "ws://localhost:8080/ws";
      connection = new autobahn.Connection({
        url: wsuri,
        realm: "eshl"
      });
      // now actually open the connection
      connection.open();
      connection.onopen = function (session, details) {
        console.log("session is open!!");
        wampSession=session;
      }
    }




    function getWAMPsession () {
      return wampSession;
    }

  }

})();
