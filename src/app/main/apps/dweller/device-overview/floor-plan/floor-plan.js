/**
 * Created by pg9501 on 20.10.2016.
 */

function update(activeAnchor) {
  var group = activeAnchor.getParent();

  var topLeft = group.find('.topLeft')[0];
  var topRight = group.find('.topRight')[0];
  var bottomRight = group.find('.bottomRight')[0];
  var bottomLeft = group.find('.bottomLeft')[0];
  var image = group.find('.image')[0];

  var anchorX = activeAnchor.x();
  var anchorY = activeAnchor.y();

  // update anchor positions
  switch (activeAnchor.name()) {
    case 'topLeft':
      topRight.y(anchorY);
      bottomLeft.x(anchorX);
      break;
    case 'topRight':
      topLeft.y(anchorY);
      bottomRight.x(anchorX);
      break;
    case 'bottomRight':
      bottomLeft.y(anchorY);
      topRight.x(anchorX);
      break;
    case 'bottomLeft':
      bottomRight.y(anchorY);
      topLeft.x(anchorX);
      break;
  }

  image.setPosition(topLeft.getPosition());

  var width = topRight.x() - topLeft.x();
  var height = bottomLeft.y() - topLeft.y();
  if(width && height) {
    image.setSize({width:width, height: height});
  }
}
function addAnchor(userRole, group, x, y, name,radius,color,selectedTabTitle) {
  var stage = group.getStage();
  var layer = group.getLayer();

  var index_isContainerResize=0;
  for(var i in isContainerResizeList){
    if(isContainerResizeList[i].title==selectedTabTitle){
      index_isContainerResize=i;
      break;
    }
  }

  var anchor = new Kinetic.Circle({
    x: x,
    y: y,
    stroke: '#666',
  //  stroke: color,
    //fill: '#ddd',
    fill:color,
    strokeWidth: 2,
    radius: radius,
    name: name,
    draggable: true,
    dragOnTop: false
  });

  //anchor.attrs.name = image;

  anchor.on('dragmove', function() {
    // console.log('dragmove');
    update(this);
    layer.draw();
  });
  anchor.on('mousedown touchstart', function() {
    //console.log('mousedown touchstart');
    group.setDraggable(false);
    this.moveToTop();
  });
  anchor.on('dragend', function() {
    //console.log('dragend');
    group.setDraggable(true);
    layer.draw();
    //  var image=group.get('Image')[0];
    var kineticImage = group.find('.image')[0];
    var image =kineticImage.attrs.name;
    var stageJson=JSON.parse(window.localStorage['stage-storage-'+selectedTabTitle]);
    var xScale=stageJson.scale.x;
    var yScale=stageJson.scale.y;
    var isConfigured=stageJson.deviceImages[image].isConfigured;
    var anchorColor=stageJson.deviceImages[image].anchorColor;
    var deviceName=stageJson.deviceImages[image].deviceName;
    var deviceID=stageJson.deviceImages[image].deviceID;
    var isContainerResize=isContainerResizeList[index_isContainerResize].value;
    if(isContainerResize){
      stageJson.deviceImages[kineticImage.attrs.name]={"x":group.getX()*xScale+kineticImage.getX()*xScale,"y":group.getY()*yScale+kineticImage.getY()*yScale,"image":kineticImage.getImage().src,"width":kineticImage.getWidth()*xScale,"height":kineticImage.getHeight()*yScale,"deviceName":deviceName,"deviceID":deviceID,"anchorRadius":radius*(xScale+yScale)/2,"isConfigured":isConfigured,"anchorColor":anchorColor};
    }else{
      stageJson.deviceImages[kineticImage.attrs.name]={"x":group.getX()+kineticImage.getX(),"y":group.getY()+kineticImage.getY(),"image":kineticImage.getImage().src,"width":kineticImage.getWidth(),"height":kineticImage.getHeight(),"deviceName":deviceName,"deviceID":deviceID,"anchorRadius":radius,"isConfigured":isConfigured,"anchorColor":anchorColor};
    }

    window.localStorage.setItem('stage-storage-'+selectedTabTitle, JSON.stringify(stageJson));
  });

  if(userRole!='ADMINISTRATOR'){
    anchor.draggable(false); //disable dragging the anchor
  }

  // add hover styling
  anchor.on('mouseover', function() {
    var layer = this.getLayer();
    document.body.style.cursor = 'pointer';
    this.setStrokeWidth(4);
    layer.draw();
  });
  anchor.on('mouseout', function() {
    var layer = this.getLayer();
    document.body.style.cursor = 'default';
    this.strokeWidth(2);
    layer.draw();
  });

  group.add(anchor);
}

/*function loadImages(title,sources, isContainerResize, callback) {

  var stageIndex=0;
  for(var i in newStageList){
    if(title==newStageList[i].title){
      stageIndex=i;
      break;
    }
  }
  var images = {};
  var loadedImages = 0;
  var numImages = 0;
  for(var src in sources) {
    numImages++;
  }
  //console.log(sources);
  for(var src in sources) {
    images[src] = new Image();
    images[src].onload = function() {
      if(++loadedImages >= numImages) {
        callback(stageIndex,images, isContainerResize);
      }
    };
    images[src].src = sources[src];
  }
}*/
function loadImages(userRole,title,selectedImgObjects, callback) {

  var stageIndex=0;
  for(var i in newStageList){
    if(title==newStageList[i].title){
      stageIndex=i;
      break;
    }
  }
  var images = {};
  var loadedImages = 0;
  var numImages = selectedImgObjects.length;

  for(var i in selectedImgObjects) {

    var imgID=selectedImgObjects[i].id;
    images[imgID] = new Image();
    images[imgID].setAttribute("deviceID", selectedImgObjects[i].id);
    images[imgID].setAttribute("deviceName", selectedImgObjects[i].name);
    images[imgID].onload = function() {
      if(++loadedImages >= numImages) {
        callback(userRole,stageIndex,images);
      }
    };
    //images[imgID].src = sources[src];
    images[imgID].src = selectedImgObjects[i].url;
  }
}
function changeAnchorColor(image,anchorColor,selectedTabTitle) {
 // var stageJson=JSON.parse(window.localStorage['stage-storage']);
  //var xScale=stageJson.scale.x;
  //var yScale=stageJson.scale.y;
 //var anchors=deviceImageGroups[image].anchor

  //console.log("image is "+image+" color is "+anchorColor);
  var index_groups=0;
  for(var i in deviceImageGroupsList){
    if(deviceImageGroupsList[i].title==selectedTabTitle){
      index_groups=i;
      break;
    }
  }
  if(deviceImageGroupsList[index_groups].groups[image]!=null){
    var children=deviceImageGroupsList[index_groups].groups[image].children;
    for(var i=0;i<children.length;i++){
      var child=children[i];
      if(child instanceof Kinetic.Circle){
        // console.log(child);
        child.attrs.fill=anchorColor;
      }
    }
    //layer.draw();
    for(var i in layerList){
      if(layerList[i].title==selectedTabTitle){
        layerList[i].layer.draw();
        break;
      }
    }
  }else{
   // console.log(image);
  }
}

function changeKineticImgAttr(image,attrName,attrValue,selectedTabTitle){
  var index_groups=0;
  for(var i in deviceImageGroupsList){
    if(deviceImageGroupsList[i].title==selectedTabTitle){
      index_groups=i;
      break;
    }
  }
  if(deviceImageGroupsList[index_groups].groups[image]!=null){
    var children=deviceImageGroupsList[index_groups].groups[image].children;
    for(var i=0;i<children.length;i++){
      var child=children[i];
      if(child instanceof Kinetic.Image){
        child.attrs[attrName]=attrValue;
      }
    }
  }
}

function clearLayerAndGroups(selectedTabTitle){
  for(var i in layerList){
    if(layerList[i].title==selectedTabTitle){
      layerList[i].layer= new Kinetic.Layer();
      break;
    }
  }
  for(var i in deviceImageGroupsList){
    if(deviceImageGroupsList[i].title==selectedTabTitle){
      deviceImageGroupsList[i].groups= {};
      break;
    }
  }
 // layer = new Kinetic.Layer();
 // deviceImageGroups={};
}

function initStageList(stageList) {
  newStageList=stageList;
}

function addAStageObjToStageList(stageObj){
  newStageList.push(stageObj);
  //console.log(newStageList);
}
function removeAStageObjFromStageList(title){
  var index=0;
  for(var i in newStageList){
    if(title==newStageList[i].title){
      index=i;
      break;
    }
  }
  newStageList.splice(index,1);
 // console.log(newStageList);

}

function getAStageFromStageList(title){
  for(var i in newStageList){
    if(title==newStageList[i].title){
      return newStageList[i].stage;
    }
  }
}

function initLayerList(){
  for(var i in newStageList){
    var title=newStageList[i].title;
    var layer = new Kinetic.Layer();
    var layerObj={"title":title,"layer":layer};
    layerList.push(layerObj);

    var groups={};
    var groupsObj={"title":title,"groups":groups};
    deviceImageGroupsList.push(groupsObj);
  }
}

function getLengthOfLayerList(){
  return deviceImageGroupsList.length;
}

function addLayerList(title){
  var layer = new Kinetic.Layer();
  var layerObj={"title":title,"layer":layer};
  layerList.push(layerObj);

  var groups={};
  var groupsObj={"title":title,"groups":groups};
  deviceImageGroupsList.push(groupsObj);
}

function removeLayerList(title){
  var index_layer=0;
  for(var i in layerList){
    if(layerList[i].title==title){
      index_layer=i;
      break;
    }
  }
  layerList.splice(index_layer,1);
  var index_groups=0;
  for(var i in deviceImageGroupsList){
    if(deviceImageGroupsList[i].title==title){
      index_groups=i;
      break;
    }
  }
  deviceImageGroupsList.splice(index_groups,1);
 // console.log("layerlist index is "+index_layer);
 // console.log(layerList);
 // console.log("deviceImageGroupsList index is "+index_groups);
 // console.log(deviceImageGroupsList);
}

function updateStageList(title, stage){
  var index=0;
  for(var i in newStageList){
    if(newStageList[i].title==title){
      index=i;
      break;
    }
  }
  newStageList[index].stage=stage;
  newStageList[index].stage.draw();
 // index =1;
//  console.log("the current stage is "+ index);
  //console.log(newStageList);
//  console.log(newStageList[index].stage);
}

function removeIsContainerResizeList(tabTitle){
  var index=0;
  for(var i in isContainerResizeList){
    if(isContainerResizeList[i].title==tabTitle){
      index=i;
      break;
    }
  }
  isContainerResizeList.splice(index,1);
}

function updateIsContainerResizeList(title,value){
  var index=-1;
  for(var i in isContainerResizeList){
    if(isContainerResizeList[i].title==title){
      index=i;
      break;
    }
  }

  if(index<0){
    isContainerResizeList.push({"title":title,"value":value});
  }else{
    isContainerResizeList[index].value=value;
  }


}


var layerList=[];
var deviceImageGroupsList=[];
var isContainerResizeList=[];
//var deviceImageGroups={};
function LoadImagesToStage(userRole,stageIndex,images, selectedImgObjects) {

 // stageIndex=1;
  var selectedTabTitle=newStageList[stageIndex].title;
  var stageJson=JSON.parse(window.localStorage['stage-storage-'+selectedTabTitle]);
  var xScale=stageJson.scale.x;
  var yScale=stageJson.scale.y;

  var kineticImgs={};

  var index_layer=0;
  for(var i in layerList){
    if(layerList[i].title==selectedTabTitle){
      index_layer=i;
      break;
    }
  }
  var index_groups=0;
  for(var i in deviceImageGroupsList){
    if(deviceImageGroupsList[i].title==selectedTabTitle){
      index_groups=i;
      break;
    }
  }
  var index_isContainerResize=0;
  for(var i in isContainerResizeList){
    if(isContainerResizeList[i].title==selectedTabTitle){
      index_isContainerResize=i;
      break;
    }
  }
  var isContainerResize=isContainerResizeList[index_isContainerResize].value;

  for(var image in images){


    deviceImageGroupsList[index_groups].groups[image] = new Kinetic.Group({
      x: 20,
      y: 20,
      draggable: true
    });

    /*
     * go ahead and add the groups
     * to the layer and the layer to the
     * stage so that the groups have knowledge
     * of its layer and stage
     */



    layerList[index_layer].layer.add(deviceImageGroupsList[index_groups].groups[image]);
  //  stage.add(layer);

    newStageList[stageIndex].stage.add(layerList[index_layer].layer);

    //   stage.add(layer);

    var width=stageJson.width/15;
    var height=stageJson.width/15;

    // darth vader
    kineticImgs[image] = new Kinetic.Image({
      // id:image,
      x: 0,
      y: 0,
      image: images[image],
      width: width,
      height: height,
      name: 'image'
    });

    var deviceName=images[image].getAttribute("deviceName");
    var deviceID=images[image].getAttribute("deviceID");
    kineticImgs[image].attrs.name = image;
    kineticImgs[image].attrs.isConfigured = false;
    kineticImgs[image].attrs.deviceName = deviceName;
    kineticImgs[image].attrs.deviceID = deviceID;

    var delay = 500, clicks = 0, timer = null;
    kineticImgs[image].on('click', function(i) {
      clicks++;  //count clicks
      timer = setTimeout(function () {
        if(clicks === 1){
          var newImg=angular.element($('#container_floorPlan_'+selectedTabTitle)).scope().showDialog(i.target);
        }
        clicks = 0;
      }, delay);
    });

    kineticImgs[image].on('mouseover', function() {
      //console.log("mouseover");
      document.body.style.cursor = 'pointer';
    });
    kineticImgs[image].on('mouseout', function() {
      //console.log("mouseout");
      document.body.style.cursor = 'default';
    });

    if(userRole==='ADMINISTRATOR'){
      kineticImgs[image].on('dblclick', function(i) {
        var id='';
        var image = i.target.attrs.name;
        var result = window.confirm("Do you want to remove this device from the floor plan?");
        if(result){
          stageJson=JSON.parse(window.localStorage['stage-storage-'+selectedTabTitle]);
          var index=0;
          for(var img in stageJson.deviceImages){
            if(img==image){
              id=stageJson.deviceImages[img].deviceID;
              delete stageJson.deviceImages[img];
              break;
            }
            index++;
          }
          // console.log(stageJson.deviceImages);
          window.localStorage.setItem('stage-storage-'+selectedTabTitle, JSON.stringify(stageJson));
          deviceImageGroupsList[index_groups].groups[image].remove();
          layerList[index_layer].layer.draw();
          angular.element(document.getElementById('container_'+selectedTabTitle)).scope().removeDeviceFromFloorPlan(id);
        }

      });
    }


    var anchorRadius=6;
    // console.log("anchorRadius: "+anchorRadius);
    /*  if(isContainerResize){
     anchorRadius=anchorRadius*(xScale+yScale)/2;
     }
     if(anchorRadius>8){
     anchorRadius=8;
     }else if(anchorRadius<6){
     anchorRadius=6;
     }*/
    deviceImageGroupsList[index_groups].groups[image].add(kineticImgs[image]);

    var anchorColor="#ddd";
    addAnchor(userRole,deviceImageGroupsList[index_groups].groups[image], 0, 0, 'topLeft',anchorRadius,anchorColor,selectedTabTitle);
    addAnchor(userRole,deviceImageGroupsList[index_groups].groups[image], width, 0, 'topRight',anchorRadius,anchorColor,selectedTabTitle);
    addAnchor(userRole,deviceImageGroupsList[index_groups].groups[image], width, height, 'bottomRight',anchorRadius,anchorColor,selectedTabTitle);
    addAnchor(userRole,deviceImageGroupsList[index_groups].groups[image], 0, height, 'bottomLeft',anchorRadius,anchorColor,selectedTabTitle);

    if(isContainerResize){
      stageJson.deviceImages[image]={"x":deviceImageGroupsList[index_groups].groups[image].getX()*xScale+kineticImgs[image].getX()*xScale,"y":deviceImageGroupsList[index_groups].groups[image].getY()*yScale+kineticImgs[image].getY()*yScale,"image":kineticImgs[image].getImage().src,"width":kineticImgs[image].getWidth()*xScale,"height":kineticImgs[image].getHeight()*yScale,"deviceName":deviceName,"deviceID":deviceID,"anchorRadius":anchorRadius,"isConfigured":false,"anchorColor":anchorColor};
    }else{
      stageJson.deviceImages[image]={"x":deviceImageGroupsList[index_groups].groups[image].getX()+kineticImgs[image].getX(),"y":deviceImageGroupsList[index_groups].groups[image].getY()+kineticImgs[image].getY(),"image":kineticImgs[image].getImage().src,"width":kineticImgs[image].getWidth(),"height":kineticImgs[image].getHeight(),"deviceName":deviceName,"deviceID":deviceID,"anchorRadius":anchorRadius,"isConfigured":false,"anchorColor":anchorColor};
    }

    window.localStorage.setItem('stage-storage-'+selectedTabTitle, JSON.stringify(stageJson));

    deviceImageGroupsList[index_groups].groups[image].on('dragstart', function() {
      // console.log(image+'dragstart');
      this.moveToTop();
    });

    deviceImageGroupsList[index_groups].groups[image].on('dragend', function(i) {

      if( i.target.hasOwnProperty('children')){
        var image=i.target.children[0].attrs.name;
        stageJson=JSON.parse(window.localStorage['stage-storage-'+selectedTabTitle]);
        xScale=stageJson.scale.x;
        yScale=stageJson.scale.y;
        anchorColor=stageJson.deviceImages[image].anchorColor;
        var isConfigured=stageJson.deviceImages[image].isConfigured;
        var deviceName=stageJson.deviceImages[image].deviceName;
        var deviceID=stageJson.deviceImages[image].deviceID;
        isContainerResize=isContainerResizeList[index_isContainerResize].value;
        if(isContainerResize){
          stageJson.deviceImages[image]={"x":deviceImageGroupsList[index_groups].groups[image].getX()*xScale+kineticImgs[image].getX()*xScale,"y":deviceImageGroupsList[index_groups].groups[image].getY()*yScale+kineticImgs[image].getY()*yScale,"image":kineticImgs[image].getImage().src,"width":kineticImgs[image].getWidth()*xScale,"height":kineticImgs[image].getHeight()*yScale,"deviceName":deviceName,"deviceID":deviceID,"anchorRadius":anchorRadius,"isConfigured":isConfigured,"anchorColor":anchorColor};
        }else{
          stageJson.deviceImages[image]={"x":deviceImageGroupsList[index_groups].groups[image].getX()+kineticImgs[image].getX(),"y":deviceImageGroupsList[index_groups].groups[image].getY()+kineticImgs[image].getY(),"image":kineticImgs[image].getImage().src,"width":kineticImgs[image].getWidth(),"height":kineticImgs[image].getHeight(),"deviceName":deviceName,"deviceID":deviceID,"anchorRadius":anchorRadius,"isConfigured":isConfigured,"anchorColor":anchorColor};
        }
        window.localStorage.setItem('stage-storage-'+selectedTabTitle, JSON.stringify(stageJson));
      }

    });



  }
 // stage.draw();
  newStageList[stageIndex].stage.draw();



}
function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
function loadOldImages(userRole, stage, selectedTabTitle, allowedDevices){

  if(!isJson(window.localStorage['stage-storage-'+selectedTabTitle])){

    return;
  }
  var stageJson=JSON.parse(window.localStorage['stage-storage-'+selectedTabTitle]);

  var deviceImages=stageJson.deviceImages;

  //deviceImages.splice(-1,1);
  //window.localStorage.setItem('stage-storage-'+selectedTabTitle, JSON.stringify(stageJson));

  var loadedImagesCount = 0;
  var images = {};
  for(var image in deviceImages){

    images[image] = new Image();
    //console.log(image);
    images[image].onload = function () {

      if (++loadedImagesCount >= Object.keys(deviceImages).length) {
        //loaded all pictures

        loadOldImagesToStage(userRole,stage,images, selectedTabTitle, allowedDevices);
      }
    };
    images[image].src = deviceImages[image].image;
  }
}
function loadOldImagesToStage(userRole,stage,images, selectedTabTitle, allowedDevices){
  var stageJson=JSON.parse(window.localStorage['stage-storage-'+selectedTabTitle]);
  var xScale=stageJson.scale.x;
  var yScale=stageJson.scale.y;
  var deviceImages=stageJson.deviceImages;
//  var deviceImageGroups={};
  var kineticImgs={};
 // var layer = new Kinetic.Layer();

  var index_layer=0;
  for(var i in layerList){
    if(layerList[i].title==selectedTabTitle){
      index_layer=i;
      break;
    }
  }
  var index_groups=0;
  for(var i in deviceImageGroupsList){
    if(deviceImageGroupsList[i].title==selectedTabTitle){
      index_groups=i;
      break;
    }
  }

  var index_isContainerResize=0;
  for(var i in isContainerResizeList){
    if(isContainerResizeList[i].title==selectedTabTitle){
      index_isContainerResize=i;
      break;
    }
  }
  var isContainerResize=isContainerResizeList[index_isContainerResize].value;

  for(var image in deviceImages){

    if(userRole=='DWELLER'){
      var deviceID=stageJson.deviceImages[image].deviceID;
      if(allowedDevices.indexOf(deviceID)<0){
        continue;
      }
    }

    deviceImageGroupsList[index_groups].groups[image] = new Kinetic.Group({
      x: deviceImages[image].x,
      y: deviceImages[image].y,
      // x: 100,
      // y: 110,
      draggable: true
    });

    /*
     * go ahead and add the groups
     * to the layer and the layer to the
     * stage so that the groups have knowledge
     * of its layer and stage
     */
    layerList[index_layer].layer.add(deviceImageGroupsList[index_groups].groups[image]);
    stage.add(layerList[index_layer].layer);
    // darth vader
    kineticImgs[image] = new Kinetic.Image({
      // id:image,
      x: 0,
      y: 0,
      image:images[image],
      width: deviceImages[image].width,
      height: deviceImages[image].height,
      // width:138,
      // height:138,
      name: 'image'
    });
    kineticImgs[image].attrs.name = image;
    var isConfigured=stageJson.deviceImages[image].isConfigured;
    kineticImgs[image].attrs.isConfigured = isConfigured;
    var deviceName=stageJson.deviceImages[image].deviceName;
    kineticImgs[image].attrs.deviceName=deviceName;
    var deviceID=stageJson.deviceImages[image].deviceID;
    kineticImgs[image].attrs.deviceID=deviceID;

    var delay = 500, clicks = 0, timer = null;
    kineticImgs[image].on('click', function(i) {
      console.log("click");

      clicks++;  //count clicks
      timer = setTimeout(function () {
        if(clicks === 1){
          var newImg=angular.element($('#container_floorPlan_'+selectedTabTitle)).scope().showDialog(i.target);
        }
        clicks = 0;
      }, delay);
    });

    kineticImgs[image].on('mouseover', function() {
      //console.log("mouseover");
      document.body.style.cursor = 'pointer';
    });
    kineticImgs[image].on('mouseout', function() {
      //console.log("mouseout");
      document.body.style.cursor = 'default';
    });

    if(userRole==='ADMINISTRATOR'){
      kineticImgs[image].on('dblclick', function(i) {
        console.log("double click");
        var id='';
        var image = i.target.attrs.name;
        var result = window.confirm("Do you want to remove this device from the floor plan?");
        if(result){
          stageJson=JSON.parse(window.localStorage['stage-storage-'+selectedTabTitle]);
          var index=0;
          for(var img in stageJson.deviceImages){
            if(img==image){
              id=stageJson.deviceImages[img].deviceID;
              delete stageJson.deviceImages[img];
              break;
            }
            index++;
          }
          // console.log(stageJson.deviceImages);
          window.localStorage.setItem('stage-storage-'+selectedTabTitle, JSON.stringify(stageJson));
          deviceImageGroupsList[index_groups].groups[image].remove();
          layerList[index_layer].layer.draw();

          angular.element(document.getElementById('container_'+selectedTabTitle)).scope().removeDeviceFromFloorPlan(id);

        }

      });
    }



    deviceImageGroupsList[index_groups].groups[image].add(kineticImgs[image]);



    var anchorRadius=6;
    /*     var anchorRadius=deviceImages[image].anchorRadius;
     if(isContainerResize){
     anchorRadius=anchorRadius*(xScale+yScale)/2;
     }
     if(typeof anchorRadius === 'undefined' || anchorRadius>8){
     anchorRadius=8;
     }
     if(anchorRadius<6){
     anchorRadius=6;
     }*/

    // console.log("anchorRadius: "+anchorRadius);
   // var anchorColor="#0AF50A";
    var anchorColor=stageJson.deviceImages[image].anchorColor;
    addAnchor(userRole,deviceImageGroupsList[index_groups].groups[image], 0, 0, 'topLeft',anchorRadius,anchorColor,selectedTabTitle);
    addAnchor(userRole,deviceImageGroupsList[index_groups].groups[image], deviceImages[image].width, 0, 'topRight',anchorRadius,anchorColor,selectedTabTitle);
    addAnchor(userRole,deviceImageGroupsList[index_groups].groups[image], deviceImages[image].width, deviceImages[image].height, 'bottomRight',anchorRadius,anchorColor,selectedTabTitle);
    addAnchor(userRole,deviceImageGroupsList[index_groups].groups[image], 0, deviceImages[image].height, 'bottomLeft',anchorRadius,anchorColor,selectedTabTitle);


    /*deviceImageGroupsList[index_groups].groups[image].on('click', function(i) {
      console.log("jetzt click!!!");
    });*/
    deviceImageGroupsList[index_groups].groups[image].on('dragstart', function(i) {
      console.log("jetzt dragstart!!!");
      this.moveToTop();
    });
    deviceImageGroupsList[index_groups].groups[image].on('dragend', function(i) {
    //  console.log("jetzt dragend!!!");
      if( i.target.hasOwnProperty('children')){
        var image=i.target.children[0].attrs.name;
        // console.log(image+ " dragend: "+ deviceImageGroups[image].getX());
      //  console.log("selectedTabTitle is "+selectedTabTitle);
        stageJson=JSON.parse(window.localStorage['stage-storage-'+selectedTabTitle]);
        xScale=stageJson.scale.x;
        yScale=stageJson.scale.y;
        anchorColor=stageJson.deviceImages[image].anchorColor;
        isConfigured=stageJson.deviceImages[image].isConfigured;
        deviceName=stageJson.deviceImages[image].deviceName;
        deviceID=stageJson.deviceImages[image].deviceID;
        isContainerResize=isContainerResizeList[index_isContainerResize].value;
        if(isContainerResize){
        //  console.log("isContainerResize!!!");
          stageJson.deviceImages[image]={"x":deviceImageGroupsList[index_groups].groups[image].getX()*xScale+kineticImgs[image].getX()*xScale,"y":deviceImageGroupsList[index_groups].groups[image].getY()*yScale+kineticImgs[image].getY()*yScale,"image":kineticImgs[image].getImage().src,"width":kineticImgs[image].getWidth()*xScale,"height":kineticImgs[image].getHeight()*yScale,"deviceName":deviceName,"deviceID":deviceID,"anchorRadius": anchorRadius,"isConfigured":isConfigured,"anchorColor":anchorColor};
        }else{
          stageJson.deviceImages[image]={"x":deviceImageGroupsList[index_groups].groups[image].getX()+kineticImgs[image].getX(),"y":deviceImageGroupsList[index_groups].groups[image].getY()+kineticImgs[image].getY(),"image":kineticImgs[image].getImage().src,"width":kineticImgs[image].getWidth(),"height":kineticImgs[image].getHeight(),"deviceName":deviceName,"deviceID":deviceID,"anchorRadius": anchorRadius,"isConfigured":isConfigured,"anchorColor":anchorColor};
        }
        window.localStorage.setItem('stage-storage-'+selectedTabTitle, JSON.stringify(stageJson));
      }

    });

    if(userRole!='ADMINISTRATOR'){
      deviceImageGroupsList[index_groups].groups[image].draggable(false); //disable dragging the device image
    }
   // console.log(deviceImageGroupsList[index_groups].groups[image]);

  }
  stage.draw();


}
var newStageList=[];
function initStage(userRole,title, backgroundImage, allowedDevices) {


  var stageIndex=0;
  for(var i in newStageList){
    if(newStageList[i].title==title){
      stageIndex=i;
      break;
    }
  }
  var selectedTabTitle=title;
  clearLayerAndGroups(selectedTabTitle);
//  stageIndex=0;
 // console.log("new index is "+stageIndex);
  newStageList[stageIndex].stage.removeChildren();
  // Create SO logo image
  var image = new Image();

  image.src =backgroundImage;

  // create stage when image loaded
  image.onload = function () {

    // create image
    var backgroundKineticImage = new Kinetic.Image({
      width: newStageList[stageIndex].stage.getSize().width,
      height:  newStageList[stageIndex].stage.getSize().height,
      image: image
    });

    // create background layer
    var backgroundLayer = new Kinetic.Layer({
      x: 0, y: 0,
      width:  newStageList[stageIndex].stage.getSize().width,
      height:  newStageList[stageIndex].stage.getSize().height
    });

    // add background layer into stage
    newStageList[stageIndex].stage.add(backgroundLayer);

    // add background image
    backgroundLayer.add(backgroundKineticImage);
    //console.log(backgroundLayer);
    loadOldImages(userRole,newStageList[stageIndex].stage, selectedTabTitle, allowedDevices);
    newStageList[stageIndex].stage.draw();
  //  newStageList[stageIndex].stage=stage;
 //   console.log("new stage isss")
 //   console.log(newStageList[stageIndex].stage);
    //newStageList[0].stage.draw();
  }
}

function initStage_old(stageConfiguration) {
  clearLayerAndGroups();
  if(!isJson(window.localStorage['stage-storage'])){
    console.log("localStorage is not json");
    return null;
  }
  var stageConfigJson=JSON.parse(stageConfiguration);

  // Create SO logo image
  var image = new Image();
  if(stageConfigJson==null){
    console.log("has noooooooooooo property");
    return;
  }
  image.src =stageConfigJson.backgroundImage;

  // create stage when image loaded
  image.onload = function () {



    var stage = new Kinetic.Stage({
      container: stageConfigJson.container,
      width: stageConfigJson.width,
      height: stageConfigJson.height
      //scale: {x: stageConfigJson.scale.x, y: stageConfigJson.scale.y}
    });

    // create image
    var backgroundImage = new Kinetic.Image({
      width: stage.getSize().width,
      height:  stage.getSize().height,
      image: image
    });



    // create background layer
    var backgroundLayer = new Kinetic.Layer({
      x: 0, y: 0,
      width:  stage.getSize().width,
      height:  stage.getSize().height
    });

    // add background layer into stage
    stage.add(backgroundLayer);

    // add background image
    backgroundLayer.add(backgroundImage);
    //console.log(backgroundLayer);
    stage.draw();
   // console.log(stage);
  }
}



