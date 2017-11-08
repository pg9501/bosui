(function ()
{
    'use strict';

    angular
        .module('app.quick-panel')
        .controller('QuickPanelController', QuickPanelController);

    /** @ngInject */
    function QuickPanelController($http,msApi,WAMPService)
    {
        var vm = this;

      vm.wampSession=WAMPService.getWAMPsession();

        // Data
        vm.date = new Date();

      vm.weather={description:"",weatherImage:"",temp:"",low:"",high:"",humidity:"",windSpeed:"",rainProb:""};
      vm.locations=[{name:"Bed Room1", temperature:"--",humidity:"--"},{name:"Bed Room2", temperature:"--",humidity:"--"},{name:"Kitchen", temperature:"--",humidity:"--"},
        {name:"Living Room", temperature:"--",humidity:"--"},{name:"Toilet", temperature:"--",humidity:"--"}];

      getWeather();

      /*GetAllLocations().then(function (result) {
        if (result != null) {
          var locations=result.locations;

          console.log(locations);
          for (var i in locations) {
            var location=locations[i];
            vm.locations.push({name:location, temperature:"--",humidity:"--"});

          }
        }
      });*/

        // Methods

      function tempHandler (args) {
        var msg = args[0];

        for(var i in vm.locations){


          if(vm.locations[i].name=='Living Room'){
            vm.locations[i].temperature=Math.round(msg['values']['3901']['2796204']['AI'] * 10) / 10;
          }
          if(vm.locations[i].name=='Kitchen'){
            vm.locations[i].temperature=Math.round((msg['values']['3901']['2796204']['AI']+0.2) * 10) / 10;
          }
          if(vm.locations[i].name=='Toilet'){
            vm.locations[i].temperature=Math.round((msg['values']['3901']['2796204']['AI']+0.6) * 10) / 10;
          }
          if(vm.locations[i].name=='Bed Room1'){
            vm.locations[i].temperature=Math.round(msg['values']['3901']['2796205']['AI'] * 10) / 10;
          }
          if(vm.locations[i].name=='Bed Room2'){
            vm.locations[i].temperature=Math.round(msg['values']['3901']['2796206']['AI'] * 10) / 10;
          }

        }
      }

      // SUBSCRIBE to a topic and receive events
  //    vm.wampSession.subscribe('eshl.bacnet.v2.values', tempHandler);

      function getWeather() {
        $.simpleWeather({
          zipcode: '76133',
          location: 'Karlsruhe, BW',
          woeid: '',
          unit: 'c',
          success: function (weather) {

            vm.weather.description=weather.text;
            vm.weather.weatherImage=weather.thumbnail;
            vm.weather.temp=weather.temp;
            vm.weather.low=weather.low;
            vm.weather.high=weather.high;
            vm.weather.windSpeed=weather.wind.speed;
            vm.weather.humidity=weather.humidity;

            var random = Math.random(); // this will get a number between 1 and 99;
            random *= Math.floor(Math.random()*2) == 1 ? 1 : -1; // this will add minus sign in 50% of cases


            for(var i in vm.locations){
              random= (Math.random()*(1.3)-1).toFixed(1);
              vm.locations[i].humidity=parseFloat(vm.weather.humidity)+parseFloat(random);
            }

          },
          error: function (error) {

          }
        });
      };

      function GetAllLocations() {
        return $http.get('http://localhost:8087/bos/api/locations').then(handleSuccess, handleError('Error getting all locations'));
      }
      function handleSuccess(res) {
        return res.data;
      }
      function handleError(error) {
        return function () {
          return { success: false, message: error };
        };
      }

        //////////
    }

})();
