/**
 * Created by pg9501 on 21.06.2016.
 */

(function ()
{
  'use strict';

    angular
      .module('app.dweller.energy-flows')
      .directive('treeMapDiagram',['$window','$mdDialog','d3Service',function($window,mdDialog,d3Service){
        return {
           restrict: 'EA',
            scope: {
              data: "@"
    },
    link: function(scope, ele, attrs) {
      d3Service.d3().then(function(d3) {

        //Browser onresize event
        $window.onresize=function(){
          scope.$apply();
        };
        //watch for resize event
        scope.$watch(function(){
          return angular.element($window)[0].innerWidth;
        },function(){
          //remove all previous items fefore render
          d3.select("#"+attrs.containerId).select("svg").remove();
          ZoomableTreeMap();
        });

     //   ZoomableTreeMap();

        function isNumber(num) {
          return (typeof num == 'string' || typeof num == 'number') && !isNaN(num - 0) && num !== '';
        };
        function getPowerTreeMapSize(energyArray){

          var totalValue=0;
          angular.forEach( energyArray.children,function(item){

            if(typeof item.children != 'undefined'){
              var children=item.children;
              angular.forEach(item.children,function(item2){
                if(isNumber(item2.value)){
                  totalValue =totalValue + item2.value;
                }
              })

            }else {
              if(isNumber(item.value)){
                totalValue = totalValue + item.value;
              }
            }

          });
          return totalValue;
        }

        function ZoomableTreeMap(){
          var containerID=attrs.containerId,
            parentContainerID=attrs.parentContainerId,
            jsonUrl=attrs.jsonUrl;

          var  dataArray=attrs.data;
          /* console.log(" containerID is:"+ containerID);
           console.log(dataArray);*/

          var $container = $('#'+containerID),
            $parentContainer = $('#'+parentContainerID),
            width = $parentContainer.width(),
            height=$parentContainer.height(),
            margin = {top: 20, right: 0, bottom: 0, left: 0},
            color = d3.scale.category20(),
            formatNumber = d3.format(",d"),
            transitioning;

          /* create x and y scales */
          var x = d3.scale.linear()
            .domain([0, width])
            .range([0, width]);

          var y = d3.scale.linear()
            .domain([0, height-margin.top])
            .range([0, height-margin.top]);

          var treemap = d3.layout.treemap()
            .children(function (d, depth) {
              return depth ? null : d.children;
            })
            .sort(function (a, b) {
              return a.value - b.value;
            })
            .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))

            .round(false);


          /* create svg */
          var svg = d3.select("#" + containerID).append("svg:svg")
            .attr("id","svg_"+containerID)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.bottom + margin.top-margin.top)
            .style("margin-left", -margin.left + "px")
            .style("margin.right", -margin.right + "px")
            .append("g")

            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .style("shape-rendering", "crispEdges")

          // .style('width','100%')
            ;

          /*  var svg = d3.select("#"+containerID)
           .append("svg:svg")
           .attr("width", width)
           .attr("height", height)
           .append("g")
           .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
           .style("shape-rendering", "crispEdges");*/

          var grandparent = svg.append("g")
            .attr("class", "grandparent");

          grandparent.append("rect")
            .attr("y", -margin.top )
            .attr("width", width)
            .attr("height", margin.top);

          grandparent.append("text")
            .attr("x", width / 2)
            .attr("y", 6 - margin.top)
            .attr("dy", ".75em")
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


          var div = d3.select("#body").append("div")
            .style("position", "relative")
            ;


        //  console.log(dataArray);


          var root=JSON.parse(dataArray);
          console.log(root);

          initialize(root);
          accumulate(root);
          layout(root);
          display(root);

          function initialize(root) {
            root.x = root.y = 0;
            root.dx = width;
            root.dy = height-margin.top;
            root.depth = 0;
          }

// Aggregate the values for internal nodes. This is normally done by the
// treemap layout, but not here because of our custom implementation.
          function accumulate(d) {
            return d.children
              ? d.value = d.children.reduce(function (p, v) {
              return p + accumulate(v);
            }, 0)
              : d.value;
          }

// Compute the treemap layout recursively such that each group of siblings
// uses the same size (1�1) rather than the dimensions of the parent cell.
// This optimizes the layout for the current zoom state. Note that a wrapper
// object is created for the parent node for each group of siblings so that
// the parent�s dimensions are not discarded as we recurse. Since each group
// of sibling was laid out in 1�1, we must rescale to fit using absolute
// coordinates. This lets us use a viewport to zoom.
          function layout(d) {

            if (d.children) {
             // console.log(d.children);
              treemap.nodes({children: d.children});
              d.children.forEach(function (c) {
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
              .text(name(d))
              .style("font-family","sans-serif")
              .style("font-size",function(){
                /*var refWidth=$('#powerConPriceIndicator').width();
                 return refWidth*0.1+"px";*/
                var fontSize=width*0.05;
                if(fontSize>15){
                  fontSize=15;
                }
                return fontSize+"px";
              });


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
                  .attr("filter", "url(#outerDropShadow)")
                  .selectAll(".background")
                  .style("stroke", "#000000");
              })
              .on("mousemove", function (d) {

                var s_Top = document.documentElement.scrollTop || document.body.scrollTop; //???????
                var s_Left = document.documentElement.scrollLeft || document.body.scrollLeft; //???????


                /*$("#div_Show").html(set_Text).css({ "z-index": "2147483647", "width": set_Width + "px" }).prependTo("body");
                 js_Show.html(set_Text);*/
                var o = document.getElementById('div_Show');
                /*  if (o == null) {
                 $("<div id=\"div_Show\"></div>").html(set_Text).css({
                 "z-index": "2147483647",
                 "width": set_Width + "px"
                 }).prependTo("body");
                 }*/

                /*  if (o == null) {
                 $("<div id=\"div_Show\"></div>").html("<img src='"+ d.href+"' width=50 height=50/>").css({
                 "z-index": "2147483647",
                 "width": div_Width + "px"
                 }).prependTo("body");
                 }*/

                var bgColor;
                /*  if(d.type=="pCon"){
                 bgColor= '#dadaeb';
                 }
                 if(d.type=="pGen"){
                 bgColor= '#c7e9c0';
                 }
                 if(d.type=="hDevice"){
                 // return '#fdd0a2';
                 bgColor= '#F6E3CE';
                 }
                 if(d.type=="cDevice"){
                 bgColor= '#c6dbef';
                 }
                 if(d.type=="pConGroup"){
                 bgColor= '#bcbddc';
                 }*/
                bgColor='#F2F2F2';
                var value="";
                if(d.type=="pGen" || d.type=="pGenGroup"){
                  value= d.value+" W";
                }
                else if(d.type=="pCon" || d.type=="pConGroup"){
                  value= "-"+ d.value+" W";
                }
                else if(d.type=="hDevice" || d.type=="cDevice"){
                  value= d.value+" &deg;C";
                }


                if (o == null) {

                  var name;
                  if(typeof d.state != "undefined") {
                    name=d.id+"&nbsp;&nbsp;<br />"+d.state+"%"+"&nbsp;&nbsp";
                  }else{
                    name=d.id+"&nbsp;&nbsp;";
                  }
                  var id= d.id.replace(/ /g, '')+"new";

                  if(d.href==""){
                    $("<div id=\"div_Show\" style='background-color:"+ bgColor+" ;'></div>").html("<svg id="+ id+" width='50' height='70'/>" +
                      "<p style='float:right; font-size: small' >"+ name+"</p>"+"<hr color='grey' width='95%' style='margin-top: -5px' size='1'/>"+
                      "<p style='float:right; margin: 0; font-size: small'>"+ value+"&nbsp;&nbsp;</p>"

                    ).css({
                      "z-index": "2147483647",
                      // "width": div_Width + "px"
                      "font-family":"sans-serif"
                    }).prependTo("body");

                    if(d.type=="cDevice"){
                      var config1 = liquidFillGaugeDefaultSettings();
                      config1.circleColor = "#178BCA";
                      //  config1.textColor = "#F0F8FF";
                      config1.waveTextColor = "white";
                      config1.waveColor = "#178BCA";
                      config1.circleThickness = 0.05;
                      config1.textVertPosition = 0.2;
                      config1.waveAnimateTime = 5000;
                      //console.log("rrrrrrrrrrrrrrrrr");
                      loadLiquidFillGauge(id, 70,d.value, config1);
                    } else if(d.type=="hDevice"){
                      var config1 = liquidFillGaugeDefaultSettings();
                      config1.circleColor = "#E6B85C";
                      //  config1.textColor = "#F0F8FF";
                      config1.waveTextColor = "white";
                      config1.waveColor = "#E6B85C";
                      config1.circleThickness = 0.05;
                      config1.textVertPosition = 0.2;
                      config1.waveAnimateTime = 5000;
                      loadLiquidFillGauge(id, 70,d.value, config1);
                    }else if(d.name=="Battery"){

                      var config1 = liquidFillGaugeDefaultSettings();
                      // config1.circleColor = "#4DB84D";
                      config1.circleColor = "#474719";
                      config1.waveTextColor = "white";
                      //config1.waveColor = "#4DB84D";
                      //   config1.waveColor = "#4DB84D";
                      config1.circleThickness = 0.05;
                      config1.textVertPosition = 0.2;
                      config1. waveAnimate=false;
                      config1.batteryType=true;
                      if(d.state>=75){
                        config1.waveColor = "#4DB84D";
                      }else if(d.state<25){
                        config1.waveColor = "#FF8566";
                      }else{
                        config1.waveColor = "#E6B800";
                      }
                      loadLiquidFillGauge(id, d.state, d.state, config1);
                    }

                  }else{
                    $("<div id=\"div_Show\" style='background-color:"+ bgColor+" ;'></div>").html("<img src="+ d.href+" width='50' height='50'/>" +
                      "<p style='float:right; font-size: small' >"+ name+"</p>"+"<hr color='grey' width='95%' size='1'/>"+
                      "<p style='float:right; margin: 0; font-size: small'>"+ value+"&nbsp;&nbsp;</p>"

                    ).css({
                      "z-index": "2147483647"
                      // "width": div_Width + "px"
                    }).prependTo("body");

                  }

                };

                var e = d3.event;

                $("#div_Show").css({
                  "width": "auto",
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

                /*  tooltip.transition()
                 .duration(500)
                 .style("opacity", 0);
                 tooltip.style("visibility", "hidden");*/
              });


            /* transition on child click */
            g.filter(function (d) {
                return d.children;
              })
              .classed("children", true)
              .on("click", transition);


            var group = g.selectAll(".child")
              .data(function (d) {
                return d.children || [d];
              })
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
                  if(d.type=="hDevice"){
                    return '#fdd0a2';
                  }
                  if(d.type=="cDevice"){
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
                  if(d.type=="hDevice"){
                    // return '#fdd0a2';
                    return '#F6E3CE';
                  }
                  if(d.type=="cDevice"){
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
              .on("mouseover", function() {
                // d3.select(this).classed('hover', true);

              })
              /* open new window based on the json's URL value for leaf nodes */
              /* Chrome displays this on top */
              .on("click", function(d) {
                if(!d.children){
                  //window.open(d.url);
                  var tmpUrl="dialog1.html";
                  scope.content=[];
                  if(d.device=="Photovoltaic" || d.parent.device =="Photovoltaic"){
                    tmpUrl="photovoltaic.html";
                    scope.content =[

                      {
                        generatedPower: d.value,
                        consumedPower: d.consumedPower,
                        consumedPowerPer: Math.round(d.consumedPower/d.value * 100)+"%",
                        batteryChargedPower: d.batteryChargedPower,
                        batteryChargedPowerPer: Math.round(d.batteryChargedPower/d.value * 100)+"%",
                        feedInPower: (d.value- d.consumedPower-d.batteryChargedPower),
                        feedInPowerPer:  Math.round((d.value- d.consumedPower-d.batteryChargedPower)/d.value * 100) +"%"
                      },
                      {
                        yieldToday: d.yield.today,
                        yieldYesterday: d.yield.yesterday,
                        yieldTwoDaysBefore: d.yield.twoDaysBefore,
                        yieldThreeDaysBefore: d.yield.threeDaysBefore,
                        yieldThisWeek: d.yield.thisWeek

                      },
                    ];
                  };

                  mdDialog.show({
                      controller: DialogController,
                      // scope: scope.$new(),
                      locals:{content: scope.content, pvDataSet: scope.$parent.pvDataSet},
                      clickOutsideToClose: true,
                      templateUrl: 'template/'+tmpUrl,
                      parent: angular.element(document.body),
                      targetEvent: $window.event
                    })
                    .then(function(answer) {
                      scope.alert = 'You said the information was "' + answer + '".';
                    }, function() {
                      scope.alert = 'You cancelled the dialog.';
                    });
                }
              });
            /* .append("title")
             .text(function(d) { return formatNumber(d.value); });*/

            g.append("foreignObject")//add it to all the node
              .call(rect)
              .on("click", function (d) {

                if (!d.children) {

                  //  window.open(d.url);

                  var tmpUrl="dialog1.html";
                  scope.content=[];
                  if(d.device=="Photovoltaic" || d.parent.device =="Photovoltaic"){
                    tmpUrl="photovoltaic.html";

                    scope.content =[

                      {
                        generatedPower: d.value,
                        consumedPower: d.consumedPower,
                        consumedPowerPer: Math.round(d.consumedPower/d.value * 100)+"%",
                        batteryChargedPower: d.batteryChargedPower,
                        batteryChargedPowerPer: Math.round(d.batteryChargedPower/d.value * 100)+"%",
                        feedInPower: (d.value- d.consumedPower-d.batteryChargedPower),
                        feedInPowerPer:  Math.round((d.value- d.consumedPower-d.batteryChargedPower)/d.value * 100) +"%"
                      },
                      {
                        yieldToday: d.yield.today,
                        yieldYesterday: d.yield.yesterday,
                        yieldTwoDaysBefore: d.yield.twoDaysBefore,
                        yieldThreeDaysBefore: d.yield.threeDaysBefore,
                        yieldThisWeek: d.yield.thisWeek

                      },
                    ];
                  }
                  mdDialog.show({
                      controller: DialogController,
                      // scope: scope.$new(),
                      locals:{content: scope.content, pvDataSet: scope.$parent.pvDataSet},
                      clickOutsideToClose: true,
                      templateUrl: 'template/'+tmpUrl,
                      parent: angular.element(document.body),
                      targetEvent: $window.event
                    })
                    .then(function(answer) {
                      // scope.alert = 'You said the information was "' + answer + '".';
                    }, function() {
                      //  scope.alert = 'You cancelled the dialog.';
                    });
                }
              })
              .attr("class", "foreignobj2");

            function DialogController($scope,  $mdDialog, content,pvDataSet) {
              $scope.content=content;
              $scope.pvDataSet=pvDataSet;
              $scope.close = function() {
                $mdDialog.hide();
              };
            };


            var myDiv=group.append("foreignObject")//add it to all the node
              .call(rect3)
              .attr("class", "foreignobj")

              .append("xhtml:div")

              .html(function (d) {
                if(d.type=="pGen" || d.type=="pGenGroup"){
                  /* if(typeof d.state !== "undefined"){
                   return  d.id+"<br />"+ d.state+"%"+"<br /><strong>"+ d.value+" W" ;
                   }*/
                  if(d.name=="EV"){
                    return  d.id+"<br />"+ d.state+"%"+"<br /><strong>"+ d.value+" W" ;
                  }
                  return d.id+"<br /><strong>"+ d.value+" W";
                }
                if(d.type=="pCon" || d.type=="pConGroup"){
                  /* if(typeof d.state !== "undefined"){
                   return  d.id+"<br />"+ d.state+"%"+"<br /><strong>"+"-"+ d.value+" W" ;
                   }*/
                  if(d.name=="EV"){
                    return  d.id+"<br />"+ d.state+"%"+"<br /><strong>"+"-"+ d.value+" W" ;
                  }
                  return  d.id+"<br /><strong>"+"-"+ d.value+" W";
                }
                if(d.type=="hDevice" || d.type=="cDevice"){
                  return d.id+"<br /><strong>"+ d.value+" &deg;C";
                }
                return d.id;

              })
              .style("font-size",function(d){
                var height;
                if(d.href!=""){

                  var newImg = new Image();
                  newImg.src = d.href;
                  var imgWidth = newImg.width;
                  var imgHeight = newImg.height;
                  var ratio=imgWidth/imgHeight;
                  var imgWidth2=ratio*(y(d.y + d.dy) - y(d.y));
                  if(imgWidth2>(x(d.x + d.dx) - x(d.x))/2){
                    height=((x(d.x + d.dx) - x(d.x))/2)*(imgHeight/imgWidth);
                  }
                  else{

                    height=y(d.y + d.dy) - y(d.y);

                  }
                  var fontSize=height/6;
                  if(fontSize>13){
                    fontSize=13;
                  }
                  if(fontSize<5){
                    fontSize=5;
                  }

                }else{
                  height=y(d.y + d.dy) - y(d.y);
                  var width=(x(d.x + d.dx) - x(d.x))/2;
                  var svgWidth=2*width/3;
                  var svgHeight =(1/0.618)*svgWidth;
                  if(svgHeight>3*height/4){
                    svgHeight=2*parseInt(height)/3;
                  }

                  var fontSize= svgHeight/5;
                  if(fontSize>13){
                    fontSize=13;
                  }
                  if(fontSize<5){
                    fontSize=5;
                  }
                }
                return fontSize +"px";
              })
              .style("font-family","sans-serif")
              .attr("class", "textdiv") ;


            group.append("svg")
              .attr("id",function(d){
                if(d.href==""){
                  //return "coldGauge";
                  return d.id.replace(/ /g, '');
                }
                return "";
              })
              .attr("x", function (d) {
                return x(d.x);
              })
              .attr("y", function (d) {
                return y(d.y);
              })
              .attr("width", function (d) {

                return (x(d.x + d.dx) - x(d.x))/2;
              })
              .attr("height", function (d) {
                return y(d.y + d.dy) - y(d.y);
              })
              .attr("x", function (d) {
                var  id= d.id.replace(/ /g, '');

                if(d.type=="cDevice"){
                  var config1 = liquidFillGaugeDefaultSettings();
                  config1.circleColor = "#178BCA";
                  //  config1.textColor = "#F0F8FF";
                  config1.waveTextColor = "white";
                  config1.waveColor = "#178BCA";
                  config1.circleThickness = 0.05;
                  config1.textVertPosition = 0.2;
                  config1.waveAnimateTime = 5000;
                  //console.log("asssssssssssssss");
                  loadLiquidFillGauge(id, 10, d.value, config1);
                } else if(d.type=="hDevice"){
                  var config1 = liquidFillGaugeDefaultSettings();
                  config1.circleColor = "#E6B85C";
                  config1.waveTextColor = "white";
                  config1.waveColor = "#E6B85C";
                  config1.circleThickness = 0.05;
                  config1.textVertPosition = 0.2;
                  config1.waveAnimateTime = 5000;
                  loadLiquidFillGauge(id, 80, d.value, config1);
                }else if(d.name=="Battery"){

                  var config1 = liquidFillGaugeDefaultSettings();
                  // config1.circleColor = "#4DB84D";
                  config1.circleColor = "#474719";
                  config1.waveTextColor = "white";
                  //config1.waveColor = "#4DB84D";
                  //   config1.waveColor = "#4DB84D";
                  config1.circleThickness = 0.05;
                  config1.textVertPosition = 0.2;
                  config1. waveAnimate=false;
                  config1.batteryType=true;
                  if(d.state>=75){
                    config1.waveColor = "#4DB84D";
                  }else if(d.state<25){
                    config1.waveColor = "#FF8566";
                  }else{
                    config1.waveColor = "#E6B800";
                  }
                  loadLiquidFillGauge(id, d.state, d.state, config1);
                }
                return x(d.x);
              });


            /* create transition function for transitions */
            function transition(d) {
              if (transitioning || !d) return;
              transitioning = true;

              var g2 = display(d),
                t1 = g1.transition().duration(100),//700
                t2 = g2.transition().duration(100);//700

              // Update the domain only after entering new elements.
              x.domain([d.x, d.x + d.dx]);
              y.domain([d.y, d.y + d.dy]);

              // Enable anti-aliasing during the transition.
              svg.style("shape-rendering", null);

              // Draw child nodes on top of parent nodes.
              svg.selectAll(".depth").sort(function (a, b) {
                return a.depth - b.depth;
              });

              // Fade-in entering text.
              g2.selectAll("text").style("fill-opacity", 0);
              g2.selectAll("foreignObject div").style("display", "none");
              g2.selectAll("foreignObject div").call(foDiv);
              /*added*/

              // Transition to the new view.
              t1.selectAll("text").call(text).style("fill-opacity", 0);
              t2.selectAll("text").call(text).style("fill-opacity", 1);
              t1.selectAll("rect").call(rect);
              t2.selectAll("rect").call(rect);

              t1.selectAll("image").call(image);
              t2.selectAll("image").call(image);

              g2.selectAll("svg").call(innerSvg);
              t1.selectAll("svg").call(innerSvg).each("end",function(d){

                var  id= d.id.replace(/ /g, '');

                if(d.type=="cDevice"){
                  var config1 = liquidFillGaugeDefaultSettings();
                  config1.circleColor = "#178BCA";
                  //  config1.textColor = "#F0F8FF";
                  config1.waveTextColor = "white";
                  config1.waveColor = "#178BCA";
                  config1.circleThickness = 0.05;
                  config1.textVertPosition = 0.02;
                  config1.waveAnimateTime = 5000;
                 // console.log("kkkkkkkkkkkkkkkk");
                  loadLiquidFillGauge(id, 80, d.value, config1);
                } else if(d.type=="hDevice"){
                  var config1 = liquidFillGaugeDefaultSettings();
                  config1.circleColor = "#E6B85C";
                  config1.waveTextColor = "white";
                  config1.waveColor = "#E6B85C";
                  config1.circleThickness = 0.05;
                  config1.textVertPosition = 0.02;
                  config1.waveAnimateTime = 5000;
                  loadLiquidFillGauge(id, 80, d.value, config1);
                }else if(d.name=="Battery"){

                  var config1 = liquidFillGaugeDefaultSettings();
                  // config1.circleColor = "#4DB84D";
                  config1.circleColor = "#474719";
                  config1.waveTextColor = "white";
                  //config1.waveColor = "#4DB84D";
                  //   config1.waveColor = "#4DB84D";
                  config1.circleThickness = 0.05;
                  config1.textVertPosition = 0.2;
                  config1. waveAnimate=false;
                  config1.batteryType=true;
                  if(d.state>=75){
                    config1.waveColor = "#4DB84D";
                  }else if(d.state<25){
                    config1.waveColor = "#FF8566";
                  }else{
                    config1.waveColor = "#E6B800";
                  }
                  console.log("just a testtttttttt");
                  loadLiquidFillGauge(id, d.state, d.state, config1);
                }
              });

              t1.selectAll(".textdiv").style("display", "none");
              /* added */
              //           t1.selectAll(".foreignobj").call(foreign);
              t1.selectAll(".foreignobj").call(rect3);
              /* added */
              t2.selectAll(".textdiv").style("display", "block");
              /* added */
              //           t2.selectAll(".foreignobj").call(foreign);
              t2.selectAll(".foreignobj").call(rect3);
              t2.selectAll(".foreignobj2").call(foreign);
              /* added */

              // Remove the old node when the transition is finished.
              t1.remove().each("end", function () {
                svg.style("shape-rendering", "crispEdges");
                transitioning = false;
              });

            }//endfunc transition

            return g;
          }//endfunc display

          function text(text) {
            text.attr("x", function (d) {
                return x(d.x) + 6;
              })
              .attr("y", function (d) {
                return y(d.y) + 6;
              })
              .style("font-family","sans-serif")
            ;
          }

          function rect(rect) {

            rect.attr("x", function (d) {
                return x(d.x);
              })
              .attr("y", function (d) {
                return y(d.y);
              })
              .attr("width", function (d) {
                return x(d.x + d.dx) - x(d.x);
              })
              .attr("height", function (d) {
                return y(d.y + d.dy) - y(d.y);
              })
            ;

          }
          function innerSvg(innerSvg) {
            innerSvg
              .attr("x", function (d) {
                return x(d.x);
              })
              .attr("y", function (d) {
                return y(d.y);
              })
              .attr("width", function (d) {
                return (x(d.x + d.dx) - x(d.x))/2;
              })
              .attr("height", function (d) {
                return y(d.y + d.dy) - y(d.y);
              })
              .attr("x", function (d) {

                var  id= d.id.replace(/ /g, '');

                if(d.type=="cDevice"){
                  var config1 = liquidFillGaugeDefaultSettings();
                  config1.circleColor = "#178BCA";
                  //  config1.textColor = "#F0F8FF";
                  config1.waveTextColor = "white";
                  config1.waveColor = "#178BCA";
                  config1.circleThickness = 0.05;
                  config1.textVertPosition = 0.02;
                  config1.waveAnimateTime = 5000;
                 // console.log("fffffffffffffffffffff");
                  loadLiquidFillGauge(id, 80, d.value, config1);
                } else if(d.type=="hDevice"){
                  var config1 = liquidFillGaugeDefaultSettings();
                  config1.circleColor = "#E6B85C";
                  config1.waveTextColor = "white";
                  config1.waveColor = "#E6B85C";
                  config1.circleThickness = 0.05;
                  config1.textVertPosition = 0.02;
                  config1.waveAnimateTime = 5000;
                  loadLiquidFillGauge(id, 80, d.value, config1);
                }else if(d.name=="Battery"){

                  var config1 = liquidFillGaugeDefaultSettings();
                  // config1.circleColor = "#4DB84D";
                  config1.circleColor = "#474719";
                  config1.waveTextColor = "white";
                  //config1.waveColor = "#4DB84D";
                  //   config1.waveColor = "#4DB84D";
                  config1.circleThickness = 0.05;
                  config1.textVertPosition = 0.2;
                  config1. waveAnimate=false;
                  config1.batteryType=true;
                  if(d.state>=75){
                    config1.waveColor = "#4DB84D";
                  }else if(d.state<25){
                    config1.waveColor = "#FF8566";
                  }else{
                    config1.waveColor = "#E6B800";
                  }
                  loadLiquidFillGauge(id, d.state, d.state, config1);
                }
                return x(d.x);
              });
          }


          function rect1(rect) {


            rect.attr("x", function (d) {
                return x(d.x);
              })
              .attr("y", function (d) {
                return y(d.y);
              })
              .attr("width", function (d) {
                //  return "auto";
                return (x(d.x + d.dx) - x(d.x))/2;
              })
              .attr("height", function (d) {
                return y(d.y + d.dy) - y(d.y);
              })
            ;

          }
          function rect2(rect) {


            rect.attr("x", function (d) {
                return x(d.x)+(x(d.x + d.dx) - x(d.x))/2;
              })
              .attr("y", function (d) {
                return y(d.y);
              })
              .attr("width", function (d) {
                return (x(d.x + d.dx) - x(d.x))/2;
              })
              .attr("height", function (d) {
                return y(d.y + d.dy) - y(d.y);
              })
            ;

          }
          function foDiv(foDiv) {

            /*   foDiv.style("font-size",function(d){

             var height;
             var newImg = new Image();
             newImg.src = d.href;
             var imgWidth = newImg.width;
             var imgHeight = newImg.height;
             var ratio=imgWidth/imgHeight;
             var imgWidth2=ratio*(y(d.y + d.dy) - y(d.y));
             if(imgWidth2>(x(d.x + d.dx) - x(d.x))/2){
             height=((x(d.x + d.dx) - x(d.x))/2)*(imgHeight/imgWidth);
             }
             else{

             height=y(d.y + d.dy) - y(d.y);

             }
             var fontSize=height/6;
             if(fontSize>20){
             fontSize=20;
             }
             if(fontSize<5){
             fontSize=5;
             }
             return fontSize +"px";

             })
             ;*/
            foDiv .style("font-size",function(d){
              var height;
              if(d.href!=""){

                var newImg = new Image();
                newImg.src = d.href;
                var imgWidth = newImg.width;
                var imgHeight = newImg.height;
                var ratio=imgWidth/imgHeight;
                var imgWidth2=ratio*(y(d.y + d.dy) - y(d.y));
                if(imgWidth2>(x(d.x + d.dx) - x(d.x))/2){
                  height=((x(d.x + d.dx) - x(d.x))/2)*(imgHeight/imgWidth);
                }
                else{

                  height=y(d.y + d.dy) - y(d.y);

                }
                var fontSize=height/6;
                if(fontSize>13){
                  fontSize=13;
                }
                if(fontSize<5){
                  fontSize=5;
                }

              }else{
                height=y(d.y + d.dy) - y(d.y);
                var width=(x(d.x + d.dx) - x(d.x))/2;
                var svgWidth=2*width/3;
                var svgHeight =(1/0.618)*svgWidth;
                if(svgHeight>3*height/4){
                  svgHeight=2*parseInt(height)/3;
                }

                var fontSize= svgHeight/5;
                if(fontSize>13){
                  fontSize=13;
                }
                if(fontSize<5){
                  fontSize=5;
                }
              }
              return fontSize +"px";
            })
          }
          function rect3(rect) {

            var widthDiff;
            var heightDiff;
            var imgDy;



            rect.attr("x", function (d) {
                if(d.href!=""){
                  var width;
                  // return x(d.x)+(x(d.x + d.dx) - x(d.x))/2;
                  var newImg = new Image();
                  newImg.src = d.href;

                  var imgWidth = newImg.width;
                  var imgHeight = newImg.height;
                  var ratio=imgHeight/imgWidth;
                  var imgHeight2=ratio*(1*(x(d.x + d.dx) - x(d.x))/2);

                  if(imgHeight2>y(d.y + d.dy) - y(d.y)){

                    width=(y(d.y + d.dy) - y(d.y))*(imgWidth/imgHeight);


                    // return width;
                    // return "auto";
                  }
                  else{
                    width=(x(d.x + d.dx) - x(d.x))/2;


                    // return x(d.x + d.dx) - x(d.x);

                    //  return (x(d.x + d.dx) - x(d.x))/2;
                  }
                  widthDiff=(x(d.x + d.dx) - x(d.x))-width;

                  var height;
                  var newImg = new Image();
                  newImg.src = d.href;
                  var imgWidth = newImg.width;
                  var imgHeight = newImg.height;
                  var ratio=imgWidth/imgHeight;
                  var imgWidth2=ratio*(y(d.y + d.dy) - y(d.y));
                  if(imgWidth2>(x(d.x + d.dx) - x(d.x))/2){
                    height=((x(d.x + d.dx) - x(d.x))/2)*(imgHeight/imgWidth);
                  }
                  else{

                    height=y(d.y + d.dy) - y(d.y);
                  }
                  heightDiff=y(d.y + d.dy) - y(d.y) -height;

                  /*if(widthDiff>heightDiff){
                   return x(d.x)+width;
                   }
                   else{
                   return x(d.x);
                   }*/

                  return x(d.x)+width;

                }else{
                  return x(d.x)+(x(d.x + d.dx) - x(d.x))/2;
                }






              })
              .attr("y", function (d) {
                if(d.href!=""){
                  var height;
                  var newImg = new Image();
                  newImg.src = d.href;
                  var imgWidth = newImg.width;
                  var imgHeight = newImg.height;
                  var ratio=imgWidth/imgHeight;
                  var imgWidth2=ratio*(y(d.y + d.dy) - y(d.y));
                  if(imgWidth2>(x(d.x + d.dx) - x(d.x))/2){
                    height=((x(d.x + d.dx) - x(d.x))/2)*(imgHeight/imgWidth);
                  }
                  else{

                    //height=y(d.y + d.dy) - y(d.y);
                    height=2*(y(d.y + d.dy) - y(d.y))/3;
                  }
                  //  return y(d.y)+((y(d.y + d.dy) - y(d.y))-height)/2;

                  /*  if(widthDiff>heightDiff){
                   if(height==y(d.y + d.dy) - y(d.y)){
                   return y(d.y);
                   }
                   return  y(d.y)+height/7;
                   // return  y(d.y)+((y(d.y + d.dy) - y(d.y))-height)/2;
                   }
                   else{
                   //  return y(d.y);
                   return y(d.y)+height;
                   }*/
                  //  return y(d.y)+height/7;
                  imgDy=((y(d.y + d.dy) - y(d.y))-height)/2;
                  /*  if(d.name=="Battery1"){
                   console.log("battery1 dy: "+imgDy);
                   }*/
                  return  y(d.y)+((y(d.y + d.dy) - y(d.y))-height)/2+5;
                }else{

                  height=y(d.y + d.dy) - y(d.y);

                  var width=(x(d.x + d.dx) - x(d.x))/2;
                  var svgWidth=2*width/3;
                  var svgHeight =(1/0.618)*svgWidth;
                  if(svgHeight>3*height/4){
                    svgHeight=2*parseInt(height)/3;
                  }
                  return  y(d.y)+(y(d.y + d.dy) - y(d.y)- svgHeight)/2-5;

                }
              })
              .attr("width", function (d) {
                return (x(d.x + d.dx) - x(d.x))/2;
              })
              .attr("height", function (d) {
                var height;
                var newImg = new Image();
                newImg.src = d.href;
                var imgWidth = newImg.width;
                var imgHeight = newImg.height;
                var ratio=imgWidth/imgHeight;
                var imgWidth2=ratio*(y(d.y + d.dy) - y(d.y));
                if(imgWidth2>(x(d.x + d.dx) - x(d.x))/2){
                  height=((x(d.x + d.dx) - x(d.x))/2)*(imgHeight/imgWidth);
                }
                else{

                  height=y(d.y + d.dy) - y(d.y);
                }

                imgDy=((y(d.y + d.dy) - y(d.y))-height)/2;
                return y(d.y + d.dy) - y(d.y)-imgDy;
              })

            ;

          }

          function image(image) {
            //  console.log(image);
            var flag=false;
            var height=0;
            image
              .attr("x", function (d) {
                return x(d.x)+5;
              })
              /*  .attr("y", function (d) {
               return y(d.y);
               })*/
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

                  var width=(y(d.y + d.dy) - y(d.y))*(imgWidth/imgHeight);
                  flag=true;

                  return width;
                  // return "auto";
                }
                else{

                  //  return (x(d.x + d.dx) - x(d.x))/2;
                  return 0.4*(x(d.x + d.dx) - x(d.x));
                }
                /*  if(imgWidth>(x(d.x + d.dx) - x(d.x))/2){
                 return (x(d.x + d.dx) - x(d.x))/2;
                 }
                 else{
                 return "auto";
                 }*/

                //  return (x(d.x + d.dx) - x(d.x))/4;
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
                /*   if(d.name=="Battery13"){
                 console.log(imgWidth+"  "+imgHeight+"  ratio is:"+ratio+" imgWidth2 is: "+imgWidth2+" rect width is: "+(x(d.x + d.dx) - x(d.x))/2);
                 }*/
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
                //console.log("imageeeeeeeeee id:"+ d.id+" height:"+ height);

                if(d.href==""){
                  return 0;
                }

                var newImg = new Image();
                newImg.src = d.href;
                var imgWidth = parseFloat(newImg.width);
                var imgHeight =parseFloat(newImg.height) ;
                var ratio=(imgWidth/imgHeight).toFixed(2);
                var imgWidth2=ratio*(y(d.y + d.dy) - y(d.y));
                /*if(d.name=="Battery13"){
                 console.log(imgWidth+"  "+imgHeight+"  ratio is:"+ratio+" imgWidth2 is: "+imgWidth2+" rect width is: "+(x(d.x + d.dx) - x(d.x))/2);
                 }*/
                if(imgWidth2>(x(d.x + d.dx) - x(d.x))/2){
                  height=((x(d.x + d.dx) - x(d.x))/2)*(imgHeight/imgWidth);

                }
                else{

                  //  height=y(d.y + d.dy) - y(d.y);
                  height=2*(y(d.y + d.dy) - y(d.y))/3;
                  /*  if(d.name=="Battery13"){
                   console.log("height22 is: "+height);
                   }*/
                  if(flag==true){
                    //  height=((x(d.x + d.dx) - x(d.x))/2)*(imgHeight/imgWidth);
                    flag=false;
                  }

                }

                return y(d.y)+((y(d.y + d.dy) - y(d.y))-height)/2;
              });


          }

          function foreign(foreign) { /* added */
            foreign.attr("x", function (d) {
                return x(d.x);
              })
              .attr("y", function (d) {
                return y(d.y);
              })
              .attr("width", function (d) {
                return x(d.x + d.dx) - x(d.x);
              })
              .attr("height", function (d) {
                return y(d.y + d.dy) - y(d.y);
              });
          }

          function name(d) {
            return d.parent
              ? name(d.parent) + "." + d.name
              : d.name;
          }

        }

      /*  $(window).resize(function () {
          d3.select("#"+attrs.containerId).select("svg").remove();
          ZoomableTreeMap();

        });*/

        // Observe the element's dimensions.
        scope.$watch
        (
          function () {
            return {
              wpc: $("#parent_powerConsumption").width(),
              hpc: $("#parent_powerConsumption").height(),
              wpg: $("#parent_powerGeneration").width(),
              hpg: $("#parent_powerGeneration").height(),
              whg: $("#parent_heatGeneration").width(),
              hhg: $("#parent_heatGeneration").height(),
              wcg: $("#parent_coldGeneration").width(),
              hcg: $("#parent_coldGeneration").height(),
              wgc: $("#parent_gasConsumption").width(),
              hgc: $("#parent_gasConsumption").height()
            };
          },
          function (newValue, oldValue) {
            if (newValue.wpc != oldValue.wpc || newValue.hpc != oldValue.hpc
              || newValue.wpg != oldValue.wpg || newValue.hpg != oldValue.hpg
              || newValue.whg != oldValue.whg || newValue.hhg != oldValue.hhg
              || newValue.wcg != oldValue.wcg || newValue.hcg != oldValue.hcg
              || newValue.wgc != oldValue.wgc || newValue.hgc != oldValue.hgc) {
              //   d3.select("#svg_"+attrs.containerId).remove;
              d3.select("#"+attrs.containerId).select("svg").remove();
              ZoomableTreeMap();

            }
          },
          true
        );


      });
    }
  }
}])

})();
