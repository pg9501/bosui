/**
 * Created by pg9501 on 29.09.2016.
 */
(function () {
  'use strict';

  angular
    .module('app.device-image-library')
    .controller('DeviceImageLibraryController', DeviceImageLibraryController);

  /** @ngInject */
  function DeviceImageLibraryController($document, $timeout,$window, $scope, $mdDialog) {

    //update clock time every second on the navigation bar
    $scope.getDate = new Date();
    setInterval(function(){
      $scope.$apply(function(){
        $scope.getDate = new Date();
      });
    }, 1000);

    var vm=this;
    // Local images
    vm.images = [

    /*  {
        name:'AirConditioner',
        url : 'assets/images/energy-flows/AirConditioner.png'
      },
      {
        name:'CHP',
        url : 'assets/images/energy-flows/CHP.png'
      },
      {
        name:'CoffeeSystem',
        url : 'assets/images/energy-flows/CoffeeSystem.png'
      },
      {
        name : 'Dishwasher',
        url : 'assets/images/energy-flows/Dishwasher.png'
      },
      {
        name:'ElectricVehicle',
        url : 'assets/images/energy-flows/ElectricVehicle.png'
      },
      {
        name:'EmptyBattery',
        url : 'assets/images/energy-flows/EmptyBattery.png'
      },
      {
        name:'HalfBattery',
        url : 'assets/images/energy-flows/HalfBattery.png'
      },
      {
        name:'LowBattery',
        url : 'assets/images/energy-flows/LowBattery.png'
      },
      {
        name:'FullBattery',
        url : 'assets/images/energy-flows/FullBattery.png'
      },
      {
        name:'ExtractorHood',
        url : 'assets/images/energy-flows/ExtractorHood.png'
      },
      {
        name : 'Freezer',
        url : 'assets/images/energy-flows/Freezer.png'
      },
      {
        name:'Fridge',
        url : 'assets/images/energy-flows/Fridge.png'
      },
      {
        name:'GlobeBulb',
        url : 'assets/images/energy-flows/GlobeBulb.png'
      },
      {
        name:'HeatPump',
        url : 'assets/images/energy-flows/HeatPump.png'
      },
      {
        name:'HobInduction',
        url : 'assets/images/energy-flows/HobInduction.png'
      },
      {
        name:'Oven',
        url : 'assets/images/energy-flows/Oven.png'
      },
      {
        name:'PV',
        url : 'assets/images/energy-flows/Photovoltaic.png'
      },
      {
        name:'Radiator',
        url : 'assets/images/energy-flows/Radiator.png'
      },
      {
        name:'Shower',
        url : 'assets/images/energy-flows/Shower.png'
      },
      {
        name:'SolarHeater',
        url : 'assets/images/energy-flows/SolarHeater.png'
      },
      {
        name:'TumbleDryer',
        url : 'assets/images/energy-flows/TumbleDryer.png'
      },
      {
        name:'WashingMachine',
        url : 'assets/images/energy-flows/WashingMachine.png'
      }*/
  ];
    initDeviceImageLibrary($window.localStorage.getItem('device-image-library'));
   // $window.localStorage.setItem('device-image-library', angular.toJson(vm.images));

    vm.addImage = function(){
      vm.images.push(
        {
          name:'WashingMachine',
          url : 'assets/images/energy-flows/WashingMachine.png'
        }
      );
    }

    function removeExtension(filename){
      var lastDotPosition = filename.lastIndexOf(".");
      if (lastDotPosition === -1) return filename;
      else return filename.substr(0, lastDotPosition);
    }

    $scope.deviceImageUploadClick = function(ele){
      ele.value="";
    }
    $scope.deviceImageChanged = function(ele){
      $("#deviceImageUpload").value=null;
      //console.log(vm.images);
      var files = ele.files;
      for (var i = 0; i < files.length; i++) {
        var name=removeExtension(files[i].name);
        var url='assets/images/energy-flows/'+files[i].name;
        var image={
          name:name,
          url : url
        }
        var flag=false;
       for(var img in vm.images){
         if(vm.images[img].name.toLowerCase()==name.toLowerCase()){

           $mdDialog.show(
             $mdDialog.alert()
               // .parent(angular.element(document.querySelector('#popupContainer')))
               .clickOutsideToClose(true)
               .title('Duplicated Name')
               .textContent(name+' has already existed!')
               //.ariaLabel('Alert Dialog Demo')
               .ok('Got it!')
           );
           flag=true;
           continue;
         }
       }
        if(flag==false){
          vm.images.push(image);
          $window.localStorage.setItem('device-image-library', angular.toJson(vm.images));
         // var imageLib=JSON.parse(window.localStorage['device-image-library']);
         // console.log(imageLib);
        }

      }
      //console.log(vm.images);
    }

    vm.removeImage = function(image){
      var confirm = $mdDialog.confirm()
        .title('Are you sure to remove this image?')
        .ok('Yes')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function() {
        var index = vm.images.indexOf(image);
        vm.images.splice(index,1);
        $window.localStorage.setItem('device-image-library', angular.toJson(vm.images));
      });

    }

    function initDeviceImageLibrary(libraryStorage) {
      vm.images=JSON.parse(window.localStorage['device-image-library']);
    }

  }

}
)();
