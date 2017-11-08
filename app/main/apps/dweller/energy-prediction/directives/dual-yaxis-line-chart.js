/**
 * Created by pg9501 on 26.07.2016.
 */

(function () {
  'use strict';

  angular
    .module('app.dweller.energy-prediction')
    .directive('dualYaxisLineChartForBuildingPrediction', ['$window','$timeout', 'd3Service2','moment', function ($window,$timeout, d3Service2,moment) {
      return {
        restrict: 'EA',
        scope: {
          y1Label:"@",
          y2Label:"@",
          loadLimitLabel: "@",
          electricityPriceLabel: "@",
          pvFeedinPriceLabel: "@",
          chpFeedinPriceLabel: "@",
          buildingBaseLoadLabel: "@",
          buildingNetLoadLabel: "@",
          pvEnergyLabel: "@",
          chpEnergyLabel: "@",
          isRenderAll:"@",
          isRenderY1:"@",
          startTimeStamp:"@",
          endTimeStamp:"@",
          powerUpperLimitData: "@",
          powerLowerLimitData: "@",
          electricityPriceData: "@",
          pvFeedinPriceData: "@",
          chpFeedinPriceData: "@",

          pvEnergyGenerationData:"@",
          chpEnergyConGenData:"@",
          buildingBaseLoadData:"@",
          buildingEnergyNetUseData:"@",
          netEnergyData:"@"
        },
        link: function (scope, ele, attrs) {
          d3Service2.d3().then(function (d3) {

            var renderTimeout;
            //var $container = $('#'+ele[0].id);
            var $container=$('#'+attrs.containerId);
            var margin = {top: 10, right: 45, bottom: 25, left: 60};
            var   width = $container.width(),

             // height =0.85*$container.height();

            height =$container.height();

            //var svg1 = d3.select(ele[0]).append("svg:svg");

            var color_powerUpperLimit="#9b59b6";
            var color_powerLowerLimit="#cc99ff";
            var color_elePrice="#009999";
            var color_pvFeedin="#00cc66";
            var color_chpFeedin="#33cccc";

            var color_pvEnergyGenerationData="darkorange";
            var color_chpEnergyConGenData="#0033cc";
            var color_buildingBaseLoadData="#996600";
            var color_buildingEnergyNetUseData="333300";



            //Browser onresize event
            $window.onresize=function(){

              scope.$apply();
            };

            //watch for resize event
            scope.$watch(function(){
              return $container.width();
            },function(){
              d3.select(ele[0]).select("svg").remove();
              scope.render(true,false,JSON.parse(scope.powerUpperLimitData),JSON.parse(scope.powerLowerLimitData),JSON.parse(scope.electricityPriceData),JSON.parse(scope.pvFeedinPriceData),JSON.parse(scope.chpFeedinPriceData),JSON.parse(scope.pvEnergyGenerationData),JSON.parse(scope.chpEnergyConGenData),JSON.parse(scope.buildingBaseLoadData),JSON.parse(scope.buildingEnergyNetUseData));
            });

            scope.$watchGroup(['startTimeStamp','endTimeStamp','powerUpperLimitData', 'powerLowerLimitData', 'electricityPriceData','pvFeedinPriceData','chpFeedinPriceData','pvEnergyGenerationData','chpEnergyConGenData','buildingBaseLoadData','buildingEnergyNetUseData','y1Label'], function(newValues, oldValues, scope) {

              if(scope.isRenderAll){
                d3.select(ele[0]).select("svg").remove();
              }

              scope.render(scope.isRenderAll, scope.isRenderY1,JSON.parse(scope.powerUpperLimitData),JSON.parse(scope.powerLowerLimitData),JSON.parse(scope.electricityPriceData),JSON.parse(scope.pvFeedinPriceData),JSON.parse(scope.chpFeedinPriceData),JSON.parse(scope.pvEnergyGenerationData),JSON.parse(scope.chpEnergyConGenData),JSON.parse(scope.buildingBaseLoadData),JSON.parse(scope.buildingEnergyNetUseData));

            });

            scope.renderForEmptyData=function () {
              var svg1 = d3.select(ele[0]).append("svg:svg");
              svg1.selectAll('*').remove();
              width = $container.width();

              height =$container.height();

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
              var startSeconds=currentSeconds-24*60*60;
              var currentDate=moment.unix(currentSeconds);
              var startDate=moment.unix(startSeconds);

              var xScale = d3.time.scale()
                .range([0, width-margin.right-margin.left])
                .domain([startDate.toDate(),currentDate.toDate()])
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
                  var yValue=yScale1_down(d.y);
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
               // .style("fill",color_powerUpperLimit)
                .text(scope.y1Label)
                .style("font-size","x-medium");

              svg1.append("text")
                .attr("transform", "rotate(90)")
                .attr("y", -(width))
                .attr("x",( (height-margin.top-margin.bottom) / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                //.style("fill",color_elePrice)
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
                // .style("fill", function(d){
                //
                //   if(d>100){
                //     return color_powerUpperLimit;
                //   }
                //   return color_elePrice;
                // })
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

            scope.render=function(isRenderAll,isRenderY1,powerUpperLimitData,powerLowerLimitData,electricityPriceData,pvFeedinPriceData,chpFeedinPriceData,pvEnergyGenerationData,chpEnergyConGenData,buildingBaseLoadData,buildingEnergyNetUseData){

              /*if(electricityPriceData.length==0 && powerUpperLimitData.lengh==0 && pvFeedinPriceData.length==0 && chpFeedinPriceData.length==0 && pvEnergyGenerationData.length==0 && chpEnergyConGenData.length==0 && buildingBaseLoadData ==0 && buildingEnergyNetUseData.length==0){
                return;
              }*/
               var netEenrgyData=JSON.parse(scope.netEnergyData);
              if(netEenrgyData.length==0){
                return;
              }


              width = $container.width();
              //height =0.85*$container.height();
              height =$container.height();
              var svg;
              var svg1;

              var y1min=2000;
              var y1max=3500;

              var y1min_loadUpperLimit=2000;
              var y1max_loadUpperLimit=y1min_loadUpperLimit+1500;

              var y1min_buildingNetEnergyData=2000;
              var y1max_buildingNetEnergyData=y1min_buildingNetEnergyData + 1500;

              var y1min_buildingEnergyGenerationData=2000;
              var y1max_buildingEnergyGenerationData=y1min_buildingEnergyGenerationData + 1500;

              var y1min_pvEnergyGenerationData=2000;
              var y1max_pvEnergyGenerationData=y1min_pvEnergyGenerationData + 1500;

              var y1min_chpEnergyConGenData=2000;
              var y1max_chpEnergyConGenData=y1min_chpEnergyConGenData + 1500;

              var y1min_buildingBaseLoadData=2000;
              var y1max_buildingBaseLoadData=y1min_buildingBaseLoadData + 1500;

              var y1min_buildingEnergyNetUseData=2000;
              var y1max_buildingEnergyNetUseData=y1min_buildingEnergyNetUseData + 1500;

              var y2min=0;
              var y2max=48;

              var y2min_pvFeedin=0;
              var y2max_pvFeedin=0;
              var y2min_chpFeedin=0;
              var y2max_chpFeedin=0;

              var firstTime=scope.startTimeStamp;
              var lastTime=scope.endTimeStamp;

              if(powerUpperLimitData.length>0){
                y1min_loadUpperLimit=Math.min.apply(Math,powerUpperLimitData.map(function(o){return o.y;}));
                y1min_loadUpperLimit=y1min_loadUpperLimit-y1min_loadUpperLimit % 100;
                y1min_loadUpperLimit-=100;
                y1max_loadUpperLimit=y1min_loadUpperLimit+30;
                while(y1max_loadUpperLimit<Math.max.apply(Math,powerUpperLimitData.map(function(o){return o.y;}))){
                  y1max_loadUpperLimit+=30;
                }
                y1min=y1min_loadUpperLimit;
                y1max=y1max_loadUpperLimit;
              }


              if(pvEnergyGenerationData.length>0){
                y1min_pvEnergyGenerationData=Math.min.apply(Math,pvEnergyGenerationData.map(function(o){return o.y;}));
                y1min_pvEnergyGenerationData=y1min_pvEnergyGenerationData-y1min_pvEnergyGenerationData % 100;
                y1min_pvEnergyGenerationData-=100;
                y1max_pvEnergyGenerationData=y1min_pvEnergyGenerationData+30;
                while(y1max_pvEnergyGenerationData<Math.max.apply(Math,pvEnergyGenerationData.map(function(o){return o.y;}))){
                  y1max_pvEnergyGenerationData+=30;
                }
              }

              if(chpEnergyConGenData.length>0){
                y1min_chpEnergyConGenData=Math.min.apply(Math,chpEnergyConGenData.map(function(o){return o.y;}));
                y1min_chpEnergyConGenData=y1min_chpEnergyConGenData-y1min_chpEnergyConGenData % 100;
                y1min_chpEnergyConGenData-=100;
                y1max_chpEnergyConGenData=y1min_chpEnergyConGenData+30;
                while(y1max_chpEnergyConGenData<Math.max.apply(Math,chpEnergyConGenData.map(function(o){return o.y;}))){
                  y1max_chpEnergyConGenData+=30;
                }
              }

              if(buildingBaseLoadData.length>0) {
                y1min_buildingBaseLoadData = Math.min.apply(Math, buildingBaseLoadData.map(function (o) {
                  return o.y;
                }));
                y1min_buildingBaseLoadData = y1min_buildingBaseLoadData - y1min_buildingBaseLoadData % 100;
                y1min_buildingBaseLoadData -= 100;
                y1max_buildingBaseLoadData = y1min_buildingBaseLoadData + 30;
                while (y1max_buildingBaseLoadData < Math.max.apply(Math, buildingBaseLoadData.map(function (o) {
                  return o.y;
                }))) {
                  y1max_buildingBaseLoadData += 30;
                }
              }

              if(buildingEnergyNetUseData.length>0){
                y1min_buildingEnergyNetUseData=Math.min.apply(Math,buildingEnergyNetUseData.map(function(o){return o.y;}));
                y1min_buildingEnergyNetUseData=y1min_buildingEnergyNetUseData-y1min_buildingEnergyNetUseData % 100;
                y1min_buildingEnergyNetUseData-=100;
                y1max_buildingEnergyNetUseData=y1min_buildingEnergyNetUseData+30;
                while(y1max_buildingEnergyNetUseData<Math.max.apply(Math,buildingEnergyNetUseData.map(function(o){return o.y;}))){
                  y1max_buildingEnergyNetUseData+=30;
                }
              }

              var y1minArr=[];
              y1minArr.push(y1min_loadUpperLimit);
              y1minArr.push(y1min_pvEnergyGenerationData);
              y1minArr.push(y1min_chpEnergyConGenData);
              y1minArr.push(y1min_buildingBaseLoadData);
              y1minArr.push(y1min_buildingEnergyNetUseData);

              y1min=Math.min.apply(Math,y1minArr);

              var y1maxArr=[];
              y1maxArr.push(y1max_loadUpperLimit);
              y1maxArr.push(y1max_pvEnergyGenerationData);
              y1maxArr.push(y1max_chpEnergyConGenData);
              y1maxArr.push(y1max_buildingBaseLoadData);
              y1maxArr.push(y1max_buildingEnergyNetUseData);

              y1max=Math.max.apply(Math,y1maxArr);


              var yAbsMax=Math.max(Math.abs(y1min),Math.abs(y1max));
              y1max=yAbsMax;
              y1min=-yAbsMax;

              var yValues1=[];
              var diff=yAbsMax/4;

              for(var i =-yAbsMax; i<0;i=i+diff){
                yValues1.push(i);
              }

              for(var i =0; i<=yAbsMax;i=i+diff){
                yValues1.push(i);
              }
              if(electricityPriceData.length>0){
                // y2min=Math.min.apply(Math,electricityPriceData.map(function(o){return o.y;}));
                // y2min=y2min-y2min % 10;
                y2min=0;
                y2max=y2min+4;
                while(y2max<Math.max.apply(Math,electricityPriceData.map(function(o){return o.y;}))){
                  y2max+=4;
                }
              }
             /* var yValues2=[];
              var diff=(y2max-y2min)/3;
              for(var i =y2min; i<=y2max;i=i+diff){
                yValues2.push(i);
              }*/

              var yValues2=[];
              var diff=y2max/4;
              for(var i =0; i<=y2max;i=i+diff){
                yValues2.push(i);
              }

              if(pvFeedinPriceData.length>0){
                y2min_pvFeedin=Math.min.apply(Math,pvFeedinPriceData.map(function(o){return o.y;}));
                y2max_pvFeedin=Math.max.apply(Math,pvFeedinPriceData.map(function(o){return o.y;}));
              }
              if(chpFeedinPriceData.length>0){
                y2min_chpFeedin=Math.min.apply(Math,chpFeedinPriceData.map(function(o){return o.y;}));
                y2max_chpFeedin=Math.max.apply(Math,chpFeedinPriceData.map(function(o){return o.y;}));
              }

              //var y2min_feedin=6;
              var y2min_feedin=0;
              var y2max_feedin=12;
              while(y2max_feedin<Math.max(y2max_pvFeedin,y2max_chpFeedin)){
                y2max_feedin+=4;
              }
              var yValues2_feedin=[];
              var diff=(y2max_feedin-y2min_feedin)/4;
              for(var i =0; i<=y2max_feedin;i=i+diff){
                yValues2_feedin.push(i);
              }

              var zeroLineHeight=(height-margin.bottom-margin.top)/2-(height-margin.bottom)*0.05;

              var yScale1 = d3.scale.linear()
                .domain([y1min, y1max])
                //.range([(margin.top+zeroLineHeight)*0.85, margin.top]);
                .range([(height-margin.bottom)*0.9, margin.top]);

              var yScale2 = d3.scale.linear()
                .domain([y2min, y2max])
               // .range([(margin.top+zeroLineHeight)*0.85, margin.top]);
                .range([margin.top+ zeroLineHeight, margin.top]);
               // .range([(height-margin.bottom)*0.9, margin.top]);

              var yScale1_down = d3.scale.linear()
                // .domain([y1max,y1min])
                // .range([(height-margin.bottom)*0.9, (zeroLineHeight+ margin.top)*1.15]);
                .domain([y1min, y1max])
                .range([(height-margin.bottom)*0.9, margin.top]);


              var yScale2_down = d3.scale.linear()
                 .domain([y2max_feedin,y2min_feedin])
                // .range([(height-margin.bottom)*0.9, (zeroLineHeight+ margin.top)*1.15]);
                .range([(height-margin.bottom)*0.9, (zeroLineHeight+ margin.top)]);
               // .domain([y2min_feedin, y2max_feedin])
               // .range([(height-margin.bottom)*0.9, margin.top]);

              var yAxis1 = d3.svg.axis()
                .scale(yScale1)
                .ticks(9)
                .tickValues( yValues1 )
                .orient("left")
                .innerTickSize(-(width-margin.left-margin.right))
                .outerTickSize(0)
                .tickPadding(10);


              var yAxis2 = d3.svg.axis()
                .scale(yScale2)
                //.tickValues([10, 20, 30,40])
                .ticks(4)
                .tickValues( yValues2 )
                .orient("right")
                .innerTickSize(-(width-margin.left-margin.right))
                .outerTickSize(0)
                .tickPadding(10);

              var yAxis1_down = d3.svg.axis()
                .scale(yScale1_down)
                //.tickValues([1500, 2000, 2500,3000])
                .ticks(4)
                .tickValues(yValues1)
                .orient("left")
                .innerTickSize(-(width-margin.left-margin.right))
                .outerTickSize(0)
                .tickPadding(10);

              var yAxis2_down = d3.svg.axis()
                .scale(yScale2_down)
                //.tickValues([10, 20, 30,40])
                .ticks(4)
                .tickValues(yValues2_feedin)
                .orient("right")
                .innerTickSize(-(width-margin.left-margin.right))
                .outerTickSize(0)
                .tickPadding(10);


              if(isRenderAll){
                d3.select(ele[0]).select("svg").remove();
                svg1 = d3.select(ele[0]).append("svg:svg");

                svg1.selectAll('*').remove();

                svg1.attr("width", width )
                  .attr("height", height)
                  .attr("id","svg1")
                ;
                var svg2=svg1.append("svg")
                  .attr("id","svg2")
                  .attr("width", width)
                  .attr("height", height);

                svg=svg2.append("g")
                  .attr("id","group1")
                  .attr("transform", "translate("+margin.left+","+0+")");


              }
              else {
                svg=d3.select("#group1");
                svg1=d3.select("#svg1");
              }

              var currentDate=moment.unix(firstTime);

              var xScale = d3.time.scale()
                .range([0, width-margin.right-margin.left])
                .domain([convertToDate(firstTime),convertToDate(lastTime)])
              ;

              if(isRenderAll){
                svg.append("line")          // attach a line
                  .style("stroke", "#424242")  // colour the line
                  .style("stroke-width", "1")
                  .attr("x1", 0)     // x position of the first end of the line
                  .attr("y1", margin.top+ zeroLineHeight)      // y position of the first end of the line
                  .attr("x2", width-margin.right-margin.left)     // x position of the second end of the line
                  .attr("y2", margin.top+ zeroLineHeight);

            /*    svg1.append("text")          // attach a line
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
                  .style("font-size","x-medium");;*/
              }

              var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom")
                .innerTickSize(-height)
                .outerTickSize(-height)
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
                  var yValue=yScale1_down(d.y);
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

              if(isRenderAll){
                var axis1 =svg.append("g")
                  .attr("class", "x axis")
                  .attr("id", "xAxis")
                  .attr("transform", "translate(0," + yTranslate + ")")
                  .call(xAxis);

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
                  .attr("id", "yAxisTop1")
                  .attr("transform", "translate("+0+",0)")
                  .call(yAxis1);

                svg.append("g")
                  .attr("class", "y axis")
                  .attr("id", "yAxisTop2")
                  .attr("transform", "translate("+(width-margin.right-margin.left)+",0)")
                  .call(yAxis2);

               /* svg.append("g")
                  .attr("class", "y axis")
                  .attr("id", "yAxisDown1")
                  .attr("transform", "translate("+0+",0)")
                  .call(yAxis1_down);*/

                svg.append("g")
                  .attr("class", "y axis")
                  .attr("id", "yAxisDown2")
                  .attr("transform", "translate("+(width-margin.right-margin.left)+",0)")
                  .call(yAxis2_down);



              }else{

                var yAxisTop1=d3.select("#yAxisTop1");
                var yAxisTop2=d3.select("#yAxisTop2");
                var yAxisDown1=d3.select("#yAxisDown1");
                var yAxisDown2=d3.select("#yAxisDown2");

                yAxisTop1.call(yAxis1);
                yAxisTop2.call(yAxis2);
                yAxisDown1.call(yAxis1_down);
                yAxisDown2.call(yAxis2_down);
              }

              d3.select("#y1Label").remove();
              d3.select("#y2Label").remove();

              svg.append("text")
                .attr("id","y1Label")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left)
                .attr("x",0 - ( (height-margin.top-margin.bottom) / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                //.style("fill",color_powerUpperLimit)
                .text(scope.y1Label)
                .style("font-size","x-medium");

              svg1.append("text")
                .attr("id","y2Label")
                .attr("transform", "rotate(90)")
                .attr("y", -(width))
                .attr("x",( (height-margin.top-margin.bottom) / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                // .style("fill",color_elePrice)
                .text(scope.y2Label)
                .style("font-size","x-medium");


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


              svg.selectAll(".axis line")
                .style("stroke-width",function(d){
                  return "2";
                })
                .style("stroke-dasharray", ("2, 6"))
                .style("stroke","lightgrey")
                .style("shape-rendering","crispEdges")
                .style("fill","none");

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
                .style("font-size","11px");


              svg.selectAll(".axis path")
                .style("fill","none");

              svg.selectAll(".x.axis text")
                .style("fill","#2E2E2E")
                .style("font-family","sans-serif")
                .style("font-size","11px");

              var mouseG = svg.append("g")
                .attr("class", "mouse-over-effects");

              var test=[
                {"x": "", "y": ""},
                {"x": "", "y": ""},
                {"x": "", "y": ""},
                {"x": "", "y": ""},
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
                  var pvEnergyGenerationValue;
                  var chpEnergyConGenValue;
                  var buildingBaseLoadValue;
                  var buildingEnergyNetUseValue;

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
                          powerLowerLimitValue=yScale1.invert(pos.y).toFixed(0)+" W";
                          d3.select(this).select('text')
                            .text(""+xValue+" : "+yScale1.invert(pos.y).toFixed(0)+" W");
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

                        if(lines[i].id=='line8'){
                          pvEnergyGenerationValue=yScale1.invert(pos.y).toFixed(0)+" W";
                          d3.select(this).select('text')
                            .text(""+xValue+" : "+yScale1.invert(pos.y).toFixed(0)+" W");
                        }
                        if(lines[i].id=='line9'){
                          buildingBaseLoadValue=yScale1.invert(pos.y).toFixed(0)+" W";
                          d3.select(this).select('text')
                            .text(""+xValue+" : "+yScale1.invert(pos.y).toFixed(0)+" W");
                        }
                        if(lines[i].id=='line10'){
                          chpEnergyConGenValue=yScale1.invert(pos.y).toFixed(0)+" W";
                          d3.select(this).select('text')
                            .text(""+xValue+" : "+yScale1.invert(pos.y).toFixed(0)+" W");
                        }
                        if(lines[i].id=='line11'){
                          buildingEnergyNetUseValue=yScale1.invert(pos.y).toFixed(0)+" W";
                          d3.select(this).select('text')
                            .text(""+xValue+" : "+yScale1.invert(pos.y).toFixed(0)+" W");
                        }

                        div
                          .style("opacity", .9);

                        var s_Top = document.documentElement.scrollTop || document.body.scrollTop;
                        var s_Left = document.documentElement.scrollLeft || document.body.scrollLeft;

                        var htmlString="<p style='margin-bottom: 0px;margin-top: 0px'><b><u>Time: "+xValue +"</u></b></p>";
                        if(powerUpperLimitData.length>0){
                          htmlString+="<p style='margin-bottom: 0px'><b>"+scope.loadLimitLabel+": [ "+powerLowerLimitValue+", "+powerUpperLimitValue+" ]</b></p>";
                        }
                      /*  if(powerLowerLimitData.length>0){
                          htmlString+= "<p style='margin-bottom: 0px'><b>Power Lower Limit: "+powerLowerLimitValue+"</b></p>";
                        }*/
                        if(electricityPriceData.length>0){
                          htmlString+="<p style='margin-bottom: 0px'><b>"+scope.electricityPriceLabel+": "+electricityPriceValue +"</b></p>"
                        }
                        if(pvFeedinPriceData.length>0){
                          htmlString+="<p style='margin-bottom: 0px'><b>"+scope.pvFeedinPriceLabel+": "+pvFeedinPriceValue+"</b></p>";
                        }
                        if(chpFeedinPriceData.length>0){
                          htmlString+="<p style='margin-bottom: 0px'><b>"+scope.chpFeedinPriceLabel+": "+chpFeedinPriceValue+"</b></p>";
                        }

                        if(pvEnergyGenerationData.length>0){
                          htmlString+="<p style='margin-bottom: 0px'><b>"+scope.pvEnergyLabel+": "+pvEnergyGenerationValue+"</b></p>";
                        }
                        if(chpEnergyConGenData.length>0){
                          htmlString+="<p style='margin-bottom: 0px'><b>"+scope.chpEnergyLabel+": "+buildingBaseLoadValue+"</b></p>";
                        }
                        if(buildingBaseLoadData.length>0){
                          htmlString+="<p style='margin-bottom: 0px'><b>"+scope.buildingBaseLoadLabel+": "+chpEnergyConGenValue+"</b></p>";
                        }
                        if(buildingEnergyNetUseData.length>0){
                          htmlString+="<p style='margin-bottom: 0px'><b>"+scope.buildingNetLoadLabel+": "+buildingEnergyNetUseValue+"</b></p>";
                        }

                        div	.html(htmlString)
                          // .style("left", mouse[0] + "px" )
                          // .style("top",pos.y + "px");
                          .style("left", (d3.event.pageX) + "px")
                          .style("top", (d3.event.pageY +25) + "px");


                        return "translate(" + mouse[0] + "," + pos.y +")";
                      }

                    });
                });

              var interval=2;
              var breakPoint=768;
              if($(window).width() < breakPoint) {
                interval=6;
              }

              var utcChange=false;
            //  if(isRenderAll){
                xAxis.scale(xScale)
                  .orient("bottom")
                   .ticks(d3.time.hour,2)
                  .tickFormat(function(d){
                    if(utcChange==false && moment().utcOffset()=="120" && moment(d).utcOffset()=="60"){
                      utcChange=true;
                      return;
                    }
                    var formatTime = d3.time.format("%H:%M");
                    var formatTime2 = d3.time.format("%d %b");//output Date instead of time
                    var time=formatTime(d);
                    if(time=="00:00"){
                      return formatTime2(d);
                    }
                    return formatTime(d);
                  })
                  .innerTickSize(-height)
                ;
              var axis1=d3.select("#xAxis");
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
             // }

              if(powerUpperLimitData.length>0){
                rect.attr('width', xScale(convertToDate(powerUpperLimitData[powerUpperLimitData.length-1].x)));
              }

                if(powerUpperLimitData.length>0){

                  var path1;
                  if(isRenderAll){
                    path1= svg.append("path")
                      .data([powerUpperLimitData])
                      .attr("class", "line")
                      .attr("d", line1)
                      .attr("id","line1")
                      .style("fill","none")
                      .style("stroke",color_powerUpperLimit)
                      .style("stroke-width",3);

                    var totalLength = path1.node().getTotalLength();
                    path1
                      .attr("stroke-dasharray", totalLength + " " + totalLength)
                      .attr("stroke-dashoffset", totalLength)
                      .transition()
                      .duration(2000)
                      .ease("linear")
                      .attr("stroke-dashoffset", 0)
                      .each("end", function(){
                        scope.isRenderAll=false;
                      });

                  }else{
                    var path=d3.select("path#line1");
                    if(path[0][0]==null){
                      path1= svg.append("path")
                        .data([powerUpperLimitData])
                        .attr("class", "line")
                        .attr("d", line1)
                        .attr("id","line1")
                        .style("fill","none")
                        .style("stroke",color_powerUpperLimit)
                        .style("stroke-width",3);

                      var totalLength = path1.node().getTotalLength();
                      path1
                        .attr("stroke-dasharray", totalLength + " " + totalLength)
                        .attr("stroke-dashoffset", totalLength)
                        .transition()
                        .duration(2000)
                        .ease("linear")
                        .attr("stroke-dashoffset", 0)
                        .each("end", function(){
                          scope.isRenderAll=false;
                        });
                    }else if(isRenderY1=='true'){
                      d3.select("path#line1").remove();
                      path1= svg.append("path")
                        .data([powerUpperLimitData])
                        .attr("class", "line")
                        .attr("d", line1)
                        .attr("id","line1")
                        .style("fill","none")
                        .style("stroke",color_powerUpperLimit)
                        .style("stroke-width",3);

                      var totalLength = path1.node().getTotalLength();
                      path1
                        .attr("stroke-dasharray", totalLength + " " + totalLength)
                        .attr("stroke-dashoffset", totalLength)
                        .transition()
                        .duration(2000)
                        .ease("linear")
                        .attr("stroke-dashoffset", 0)
                        .each("end", function(){
                          scope.isRenderAll=false;
                        });
                    }

                  }


                }else{

                  var path=d3.select("path#line1");
                  if(path[0][0]!=null){

                    var totalLength = path.node().getTotalLength();
                    path
                      .transition()
                      .duration(2000)
                      .ease("linear")
                      .attr("stroke-dashoffset", totalLength)
                      .each("end", function(){
                        d3.select("path#line1").remove();
                      });

                  }
                }



                if(electricityPriceData.length>0){

                  var path2;
                  if(isRenderAll){
                    path2= svg.append("path")
                      .data([electricityPriceData])
                      .attr("class", "line")
                      .attr("d", line2)
                      .attr("id","line2")
                      .style("fill","none")
                      .style("stroke",color_elePrice)
                      .style("stroke-width",3);
                  }else{
                    var path=d3.select("path#line2");
                    if(path[0][0]==null){
                      path2= svg.append("path")
                        .data([electricityPriceData])
                        .attr("class", "line")
                        .attr("d", line2)
                        .attr("id","line2")
                        .style("fill","none")
                        .style("stroke",color_elePrice)
                        .style("stroke-width",3);
                    }
                  }
                  if(path2 != null){
                    var totalLength = path2.node().getTotalLength();
                    path2
                      .attr("stroke-dasharray", totalLength + " " + totalLength)
                      .attr("stroke-dashoffset", totalLength)
                      .transition()
                      .duration(1000)
                      .ease("linear")
                      .attr("stroke-dashoffset", 0)
                      .each("end", function(){
                        scope.isRenderAll=false;
                      });
                  }

                }else{
                  console.log("removeeeeeeeeeeeeeeeee");

                  var path=d3.select("path#line2");
                  if(path[0][0]!=null){

                    var totalLength = path.node().getTotalLength();
                    path
                      .transition()
                      .duration(2000)
                      .ease("linear")
                      .attr("stroke-dashoffset", totalLength)
                      .each("end", function(){
                        d3.select("path#line2").remove();
                      });
                  }
                }

                if(powerLowerLimitData.length>0){

                  var path3;

                  if(isRenderAll){
                    path3= svg.append("path")
                      .data([powerLowerLimitData])
                      .style("fill","none")
                      .attr("class", "line")
                      .attr("d", line3)
                      .attr("id","line3")
                      .style("stroke",color_powerLowerLimit)
                      .style("stroke-width",3);

                    var totalLength = path3.node().getTotalLength();
                    path3
                      .attr("stroke-dasharray", totalLength + " " + totalLength)
                      .attr("stroke-dashoffset", totalLength)
                      .transition()
                      .duration(2000)
                      .ease("linear")
                      .attr("stroke-dashoffset", 0)
                      .each("end", function(){
                        scope.isRenderAll=false;
                      });

                  }else{
                    var path=d3.select("path#line3");
                    if(path[0][0]==null){
                      path3= svg.append("path")
                        .data([powerLowerLimitData])
                        .style("fill","none")
                        .attr("class", "line")
                        .attr("d", line3)
                        .attr("id","line3")
                        .style("stroke",color_powerLowerLimit)
                        .style("stroke-width",3);

                      var totalLength = path3.node().getTotalLength();
                      path3
                        .attr("stroke-dasharray", totalLength + " " + totalLength)
                        .attr("stroke-dashoffset", totalLength)
                        .transition()
                        .duration(2000)
                        .ease("linear")
                        .attr("stroke-dashoffset", 0)
                        .each("end", function(){
                          scope.isRenderAll=false;
                        });
                    }else if(isRenderY1=='true') {
                      d3.select("path#line3").remove();
                      path3= svg.append("path")
                        .data([powerLowerLimitData])
                        .style("fill","none")
                        .attr("class", "line")
                        .attr("d", line3)
                        .attr("id","line3")
                        .style("stroke",color_powerLowerLimit)
                        .style("stroke-width",3);

                      var totalLength = path3.node().getTotalLength();
                      path3
                        .attr("stroke-dasharray", totalLength + " " + totalLength)
                        .attr("stroke-dashoffset", totalLength)
                        .transition()
                        .duration(2000)
                        .ease("linear")
                        .attr("stroke-dashoffset", 0)
                        .each("end", function(){
                          scope.isRenderAll=false;
                        });

                    }


                  }
                  if(path3 != null){

                  }

                }else{
                  var path=d3.select("path#line3");
                  if(path[0][0]!=null){

                    var totalLength = path.node().getTotalLength();
                    path
                      .transition()
                      .duration(2000)
                      .ease("linear")
                      .attr("stroke-dashoffset", totalLength)
                      .each("end", function(){
                        d3.select("path#line3").remove();
                      });
                  }
                }

                if(pvFeedinPriceData.length>0){
                  var path4;
                  if(isRenderAll){
                    path4= svg.append("path")
                      .data([pvFeedinPriceData])
                      .attr("class", "line")
                      .attr("d", line4)
                      .attr("id","line4")
                      .style("fill","none")
                      .style("stroke",color_pvFeedin)
                      .style("stroke-width",3);
                  }else{
                    var path=d3.select("path#line4");
                    if(path[0][0]==null){
                      path4= svg.append("path")
                        .data([pvFeedinPriceData])
                        .attr("class", "line")
                        .attr("d", line4)
                        .attr("id","line4")
                        .style("fill","none")
                        .style("stroke",color_pvFeedin)
                        .style("stroke-width",3);
                    }
                  }

                  if(path4 != null){
                    var totalLength = path4.node().getTotalLength();
                    path4
                      .attr("stroke-dasharray", totalLength + " " + totalLength)
                      .attr("stroke-dashoffset", totalLength)
                      .transition()
                      .duration(2000)
                      .ease("linear")
                      .attr("stroke-dashoffset", 0)
                      .each("end", function(){
                        scope.isRenderAll=false;
                      });
                  }

                }else{
                  var path=d3.select("path#line4");
                  if(path[0][0]!=null){

                    var totalLength = path.node().getTotalLength();
                    path
                      .transition()
                      .duration(2000)
                      .ease("linear")
                      .attr("stroke-dashoffset", totalLength)
                      .each("end", function(){
                        d3.select("path#line4").remove();
                      });
                  }
                }

                if(chpFeedinPriceData.length>0){
                  var path5;
                  if(isRenderAll){
                    path5= svg.append("path")
                      .data([chpFeedinPriceData])
                      .attr("class", "line")
                      .attr("d", line5)
                      .attr("id","line5")
                      .style("fill","none")
                      .style("stroke",color_chpFeedin)
                      .style("stroke-width",3);
                  }else{
                    var path=d3.select("path#line5");
                    if(path[0][0]==null){
                      path5= svg.append("path")
                        .data([chpFeedinPriceData])
                        .attr("class", "line")
                        .attr("d", line5)
                        .attr("id","line5")
                        .style("fill","none")
                        .style("stroke",color_chpFeedin)
                        .style("stroke-width",3);
                    }
                  }
                  if(path5 != null){
                    var totalLength = path5.node().getTotalLength();
                    path5
                      .attr("stroke-dasharray", totalLength + " " + totalLength)
                      .attr("stroke-dashoffset", totalLength)
                      .transition()
                      .duration(1000)
                      .ease("linear")
                      .attr("stroke-dashoffset", 0)
                      .each("end", function(){
                        scope.isRenderAll=false;
                      });
                  }
                }else{

                  var path=d3.select("path#line5");
                  if(path[0][0]!=null){

                    var totalLength = path.node().getTotalLength();
                    path
                      .transition()
                      .duration(2000)
                      .ease("linear")
                      .attr("stroke-dashoffset", totalLength)
                      .each("end", function(){
                        d3.select("path#line5").remove();
                      });
                  }
                }




              if(pvEnergyGenerationData.length>0){

                var path8;
                if(isRenderAll){
                  path8= svg.append("path")
                    .data([pvEnergyGenerationData])
                    .attr("class", "line")
                    .attr("d", line1)
                    .attr("id","line8")
                    .style("fill","none")
                    .style("stroke",color_pvEnergyGenerationData)
                    .style("stroke-width",3);

                  var totalLength = path8.node().getTotalLength();
                  path8
                    .attr("stroke-dasharray", totalLength + " " + totalLength)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                    .duration(1000)
                    .ease("linear")
                    .attr("stroke-dashoffset", 0)
                    .each("end", function(){
                      scope.isRenderAll=false;

                    });
                }else{
                  var path=d3.select("path#line8");
                  if(path[0][0]==null){

                    path8= svg.append("path")
                      .data([pvEnergyGenerationData])
                      .attr("class", "line")
                      .attr("d", line1)
                      .attr("id","line8")
                      .style("fill","none")
                      .style("stroke",color_pvEnergyGenerationData)
                      .style("stroke-width",3);

                    var totalLength = path8.node().getTotalLength();
                    path8
                      .attr("stroke-dasharray", totalLength + " " + totalLength)
                      .attr("stroke-dashoffset", totalLength)
                      .transition()
                      .duration(1000)
                      .ease("linear")
                      .attr("stroke-dashoffset", 0)
                      .each("end", function(){
                        scope.isRenderAll=false;

                      });

                    /*if(isRenderY1=='true'){
                      var path_line1=d3.select("path#line1");

                      if(path_line1[0][0]!=null){
                        d3.select("path#line1").remove();
                        d3.select("path#line3").remove();

                        svg.append("path")
                          .data([powerUpperLimitData])
                          .attr("class", "line")
                          .attr("d", line1)
                          .attr("id","line1")
                          .style("fill","none")
                          .style("stroke",color_powerUpperLimit)
                          .style("stroke-width",3);


                        svg.append("path")
                          .data([powerLowerLimitData])
                          .attr("class", "line")
                          .attr("d", line3)
                          .attr("id","line3")
                          .style("fill","none")
                          .style("stroke",color_powerLowerLimit)
                          .style("stroke-width",3);

                      }
                    }*/


                  }else if(isRenderY1=='true') {
                    d3.select("path#line8").remove();
                    path8= svg.append("path")
                      .data([pvEnergyGenerationData])
                      .attr("class", "line")
                      .attr("d", line1)
                      .attr("id","line8")
                      .style("fill","none")
                      .style("stroke",color_pvEnergyGenerationData)
                      .style("stroke-width",3);

                    var totalLength = path8.node().getTotalLength();
                    path8
                      .attr("stroke-dasharray", totalLength + " " + totalLength)
                      .attr("stroke-dashoffset", totalLength)
                      .transition()
                      .duration(1000)
                      .ease("linear")
                      .attr("stroke-dashoffset", 0)
                      .each("end", function(){
                        scope.isRenderAll=false;

                      });
                  }
                }


              }else{

                var path=d3.select("path#line8");
                if(path[0][0]!=null){

                  var totalLength = path.node().getTotalLength();
                  path
                    .transition()
                    .duration(2000)
                    .ease("linear")
                    .attr("stroke-dashoffset", totalLength)
                    .each("end", function(){
                      d3.select("path#line8").remove();
                    });
                }



              }

              if(chpEnergyConGenData.length>0){

                var path9;
                if(isRenderAll){
                  path9= svg.append("path")
                    .data([chpEnergyConGenData])
                    .attr("class", "line")
                    .attr("d", line1)
                    .attr("id","line9")
                    .style("fill","none")
                    .style("stroke",color_chpEnergyConGenData)
                    .style("stroke-width",3);

                  var totalLength = path9.node().getTotalLength();
                  path9
                    .attr("stroke-dasharray", totalLength + " " + totalLength)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                    .duration(1000)
                    .ease("linear")
                    .attr("stroke-dashoffset", 0)
                    .each("end", function(){
                      scope.isRenderAll=false;

                    });
                }else{
                  var path=d3.select("path#line9");
                  if(path[0][0]==null){

                    path9= svg.append("path")
                      .data([chpEnergyConGenData])
                      .attr("class", "line")
                      .attr("d", line1)
                      .attr("id","line9")
                      .style("fill","none")
                      .style("stroke",color_chpEnergyConGenData)
                      .style("stroke-width",3);

                    var totalLength = path9.node().getTotalLength();
                    path9
                      .attr("stroke-dasharray", totalLength + " " + totalLength)
                      .attr("stroke-dashoffset", totalLength)
                      .transition()
                      .duration(1000)
                      .ease("linear")
                      .attr("stroke-dashoffset", 0)
                      .each("end", function(){
                        scope.isRenderAll=false;

                      });

                  }else if(isRenderY1=='true') {
                    d3.select("path#line9").remove();
                    path9= svg.append("path")
                      .data([chpEnergyConGenData])
                      .attr("class", "line")
                      .attr("d", line1)
                      .attr("id","line9")
                      .style("fill","none")
                      .style("stroke",color_chpEnergyConGenData)
                      .style("stroke-width",3);

                    var totalLength = path9.node().getTotalLength();
                    path9
                      .attr("stroke-dasharray", totalLength + " " + totalLength)
                      .attr("stroke-dashoffset", totalLength)
                      .transition()
                      .duration(1000)
                      .ease("linear")
                      .attr("stroke-dashoffset", 0)
                      .each("end", function(){
                        scope.isRenderAll=false;

                      });
                  }
                }

              }else{

                var path=d3.select("path#line9");
                if(path[0][0]!=null){

                  var totalLength = path.node().getTotalLength();
                  path
                    .transition()
                    .duration(2000)
                    .ease("linear")
                    .attr("stroke-dashoffset", totalLength)
                    .each("end", function(){
                      d3.select("path#line9").remove();
                    });
                }
              }

              if(buildingBaseLoadData.length>0){

                var path10;
                if(isRenderAll){
                  path10= svg.append("path")
                    .data([buildingBaseLoadData])
                    .attr("class", "line")
                    .attr("d", line1)
                    .attr("id","line10")
                    .style("fill","none")
                    .style("stroke",color_buildingBaseLoadData)
                    .style("stroke-width",3);

                  var totalLength = path10.node().getTotalLength();
                  path10
                    .attr("stroke-dasharray", totalLength + " " + totalLength)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                    .duration(1000)
                    .ease("linear")
                    .attr("stroke-dashoffset", 0)
                    .each("end", function(){
                      scope.isRenderAll=false;

                    });
                }else{
                  var path=d3.select("path#line10");
                  if(path[0][0]==null){

                    path10= svg.append("path")
                      .data([buildingBaseLoadData])
                      .attr("class", "line")
                      .attr("d", line1)
                      .attr("id","line10")
                      .style("fill","none")
                      .style("stroke",color_buildingBaseLoadData)
                      .style("stroke-width",3);

                    var totalLength = path10.node().getTotalLength();
                    path10
                      .attr("stroke-dasharray", totalLength + " " + totalLength)
                      .attr("stroke-dashoffset", totalLength)
                      .transition()
                      .duration(1000)
                      .ease("linear")
                      .attr("stroke-dashoffset", 0)
                      .each("end", function(){
                        scope.isRenderAll=false;

                      });

                  }else if(isRenderY1=='true') {
                    d3.select("path#line10").remove();

                    path10= svg.append("path")
                      .data([buildingBaseLoadData])
                      .attr("class", "line")
                      .attr("d", line1)
                      .attr("id","line10")
                      .style("fill","none")
                      .style("stroke",color_buildingBaseLoadData)
                      .style("stroke-width",3);

                    var totalLength = path10.node().getTotalLength();
                    path10
                      .attr("stroke-dasharray", totalLength + " " + totalLength)
                      .attr("stroke-dashoffset", totalLength)
                      .transition()
                      .duration(1000)
                      .ease("linear")
                      .attr("stroke-dashoffset", 0)
                      .each("end", function(){
                        scope.isRenderAll=false;

                      });

                  }
                }

              }else{

                var path=d3.select("path#line10");
                if(path[0][0]!=null){

                  var totalLength = path.node().getTotalLength();
                  path
                    .transition()
                    .duration(2000)
                    .ease("linear")
                    .attr("stroke-dashoffset", totalLength)
                    .each("end", function(){
                      d3.select("path#line10").remove();
                    });
                }

              }

              if(buildingEnergyNetUseData.length>0){

                var path11;
                if(isRenderAll){
                  path11= svg.append("path")
                    .data([buildingEnergyNetUseData])
                    .attr("class", "line")
                    .attr("d", line1)
                    .attr("id","line11")
                    .style("fill","none")
                    .style("stroke",color_buildingEnergyNetUseData)
                    .style("stroke-width",3);

                  var totalLength = path11.node().getTotalLength();
                  path11
                    .attr("stroke-dasharray", totalLength + " " + totalLength)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                    .duration(1000)
                    .ease("linear")
                    .attr("stroke-dashoffset", 0)
                    .each("end", function(){
                      scope.isRenderAll=false;

                    });
                }else{
                  var path=d3.select("path#line11");
                  if(path[0][0]==null){

                    path11= svg.append("path")
                      .data([buildingEnergyNetUseData])
                      .attr("class", "line")
                      .attr("d", line1)
                      .attr("id","line11")
                      .style("fill","none")
                      .style("stroke",color_buildingEnergyNetUseData)
                      .style("stroke-width",3);

                    var totalLength = path11.node().getTotalLength();
                    path11
                      .attr("stroke-dasharray", totalLength + " " + totalLength)
                      .attr("stroke-dashoffset", totalLength)
                      .transition()
                      .duration(1000)
                      .ease("linear")
                      .attr("stroke-dashoffset", 0)
                      .each("end", function(){
                        scope.isRenderAll=false;

                      });

                  }else if(isRenderY1=='true') {
                    d3.select("path#line11").remove();
                    path11= svg.append("path")
                      .data([buildingEnergyNetUseData])
                      .attr("class", "line")
                      .attr("d", line1)
                      .attr("id","line11")
                      .style("fill","none")
                      .style("stroke",color_buildingEnergyNetUseData)
                      .style("stroke-width",3);

                    var totalLength = path11.node().getTotalLength();
                    path11
                      .attr("stroke-dasharray", totalLength + " " + totalLength)
                      .attr("stroke-dashoffset", totalLength)
                      .transition()
                      .duration(1000)
                      .ease("linear")
                      .attr("stroke-dashoffset", 0)
                      .each("end", function(){
                        scope.isRenderAll=false;

                      });
                  }
                }

              }else{

                var path=d3.select("path#line11");
                if(path[0][0]!=null){

                  var totalLength = path.node().getTotalLength();
                  path
                    .transition()
                    .duration(2000)
                    .ease("linear")
                    .attr("stroke-dashoffset", totalLength)
                    .each("end", function(){
                      d3.select("path#line11").remove();
                    });
                }
              }



              function convertToDate (dateString){

                return moment.unix(dateString).toDate();

              }


            }


          })
        }
      }
    }])
})();
