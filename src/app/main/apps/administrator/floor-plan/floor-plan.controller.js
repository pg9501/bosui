/**
 * Created by pg9501 on 29.09.2016.
 */
(function () {
  'use strict';

  angular
    .module('app.administrator.floor-plan')
    .controller('AdministratorFloorPlanController', AdministratorFloorPlanController);

  /** @ngInject */
  function AdministratorFloorPlanController( $timeout,$translate,$mdMedia, $scope,$window,$cookies,$rootScope,$http,$mdSidenav, $mdDialog,fuseTheming,WAMPService, msNavigationService) {

    function initializeNavigator() {
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
        title : 'OPTIMIZATION',
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

      msNavigationService.saveItem('dweller', {
        title : 'DWELLERS',
        group : true,
        weight: 1,
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
    }

    initializeNavigator();

    var vm=this;

    vm.activeTheme=fuseTheming.themes.active.theme; //get currently active theme
    $scope.$watch(watchSource, function(current, previous){ //watch theme changing and update the active theme in this controller
      vm.activeTheme=fuseTheming.themes.active.theme;
    });
    function watchSource(){
      return fuseTheming.themes.active.theme;
    }

    $scope.active=true;

    vm.wampSession=WAMPService.getWAMPsession();

    vm.tabs = [
       //{ title: 'One'}
      // { title: 'Two'}
    ];
    vm.currentLanuage="en";
    vm.admin=$cookies.getObject('globals').currentUser.username;
    vm.floors=[];
    vm.selectedFloor=null;
    vm.devices=[];

    vm.defaultFloor={"id":10551,"name":"Floor 1","admin":"admin","rooms":[{"id":10567,"name":"Kitchen","devices":["Freezer","Coffee System","Hob Induction","Oven","Extractor Hood","Dishwasher","Blind_3","Tumble Dryer","Washing Machine","Fridge","Light_K19"]},{"id":10568,"name":"Living Room","devices":["Blind_5","Blind_4","Light_K21","Air Conditioner","Light_K20"]},{"id":10569,"name":"Bed Room1","devices":["Light_K16","Blind_1"]},{"id":10570,"name":"Bed Room2","devices":["Blind_2","Light_K17"]},{"id":10571,"name":"Toilet","devices":["Light_K18"]},{"id":10572,"name":"Engineering Room","devices":["PV","CHP"]}]};

    vm.floors.push(vm.defaultFloor);


    GetFloors(vm.admin).then(function (result) {
      if(result!=null){
        for(var i in result){
          var floor=result[i];
          if(floor.name!=null&& floor.name!=vm.defaultFloor.name){
            vm.floors.push({
              //id:     msUtils.guidGenerator(),
              id:     floor.id,
              name   : floor.name,
              rooms: floor.rooms
            });
          }
        }

        var devices=[{"deviceName":"µCHP","uid":"CHP","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Engineering Room"}],"deviceImage":"CHP"},
          {"deviceName":"Photovoltaic","uid":"PV","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Engineering Room"}],"deviceImage":"Photovoltaic"},
          {"deviceName":"Washing Machine","uid":"Washing Machine","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceImage":"WashingMachine"},
          {"deviceName":"Dishwasher","uid":"Dishwasher","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceImage":"Dishwasher"},
          {"deviceName":"Oven","uid":"Oven","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceImage":"Oven"},
          {"deviceName":"Tumble Dryer","uid":"Tumble Dryer","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceImage":"TumbleDryer"},
          {"deviceName":"Hob Induction","uid":"Hob Induction","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceImage":"HobInduction"},
          {"deviceName":"Coffee System","uid":"Coffee System","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceImage":"CoffeeSystem"},
          {"deviceName":"Air Conditioner","uid":"Air Conditioner","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Living Room"}],"deviceImage":"AirConditioner"},
          {"deviceName":"Fridge","uid":"Fridge","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceImage":"Fridge"},
          {"deviceName":"Freezer","uid":"Freezer","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceImage":"Freezer"},
          {"deviceName":"Extractor Hood","uid":"Extractor Hood","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceImage":"ExtractorHood"},
          {"deviceName":"Light_K16","uid":"Light_K16","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Bed Room1"}],"deviceImage":"Light_off"},
          {"deviceName":"Light_K17","uid":"Light_K17","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Bed Room2"}],"deviceImage":"Light_off"},
          {"deviceName":"Light_K18","uid":"Light_K18","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Toilet"}],"deviceImage":"Light_off"},
          {"deviceName":"Light_K19","uid":"Light_K19","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceImage":"Light_off"},
          {"deviceName":"Light_K20","uid":"Light_K20","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Living Room"}],"deviceImage":"Light_off"},
          {"deviceName":"Light_K21","uid":"Light_K21","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Living Room"}],"deviceImage":"Light_off"},
          {"deviceName":"Blind_1","uid":"Blind_1","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Bed Room1"}],"deviceImage":"Blind_50"},
          {"deviceName":"Blind_2","uid":"Blind_2","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Bed Room2"}],"deviceImage":"Blind_50"},
          {"deviceName":"Blind_3","uid":"Blind_3","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Kitchen"}],"deviceImage":"Blind_50"},
          {"deviceName":"Blind_4","uid":"Blind_4","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Living Room"}],"deviceImage":"Blind_50"},
          {"deviceName":"Blind_5","uid":"Blind_5","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":"Floor 1: Living Room"}],"deviceImage":"Blind_50"}];


        var localDevicesStorage = window.localStorage.getItem('stage-storage-local-devices');
        var localDevices=[];
        if (localDevicesStorage === null || localDevicesStorage.length === 0)
        {
          localDevices=[
            {"deviceName":"Coffee System_2","uid":"Coffee System_2","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":""}],"deviceImage":"CoffeeSystem"},
            {"deviceName":"Air Conditioner_2","uid":"Air Conditioner_2","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":""}],"deviceImage":"AirConditioner"},
            {"deviceName":"Light_2","uid":"Light_2","deviceGeneralInfoList":[{"unit":null,"infoName":"Location","infoValue":""}],"deviceImage":"Light_off"},
          ];
          $window.localStorage.setItem('stage-storage-local-devices', angular.toJson(localDevices));

        }else{
          localDevices =JSON.parse(window.localStorage['stage-storage-local-devices']);
        }
        for(var i in localDevices){
          devices.push(localDevices[i]);
        }
        for(var i in devices){
          var device=devices[i];
          var location='';
          var floorName='';
          var roomName='';
          var id=device['uid'];
          var name=device['deviceName'];

          if(id.indexOf("SYS")>0){
            continue;
          }

          var imageName=device['deviceImage'];
          if(imageName=="Light_on"){
            imageName="Light_off";
          }
          var image='assets/images/energy-flows/'+imageName+".png";
          var generalInfoList=device["deviceGeneralInfoList"];

          for(var i in generalInfoList) {
            var info = generalInfoList[i];
            var infoName = info.infoName;
            var infoValue = info.infoValue;
            if(infoName=='Location'){
              // console.log("device location is "+infoValue);
              location=infoValue;
              if(location!==''){
                floorName=location.substring(0,location.indexOf(":")).trim();
                roomName=location.substring(location.indexOf(":")+1).trim();
              }

            }
          }
          if(location!==''){
            vm.devices.push({id:id,name:name, image:image,floor:floorName,room:roomName,location:location,generalInfoList:generalInfoList});
          }


        }

   //     for(var t in vm.tabs){




          for(var i in vm.floors) {
            var floor=vm.floors[i];

            var tabTitle=floor.name.replace(/ /g,"_");

            var stageJson=JSON.parse(window.localStorage['stage-storage-'+tabTitle]);

            var loadedDeviceImages=stageJson.deviceImages;

            for(var j in floor.rooms){
              var room=floor.rooms[j];
              room.remainingDevices=[];

              for(var k in vm.devices){
                if(vm.devices[k].floor===floor.name && vm.devices[k].room===room.name){
                  // count++;
                  if (!loadedDeviceImages.hasOwnProperty(vm.devices[k].id)){
                    room.remainingDevices.push(vm.devices[k]);
                  }
                 /* var isLoaded=false;
                  for(var deviceID in loadedDeviceImages){

                    if(deviceID===vm.devices[k].id){

                      isLoaded=true;
                      break;
                    }
                  }
                  console.log(vm.devices[k].id+":"+isLoaded);
                  if(!isLoaded){

                    room.remainingDevices.push(vm.devices[k]);
                  }*/
                }
              }

            }

          }

  //      }


        vm.selectedFloor=vm.floors[0];

      }
    });


   /* var check = function(){
     vm.wampSession=WAMPService.getWAMPsession();
     if (typeof vm.wampSession != 'undefined') {
     GetFloors(vm.admin).then(function (result) {
     if(result!=null){
     for(var i in result){
     var floor=result[i];
     if(floor.name!=null&& floor.name!=vm.defaultFloor.name){
     vm.floors.push({
     //id:     msUtils.guidGenerator(),
     id:     floor.id,
     name   : floor.name,
     rooms: floor.rooms
     });
     }
     }

     vm.wampSession.call('eshl.get_all_devices',[vm.currentLanuage]).then(
     // RPC success callback
     function (devices) {

     for(var i in devices){
     var device=devices[i];
     var location='';
     var floorName='';
     var roomName='';
     var id=device['uid'];
     var name=device['deviceName'];

     if(id.indexOf("SYS")>0){
     continue;
     }

     var imageName=device['deviceImage'];
     if(imageName=="Light_on"){
     imageName="Light_off";
     }
     var image='assets/images/energy-flows/'+imageName+".png";
     var generalInfoList=device["deviceGeneralInfoList"];

     for(var i in generalInfoList) {
     var info = generalInfoList[i];
     var infoName = info.infoName;
     var infoValue = info.infoValue;
     if(infoName=='Location'){
     // console.log("device location is "+infoValue);
     location=infoValue;
     if(location!==''){
     floorName=location.substring(0,location.indexOf(":")).trim();
     roomName=location.substring(location.indexOf(":")+1).trim();
     }

     }
     }
     if(location!==''){
     vm.devices.push({id:id,name:name, image:image,floor:floorName,room:roomName,location:location,generalInfoList:generalInfoList});
     }

     }

     var stageJson=JSON.parse(window.localStorage['stage-storage-'+vm.selectedTabTitle]);

     var loadedDeviceImages=stageJson.deviceImages;

     for(var i in vm.floors) {
     var floor=vm.floors[i];
     for(var j in floor.rooms){
     var room=floor.rooms[j];
     room.remainingDevices=[];

     for(var k in vm.devices){
     if(vm.devices[k].floor===floor.name && vm.devices[k].room===room.name){
     // count++;
     if (!loadedDeviceImages.hasOwnProperty(vm.devices[k].id)){
     room.remainingDevices.push(vm.devices[k]);
     }
     }
     }

     }

     }
     vm.selectedFloor=vm.floors[0];

     },
     // RPC error callback
     function (error) {
     console.log("Call failed:", error);
     }
     );

     }
     });
     }
     else {
     setTimeout(check, 500); // check again in a second
     }
     }
     check();*/



    $rootScope.$on('$translateChangeSuccess', function () {

      if($translate.use().substring(0,1)=='c'){
        vm.currentLanuage="ch";
      }
      if($translate.use().substring(0,1)=='e'){
        vm.currentLanuage="en";
      }
      if($translate.use().substring(0,1)=='d'){
        vm.currentLanuage="de";
      }
    });
    function isJson(str) {
      try {
        JSON.parse(str);
      } catch (e) {
        return false;
      }
      return true;
    }

    var initialScaleList=[]; //returns {x: 1, y: 1}
    var initialWidthList=[]; // initial width
    var initialHeightList=[]; // initial height
  //  var isContainerResizeList=[]; // if the container is resized, the scaled will also be changed

    $scope.clickUpload = function(id){
      id=id+vm.selectedTabTitle;
      $timeout(function() {
      //angular.element('#'+id).triggerHandler('click');
      document.getElementById(id).click();
      return false;
      }, 0);
    };

    //update clock time every second on the navigation bar
    $scope.getDate = new Date();
    setInterval(function(){
      $scope.$apply(function(){
        $scope.getDate = new Date();
      });
    }, 1000);

    vm.removeTab = function () {

      var index=0;
      for(var i in vm.tabs){
        if(vm.tabs[i].title.replace(/ /g,"_")==vm.selectedTabTitle){
          index=i;
        }
      }
      vm.tabs.splice(index, 1);

      removeAStageObjFromStageList(vm.selectedTabTitle);
      removeLayerList(vm.selectedTabTitle);
      removeIsContainerResizeList(vm.selectedTabTitle);

      var index=0;
      for(var i in vm.selectedImages){
          if(vm.selectedImages[i].title==vm.selectedTabTitle){
            index=i;
          }
      }
      vm.selectedImages.splice(index,1);

      window.localStorage.removeItem('stage-storage-'+vm.selectedTabTitle);
      $window.localStorage.setItem('stage-storage-tabs', angular.toJson(vm.tabs));

    };
    vm.addTab = function (title) {

      $scope.tTitle='';

      for(var i in vm.tabs){
        if(vm.tabs[i].title==title){
          var alert = $mdDialog.alert({
            title: 'Attention',
            textContent: 'This tab name has existed!',
            ok: 'Close'
          });

          $mdDialog
            .show( alert )
            .finally(function() {
              alert = undefined;
            });
          return;

        }
      }

      vm.tabs.push({ title: title});

      $window.localStorage.setItem('stage-storage-tabs', angular.toJson(vm.tabs));

      title=title.replace(/ /g,"_");

      var selectedImagesForOneTab={"title":title,"images":[]};
      vm.selectedImages.push(selectedImagesForOneTab);
      addLayerList(title);
      updateIsContainerResizeList(title,false);
      $timeout(function() {
        var width=600;
        var height=400;

        $('#container_floorPlan_'+title).css({width: 50+"vw", height:'450px',border:'1px solid black'});
        $('#container_images_'+title).css({width: 50+"vw"});
        width=$('#container_floorPlan_'+title).width();
        height=$('#container_floorPlan_'+title).height();

        var initialWidth = $("#container_floorPlan_"+title).innerWidth(); // initial width
        var initialHeight = $("#container_floorPlan_"+title).innerHeight(); // initial height

        initialWidthList.push({"title":title,"value":initialWidth});
        initialHeightList.push({"title":title,"value":initialHeight});
       // isContainerResizeList.push({"title":title,"value":isContainerResize});

        var stage = new Kinetic.Stage({
          container: "container_"+title,
          width: width,
          height: height
        });
        var initialScale = stage.scale();
        initialScaleList.push({"title":title,"value":initialScale });
        var stageObj={};
        stageObj["title"]=title;
        stageObj["stage"]=stage;
 //       stageList.push(stageObj);
        addAStageObjToStageList(stageObj);

        vm.selectedIndex=vm.tabs.length-1;
        vm.selectedTabTitle = vm.tabs[vm.selectedIndex].title.replace(/ /g,"_");
      },500);
    };
    vm.selectedIndex = "";
    vm.selectedTabTitle = "";
    $scope.$watch('vm.selectedIndex', function(current, old){

      if(vm.tabs.length>0 && vm.tabs[current] !=null){
        var selectedFloorName=vm.tabs[current].title;
        vm.selectedTabTitle = vm.tabs[current].title.replace(/ /g,"_");

        for(var i in vm.floors){
          if(vm.floors[i].name===selectedFloorName){
            vm.selectedFloor=vm.floors[i];
            break;
          }
        }
      }

    });

    vm.user=JSON.parse(window.localStorage.getItem('user-info'));
    var width = $("#container_floorPlan_"+vm.selectedTabTitle).innerWidth(); // new width of page

    $scope.$on('$viewContentLoaded', function() {
      if(isJson(window.localStorage['stage-storage-tabs'])){
        vm.tabs=JSON.parse(window.localStorage['stage-storage-tabs']);
      }

   //   console.log(vm.tabs[0]);
      $timeout(function() {

      //  initStage($window.localStorage.getItem('stage-storage'));
        var viewportWidth = $(window).width();
        var viewportHeight = $(window).height();

        for(var i=0;i<vm.tabs.length;i++){
          var title=vm.tabs[i].title.replace(/ /g,"_");
          var selectedImagesForOneTab={"title":title,"images":[]};
          vm.selectedImages.push(selectedImagesForOneTab);
         // window.localStorage['stage-storage-'+title]=[];
          updateIsContainerResizeList(title,false);
          if(isJson(window.localStorage['stage-storage-'+title])){
            var stageJson=JSON.parse(window.localStorage['stage-storage-'+title]);
            var backgroundImage= stageJson.backgroundImage;
            for(var deviceID in stageJson.deviceImages){
              if(deviceID.indexOf('Light')>=0){
                stageJson.deviceImages[deviceID].image="assets/images/energy-flows/Light_off.png";
                stageJson.deviceImages[deviceID].anchorColor="#ddd";
              }
              if(deviceID.indexOf('Blind')>=0){
                stageJson.deviceImages[deviceID].image="assets/images/energy-flows/Blind_50.png";
              }
            }
            $window.localStorage.setItem('stage-storage-'+title, angular.toJson(stageJson));
            stageJson=JSON.parse(window.localStorage['stage-storage-'+title]);
            if(stageJson.width ==0){
              stageJson.width=600;
            }
            if(stageJson.height ==0){
              stageJson.height=400;
            }
            var width=100*stageJson.width/viewportWidth;
            var height=100*stageJson.height/viewportHeight;

            $('#container_floorPlan_'+title).css({width: width+"vw", height:height+"vh",border:'1px solid black'});
            $('#container_images_'+title).css({width: width+"vw"});

            var filename = stageJson.backgroundImage.replace(/^.*[\\\/]/, '')
            $( "#floorPlan" ).attr( "value", filename );


            var stage = new Kinetic.Stage({
            //  container: stageJson.container,
              container: "container_"+title,
              width: stageJson.width,
              height: stageJson.height
            });

            var initialScale = stage.scale();
            initialScaleList.push({"title":title,"value":initialScale });

            var stageObj={};
            stageObj["title"]=title;
            stageObj["stage"]=stage;
            addAStageObjToStageList(stageObj);
            initStage(vm.user.role,title, backgroundImage);

          } else{

            var width=600;
            var height=400;

            $('#container_floorPlan_'+title).css({width: 40+"vw", height:30+"vh",border:'1px solid black'});
            $('#container_images_'+title).css({width: 40+"vw"});
            width=$('#container_floorPlan_'+title).width();
            height=$('#container_floorPlan_'+title).height();
            var stage = new Kinetic.Stage({
              container: "container_"+title,
              width: width,
              height: height
            });
            var initialScale = stage.scale();
            initialScaleList.push({"title":title,"value":initialScale });

            var stageObj={};
            stageObj["title"]=title;
            stageObj["stage"]=stage;
            addAStageObjToStageList(stageObj);

          }

          var initialWidth = $("#container_floorPlan_"+title).innerWidth(); // initial width
          var initialHeight = $("#container_floorPlan_"+title).innerHeight(); // initial height
          initialWidthList.push({"title":title,"value":initialWidth});
          initialHeightList.push({"title":title,"value":initialHeight});
          var scale = {x: 1, y: 1};
          scaleList.push({"title":title,"value":scale});

        }
        initLayerList();

      },2000);
    });

    var scaleList=[];
    $scope.containerResize =function (){

      console.log("containerResize !");

      var width = $("#container_floorPlan_"+vm.selectedTabTitle).innerWidth(); // new width of page

      var height = $("#container_floorPlan_"+vm.selectedTabTitle).innerHeight(); // new height of page

      //var newScale = {x: xScale, y: yScale};

      var newScale;
      for(var i in scaleList){
        if(scaleList[i].title==vm.selectedTabTitle){
          newScale=scaleList[i].value;
          break;
        }
      }
      var xScale=newScale.x;
      var yScale=newScale.y;
      var viewportWidth = $(window).width();
      var viewportHeight = $(window).height();
      $('#container_floorPlan_'+vm.selectedTabTitle).css({width: 100*width/viewportWidth +"vw", height:100*height/viewportHeight+"vh"});
      $('#container_images_'+vm.selectedTabTitle).css({width: 100*width/viewportWidth +"vw"});

      var stage=getAStageFromStageList(vm.selectedTabTitle);

      var stageJson=JSON.parse(window.localStorage['stage-storage-'+vm.selectedTabTitle]);

     // var kineticLayers=stageList[index].stage.get('Layer');
      var kineticLayers=stage.get('Layer');

      for(var layer=1; layer<kineticLayers.length;layer++){//the first layer is the background layer, not for devices
        var kineticLayer=kineticLayers[layer];

        var groups=kineticLayer.children;

        for(var i =0; i< groups.length;i++){
          var group=groups[i];

          var kineticImage = group.find('.image')[0];
          var anchorRadius=stageJson.deviceImages[kineticImage.attrs.name].anchorRadius;
          var anchorColor=stageJson.deviceImages[kineticImage.attrs.name].anchorColor;
          var isConfigured=stageJson.deviceImages[kineticImage.attrs.name].isConfigured;
          var deviceName=stageJson.deviceImages[kineticImage.attrs.name].deviceName;
          var deviceID=stageJson.deviceImages[kineticImage.attrs.name].deviceID;
          anchorRadius=anchorRadius*(xScale+yScale)/2;
          if(anchorRadius>8){
            anchorRadius=8;
          }
          if(anchorRadius<6){
            anchorRadius=6;
          }
          stageJson.deviceImages[kineticImage.attrs.name]={"x":group.getX()*xScale+kineticImage.getX()*xScale,"y":group.getY()*yScale+kineticImage.getY()*yScale,"image":kineticImage.getImage().src,"width":kineticImage.getWidth()*xScale,"height":kineticImage.getHeight()*yScale,"deviceName":deviceName,"deviceID":deviceID,"anchorRadius":anchorRadius,"isConfigured":isConfigured,"anchorColor":anchorColor};
        }
      }

      stageJson.width=width;
      stageJson.height=height;
      stageJson.scale=newScale;
      // stageJson.scale={x: 1, y: 1};

      $window.localStorage.setItem('stage-storage-'+vm.selectedTabTitle, angular.toJson(stageJson));

      updateIsContainerResizeList(vm.selectedTabTitle,true);

    }

    $(window).resize(function(){

      console.log("window resized!");
      for(var tabIndex in vm.tabs){
        var tabTitle=vm.tabs[tabIndex].title.replace(/ /g,"_");

        var width = $("#container_floorPlan_"+tabTitle).innerWidth(); // new width of page
        var height = $("#container_floorPlan_"+tabTitle).innerHeight(); // new height of page

        var initialScale;
        for(var i in initialScaleList){
          if(initialScaleList[i].title==tabTitle){
            initialScale=initialScaleList[i].value;
            break;
          }
        }
        var initialWidth;
        for(var i in initialWidthList){
          if(initialWidthList[i].title==tabTitle){
            initialWidth=initialWidthList[i].value;
            break;
          }
        }
        var initialHeight;
        for(var i in initialHeightList){
          if(initialHeightList[i].title==tabTitle){
            initialHeight=initialHeightList[i].value;
            break;
          }
        }

        var xScale;
        var yScale;
        xScale =  (width  / initialWidth) * initialScale.x;  // percent change in width (Ex: 1000 - 400/1000 means the page scaled down 60%, you should play with this to get wanted results)
        yScale = (height / initialHeight) * initialScale.y;
        var newScale = {x: xScale, y: yScale};

        for(var i in scaleList){
          if(scaleList[i].title==tabTitle){
            scaleList[i].value=newScale;
            break;
          }
        }

        var stage=getAStageFromStageList(tabTitle);

        stage.setAttr('width', width);
        stage.setAttr('height', height);
        stage.setAttr('scale', newScale );

        updateStageList(tabTitle,stage);
      }

    });
    $scope.inputFileClick = function(){
    //  ele.value="";

     /* if(isJson(window.localStorage['stage-storage-'+vm.selectedTabTitle])) {
        var stageJson = JSON.parse(window.localStorage['stage-storage-' + vm.selectedTabTitle]);
        console.log("current statejson is ");
        console.log(stageJson);
        if(stageJson.deviceImages!=={}){
          console.log("cccccc");
          var confirm = $mdDialog.confirm()
            .title('Would you like to replace this floor plan?')
            .textContent('The devices on this floor plan will also be removed.')
            .ariaLabel('Lucky day')
            .ok('Yes')
            .cancel('Cancel');

          $mdDialog.show(confirm).then(function() {
            ele.value="";
          }, function() {
            ele.preventDefault();
          });
        }
      }*/

    //  console.log("ele");
     // console.log(ele.value);
    //  console.log(ele);

      if(isJson(window.localStorage['stage-storage-'+vm.selectedTabTitle])) {
        var stageJson = JSON.parse(window.localStorage['stage-storage-' + vm.selectedTabTitle]);
        if (!isEmpty(stageJson.deviceImages)) {
          var answer = confirm('If you upload a new floor plan, the devices on this floor plan will be removed. Do you want to replace this floor plan?');

          if (answer)
          {
            return true;

          }
          else {return false;}
        }
      }
      return true;


      /*if(isJson(window.localStorage['stage-storage-'+vm.selectedTabTitle])) {
        var stageJson = JSON.parse(window.localStorage['stage-storage-' + vm.selectedTabTitle]);
        if (!isEmpty(stageJson.deviceImages)) {
          var answer = confirm('Ok or cancel?');

          if (answer)
          {
            //shows file selection dialog window.

          }
          else {ele.preventDefault();}
        }
      }

      ele.value="";*/


    };

    function isEmpty(obj) {
      for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
          return false;
      }

      return JSON.stringify(obj) === JSON.stringify({});
    }

    /*$scope.deviceImageChanged = function(ele){
      console.log("vm.selectedTabTitle is "+vm.selectedTabTitle);
      var files = ele.files;
      var sources={};
      var stageJson=JSON.parse(window.localStorage['stage-storage-'+vm.selectedTabTitle]);
      var loadedDeviceImages=stageJson.deviceImages;
      for (var i = 0; i < files.length; i++) {
        if(loadedDeviceImages.hasOwnProperty(files[i].name)){
          return;
        }
        sources[files[i].name]='assets/images/energy-flows/'+files[i].name;
      }

      var stage=getAStageFromStageList(vm.selectedTabTitle);
      //loadImages(vm.user.role,stage,sources, LoadImagesToStage);
      loadImages(vm.user.role,vm.selectedTabTitle,sources, LoadImagesToStage);
    }*/

    $scope.floorPlanChanged = function(ele){

      for(var i in initialScaleList){
        if(initialScaleList[i].title==vm.selectedTabTitle){
          initialScaleList[i].value={x: 1, y: 1};
          break;
        }
      }
      for(var i in initialWidthList){
        if(initialWidthList[i].title==vm.selectedTabTitle){
          initialWidthList[i].value=$("#container_floorPlan_"+vm.selectedTabTitle).innerWidth(); // initial width
          break;
        }
      }
      for(var i in initialHeightList){
        if(initialHeightList[i].title==vm.selectedTabTitle){
          initialHeightList[i].value=$("#container_floorPlan_"+vm.selectedTabTitle).innerHeight(); // initial height
          break;
        }
      }

      var files = ele.files;
      $( "#floorPlan" ).attr( "value", files[0].name );
      var backgroundSrc='assets/images/energy-flows/'+files[0].name;

      var stageStorageValue={"container":"container_"+vm.selectedTabTitle,"width":$("#container_floorPlan_"+vm.selectedTabTitle).width(), "height": $("#container_floorPlan_"+vm.selectedTabTitle).height(),"scale":{"x":1,"y":1},"backgroundImage":backgroundSrc,"deviceImages":{}};
      $window.localStorage.setItem('stage-storage-'+vm.selectedTabTitle, angular.toJson(stageStorageValue));
      var stageJson =JSON.parse(window.localStorage['stage-storage-'+vm.selectedTabTitle]);

      var backgroundImage= stageJson.backgroundImage;

      initStage(vm.user.role,vm.selectedTabTitle, backgroundImage);
      //stageList[index].stage.draw();



        for(var j in vm.selectedFloor.rooms){
          var room=vm.selectedFloor.rooms[j];
          room.remainingDevices=[];
          //var count = 0;
          for(var k in vm.devices){
            if(vm.devices[k].floor===vm.selectedFloor.name && vm.devices[k].room===room.name){
              room.remainingDevices.push(vm.devices[k]);
            }
          }
        }


    }


    vm.images =JSON.parse(window.localStorage['device-image-library']);

    vm.IsDeviceLibraryVisible=false;
    vm.toggleDeviceLibrary=function(){
      vm.IsDeviceLibraryVisible=!vm.IsDeviceLibraryVisible;
     // console.log(vm.IsDeviceLibraryVisible);
      /*if(vm.IsDeviceLibraryVisible){
        if($("#btnToggleLibrary").text().indexOf("Device")>=0){
          $("#btnToggleLibrary").text('Hide Device Library');
        }
        if($("#btnToggleLibrary").text().indexOf("设备")>=0){
          $("#btnToggleLibrary").text('隐藏设备库');
        }

      }else{
        if($("#btnToggleLibrary").text().indexOf("Device")>=0){
          $("#btnToggleLibrary").text('Show Device Library');
        }
        if($("#btnToggleLibrary").text().indexOf("设备")>=0){
          $("#btnToggleLibrary").text('显示设备库');
        }
      }*/
    };

    vm.toggleRight=function () {
     // $mdSidenav('right').is
   //   $mdSidenav('right').toggle();
      $mdSidenav('right').open();
    };

    $scope.$watch(function() { return $mdMedia('md'); }, function(md) {
      $scope.isMedium=md;
    });

    $scope.removeDeviceFromFloorPlan=function (deviceID) {
      for(var i in vm.selectedFloor.rooms){
        var room=vm.selectedFloor.rooms[i];
        if(room.devices.indexOf(deviceID)>=0){
          for(var j in vm.devices){
            if(vm.devices[j].id===deviceID){
              room.remainingDevices.push(vm.devices[j]);
              return;
            }
          }
        }
      }

    }

    vm.addDevicesToFloorPlan=function(){
      var title=vm.selectedTabTitle;
      var indexOfSelectedImages=0;
      for(var i in vm.selectedImages){
        if(vm.selectedImages[i].title==title){
          indexOfSelectedImages=i;
        }
      }

      if(vm.selectedImages[indexOfSelectedImages].images.length>0){

        loadImages(vm.user.role,vm.selectedTabTitle,vm.selectedImages[indexOfSelectedImages].images, LoadImagesToStage);

        angular.forEach(vm.images, function(image) {
          if(image.check==true){
            image.check = false;
          }
        });
        vm.selectedImages[indexOfSelectedImages].images=[];
      }else{
        $mdDialog.show(
          $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Alert')
            .textContent('No devices are selected.')
            .ariaLabel('Alert Dialog Demo')
            .ok('Got it!')
        );
      }

    };

    vm.addDevicesToFloorPlanNew=function (room,device) {

      vm.checkDeviceImageNew(device);

      var title=vm.selectedTabTitle;
      var indexOfSelectedImages=0;
      for(var i in vm.selectedImages){
        if(vm.selectedImages[i].title==title){
          indexOfSelectedImages=i;
        }
      }

      if(vm.selectedImages[indexOfSelectedImages].images.length>0){

        loadImages(vm.user.role,vm.selectedTabTitle,vm.selectedImages[indexOfSelectedImages].images, LoadImagesToStage);
        vm.selectedImages[indexOfSelectedImages].images=[];
      }

      /*var index=vm.devices.indexOf(device);
      vm.devices.splice(index,1);*/

      var index=room.remainingDevices.indexOf(device);
      room.remainingDevices.splice(index,1);

    };

    vm.checkDeviceImageNew=function(device){

      var id=device.id;
      var name=device.name;
      var url=device.image;
      var newName=name;
      var newImage={
        id:id,
        name:newName,
        url:url
      };
      var stageJson=JSON.parse(window.localStorage['stage-storage-'+vm.selectedTabTitle]);
      var loadedDeviceImages=stageJson.deviceImages;

      var i=1;
      var result = loadedDeviceImages.hasOwnProperty(newName);
      while(result==true){
        newName=name+"_"+i;
        i++;
        result = loadedDeviceImages.hasOwnProperty(newName);
      }

      newImage={
        id:id,
        name:newName,
        url:url
      };

      for(var j=0;j<vm.selectedImages.length;j++){
        if(vm.selectedImages[j].title==vm.selectedTabTitle){
          vm.selectedImages[j].images.push(newImage);
        }
      }


    };

    function createDeviceDetailsTemplate(device){

      var templateHead='<link rel="stylesheet" type="text/css" href="app/main/apps/dweller/energy-flows/energy-flows.scss" />'+
        '<md-dialog id="dialog" aria-label="Mango (Fruit)" style="width: 40%; height: 53%">'+
        '<form>'+
        '<md-toolbar class="md-accent-bg">'+
        '<div class="md-accent-bg md-toolbar-tools">'+
        '<div class="md-table-thumbs" style="float: left;" >'+
        '<div style="background-image:url('+device.imageUrl+');"></div>'+
        // '<img src='+deviceInfo.href+' width="50" height="50" class="md-avatar"/>'+
        '</div>'+
        '<h2>&nbsp;&nbsp;'+device.name+'</h2>'+
        '<span flex></span>'+
        '<md-button class="md-icon-button" ng-click="close()">'+
        '<md-icon md-svg-src="assets/images/svg/ic_close_24px.svg" aria-label="Close dialog"></md-icon>'+
        '</md-button>'+
        '</div>'+
        '</md-toolbar>'+
        '<md-dialog-content>'+
        '<table width="100%" style="font-family:sans-serif"><tr>';

      var templateContent='<td width="50%" valign="top"><table width="100%">'+createDeviceGeneralInfoTemplate(device.generalInfoList)+'</table></td>';
      var templateTail=
        '</tr></table>'+
        '</md-dialog-content>'+
        '</form>'+
        '</md-dialog>';

      return templateHead+templateContent+templateTail;
    }
    function createDeviceGeneralInfoTemplate(generalInfo){

      var content='';
      for(var i in generalInfo){
        var info=generalInfo[i];
        //console.log(state);
        var infoName=info.infoName;
        var infoValue=info.infoValue;
        if(info.unit != null){
          var unit=info.unit;
          if(unit == "degree Celsius"){
            unit="&deg;C";
          }
          infoValue+=" "+unit;
        }
        content+="<tr style='font-size: small'><td style='font-weight:bold'>"+ infoName+": </td><td>"+infoValue+"</td></tr>";
      }

      return content;
    }


    /*$scope.showDialog=function(kineticImg){
      var deviceID=kineticImg.attrs.deviceID;
      var imgUrl=kineticImg.attrs.image.src;

      vm.wampService.call('eshl.get_home_device',[deviceID]).then(
        // RPC success callback
        function (device) {
          var location='';
          var id=device['uid'];
          var name=device['deviceName'];
          var image=imgUrl;
          var generalInfoList=device["deviceGeneralInfoList"];

          for(var i in generalInfoList) {
            var info = generalInfoList[i];
            var infoName = info.infoName;
            var infoValue = info.infoValue;
            if(infoName=='Location'){
              location=infoValue;
            }
          }
          var selectedDevice={id:id,name:name, imageUrl:image,location:location,generalInfoList:generalInfoList};
          $mdDialog.show({
              controller: DialogController,
              locals:{device:device},
              clickOutsideToClose: true,
              parent: angular.element(document.body),
              // templateUrl: "app/main/apps/energy-flows/deviceDetails.html",
              template: createDeviceDetailsTemplate(selectedDevice),
              targetEvent: $window.event
            })
            .then(function(answer) {
              $scope.alert = 'You said the information was "' + answer + '".';
            }, function() {
              $scope.alert = 'You cancelled the dialog.';
            });

        }
      );

    }*/

    function DialogController($scope, $mdDialog) {

      $scope.close = function() {
        $mdDialog.hide();
      };

    };

    vm.selectedImages=[];
    vm.checkDeviceImage=function(checkBox){

      var id=checkBox.image.id;
      var name=checkBox.image.name;
      console.log("id is "+id+", name is "+name);
      var url=checkBox.image.url;
      var newName=name;
      var newImage={
        id:id,
        name:newName,
        url:url
      };
      var stageJson=JSON.parse(window.localStorage['stage-storage-'+vm.selectedTabTitle]);
      var loadedDeviceImages=stageJson.deviceImages;

      var i=1;
      var result = loadedDeviceImages.hasOwnProperty(newName);
      while(result==true){
        newName=name+"_"+i;
        i++;
        result = loadedDeviceImages.hasOwnProperty(newName);
      }
      if(checkBox.image.check === true){


        newImage={
          id:id,
          name:newName,
          url:url
        };

        for(var j=0;j<vm.selectedImages.length;j++){
          if(vm.selectedImages[j].title==vm.selectedTabTitle){
            vm.selectedImages[j].images.push(newImage);
          }
        }

      }else{
        for(var j=0;j<vm.selectedImages.length;j++){
          if(vm.selectedImages[j].title==vm.selectedTabTitle){
            for(var i=0;i<vm.selectedImages[j].images.length;i++){
              if(vm.selectedImages[j].images[i].name==newName){
                vm.selectedImages[j].images.splice(i, 1);
                break;
              }
            }
          }
        }

      }

    };

    function GetFloors(admin) {
      return $http.get('http://localhost:8087/bos/api/floors/'+admin).then(handleSuccess, handleError('Error getting all locations'));
    }
    function handleSuccess(res) {
      return res.data;
    }
    function handleError(error) {
      return function () {
        return { success: false, message: error };
      };
    }

  }
}
)();
