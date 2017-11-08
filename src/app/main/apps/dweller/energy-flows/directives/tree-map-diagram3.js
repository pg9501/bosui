/**
 * Created by pg9501 on 27.06.2016.
 */
(function ()
{
  'use strict';

  angular
    .module('app.dweller.energy-flows')
    .directive('treeMapDiagramC',['$window','$mdDialog','$http','d3Service','WAMPService',function($window,mdDialog,http,d3Service,WAMPService){
      return {
        restrict: 'EA',
        scope: {
          lightStates:"=",
          user:"@",
          language:"@",
          data: "@",
          generateJsonFromJavaObj: '&'
        },
        link: function(scope, ele, attrs) {
          d3Service.d3().then(function(d3) {

         //   var airConditionerTemp=25;

            /*if(scope.data.indexOf("Power Consumption")>0){

              GetAirConditionerTemp().then(function (result) {
                var numb = result.match(/\d/g);
                if(numb!=null){
                  airConditionerTemp=result;
                }

              });
            }*/


            function GetAirConditionerTemp() {
              return http.get('http://localhost:8087/bos/api/airConditionerTemp').then(handleSuccess, handleError('Error getting air conditioner temp'));
            }
            function handleSuccess(res) {
              return res.data;
            }
            function handleError(error) {
              return function () {
                return { success: false, message: error };
              };
            }

            //Browser onresize event
            $window.onresize=function(){


              scope.$apply();
            };
            //watch for resize event
            scope.$watch(function(){
              return angular.element($window)[0].innerWidth;
            },function(){


              if(2*$('#'+attrs.containerId).width()> $window.innerWidth){
                $('#'+attrs.containerId).height($('#'+attrs.containerId).width());
              }
              d3.select("#"+attrs.containerId).select("svg").remove();
              treeMap();
            });

            scope.$watch(function(scope) { return scope.data },
              function() {
                d3.select("#"+attrs.containerId).select("svg").remove();
                treeMap();
              }
            );

            function treeMap() {

              var userName=attrs.user;

              var language=attrs.language;

              var lightStates=scope.lightStates;

              var wampSession=WAMPService.getWAMPsession();

              var containerID=attrs.containerId,
                  parentContainerID=attrs.parentContainerId;
              var $container = $('#'+containerID),
                  $parentContainer = $('#'+parentContainerID),
                  width = $parentContainer.width(),
                  height=$parentContainer.height(),
                  margin = {right: 10, bottom: 10, top:10, left: 10},
                  topMargin=height/7,
                  color = d3.scale.category20(),
                  formatNumber = d3.format(",d"),
                  transitioning;

             // console.log("topMargin is: "+topMargin);

              if(topMargin<15){
                topMargin=15;
              }
              if(topMargin>40){
                topMargin=40;
              }

              /* create x and y scales */
              var x = d3.scale.linear()
                  .domain([2, width+margin.left+margin.right-3])
                  .range([2,width+margin.left+margin.right-3]);

              var y = d3.scale.linear()
                  .domain([topMargin+5,height+margin.top+margin.bottom-3])
                  .range([topMargin+5, height+margin.top+margin.bottom-3]);

              var treemap = d3.layout.treemap()
                  .children(function(d, depth) { return depth ? null : d.children; })
                  .sort(function(a, b) { return a.value - b.value; })
                  .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
                  .round(false);

              /* create svg */
              var svg = d3.select("#" + containerID).append("svg")
                  .attr("width", width+margin.left+margin.right )
                  .attr("height", height+margin.top+margin.bottom )
                  .style("margin-left", -margin.left + "px")
                  .style("margin-top", -margin.top + "px")
                  .append("g")
                  .attr("transform", "translate(" + 0 + "," + 0 + ")")
                  .style("shape-rendering", "crispEdges");

              var grandparent = svg.append("g")
                  .attr("class", "grandparent");

              grandparent.append("rect")
                  .attr("x", 2)
                  .attr("y", 3)
                  .attr("width", width+margin.left+margin.right-4)
                  .attr("height", topMargin)
                  .style("fill","#dadaeb");

              grandparent.append("text")
                  .attr("x", (width+margin.left+margin.right-4) / 2)
                  .attr("y", 2+topMargin/2)
                  .attr("dy", ".35em")
                  .attr("text-anchor", "middle");

              var defs = svg.append("defs");

              var filter = defs.append("svg:filter")
                .attr("id", "outerDropShadow")
                .attr("x", "-20%")
                .attr("y", "-20%")
                .attr("width", "140%")
                .attr("height", "140%");

              filter.append("svg:feOffset")
                .attr("result", "offOut")
                .attr("in", "SourceGraphic")
                .attr("dx", "1")
                .attr("dy", "1");

              filter.append("svg:feColorMatrix")
                .attr("result", "matrixOut")
                .attr("in", "offOut")
                .attr("type", "matrix")
                .attr("values", "1 0 0 0 0 0 0.1 0 0 0 0 0 0.1 0 0 0 0 0 .5 0");

              filter.append("svg:feGaussianBlur")
                .attr("result", "blurOut")
                .attr("in", "matrixOut")
                .attr("stdDeviation", "3");

              filter.append("svg:feBlend")
                .attr("in", "SourceGraphic")
                .attr("in2", "blurOut")
                .attr("mode", "normal");



              /* load in data, display root */

              var root=JSON.parse(attrs.data);
              initialize(root);
              accumulate(root);
              layout(root);
              display(root);

              function initialize(root) {
                root.x =2;
                root.y = topMargin+5;
                root.dx = width+margin.left+margin.right-5;
                root.dy = height+margin.top+margin.bottom-topMargin-5;
                root.depth = 0;
              }

// Aggregate the values for internal nodes. This is normally done by the
// treemap layout, but not here because of our custom implementation.
              function accumulate(d) {
                return d.children
                    ? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
                    : d.value;
              }

// Compute the treemap layout recursively such that each group of siblings
// uses the same size (1×1) rather than the dimensions of the parent cell.
// This optimizes the layout for the current zoom state. Note that a wrapper
// object is created for the parent node for each group of siblings so that
// the parent’s dimensions are not discarded as we recurse. Since each group
// of sibling was laid out in 1×1, we must rescale to fit using absolute
// coordinates. This lets us use a viewport to zoom.
              function layout(d) {
                if (d.children) {
                  treemap.nodes({children: d.children});
                  d.children.forEach(function(c) {
                    c.x = d.x + c.x * d.dx;
                    c.y = d.y + c.y * d.dy;
                    c.dx *= d.dx;
                    c.dy *= d.dy;
                    c.parent = d;
                    layout(c);
                  });
                }
              }
              /* display show the treemap and writes the embedded transition function */
              function display(d) {
                /* create grandparent bar at top */
                grandparent
                    .datum(d.parent)
                    .on("click", transition)
                    .select("text")
                    .text(function(){
                      var array=name(d).split(".");
                      return array[array.length-1];
                    })
                    .style("font-family","sans-serif")
                    .style('fill', '#3B616E')
                  .style('font-weight','100')
                    .style("font-size",function(){
                      var fontSize=topMargin*0.5;
                      if(fontSize>15){
                        fontSize=15;
                      }
                      return fontSize+"px";
                    });
                grandparent
                  .datum(d.parent)
                  .select("rect")
                  .style("fill",function () {
                    switch (name(d)){
                      case "Power-consuming devices": return "#bcbddc";
                        break;
                      case "Stromverbrauchende Geräte": return "#bcbddc";
                        break;
                      case "正在耗电设备": return "#bcbddc";
                        break;
                      case "Power-generating devices": return "#a1d99b";
                        break;
                      case "Stromerzeugende Geräte": return "#a1d99b";
                        break;
                      case "正在发电设备": return "#a1d99b";
                        break;
                      case "Heat-generating devices": return "#fdd0a2";
                        break;
                      case "Wärmeerzeugende Geräte": return "#fdd0a2";
                        break;
                      case "正在制热设备": return "#fdd0a2";
                        break;
                      case "Cold-generating devices": return "#D4E9FF";
                        break;
                      case "Kälteerzeugende Geräte": return "#D4E9FF";
                        break;
                      case "正在制冷设备": return "#D4E9FF";
                        break;
                      case "Gas-consuming devices": return "#e6e6e6";
                        break;
                      case "Gasverbrauchende Geräte": return "#e6e6e6";
                        break;
                      case "正在燃气设备": return "#e6e6e6";
                        break;

                      default: return "#DBFF33";
                    }
                  })
                  .on('mouseover', function(d){
                   // d3.select(this).style("fill", "#DBFF33");
                    })
                  .on("mouseout", function () {
                   /* var color;
                    switch (name(d)){
                      case "Power Consumption": return "#bcbddc";
                        break;
                      case "正在耗电设备": return "#bcbddc";
                        break;
                      case "Power Generation": return "#a1d99b";
                        break;
                      case "正在发电设备": return "#a1d99b";
                        break;
                      case "Heat Generation": return "#fdd0a2";
                        break;
                      case "正在制热设备": return "#fdd0a2";
                        break;
                      case "Cold Generation": return "#D4E9FF";
                        break;
                      case "正在制冷设备": return "#D4E9FF";
                        break;
                      case "Gas Consumption": return "#e6e6e6";
                        break;
                      case "正在燃气设备": return "#e6e6e6";
                        break;

                      default: color= "#DBFF33";
                    }
                    d3.select(this).style("fill", color);*/
                  })
                  ;

                var g1 = svg.insert("g", ".grandparent")
                    .datum(d)
                    .attr("class", "depth");

                /* add in data */
                var g = g1.selectAll("g")
                    .data(d.children)
                    .enter().append("svg:g")
                    .on("mouseover", function (d) {
                      d3.select(this).classed('hover', true);
                      this.parentNode.appendChild(this); // workaround for bringing elements to the front (ie z-index)
                      d3.select(this)
                        //.attr("filter", "url(#outerDropShadow)")
                          .selectAll(".background")
                          .style("stroke", "#000000")
                        ;

                    })
                    .on("mousemove", function (d) {
                      if(d.id ==null || d.id=='No Device'){
                        return;
                      }
                      var s_Top = document.documentElement.scrollTop || document.body.scrollTop;
                      var s_Left = document.documentElement.scrollLeft || document.body.scrollLeft;
                      var o = document.getElementById('div_Show');
                      var bgColor='#F2F2F2';
                      var value=d.value;
                      var unit=d.unit;


                      if (o == null) {
                        var name;
                        if(typeof d.state != "undefined") {
                          name=d.id+"&nbsp;&nbsp;<br />"+d.state+"%"+"&nbsp;&nbsp";
                        }else{
                          name=d.id+"&nbsp;&nbsp;";
                        }
                        var id= d.id.replace(/ /g, '')+"new";

                        var head="<table width='auto' style='margin:5px; padding:5px' ><tr><td><img src="+d.href+" width='30' height='30'/></td><td style='font-weight:bold;'>"+ d.id+"</td></tr>";

                        var content=head+createDeviceGeneralInfoTemplate(d)+"</table>";

                        $("<div id=\"div_Show\" style='background-color:"+ bgColor+" ;'></div>").html(content

                        ).css({
                          "z-index": "2147483647"
                        }).prependTo("body");
                      }


                      var e = d3.event;
                      $("#div_Show").css({
                        "position": "absolute",
                        "top": $(e)[0].clientY + s_Top + "px",
                        "left": $(e)[0].clientX + s_Left + 20 + "px",
                        "border": "solid 1px grey"
                      });
                    })
                    .on("mouseout", function () {
                      d3.select(this).classed('hover', false);
                      d3.select(this)
                          .attr("filter", "")
                          .selectAll(".background")
                          .style("stroke", "#FFFFFF");
                      $("#div_Show").remove();
                    })
                  .on("click", function(d) {
                    //console.log("qqqqqqqqqqqqclickkkkkkkkkkkkkk");
                    if(!d.children){
                      //window.open(d.url);

                      if(d.id=='No Device'){
                        return;
                      }
                      //  scope.deviceInfo =d;
                      scope.defaultData=new Array();



                      wampSession.call('eshl.get_home_device',[language,d.id]).then(

                        // RPC success callback
                        function (device) {

                          scope.deviceInfo= scope.generateJsonFromJavaObj({arg1:device,arg2:"pCon"});
                          if(scope.deviceInfo.id.indexOf('Light')>=0){
                            for(var i in lightStates) {
                              var lightID = Object.keys(lightStates[i])[0];
                              if (lightID === scope.deviceInfo.id) {
                                if(lightStates[i][lightID]==='on'){
                                  scope.deviceInfo.href='assets/images/energy-flows/Light_on.png';
                                }else{
                                  scope.deviceInfo.href='assets/images/energy-flows/Light_off.png';
                                }
                                break;
                              }
                            }
                          }
                          mdDialog.show({
                            controller: DialogController,
                            locals:{deviceInfo: scope.deviceInfo, defaultData:scope.defaultData},
                            clickOutsideToClose: true,
                            template: createDeviceDetailsTemplate(scope.deviceInfo,scope.defaultData),
                            parent: angular.element(document.body),
                            targetEvent: $window.event
                          });

                        },
                        // RPC error callback
                        function (error) {
                          console.log("Call failed:", error);
                        }

                      );

                      /*  mdDialog.show({
                       controller: DialogController,
                       locals:{deviceInfo: scope.deviceInfo, defaultData:scope.defaultData},
                       clickOutsideToClose: true,
                       template: createDeviceDetailsTemplate(scope.deviceInfo,scope.defaultData),
                       parent: angular.element(document.body),
                       targetEvent: $window.event
                       })
                       .then(function(result) {

                       }, function() {
                       scope.alert = 'You cancelled the dialog.';
                       });*/
                    }
                  });

                function createDeviceControllerTemplate(deviceInfo){

                  var controllers=[];

                  var deviceID=deviceInfo.id;

                  var generalInfo=deviceInfo.generalInfo;
                  var location='';
                  if(generalInfo != null) {
                    for (var i in generalInfo) {
                      var info = generalInfo[i];
                      if (info.infoName != null) {
                        var infoName = info.infoName;
                        var infoValue = info.infoValue;
                        if(infoName==='Location' || infoName==='location'){
                          location=infoValue;
                          break;
                        }
                      }
                    }
                  }

                  for(var i in deviceInfo.controllers){
                    if(deviceInfo.controllers[i].controllerName!=null){
                      controllers.push(deviceInfo.controllers[i]);
                    }
                  }
                  var content='';
                  if(controllers != null){
                    for(var i in controllers){
                      var controller=controllers[i];

                      if(controller.controllerName!=null && controller.isAvailable){
                        var actions=controller.actionList;
                        for(var j in actions){
                          var action=actions[j];
                          if(action.actionName!=null && action.isAvailable){
                            var description=action.description;
                            var widget=action.widget;
                            if(widget!=null){
                              if(widget.type=='Button'){
                                if(widget.color==''&& widget.image==''){
                                  if(description!=""){
                                    content+="<tr ><td style='font-weight:bold'>"+ description+": </td><td><md-button class='md-raised' ng-click='buttonClick("+JSON.stringify(widget.text)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")' style='margin-left: 0px;margin-top: 15px'>"+widget.text+"</md-button></td></tr>";
                                  }else{
                                    content+="<tr ><td colspan='2'>";
                                    content+="<md-button class='md-raised' ng-click='buttonClick("+JSON.stringify(widget.text)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")' style='margin-left: 0px;margin-top: 15px'>"+widget.text+"</md-button>";
                                    content+="</td></tr>";
                                  }
                                }
                                if(widget.color!='' && widget.image!= ''){
                                  var src="assets/images/svg/"+widget.image+".svg";
                                  if(description!=""){
                                    content+="<tr ><td style='font-weight:bold'>"+ description+": </td><td><md-button class='md-raised' ng-click='buttonClick("+JSON.stringify(widget.text)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")' style='margin-left: 0px;margin-top: 15px;color:"+widget.color+"'><div layout='column'><md-icon md-svg-src="+src+"></md-icon><span>"+widget.text+"</span></div></md-button></td></tr>";
                                  }else{
                                    content+="<tr ><td colspan='2'>";
                                    content+="<md-button class='md-raised' ng-click='buttonClick("+JSON.stringify(widget.text)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")' style='margin-left: 0px;margin-top: 15px;color:"+widget.color+"'><div layout='column'><md-icon md-svg-src="+src+"></md-icon><span>"+widget.text+"</span></div></md-button>";
                                    content+="</td></tr>";
                                  }
                                }
                                if(widget.color!='' && widget.image == ''){
                                  if(description!=""){
                                    content+="<tr ><td style='font-weight:bold'>"+ description+": </td><td><md-button class='md-raised' ng-click='buttonClick("+JSON.stringify(widget.text)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")' style='margin-left: 0px;margin-top: 15px;color:"+widget.color+"'>"+widget.text+"</md-button></td></tr>";

                                  }else{
                                    content+="<tr ><td colspan='2'>";
                                    content+="<md-button class='md-raised' ng-click='buttonClick("+JSON.stringify(widget.text)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")' style='margin-left: 0px;margin-top: 15px;color:"+widget.color+"'>"+widget.text+"</md-button>";
                                    content+="</td></tr>";
                                  }

                                }
                                if(widget.color =='' && widget.image != ''){
                                  var src="assets/images/svg/"+widget.image+".svg";
                                  if(description!=""){
                                    content+="<tr ><td style='font-weight:bold'>"+ description+"</td><td><md-button class='md-raised' ng-click='buttonClick("+JSON.stringify(widget.text)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")' style='margin-left: 0px;margin-top: 15px;'><md-icon md-svg-src="+src+"></md-icon>"+widget.text+"</md-button></td></tr>";

                                  }else{
                                    content+="<tr ><td colspan='2'>";
                                    content+="<md-button class='md-raised' ng-click='buttonClick("+JSON.stringify(widget.text)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")' style='margin-left: 0px;margin-top: 15px;'><md-icon md-svg-src="+src+"></md-icon>"+widget.text+"</md-button>";
                                    content+="</td></tr>";
                                  }
                                }
                              }
                              if(widget.type=='Slider'){
                                description="Set State";
                                if(language=='de'){
                                  description="Zustand setzen";
                                }else if(language=='ch'){
                                  description="设置状态";
                                }
                                if(description!=""){
                                  content+="<tr ><td style='font-weight:bold'>"+ description+":</td><td><md-slider-container><md-slider style='width: 80%' ng-model='sliderState' aria-label='slider'  min="+ widget.min_value+" max="+widget.max_value+" step="+widget.step+ " class='md-accent' ng-change='sliderChange(sliderState,"+JSON.stringify(action)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")'> </md-slider>"+
                                    " </md-slider-container></td></tr>"

                                }else{
                                  content+="<tr ><td colspan='2'>";
                                  content+="<md-slider-container><md-slider style='width: 80%' ng-model='sliderState' aria-label='slider' min="+ widget.min_value+" max="+widget.max_value+" step="+widget.step+ " class='md-accent' ng-change='sliderChange(sliderState,"+JSON.stringify(action)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")'> </md-slider>"+
                                    " </md-slider-container>";
                                  content+="</td></tr>";
                                }
                              }

                              if(widget.type=='Switch'){

                                description="Set State";
                                if(language=='de'){
                                  description="Zustand setzen";
                                }else if(language=='ch'){
                                  description="设置状态";
                                }
                                if(description!=""){
                                  content+="<tr ><td style='font-weight:bold'>"+ description+": </td><td><md-switch class='md-accent' ng-model='switchState' aria-label='switch' ng-change='switchChange(switchState,"+JSON.stringify(action)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")'> </md-switch >"+
                                    " </td></tr>"
                                } else{
                                  content+="<tr ><td colspan='2'>";

                                  //switchState=true;
                                  //console.log("switchState="+switchState);
                                  content+="<md-switch aria-label='Switch' class='md-accent' ng-model='switchState' ng-change='switchChange(switchState,"+JSON.stringify(action)+","+JSON.stringify(deviceID)+","+JSON.stringify(location)+")'> </md-switch >";
                                  content+="</td></tr>";
                                }
                              }

                              if(widget.type=='TouchSpin'){

                                var airConditionerTempStorage = window.localStorage.getItem('stage-storage-temp-air-conditioner');
                                var airConditionerTemp=22;
                                if (airConditionerTempStorage === null){
                                  $window.localStorage.setItem('stage-storage-temp-air-conditioner', 22);
                                }else{
                                  airConditionerTemp=JSON.parse(window.localStorage['stage-storage-temp-air-conditioner']);

                                }

                                if(description!=""){
                                  content+="<tr ><td style='font-weight:bold'>"+ description+":</td><td>" +
                                    "<ng-touch-spin style='width: 50%'  ng-model='touchSpinState'  postfix='&deg;C' ng-change='touchSpinChange(touchSpinState,"+JSON.stringify(deviceID)+","+JSON.stringify(location)+")' initval="+airConditionerTemp+" decimals="+widget.decimals+" step="+widget.step+">"+
                                    " </td></tr>"
                                } else{
                                  content+="<tr ><td colspan='2'>";

                                  //switchState=true;
                                  //console.log("switchState="+switchState);
                                  content+="<ng-touch-spin style='width: 50%'  ng-model='touchSpinState' postfix='&deg;C' initval="+widget.initVal+" decimals="+widget.decimals+" step="+widget.step+">";
                                  content+="</td></tr>";
                                }

                              }
                            }


                          }
                        }
                      }
                    }
                  }

                  return content;

                }

                function createDeviceGeneralInfoTemplate(deviceInfo){
                  var generalInfo=deviceInfo.generalInfo;
                  var content='';
                  if(generalInfo != null){
                    for(var i in generalInfo){
                      var info=generalInfo[i];
                      if(info.infoName!=null){
                        var infoName=info.infoName;
                        var infoValue=info.infoValue;
                        if(infoName==='Location'){
                          var floorValue=infoValue.substring(0,infoValue.indexOf(":")).trim();
                          var roomValue=infoValue.substring(infoValue.indexOf(":")+1).trim();
                          var floorName='Floor';
                          var roomName='Room';
                          if(language==='de'){
                            floorName='Etage';
                            roomName='Zimmer';
                          }else if(language==='ch'){
                            floorName='楼层';
                            roomName='房间';
                          }
                          content+="<tr ><td style='font-weight:bold'>"+ floorName+":&nbsp;&nbsp; </td><td>"+floorValue+"</td></tr>";
                          content+="<tr ><td style='font-weight:bold'>"+ roomName+":&nbsp;&nbsp; </td><td>"+roomValue+"</td></tr>";
                          continue;
                        }
                        if(info.unit != null){
                          var unit=info.unit;
                          if(unit == "degree Celsius"){
                            unit="&deg;C";
                          }
                          infoValue+=" "+unit;
                        }
                        content+="<tr ><td style='font-weight:bold'>"+ infoName+": </td><td>"+infoValue+"</td></tr>";
                      }

                    }
                  }else{
                    content+="<tr><td style='font-weight:bold'>"+ deviceInfo.infoName+": </td><td>"+deviceInfo.value+" "+deviceInfo.unit+"</td></tr>";

                  }
                  return content;
                }

                function createDeviceChannelInfoTemplate(deviceInfo){
                  var channels=[];
                  for(var i in deviceInfo.channels){
                    if(deviceInfo.channels[i].channelName!=null){
                      channels.push(deviceInfo.channels[i]);
                    }
                  }

                  var content='';
                  if(channels != null){

                    for(var i in channels){
                      var channel=channels[i];
                      if(channels.length>1){
                        var channelName=channel.channelName;
                        if(channelName!=null){
                          content+="<tr ><td colspan='2' style='font-weight:bold'>"+channelName+":</td></tr>";
                        }else{
                          continue;
                        }
                      }
                      var channelInfo=channels[i].channelInfo;
                      for(var j in channelInfo){
                        var info=channelInfo[j];
                        //console.log(state);

                        var infoName=info.infoName;
                        if(infoName!=null){
                          var infoValue=info.infoValue;
                          if(deviceInfo.name.indexOf("Light")>=0){
                            if(language=='en'){
                              if(infoName=='State'||infoName=='Status'){
                                infoValue="{{switchState.toString().replace(true, 'On').replace(false, 'Off')}}";
                              }

                            }else if(language=='de'){
                              if(infoName=='Zustand'){
                                infoValue="{{switchState.toString().replace(true, 'ein').replace(false, 'aus')}}";
                              }
                            }else if(language=='ch'){
                              if(infoName=='状态'){
                                infoValue="{{switchState.toString().replace(true, '开启').replace(false, '关闭')}}";
                              }
                            }
                            if(infoName=='Power' || infoName=='power') {
                              infoValue="{{switchState.toString().replace(true, '100').replace(false, '0')}}";
                            }

                          }
                          if(deviceInfo.name.indexOf("Blind")>=0){
                            if(infoName=='State'||infoName=='Status' ||infoName=='Zustand'||infoName=='状态'){
                              infoValue="{{sliderStateString}}";
                            }
                          }

                          if(info.unit != null){
                            var unit=info.unit;
                            if(unit == "degree Celsius"){
                              unit="&deg;C";
                            }
                            infoValue+=" "+unit;
                          }
                          content+="<tr ><td style='font-weight:bold'>"+ infoName+": </td><td>"+infoValue+"</td></tr>";
                        }

                      }
                    }

                  }

                  return content;
                }

                function createDoFInfoTemplate(deviceInfo,defaultData){
                  var DoFInfo=deviceInfo.DoFInfo;
                  var content='';
                  //var defaultData=new Array();
                  if(DoFInfo!=null && DoFInfo.length>0){
                    for(var i in DoFInfo){
                      var info=DoFInfo[i];
                      var infoName=info.infoName;
                      var infoValue=info.infoValue;
                      var format=info.format;
                      var unit=info.unit;
                      var defaultValue=info.defaultValue;
                      if(format=="NUMBER"){

                        // content+="<tr style='height: 30px'><td width='40%'>"+ infoName+" ("+unit+"): </td><td width='60%'><input style='width: 99px' type='number' name='input' required></td></tr>";
                        content+="<tr style='height: 30px'><td width='100%'>"+ infoName+" ("+unit+"): </td></tr><tr><td width='100%'><input style='width: 99px' type='number' name='input' required value='"+defaultValue+"'></td></tr>";
                      }else if(format=='TIME'){

                        var defaultTime='';
                        if(defaultValue!=null && defaultValue!="" ){
                          defaultTime=new Date(defaultValue);
                        }else{
                          var d = new Date();
                          var year=d.getFullYear();
                          var month=d.getMonth();
                          var day=d.getDate();
                          var hour=d.getHours();
                          var minute=d.getMinutes();
                          defaultTime=new Date(year,month,day,hour,minute);
                        }
                        defaultData.push(defaultTime);

                        // content+="<tr style='height: 30px'><td width='40%'>"+ infoName+": </td><td width='60%'><input type='datetime-local' style='width: 230px' ng-model='data.datetime' placeholder='yyyy-MM-ddTHH:mm:ss' required /></td></tr>";
                        content+="<tr style='height: 30px'><td width='100%'>"+ infoName+": </td></tr><tr><td width='100%'><input type='datetime-local' style='width: 230px' ng-model='defaultData["+(defaultData.length-1)+"]' placeholder='yyyy-MM-ddTHH:mm:ss' required /></td></tr>";
                      }
                    }

                    content+="<tr style='height: 30px'><td> <md-button class='md-raised' style='margin-left: 0px;margin-top: 15px'>{{'DEVICE_LIST.APPLY'|translate}}</md-button></td></tr>";
                    //content+="<tr style='height: 30px'><td> <md-button class='md-raised' style='margin-left: 0px;margin-top: 15px'>Apply</md-button> <md-button class='md-raised'>Start Now</md-button></td></tr>";
                  }
                  return content;
                }

                /* transition on child click */
                g.filter(function(d) { return d.children; })
                    .classed("children", true)
                    .on("click", transition);

                /* write children rectangles */
                var group = g.selectAll(".child")
                    .data(function(d) { return d.children || [d]; })
                    .enter().append("g")
                    ;

                group.append("rect")
                    .attr("class", "child")
                    .call(rect)
                    .classed("background", true)
                    .style("fill", function (d) {
                      if (d.inDeviceGroup == "1") {
                        // return color(d.parent.name);
                        if(d.type=="pCon"){
                          return '#bcbddc';
                        }
                        if(d.type=="pGen"){
                          return '#a1d99b';
                        }
                        if(d.type=="hGen"){
                          return '#fdd0a2';
                        }
                        if(d.type=="cGen"){
                          //return '#9ecae1';
                          return '#D4E9FF';
                        }

                      }
                      else {
                        // return color(d.name);
                        if(d.type=="pCon"){
                          return '#dadaeb';
                        }
                        if(d.type=="pGen"){
                          return '#c7e9c0';
                        }
                        if(d.type=="hGen"){
                          // return '#fdd0a2';
                          return '#F6E3CE';
                        }
                        if(d.type=="cGen"){
                          // return '#c6dbef';
                          return '#D4E9FF';
                        }
                        if(d.type=="gCon"){
                          // return '#c6dbef';
                          return '#e6e6e6';
                        }

                      }
                    });

                group.append("image")
                    .attr("xlink:href", function (d) {
                      return d.href;
                    })
                    .call(image);

                /* write parent rectangle */
                g.append("rect")
                    .attr("class", "parent")
                    .call(rect)
                    .style("fill","none")
                    .style("stroke-width","0")
                    /* open new window based on the json's URL value for leaf nodes */
                    /* Chrome displays this on top */
                    /*.on("click", function(d) {
                     // console.log("clickkkkkkkkkkkkkk");
                      if(!d.children){
                        //window.open(d.url);
                        if(d.id=='No Device'){
                          return;
                        }
                      //  scope.deviceInfo =d;
                        scope.defaultData=new Array();

                        wampSession.call('eshl.get_home_device',[language,d.id]).then(

                          // RPC success callback
                          function (device) {

                            scope.deviceInfo= scope.generateJsonFromJavaObj({arg1:device,arg2:"pCon"});
                            mdDialog.show({
                              controller: DialogController,
                              locals:{deviceInfo: scope.deviceInfo, defaultData:scope.defaultData},
                              clickOutsideToClose: true,
                              template: createDeviceDetailsTemplate(scope.deviceInfo,scope.defaultData),
                              parent: angular.element(document.body),
                              targetEvent: $window.event
                              });

                          },
                          // RPC error callback
                          function (error) {
                            console.log("Call failed:", error);
                          }

                        );

                      }
                    })*/
                ;

                /*function DialogController($scope, $mdDialog, deviceInfo,defaultData) {

                  $scope.deviceInfo=deviceInfo;
                  $scope.defaultData=defaultData;
                  $scope.close = function() {
                    $mdDialog.hide();
                  };
                };*/

                function DialogController($scope,$mdDialog,deviceInfo,defaultData) {

                  $scope.deviceInfo=deviceInfo;
                  $scope.defaultData=defaultData;
                  $scope.close = function() {

                    if(deviceInfo.id.indexOf('Blind')>=0){
                      $mdDialog.hide($scope.sliderState);
                    }else  if(deviceInfo.id.indexOf('Light')>=0){
                      $mdDialog.hide($scope.switchState);
                    }else{
                      $mdDialog.hide();
                    }
                  };

                 // var lightStates=JSON.parse(window.localStorage['stage-storage-light-states']);


                  if(deviceInfo.id.indexOf('Light_')>=0){
                  /*  var switchState;
                    if(language==='en'){
                      for(var j in deviceInfo.channels){
                        var channel=deviceInfo.channels[j];
                        var channelInfo=channel.channelInfo;
                        for(var k in channelInfo){
                          if(channelInfo[k].infoName=='State'|| channelInfo[k].infoName=='Status'){
                            if(channelInfo[k].infoValue=='Off'){
                              switchState=false;
                            }else if(channelInfo[k].infoValue=='On'){
                              switchState=true;
                            }
                          }
                        }
                      }
                    }else if(language==='de'){
                      for(var j in deviceInfo.channels){
                        var channel=deviceInfo.channels[j];
                        var channelInfo=channel.channelInfo;
                        for(var k in channelInfo){
                          if(channelInfo[k].infoName=='Zustand'){
                            if(channelInfo[k].infoValue=='aus'){
                              switchState=false;
                            }else if(channelInfo[k].infoValue=='ein'){
                              switchState=true;
                            }
                          }
                        }
                      }
                    }else if(language==='ch'){
                      for(var j in deviceInfo.channels){
                        var channel=deviceInfo.channels[j];
                        var channelInfo=channel.channelInfo;
                        for(var k in channelInfo){
                          if(channelInfo[k].infoName=='状态'){
                            if(channelInfo[k].infoValue=='关闭'){
                              switchState=false;
                            }else if(channelInfo[k].infoValue=='开启'){
                              switchState=true;
                            }
                          }
                        }
                      }*/

                    var switchState;
                    for(var i in lightStates) {
                      var lightID = Object.keys(lightStates[i])[0];
                      if (lightID === deviceInfo.id) {
                        if(lightStates[i][lightID]==='on'){
                          switchState=true;
                        }else{
                          switchState=false;
                        }
                      }
                    }

                    $scope.switchState=switchState;


                  }

                  $scope.buttonClick=function (actionName,deviceID,location) {
                    var date=new Date();
                    var y=date.getYear();
                    var m=date.getMonth();
                    var d=date.getDate();

                    var h=date.getHours();
                    var min=date.getMinutes();
                    var sec=date.getSeconds();

                    if(h.toString().length==1){
                      h="0"+h;
                    }
                    if(min.toString().length==1){
                      min="0"+min;
                    }
                    if(sec.toString().length==1){
                      sec="0"+sec;
                    }

                    var time=d+"/"+m+" "+h+":"+min+":"+sec;
                    var action=actionName.charAt(0).toUpperCase()+actionName.substring(1).toLowerCase();

                    var eventLogger={deviceID:deviceID,location:location,time:time,action:action,operationMode:"Device_Operation",executor:userName};
                    addEventLogger(eventLogger).then(function (result) {
                      console.log(result);

                    });

                  };

                  $scope.touchSpinChange=function (touchSpinState,deviceID,location) {

                    var date=new Date();
                    var y=date.getYear();
                    var m=date.getMonth();
                    var d=date.getDate();

                    var h=date.getHours();
                    var min=date.getMinutes();
                    var sec=date.getSeconds();

                    if(h.toString().length==1){
                      h="0"+h;
                    }
                    if(min.toString().length==1){
                      min="0"+min;
                    }
                    if(sec.toString().length==1){
                      sec="0"+sec;
                    }

                    var time=d+"/"+m+" "+h+":"+min+":"+sec;

                    var actionName="Set temperature";
                    if(language==='de'){
                      actionName="Temperatur einstellen";
                    }else if(language==='ch'){
                      actionName="设置温度";
                    }
                    var action=actionName+": "+touchSpinState+"°C";
                    $window.localStorage.setItem('stage-storage-temp-air-conditioner', touchSpinState);
                    /*UpdateAirConditionerTemp(touchSpinState).then(function (result) {
                      console.log(result);

                    });*/
                    var eventLogger={deviceID:deviceID,location:location,time:time,action:action,operationMode:"Device_Operation",executor:userName};
                    addEventLogger(eventLogger).then(function (result) {
                      console.log(result);

                    });


                  };


                  $scope.switchChange=function (switchState, action,deviceID,location) {

                    // console.log("location is "+location);

                    var date=new Date();
                    var y=date.getYear();
                    var m=date.getMonth();
                    var d=date.getDate();

                    var h=date.getHours();
                    var min=date.getMinutes();
                    var sec=date.getSeconds();

                    if(h.toString().length==1){
                      h="0"+h;
                    }
                    if(min.toString().length==1){
                      min="0"+min;
                    }
                    if(sec.toString().length==1){
                      sec="0"+sec;
                    }

                    var time=d+"/"+m+" "+h+":"+min+":"+sec;
                    //var lightStates=JSON.parse(window.localStorage['stage-storage-light-states']);
                    var imgSrc='url(assets/images/energy-flows/Light_off.png)';
                    var actionName="";
                    if(switchState){
                      if(language=='en'){
                        switchState='ON';
                        actionName="Turn "+switchState.toLowerCase();
                      }else if(language=='de'){
                        switchState='ein';
                        actionName="einschalten";
                      }else{
                        switchState='开启';
                        actionName="Turn on";
                      }

                      imgSrc='url(assets/images/energy-flows/Light_on.png)';
                      for(var i in lightStates) {
                        var lightID = Object.keys(lightStates[i])[0];
                        if (lightID === deviceID) {
                          lightStates[i][lightID]='on';
                        }
                      }
                    }else{

                      if(language=='en'){
                        switchState='OFF';
                        actionName="Turn "+switchState.toLowerCase();
                      }else if(language=='de'){
                        switchState='aus';
                        actionName="ausschalten";
                      }else{
                        switchState='关闭';
                        actionName="Turn off";
                      }
                      for(var i in lightStates) {
                        var lightID = Object.keys(lightStates[i])[0];
                        if (lightID === deviceID) {
                          lightStates[i][lightID]='off';
                        }
                      }
                    }
                    document.getElementById("divImage").style.backgroundImage=imgSrc;

                    $window.localStorage.setItem('stage-storage-light-states', angular.toJson(lightStates));

                    /*for(var i in action.commandList){
                      var widgetState=action.commandList[i].widgetState;
                      if(widgetState==switchState){
                        var commandString=action.commandList[i].commandString;
                        var command=commandString.split(" ")[0];
                        var param=commandString.split(" ")[1];
                        wampSession.call(command,[param]).then(
                          // RPC success callback
                          function (result) {
                            console.log(result);
                          }

                        );
                      }
                    }*/

                   // var action="Turn "+switchState.toLowerCase();
                    var eventLogger={deviceID:deviceID,location:location,time:time,action:actionName,operationMode:"Device_Operation",executor:userName};
                    addEventLogger(eventLogger).then(function (result) {
                      console.log(result);

                    });

                  };

                  function UpdateBlindInitVal(blindName,initVal) {
                    return http.put('http://localhost:8087/bos/api/dummyDevices/blinds/'+blindName+"/"+initVal).then(handleSuccess, handleError('Error updating blind initVal'));
                  }
                  function addEventLogger(eventLogger){
                    return http.post('http://localhost:8087/bos/api/eventLogger/',eventLogger).then(handleSuccess, handleError('Error adding eventLogger'));
                  }
                  function UpdateAirConditionerTemp(value) {
                    return http.put('http://localhost:8087/bos/api/airConditionerTemp/'+value).then(handleSuccess, handleError('Error updating air conditioner temp'));
                  }
                  function GetAirConditionerTemp() {
                    return http.get('http://localhost:8087/bos/api/airConditionerTemp').then(handleSuccess, handleError('Error getting air conditioner temp'));
                  }
                  function handleSuccess(res) {
                    return res.data;
                  }
                  function handleError(error) {
                    return function () {
                      return { success: false, message: error };
                    };
                  }


                  /* $scope.saveConfiguration=function() {

                   var stageJson=JSON.parse(window.localStorage['stage-storage-'+vm.selectedTabTitle]);
                   stageJson.deviceImages[$scope.currentImgName].deviceName=$scope.deviceName;
                   stageJson.deviceImages[$scope.currentImgName].isConfigured=true;
                   window.localStorage.setItem('stage-storage-'+vm.selectedTabTitle, JSON.stringify(stageJson));
                   changeKineticImgAttr($scope.currentImgName,'isConfigured',true,vm.selectedTabTitle);
                   changeKineticImgAttr($scope.currentImgName,'deviceName',$scope.deviceName,vm.selectedTabTitle);
                   $scope.close();
                   }*/
                };

                function createDeviceDetailsTemplate(deviceInfo,defaultData){
                  var templateHead='<link rel="stylesheet" type="text/css" href="app/main/apps/dweller/energy-flows/energy-flows.scss" />'+
                    '<md-dialog id="dialog" aria-label="Mango (Fruit)" style="width: 40%; height: 53%">'+
                    '<form>'+
                    '<md-toolbar class="md-accent-bg">'+
                    '<div class="md-accent-bg md-toolbar-tools">'+
                    '<div class="md-table-thumbs" style="float: left;" >'+
                    '<div id="divImage" style="background-image:url('+deviceInfo.href+');"></div>'+
                    // '<img src='+deviceInfo.href+' width="50" height="50" class="md-avatar"/>'+
                    '</div>'+
                    '<h2>&nbsp;&nbsp;{{deviceInfo.name}}</h2>'+
                    '<span flex></span>'+
                    '<md-button class="md-icon-button" ng-click="close()">'+
                    '<md-icon md-svg-src="assets/images/svg/ic_close_24px.svg" aria-label="Close dialog"></md-icon>'+
                    '</md-button>'+
                    '</div>'+
                    '</md-toolbar>'+
                    '<md-dialog-content>'+
                    '<table width="100%" style="font-family:sans-serif"><tr>';

                  var templateContent='';

                /*  console.log("deviceInfo");
                  console.log(deviceInfo);*/


                  if(deviceInfo.id=='Air Conditioner'){

                    var templateState='<td width="100%" valign="top"><table width="100%">'+createDeviceGeneralInfoTemplate(deviceInfo)+createDeviceChannelInfoTemplate(deviceInfo)+createDeviceControllerTemplate(deviceInfo)+'</table></td>';
                    templateContent=templateState;

                  }else{
                    var templateState='<td width="50%" valign="top"><table width="100%">'+createDeviceGeneralInfoTemplate(deviceInfo)+createDeviceChannelInfoTemplate(deviceInfo)+createDeviceControllerTemplate(deviceInfo)+'</table></td>';
                    var templateDoF='<td width="50%" valign="top"><table width="100%">'+createDoFInfoTemplate(deviceInfo,defaultData)+'</table></td>';
                    templateContent=templateState+templateDoF;
                  }


                  var templateTail=
                    '</tr></table>'+
                    '</md-dialog-content>'+
                    '</form>'+
                    '</md-dialog>';

                  return templateHead+templateContent+templateTail;

                }


                /* Adding a foreign object instead of a text object, allows for text wrapping */
                g.append("foreignObject")
                    .call(rect)
                    /* open new window based on the json's URL value for leaf nodes */
                    /* Firefox displays this on top */
                    .on("click", function(d) {
                      if(!d.children){
                       // window.open(d.url);
                      }
                    })
                    .attr("class","foreignobj");

                group.append("foreignObject")//add it to all the node
                  .call(rect)
                  .attr("class", "foreignobj")
                  .append("xhtml:div")
//                  .html(function(d) { return d.name; })    //device name on the tile
                  .style("font-size",function(d){
                    var height=y(d.y + d.dy) - y(d.y);
                    var width=(x(d.x + d.dx) - x(d.x));
                   /*
                    var svgWidth=2*width/3;
                    var svgHeight =(1/0.618)*svgWidth;
                    if(svgHeight>3*height/4){
                      svgHeight=2*parseInt(height)/3;
                    }

                    var fontSize= svgHeight/5;*/
                    var fontSize= topMargin*0.4;
                    if(fontSize>13){
                      fontSize=13;
                    }
                    if(fontSize<5){
                      fontSize=5;
                    }

                    return fontSize +"px";
                  })
                  .style("font-family","sans-serif")
                  .style("text-align","left")
                  .attr("class", "textdiv") ;

                /* create transition function for transitions */
                function transition(d) {
                  if (transitioning || !d) return;
                  transitioning = true;

                  var g2 = display(d),
                      t1 = g1.transition().duration(750),
                      t2 = g2.transition().duration(750);

// Update the domain only after entering new elements.
                  x.domain([d.x, d.x + d.dx]);
                  y.domain([d.y, d.y + d.dy]);

// Enable anti-aliasing during the transition.
                  svg.style("shape-rendering", null);

// Draw child nodes on top of parent nodes.
                  svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

// Fade-in entering text.
                  g2.selectAll("text").style("fill-opacity", 0);
                  g2.selectAll("foreignObject div").style("display", "none"); /*added*/


// Transition to the new view.
                  t1.selectAll("text").call(text).style("fill-opacity", 0);
                  t2.selectAll("text").call(text).style("fill-opacity", 1);
                  t1.selectAll("rect").call(rect);
                  t2.selectAll("rect").call(rect);

                  t1.selectAll("image").call(image);
                  t2.selectAll("image").call(image);

                  t1.selectAll(".textdiv").style("display", "block"); /* added */
                  t1.selectAll(".textdiv").style("text-align", "left"); /* added */
                  t1.selectAll(".foreignobj").call(foreign); /* added */
                  t2.selectAll(".textdiv").style("display", "block"); /* added */
                  t2.selectAll(".textdiv").style("text-align", "left"); /* added */
                  t2.selectAll(".foreignobj").call(foreign); /* added */

// Remove the old node when the transition is finished.
                  t1.remove().each("end", function() {
                    svg.style("shape-rendering", "crispEdges");
                    transitioning = false;
                  });

                }//endfunc transition

                return g;
              }//endfunc display

              function text(text) {
                text.attr("x", function(d) { return x(d.x) + 6; })
                    .attr("y", function(d) { return y(d.y) + 6; });
              }

              function rect(rect) {
                rect.attr("x", function(d) { return x(d.x)+1; })
                    .attr("y", function(d) { return y(d.y)+1; })
                    .attr("width", function(d) { return x(d.x + d.dx) - x(d.x)-2; })
                    .attr("height", function(d) { return y(d.y + d.dy) - y(d.y)-2; });
              }

              function foreign(foreign){ /* added */
                foreign.attr("x", function(d) { return x(d.x); })
                    .attr("y", function(d) { return y(d.y); })
                    .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
                    .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
              }
              function image(image) {
                //  console.log(image);
                var flag=false;
                var height=0;
                var width=0;
                image
                    .attr("width", function (d) {
                      if(d.href==""){

                        return 0;
                      }
                      var newImg = new Image();
                      newImg.src = d.href;

                      var imgWidth = newImg.width;
                      var imgHeight = newImg.height;
                      var ratio=imgHeight/imgWidth;
                      var imgHeight2=ratio*(1*(x(d.x + d.dx) - x(d.x))/2);

                      if(imgHeight2>y(d.y + d.dy) - y(d.y)){

                        width=(y(d.y + d.dy) - y(d.y))*(imgWidth/imgHeight);
                        flag=true;
                      }
                      else{
                          width=0.4*(x(d.x + d.dx) - x(d.x));
                        //  return (x(d.x + d.dx) - x(d.x))/2;
                      }
                      return width;
                    })
                    .attr("x", function (d) {

                      if(d.href==""){

                        return 0;
                      }
                      var newImg = new Image();
                      newImg.src = d.href;

                      var imgWidth = newImg.width;
                      var imgHeight = newImg.height;
                      var ratio=imgHeight/imgWidth;
                      var imgHeight2=ratio*(1*(x(d.x + d.dx) - x(d.x))/2);

                      if(imgHeight2>y(d.y + d.dy) - y(d.y)){

                        width=(y(d.y + d.dy) - y(d.y))*(imgWidth/imgHeight);
                        flag=true;
                      }
                      else{
                        width=0.4*(x(d.x + d.dx) - x(d.x));
                      }
                      return x(d.x) - (width/2) +(x(d.x + d.dx) - x(d.x))/2 ;
                    })
                    .attr("height", function (d) {
                      if(d.href==""){
                        return 0;
                      }
                      var newImg = new Image();
                      newImg.src = d.href;
                      var imgWidth = parseFloat(newImg.width);
                      var imgHeight =parseFloat(newImg.height) ;
                      var ratio=(imgWidth/imgHeight).toFixed(2);
                      var imgWidth2=ratio*(y(d.y + d.dy) - y(d.y));

                      if(imgWidth2>(x(d.x + d.dx) - x(d.x))/2){
                        height=((x(d.x + d.dx) - x(d.x))/2)*(imgHeight/imgWidth);
                        return height;
                      }
                      else{

                        // height=y(d.y + d.dy) - y(d.y);
                        height=2*(y(d.y + d.dy) - y(d.y))/3;

                        if(flag==true){
                          //  height=((x(d.x + d.dx) - x(d.x))/2)*(imgHeight/imgWidth);
                          flag=false;
                        }
                        return height;
                      }

                    })
                    .attr("y", function (d) {
                      if(d.href==""){
                        return 0;
                      }

                      var newImg = new Image();
                      newImg.src = d.href;
                      var imgWidth = parseFloat(newImg.width);
                      var imgHeight =parseFloat(newImg.height) ;
                      var ratio=(imgWidth/imgHeight).toFixed(2);
                      var imgWidth2=ratio*(y(d.y + d.dy) - y(d.y));

                      if(imgWidth2>(x(d.x + d.dx) - x(d.x))/2){
                        height=((x(d.x + d.dx) - x(d.x))/2)*(imgHeight/imgWidth);

                      }
                      else{

                        //  height=y(d.y + d.dy) - y(d.y);
                        height=2*(y(d.y + d.dy) - y(d.y))/3;

                        if(flag==true){
                          //  height=((x(d.x + d.dx) - x(d.x))/2)*(imgHeight/imgWidth);
                          flag=false;
                        }

                      }

                      return y(d.y)+((y(d.y + d.dy) - y(d.y))-height)/2;
                    });


              }

              function name(d) {
                return d.parent
                    ? name(d.parent) + "." + d.name
                    : d.name;
              }

            }

            // Observe the element's dimensions.
            scope.$watch
            (
              function () {
                return {
                  wpc: $('#'+attrs.parentContainerId).width(),
                  hpc: $('#'+attrs.parentContainerId).height()
                };
              },
              function (newValue, oldValue) {
                if (Math.abs(newValue.wpc - oldValue.wpc) >1 || Math.abs(newValue.hpc - oldValue.hpc)>1) {

                  d3.select("#"+attrs.containerId).select("svg").remove();
                  treeMap();
                }
              },
              true
            );

          });
        }
      }
    }])

})();




