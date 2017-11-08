/**
 * Created by pg9501 on 26.07.2016.
 */

(function () {
  'use strict';

  angular
    .module('app.dweller.energy-flows')
    .directive('dualYaxisLineChart', ['$window','$timeout', 'd3Service2','moment', function ($window,$timeout, d3Service2,moment) {
      return {
        restrict: 'EA',
        scope: {
          y1Label:"@",
          y2Label:"@",
          powerUpperLimitLabel: "@",
          powerLowerLimitLabel: "@",
          electricityPriceLabel: "@",
          pvFeedinPriceLabel: "@",
          chpFeedinPriceLabel: "@",
          powerUpperLimitData: "@",
          powerLowerLimitData: "@",
          electricityPriceData: "@",
          pvFeedinPriceData: "@",
          chpFeedinPriceData: "@"
        },
        link: function (scope, ele, attrs) {
          d3Service2.d3().then(function (d3) {

            var renderTimeout;
            //var $container = $('#'+ele[0].id);
            var $container=$('#'+attrs.containerId);
            var margin = {top: 10, right: 35, bottom: 25, left: 70};
            var   width = $container.width(),
              //height =width*0.2;
              height =0.85*$container.height();

            var svg1 = d3.select(ele[0]).append("svg:svg");

            var color_powerUpperLimit="#9b59b6";
            var color_powerLowerLimit="#cc99ff";
            var color_elePrice="#009999";
            var color_pvFeedin="#00cc66";
            var color_chpFeedin="#33cccc";

            //Browser onresize event
            $window.onresize=function(){
              d3.select(ele[0]).select("svg").remove();
              scope.$apply();
            };

            //watch for resize event
            scope.$watch(function(){
              return $container.width();
            },function(){
              d3.select(ele[0]).select("svg").remove();
              if(scope.powerUpperLimitData==null || scope.powerUpperLimitData=="" || scope.electricityPriceData==null|| scope.electricityPriceData==""){
                scope.renderForEmptyData();
              }else{
                scope.render(JSON.parse(scope.powerUpperLimitData),JSON.parse(scope.powerLowerLimitData),JSON.parse(scope.electricityPriceData),JSON.parse(scope.pvFeedinPriceData),JSON.parse(scope.chpFeedinPriceData));
              }

            });

            scope.$watchGroup([ 'y1Label','powerUpperLimitData', 'electricityPriceData'], function(newValues, oldValues, scope) {
              d3.select(ele[0]).select("svg").remove();
             // console.log(scope.powerUpperLimitData);
              if(scope.powerUpperLimitData==null || scope.powerUpperLimitData=="" || scope.electricityPriceData==null|| scope.electricityPriceData==""){
                scope.renderForEmptyData();
              }else{
                d3.select(ele[0]).select("svg").remove();
                scope.render(JSON.parse(scope.powerUpperLimitData),JSON.parse(scope.powerLowerLimitData),JSON.parse(scope.electricityPriceData),JSON.parse(scope.pvFeedinPriceData),JSON.parse(scope.chpFeedinPriceData));
              }
            });

            scope.renderForEmptyData=function () {
              console.log("renderForEmptyDataaaaaaaaaa");
              var svg1 = d3.select(ele[0]).append("svg:svg");
              svg1.selectAll('*').remove();
              width = $container.width();

              height =0.8*$container.height();

              svg1.attr("width", width )
                .attr("height", height)
              ;
              var svg2=svg1.append("svg")
                .attr("id","svg1")
                .attr("width", width)
                .attr("height", height);

              var svg=svg2.append("g")
                .attr("transform", "translate("+margin.left+","+0+")");

              var y1min=2000;
              var y1max=y1min+1500;

              var y2min=10;
              var y2max=40;

              var y2min_feedin=5;
              var y2max_feedin=y2min_feedin+15;

              var d = new Date();
              var currentSeconds = Math.round(d.getTime() / 1000);
              var endSeconds=currentSeconds+24*60*60;
              var currentDate=moment.unix(currentSeconds);
              var endDate=moment.unix(endSeconds);

              var xScale = d3.time.scale()
                .range([0, width-margin.right-margin.left])
                .domain([currentDate.toDate(),endDate.toDate()])
                ;

              var zeroLineHeight=(height-margin.bottom-margin.top)/2-(height-margin.bottom)*0.05;
              svg.append("line")          // attach a line
                .style("stroke", "#424242")  // colour the line
                .style("stroke-width", "1")
                .attr("x1", 0)     // x position of the first end of the line
                .attr("y1", margin.top+ zeroLineHeight)      // y position of the first end of the line
                .attr("x2", width-margin.right-margin.left)     // x position of the second end of the line
                .attr("y2", margin.top+ zeroLineHeight);


              svg1.append("text")          // attach a line
                .attr("x", margin.left/2+2)     // x position of the first end of the line
                .attr("y", margin.top+ zeroLineHeight+3)
                .text("0")
                .style("fill","#424242")
                .style("font-size","x-medium");
              svg1.append("text")          // attach a line
                .attr("x", width-margin.right+10)     // x position of the first end of the line
                .attr("y", margin.top+ zeroLineHeight+3)
                .text("0")
                .style("fill","#424242")
                .style("font-size","x-medium");;

              var yScale1 = d3.scale.linear()
                .domain([y1min, y1max])
                .range([(margin.top+zeroLineHeight)*0.85, margin.top]);

              var yScale2 = d3.scale.linear()
                .domain([y2min, y2max])
                .range([(margin.top+zeroLineHeight)*0.85, margin.top]);

              var yScale1_down = d3.scale.linear()
                .domain([y1max,y1min])
                .range([(height-margin.bottom)*0.9, (zeroLineHeight+ margin.top)*1.15]);

              var yScale2_down = d3.scale.linear()
                .domain([y2max_feedin,y2min_feedin])
                .range([(height-margin.bottom)*0.9, (zeroLineHeight+ margin.top)*1.15]);

              var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom")
                .innerTickSize(-height)
                .outerTickSize(-height)
                .tickPadding(10);

              var yAxis1 = d3.svg.axis()
                .scale(yScale1)
                .ticks(4)
                .orient("left")
                .innerTickSize(-(width-margin.left-margin.right))
                .outerTickSize(0)
                .tickPadding(10);

              var yAxis2 = d3.svg.axis()
                .scale(yScale2)
                .ticks(4)
                .orient("right")
                .innerTickSize(-(width-margin.left-margin.right))
                .outerTickSize(0)
                .tickPadding(10);

              var yAxis1_down = d3.svg.axis()
                .scale(yScale1_down)
                .ticks(4)
                .orient("left")
                .innerTickSize(-(width-margin.left-margin.right))
                .outerTickSize(0)
                .tickPadding(10);

              var yAxis2_down = d3.svg.axis()
                .scale(yScale2_down)
                .ticks(4)
                .orient("right")
                .innerTickSize(-(width-margin.left-margin.right))
                .outerTickSize(0)
                .tickPadding(10);

              var lastYValue1;
              var line1 = d3.svg.line()
                .x(function(d) {
                  var xValue=xScale(convertToDate(d.x));
                  if(xValue>width-margin.right-margin.left){
                    xValue=width-margin.right-margin.left;
                  }
                  return xValue; })
                .y(function(d) {
                  var yValue=yScale1(d.y);
                  var xValue=xScale(convertToDate(d.x));
                  if(xValue>width-margin.right-margin.left){
                    yValue=lastYValue1;
                  }else{
                    lastYValue1=yValue;
                  }
                  return yValue; })
                ;

              var lastYValue2;
              var line2 = d3.svg.line()
                .x(function(d) {
                  var xValue=xScale(convertToDate(d.x));
                  if(xValue>width-margin.right-margin.left){
                    xValue=width-margin.right-margin.left;
                  }
                  return xValue; })
                .y(function(d) {
                  var yValue=yScale2(d.y);
                  var xValue=xScale(convertToDate(d.x));
                  if(xValue>width-margin.right-margin.left){
                    yValue=lastYValue2;
                  }else{
                    lastYValue2=yValue;
                  }

                  return yValue; })
                ;

              var line3 = d3.svg.line()
                .x(function(d) {
                  var xValue=xScale(convertToDate(d.x));
                  return xValue; })
                .y(function(d) {
                  var yValue=yScale1_down(Math.abs(d.y));
                  return yValue; })
                ;

              var line4 = d3.svg.line()
                .x(function(d) {
                  var xValue=xScale(convertToDate(d.x));
                  return xValue; })
                .y(function(d) {
                  var yValue=yScale2_down(Math.abs(d.y));
                  return yValue; })
                ;

              var line5 = d3.svg.line()
                .x(function(d) {
                  var xValue=xScale(convertToDate(d.x));
                  return xValue; })
                .y(function(d) {
                  var yValue=yScale2_down(Math.abs(d.y));
                  return yValue; })
                ;

              var insertLinebreaks = function (d) {
                var el = d3.select(this);
                var words = d.split(' ');
                el.text('');

                for (var i = 0; i < words.length; i++) {
                  var tspan = el.append('tspan').text(words[i]);
                  if (i > 0)
                    tspan.attr('x', 0).attr('dy', '15');
                }
              };

              var yTranslate=height-margin.top-margin.bottom;

              var axis1 =svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + yTranslate + ")")
                .call(xAxis);

              svg.append("line") //the first tick
                .attr("x1",1)
                .attr("y1",0)
                .attr("x2",1)
                .attr("y1",height-margin.bottom-margin.top)
                .style("stroke-width",function(d){
                  return "1";
                })
                .style("stroke","#585858")
                .style("shape-rendering","crispEdges");

              svg.append("line") //the last tick
                .attr("x1",width-margin.left-margin.right-1)
                .attr("y1",0)
                .attr("x2",width-margin.left-margin.right-1)
                .attr("y1",height-margin.bottom-margin.top)
                .style("stroke-width",function(d){
                  return "1";
                })
                .style("stroke","#585858")
                .style("shape-rendering","crispEdges");

              svg.append("line") //the last tick
                .attr("x1",0)
                .attr("y1",height-margin.bottom-margin.top-1)
                .attr("x2",width-margin.left-margin.right)
                .attr("y2",height-margin.bottom-margin.top-1)
                .style("stroke-width",function(d){
                  return "1";
                })
                .style("stroke","#6E6E6E")
                .style("shape-rendering","crispEdges");

              svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate("+0+",0)")
                .call(yAxis1);

              svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate("+(width-margin.right-margin.left)+",0)")
                .call(yAxis2);

              svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate("+0+",0)")
                .call(yAxis1_down);

              svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate("+(width-margin.right-margin.left)+",0)")
                .call(yAxis2_down);

              svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left)
                .attr("x",0 - ( (height-margin.top-margin.bottom) / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("fill",color_powerUpperLimit)
                .text(scope.y1Label)
                .style("font-size","x-medium");

              svg1.append("text")
                .attr("transform", "rotate(90)")
                .attr("y", -(width))
                .attr("x",( (height-margin.top-margin.bottom) / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("fill",color_elePrice)
                .text(scope.y2Label)
                .style("font-size","x-medium");

              svg.selectAll(".axis line")
                .style("stroke-width",function(d){
                  return "1";
                })
                .style("stroke","lightgrey")
                .style("shape-rendering","crispEdges");

              d3.selectAll(".axis.x text")
                .style("fill", "rgb(130,130,130)")
                .style("font-size","11px");

              d3.selectAll(".axis.y text")
                .style("fill", function(d){

                  if(d>100){
                    return color_powerUpperLimit;
                  }
                  return color_elePrice;
                })
                .style("font-size","11px");

              svg.selectAll(".axis line")
                .style("stroke-width",function(d){
                  return "2";
                })
                .style("stroke-dasharray", ("2, 6"))
                .style("stroke","lightgrey")
                .style("shape-rendering","crispEdges")
                .style("fill","none");

              svg.selectAll(".axis path")
                .style("fill","none");

              svg.selectAll(".x.axis text")
                .style("fill","#2E2E2E")
                .style("font-family","sans-serif")
                .style("font-size","11px");


              function convertToDate (dateString){
                return moment.unix(dateString).toDate();
              }

              var interval=2;
              var breakPoint=768;
              if($(window).width() < breakPoint) {
                interval=6;
              }

              var utcChange=false;
              xAxis.scale(xScale)
                .orient("bottom")
                .ticks(d3.time.hour,interval)
                .tickFormat(function(d){
                  if(utcChange==false && moment().utcOffset()=="120" && moment(d).utcOffset()=="60"){
                    utcChange=true;
                    return;
                  }
                  var formatTime = d3.time.format("%H:%M");
                  var formatTime2 = d3.time.format("%d %b");//output Date instead of time
                  var time=formatTime(d);
                  //console.log(time);
                  if(time=="00:00"){
                    return formatTime2(d);
                  }
                  return formatTime(d);
                })
                .innerTickSize(-height)
              ;
              axis1.call(xAxis);


              svg.selectAll(".axis line")
                .style("stroke-width",function(d){
                  return "2";
                })
                .style("stroke-dasharray", ("3, 8"))
                .style("stroke","lightgrey")
                .style("shape-rendering","crispEdges")
                .style("fill","none");

              var d = new Date();
              if(d.getMonth()==9 && d.getDate()>20){//change from summer time to winter time on the last Sunday of October
                utcChange=false;
                svg.selectAll(".x.axis line")
                  .style("stroke",function(d){
                    if(utcChange==false && moment().utcOffset()=="120" && moment(d).utcOffset()=="60"){//there will be one more hour when changing from summer time to winter time, hide this hour
                      utcChange=true;
                      return "transparent";
                    }
                    return "lightgrey";
                  });
              }

            }


            scope.render=function(powerUpperLimitData,powerLowerLimitData,electricityPriceData,pvFeedinPriceData,chpFeedinPriceData){

              width = $container.width()-margin.right;
              height =0.7*$container.height();

             var svg1 = d3.select(ele[0]).append("svg:svg");

              svg1.selectAll('*').remove();
                svg1.attr("width", width+margin.right )
                  .attr("height", height)
                ;
              var svg2=svg1.append("svg")
                .attr("id","svg1")
                .attr("width", width)
                .attr("height", height);
                //.attr("viewBox",-margin.left+" "+0+" "+(width-margin.right-margin.left-100)+" "+height);

              var svg=svg2.append("g")
                .attr("transform", "translate("+margin.left+","+0+")");


              //  var width_x_tick=(width-margin.left-margin.right)/12;

              /*  var xScale1 = d3.time.scale()
                    .range([0, width-margin.right-margin.left])
                  .domain([convertToDate(powerUpperLimitData[0].x),convertToDate(powerUpperLimitData[powerUpperLimitData.length-1].x)])
                  ;
                var xScale2 = d3.time.scale()
                    .range([0,width-margin.right-margin.left])
                    .domain([convertToDate(electricityPriceData[0].x),convertToDate(electricityPriceData[electricityPriceData.length-1].x)])
                    ;*/

              var y1min=Math.min.apply(Math,powerUpperLimitData.map(function(o){return o.y;}));
              y1min=y1min-y1min % 100;
              y1min-=100;
              var y1max=y1min+300;
              while(y1max<Math.max.apply(Math,powerUpperLimitData.map(function(o){return o.y;}))){
                y1max+=300;
              }
              var y2min=Math.min.apply(Math,electricityPriceData.map(function(o){return o.y;}));
              y2min=y2min-y2min % 10;
              var y2max=y2min+30;
              while(y2max<Math.max.apply(Math,electricityPriceData.map(function(o){return o.y;}))){
                y2max+=30;
              }

              var y2min_pvFeedin=Math.min.apply(Math,pvFeedinPriceData.map(function(o){return o.y;}));
              var y2min_chpFeedin=Math.min.apply(Math,chpFeedinPriceData.map(function(o){return o.y;}));
              var y2max_pvFeedin=Math.max.apply(Math,pvFeedinPriceData.map(function(o){return o.y;}));
              var y2max_chpFeedin=Math.max.apply(Math,chpFeedinPriceData.map(function(o){return o.y;}));
              var y2min_feedin=6;
              var y2max_feedin=y2min_feedin+3;
              while(y2max_feedin<Math.max(y2max_pvFeedin,y2max_chpFeedin)){
                y2max_feedin+=3;
              }
              var currentDate=moment.unix(powerUpperLimitData[0].x);
              var xScale = d3.time.scale()
                .range([0, width-margin.right-margin.left])
                .domain([currentDate.toDate(),currentDate.add(24, 'h').toDate()])
              ;

              var zeroLineHeight=(height-margin.bottom-margin.top)/2-(height-margin.bottom)*0.05;
              svg.append("line")          // attach a line
                .style("stroke", "#424242")  // colour the line
                .style("stroke-width", "1")
                .attr("x1", 0)     // x position of the first end of the line
                .attr("y1", margin.top+ zeroLineHeight)      // y position of the first end of the line
                .attr("x2", width-margin.right-margin.left)     // x position of the second end of the line
                .attr("y2", margin.top+ zeroLineHeight);


              svg1.append("text")          // attach a line
                .attr("x", margin.left/2+2)     // x position of the first end of the line
                .attr("y", margin.top+ zeroLineHeight+3)
                //.style("text-anchor", "middle")// y position of the first end of the line
                .text("0")
                .style("fill","#424242")
                .style("font-size","x-medium");
              svg1.append("text")          // attach a line
                .attr("x", width-margin.right+10)     // x position of the first end of the line
                .attr("y", margin.top+ zeroLineHeight+3)
                //.style("text-anchor", "middle")// y position of the first end of the line
                .text("0")
                .style("fill","#424242")
                .style("font-size","x-medium");;

                var yScale1 = d3.scale.linear()
                  .domain([y1min, y1max])
                  .range([(margin.top+zeroLineHeight)*0.85, margin.top]);

                var yScale2 = d3.scale.linear()
                  .domain([y2min, y2max])
                  .range([(margin.top+zeroLineHeight)*0.85, margin.top]);

              var yScale1_down = d3.scale.linear()
                .domain([y1max,y1min])
                .range([(height-margin.bottom)*0.9, (zeroLineHeight+ margin.top)*1.15]);

              var yScale2_down = d3.scale.linear()
                .domain([y2max_feedin,y2min_feedin])
                .range([(height-margin.bottom)*0.9, (zeroLineHeight+ margin.top)*1.15]);



               // var tickValues=["22:00", "26 Jul", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00","14:00", "16:00", "18:00", "20:00"];

              var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom")
                //.tickValues(tickValues)
                //.ticks(13)
                .innerTickSize(-height)
                .outerTickSize(-height)
                .tickPadding(10);

                var yAxis1 = d3.svg.axis()
                  .scale(yScale1)
                  //.tickValues([1500, 2000, 2500,3000])
                  .ticks(4)
                  .orient("left")
                  .innerTickSize(-(width-margin.left-margin.right))
                  .outerTickSize(0)
                  .tickPadding(10);

                var yAxis2 = d3.svg.axis()
                  .scale(yScale2)
                  //.tickValues([10, 20, 30,40])
                  .ticks(4)
                  .orient("right")
                  .innerTickSize(-(width-margin.left-margin.right))
                  .outerTickSize(0)
                  .tickPadding(10);

              var yAxis1_down = d3.svg.axis()
                .scale(yScale1_down)
                //.tickValues([1500, 2000, 2500,3000])
                .ticks(4)
                .orient("left")
                .innerTickSize(-(width-margin.left-margin.right))
                .outerTickSize(0)
                .tickPadding(10);

              var yAxis2_down = d3.svg.axis()
                .scale(yScale2_down)
                //.tickValues([10, 20, 30,40])
                .ticks(4)
                .orient("right")
                .innerTickSize(-(width-margin.left-margin.right))
                .outerTickSize(0)
                .tickPadding(10);


              var lastYValue1;
                var line1 = d3.svg.line()
                  .x(function(d) {
                    var xValue=xScale(convertToDate(d.x));
                    if(xValue>width-margin.right-margin.left){
                      xValue=width-margin.right-margin.left;
                    }
                    return xValue; })
                  .y(function(d) {
                    var yValue=yScale1(d.y);
                    var xValue=xScale(convertToDate(d.x));
                    if(xValue>width-margin.right-margin.left){
                      yValue=lastYValue1;
                    }else{
                      lastYValue1=yValue;
                    }
                    return yValue; })
                  ;

              var lastYValue2;
                var line2 = d3.svg.line()
                  .x(function(d) {
                    var xValue=xScale(convertToDate(d.x));
                    if(xValue>width-margin.right-margin.left){
                      xValue=width-margin.right-margin.left;
                    }
                    return xValue; })
                  .y(function(d) {
                    var yValue=yScale2(d.y);
                    var xValue=xScale(convertToDate(d.x));
                    if(xValue>width-margin.right-margin.left){
                      yValue=lastYValue2;
                    }else{
                      lastYValue2=yValue;
                    }

                    return yValue; })
                  ;

              var line3 = d3.svg.line()
                .x(function(d) {
                  var xValue=xScale(convertToDate(d.x));
                  return xValue; })
                .y(function(d) {
                  var yValue=yScale1_down(Math.abs(d.y));
                  return yValue; })
                ;

              var line4 = d3.svg.line()
                .x(function(d) {
                  var xValue=xScale(convertToDate(d.x));
                  return xValue; })
                .y(function(d) {
                  var yValue=yScale2_down(Math.abs(d.y));
                  return yValue; })
                ;

              var line5 = d3.svg.line()
                .x(function(d) {
                  var xValue=xScale(convertToDate(d.x));
                  return xValue; })
                .y(function(d) {
                  var yValue=yScale2_down(Math.abs(d.y));
                  return yValue; })
                ;

              var insertLinebreaks = function (d) {
                var el = d3.select(this);
                var words = d.split(' ');
                el.text('');

                for (var i = 0; i < words.length; i++) {
                  var tspan = el.append('tspan').text(words[i]);
                  if (i > 0)
                    tspan.attr('x', 0).attr('dy', '15');
                }
              };


              var yTranslate=height-margin.top-margin.bottom;

                var axis1 =svg.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0," + yTranslate + ")")
                  .call(xAxis);


              svg.append("line") //the first tick
                .attr("x1",1)
                .attr("y1",0)
                .attr("x2",1)
                .attr("y1",height-margin.bottom-margin.top)
                .style("stroke-width",function(d){
                  return "1";
                })
                .style("stroke","#585858")
                .style("shape-rendering","crispEdges");

              svg.append("line") //the last tick
                .attr("x1",width-margin.left-margin.right-1)
                .attr("y1",0)
                .attr("x2",width-margin.left-margin.right-1)
                .attr("y1",height-margin.bottom-margin.top)
                .style("stroke-width",function(d){
                  return "1";
                })
                .style("stroke","#585858")
                .style("shape-rendering","crispEdges");

              svg.append("line") //the last tick
                .attr("x1",0)
                .attr("y1",height-margin.bottom-margin.top-1)
                .attr("x2",width-margin.left-margin.right)
                .attr("y2",height-margin.bottom-margin.top-1)
                .style("stroke-width",function(d){
                  return "1";
                })
                .style("stroke","#6E6E6E")
                .style("shape-rendering","crispEdges");

                svg.append("g")
                  .attr("class", "y axis")
                  .attr("transform", "translate("+0+",0)")
                  .call(yAxis1);

              svg.append("g")
                    .attr("class", "y axis")
                    .attr("transform", "translate("+(width-margin.right-margin.left)+",0)")
                    .call(yAxis2);

              svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate("+0+",0)")
                .call(yAxis1_down);

              svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate("+(width-margin.right-margin.left)+",0)")
                .call(yAxis2_down);

                svg.append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", -margin.left+5)
                    .attr("x",0 - ( (height-margin.top-margin.bottom) / 2))
                    .attr("dy", "1em")
                    .style("text-anchor", "middle")
                    .style("fill",color_powerUpperLimit)
                    .text(scope.y1Label)
                    .style("font-size","x-medium");

                svg1.append("text")
                    .attr("transform", "rotate(90)")
                    .attr("y", -(width+5))
                    .attr("x",( (height-margin.top-margin.bottom) / 2))
                    .attr("dy", "1em")
                    .style("text-anchor", "middle")
                    .style("fill",color_elePrice)
                    .text(scope.y2Label)
                    .style("font-size","x-medium");

                svg.selectAll(".axis line")
                  .style("stroke-width",function(d){
                    return "1";
                  })
                  .style("stroke","lightgrey")
                  .style("shape-rendering","crispEdges");


              /*  svg.selectAll(".x.axis line")
                  .style("stroke-dasharray", ("3, 3"));*/

                d3.selectAll(".axis.x text")
                  .style("fill", "rgb(130,130,130)")
                  .style("font-size","11px");

                d3.selectAll(".axis.y text")
                    .style("fill", function(d){

                    if(d>100){
                      return color_powerUpperLimit;
                    }
                      return color_elePrice;
                    })
                    .style("font-size","11px");

                /* d3.selectAll(".x.axis text")
                 .call(insertLinebreaks);*/

           //     svg.selectAll('g.x.axis g text').each(insertLinebreaks);

              svg.selectAll(".axis line")
                .style("stroke-width",function(d){
                  return "2";
                })
                .style("stroke-dasharray", ("2, 6"))
                .style("stroke","lightgrey")
                .style("shape-rendering","crispEdges")
                .style("fill","none");

              svg.selectAll(".axis path")
                .style("fill","none");

              svg.selectAll(".x.axis text")
                .style("fill","#2E2E2E")
                .style("font-family","sans-serif")
                .style("font-size","11px");


              var path1= svg.append("path")
                  .data([powerUpperLimitData])
                  .attr("class", "line")
                  .attr("d", line1)
                 .attr("id","line1")
                  .style("fill","none")
                  .style("stroke",color_powerUpperLimit)
                    .style("stroke-width",3);

               var path2= svg.append("path")
                  .data([electricityPriceData])
                  .attr("class", "line")
                  .attr("d", line2)
                 .attr("id","line2")
                  .style("fill","none")
                  .style("stroke",color_elePrice)
                    .style("stroke-width",3);

              var path3= svg.append("path")
                .data([powerLowerLimitData])
                .attr("class", "line")
                .attr("d", line3)
                .attr("id","line3")
                .style("fill","none")
                .style("stroke",color_powerLowerLimit)
                .style("stroke-width",3);

              var path4= svg.append("path")
                .data([pvFeedinPriceData])
                .attr("class", "line")
                .attr("d", line4)
                .attr("id","line4")
                .style("fill","none")
                .style("stroke",color_pvFeedin)
                .style("stroke-width",3);

              var path5= svg.append("path")
                .data([chpFeedinPriceData])
                .attr("class", "line")
                .attr("d", line5)
                .attr("id","line5")
                .style("fill","none")
                .style("stroke",color_chpFeedin)
                .style("stroke-width",3);

              var mouseG = svg.append("g")
                .attr("class", "mouse-over-effects");

            /*  mouseG.append("path") // this is the black vertical line to follow mouse
                .attr("class", "mouse-line")
                .style("stroke", "green")
                .style("stroke-width", "1px")
                .style("opacity", "0")
                ;*/

              var test=[
                {"x": "", "y": ""},
                {"x": "", "y": ""},
                {"x": "", "y": ""},
                {"x": "", "y": ""},
                {"x": "", "y": ""}];
              var lines = document.getElementsByClassName('line');
              var mousePerLine = mouseG.selectAll('.mouse-per-line')
                .data(test)
                .enter()
                .append("g")
                .attr("class", "mouse-per-line");

              mousePerLine.append("circle")
                .attr("r", 2)
                .style("stroke", function(d) {
                  return 'red';
                })
                .style("fill", "red")
                .style("stroke-width", "3px")
                .style("opacity", "0");

              mousePerLine.append("text")
                .attr("transform", "translate(10,0)");

              var fo = svg1.append('foreignObject');

              // Define the div for the tooltip
           //   var div = fo.append('xhtml:div')
              d3.selectAll("#divComment").remove();
             var div= d3.select("body").append("div")
                .attr("id","divComment")
                .style("position", "absolute")
                .style("text-align", "left")
                .style("padding", "6px")
                .style("font", "12px sans-serif")
                .style("background", "lightsteelblue")
                .style("border", "1px")
                .style("opacity", 0);

            var rect=  mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
                .attr('width', width-margin.left-margin.right) // can't catch mouse events on a g element
                .attr('height', height)
                .attr('fill', 'none')
                .attr('pointer-events', 'all')
                .on('mouseout', function() { // on mouse out hide line, circles and text
                  d3.select(".mouse-line")
                    .style("opacity", "0");
                  d3.selectAll(".mouse-per-line circle")
                    .style("opacity", "0");
                  d3.selectAll(".mouse-per-line text")
                    .style("opacity", "0");

                  div
                    .style("opacity", 0);
                })
                .on('mouseover', function() { // on mouse in show line, circles and text
                  d3.select(".mouse-line")
                    .style("opacity", "1");
                  d3.selectAll(".mouse-per-line circle")
                    .style("opacity", "1");
                  d3.selectAll(".mouse-per-line text")
                    .style("opacity", "1");

                  div.style("opacity", 1);
                })
                .on('mousemove', function() { // mouse moving over canvas
                  var mouse = d3.mouse(this);
                  d3.select(".mouse-line")
                    .attr("d", function() {
                      var d = "M" + mouse[0] + "," + height;
                      d += " " + mouse[0] + "," + 0;
                      return d;
                    });

                  var powerUpperLimitValue;
                  var powerLowerLimitValue;
                  var electricityPriceValue;
                  var pvFeedinPriceValue;
                  var chpFeedinPriceValue;
                  d3.selectAll(".mouse-per-line")
                    .attr("transform", function(d, i) {
                      var xDate = xScale.invert(mouse[0]),
                        bisect = d3.bisector(function(d) { return d.x; }).right;
                      var idx = bisect(d.y, xDate);

                      var beginning = 0,
                        end = null,
                        target = null;

                      if(typeof lines[i]!='undefined'){
                        end = lines[i].getTotalLength();
                       // console.log(end);

                        while (true){
                          target = Math.floor((beginning + end) / 2);
                          var pos = lines[i].getPointAtLength(target);
                          if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                            break;
                          }
                          if (pos.x > mouse[0])      end = target;
                          else if (pos.x < mouse[0]) beginning = target;
                          else break; //position found
                        }

                        var formatTime = d3.time.format("%H:%M");
                        var formatTime2 = d3.time.format("%d %b");//output Date instead of time
                        var xValue=formatTime(xDate);
                        if(time=="00:00"){
                          xValue=formatTime2(xDate);
                        }

              //          console.log("i is "+i);
                        if(lines[i].id=='line1'){
                          powerUpperLimitValue=yScale1.invert(pos.y).toFixed(0)+" W";
                          d3.select(this).select('text')
                            .text(""+xValue+" : "+yScale1.invert(pos.y).toFixed(0)+" W");
                        }
                        if(lines[i].id=='line2'){

                          electricityPriceValue=yScale2.invert(pos.y).toFixed(0)+" ct";
                          d3.select(this).select('text')
                            .text(""+xValue+" : "+yScale2.invert(pos.y).toFixed(0)+" ct");
                        }
                        if(lines[i].id=='line3'){
                          powerLowerLimitValue=yScale1_down.invert(pos.y).toFixed(0)+" W";
                          d3.select(this).select('text')
                            .text(""+xValue+" : "+yScale1_down.invert(pos.y).toFixed(0)+" W");
                        }
                        if(lines[i].id=='line4'){
                          pvFeedinPriceValue=yScale2_down.invert(pos.y).toFixed(0)+" ct";
                          d3.select(this).select('text')
                            .text(""+xValue+" : "+yScale2_down.invert(pos.y).toFixed(0)+" ct");
                        }
                        if(lines[i].id=='line5'){
                          chpFeedinPriceValue=yScale2_down.invert(pos.y).toFixed(0)+" ct";
                          d3.select(this).select('text')
                            .text(""+xValue+" : "+yScale2_down.invert(pos.y).toFixed(0)+" ct");
                        }

                        div
                          .style("opacity", .9);

                        var s_Top = document.documentElement.scrollTop || document.body.scrollTop;
                        var s_Left = document.documentElement.scrollLeft || document.body.scrollLeft;

                       /* d3.selectAll("#divComment")
                          .style("background", "transparent")
                          .html("");*/

                        div	.html("<p style='margin-bottom: 0px;margin-top: 0px'><b><u>Time: "+xValue +"</u></b></p>"   +"<p style='margin-bottom: 0px'><b>"+scope.electricityPriceLabel+": "+electricityPriceValue +"</b></p>"+ "<p style='margin-bottom: 0px'><b>"+scope.powerUpperLimitLabel+": "+powerUpperLimitValue+"</b></p>" +
                          "<p style='margin-bottom: 0px'><b>"+scope.powerLowerLimitLabel+": "+powerLowerLimitValue+"</b></p>"+ "<p style='margin-bottom: 0px'><b>"+scope.pvFeedinPriceLabel+": "+pvFeedinPriceValue+"</b></p>" + "<p style='margin-bottom: 0px'><b>"+scope.chpFeedinPriceLabel+": "+chpFeedinPriceValue+"</b></p>" )
                         // .style("left", mouse[0] + "px" )
                         // .style("top",pos.y + "px");
                          .style("left", (d3.event.pageX) + "px")
                          .style("top", (d3.event.pageY +25) + "px");

                      //  div.style("background", "lightsteelblue");


                        return "translate(" + mouse[0] + "," + pos.y +")";
                      }

                    });
                });


              function convertToDate (dateString){
                //return moment(dateString).toDate();
                //var timeOffset = moment().utcOffset();
               // console.log(moment.unix(dateString).utcOffset());
                //moment().utcOffset(60);
             //   var date=moment.unix(dateString).toDate();
    //            var date=moment.unix(dateString).format('YYYY-MM-DD[T]HH:mm:ss');

               // moment('2014/09/05 12:00').format('YYYY-MM-DD[T]HH:mm:ss')
               // moment.utc()
                /*if(moment.unix(dateString).utcOffset()==60){

                  var newDate=parseInt(dateString)+3600;
                  date=moment.unix(newDate).format('YYYY-MM-DD[T]HH:mm:ss');
                 // date.setHours(date.getHours()+1);
                }
               // console.log(date);
                return moment(date).toDate();*/
                return moment.unix(dateString).toDate();
              //  return date;
               // return moment.unix(dateString).utcOffset("60").format('MM/DD/YYYY hh:mm:ss');
              }
               tick();

                function tick(){





                 // xScale1.domain([new Date(powerUpperLimitData[0].x),new Date(powerUpperLimitData[powerUpperLimitData.length-1].x)]);
                 // xScale2.domain([new Date(electricityPriceData[0].x),new Date(electricityPriceData[electricityPriceData.length-1].x)]);
                  var interval=2;
                  var breakPoint=768;
                  if($(window).width() < breakPoint) {
                    interval=6;
                  }
                /*  var dates = [];
                  dates.push(convertToDate(powerUpperLimitData[0].x));
                  dates.push(convertToDate(electricityPriceData[0].x));
                  dates.push(convertToDate(powerUpperLimitData[powerUpperLimitData.length-1].x));
                  dates.push(convertToDate(electricityPriceData[electricityPriceData.length-1].x));

                  //console.log(new Date(powerUpperLimitData[0].x));
                  var sorted = dates.sort(sortDates);*/
                 // console.log(convertToDate(sorted[3]));
                  var currentDate=moment.unix(powerUpperLimitData[0].x);
                //  console.log(currentDate);
                  xScale = d3.time.scale()
                    // .rangePoints([width_x_tick/2+margin.left, width-margin.right-width_x_tick/2])
                    .range([0, width-margin.right-margin.left])
                   // .domain([sorted[0],moment(sorted[0]).add(1440, 'minutes')])
                    .domain([convertToDate(powerUpperLimitData[0].x),convertToDate(powerUpperLimitData[powerUpperLimitData.length-1].x)])
                    ;


                  var utcChange=false;
                  xAxis.scale(xScale)
                    .orient("bottom")
                    .ticks(d3.time.hour,interval)
                    .tickFormat(function(d){
                      //console.log(dateStr);
                      if(utcChange==false && moment().utcOffset()=="120" && moment(d).utcOffset()=="60"){
                        utcChange=true;
                        return;
                      }
                      var formatTime = d3.time.format("%H:%M");
                      var formatTime2 = d3.time.format("%d %b");//output Date instead of time
                      var time=formatTime(d);
                      //console.log(time);
                      if(time=="00:00"){
                        return formatTime2(d);
                      }
                      return formatTime(d);
                    })
                    .innerTickSize(-height)
                    ;
                  axis1.call(xAxis);


                  path1.data([powerUpperLimitData]).attr("d", line1);

                  path2 .data([electricityPriceData]).attr("d", line2);

                  path3 .data([powerLowerLimitData]).attr("d", line3);
                  path4 .data([pvFeedinPriceData]).attr("d", line4);
                  path5 .data([chpFeedinPriceData]).attr("d", line5);
                   // .transition()
                   // .duration(60000)
                   // .ease("linear")
                   // .each("end", tick);



                 // rect.attr('width', xScale(convertToDate(sorted[3])));
                  rect.attr('width', xScale(convertToDate(powerUpperLimitData[powerUpperLimitData.length-1].x)));

             /*     var diff_ms1 = moment(powerUpperLimitData[powerUpperLimitData.length-1].x).diff(moment(powerUpperLimitData[0].x));
                  var duration1 = moment.duration(diff_ms1);
                  var hours1 = duration1.asHours();
                  var diff_ms2 = moment(electricityPriceData[electricityPriceData.length-1].x).diff(moment(electricityPriceData[0].x));
                  var duration2 = moment.duration(diff_ms2);
                  var hours2 = duration2.asHours();

                  if(moment(powerUpperLimitData[1].x).diff(moment(electricityPriceData[1].x)) ==0){
                    powerUpperLimitData.shift();
                    electricityPriceData.shift();
                  }else if(moment(powerUpperLimitData[1].x).diff(moment(electricityPriceData[1].x)) >0){
                    electricityPriceData.shift();
                  }else{
                    powerUpperLimitData.shift();
                  }
                  if(powerUpperLimitData[0].x==powerUpperLimitData[1].x){
                    powerUpperLimitData.shift();
                  }
                  if(electricityPriceData[0].x==electricityPriceData[1].x){
                    electricityPriceData.shift();
                  }*/
                  svg.selectAll(".axis line")
                    .style("stroke-width",function(d){
                      return "2";
                    })
                    .style("stroke-dasharray", ("3, 8"))
                    .style("stroke","lightgrey")
                    .style("shape-rendering","crispEdges")
                    .style("fill","none");

                  var d = new Date();
                  if(d.getMonth()==9 && d.getDate()>20){//change from summer time to winter time on the last Sunday of October
                    utcChange=false;
                    svg.selectAll(".x.axis line")
                      .style("stroke",function(d){
                        if(utcChange==false && moment().utcOffset()=="120" && moment(d).utcOffset()=="60"){//there will be one more hour when changing from summer time to winter time, hide this hour
                          utcChange=true;
                          return "transparent";
                        }
                        return "lightgrey";
                      });
                  }







               /*   var lastTime=powerUpperLimitData[powerUpperLimitData.length-1].x;
                  var newTime=parseInt(lastTime)+60;
                  var newpowerUpperLimitData={"x":newTime, "y": powerUpperLimitData[powerUpperLimitData.length-1].y};
                  var newelectricityPriceData={"x":newTime, "y": electricityPriceData[electricityPriceData.length-1].y};
                  powerUpperLimitData.push(newpowerUpperLimitData);
                  electricityPriceData.push(newelectricityPriceData);

                  console.log(powerUpperLimitData[powerUpperLimitData.length-1].x + " : "+ powerUpperLimitData[powerUpperLimitData.length-1].y);
                  console.log(electricityPriceData[electricityPriceData.length-1].x + " : "+ electricityPriceData[electricityPriceData.length-1].y);*/


                }





              //},200);
            }



          })
        }
      }
    }])
})();
