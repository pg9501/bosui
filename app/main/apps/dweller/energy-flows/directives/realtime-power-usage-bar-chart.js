/**
 * Created by pg9501 on 21.07.2016.
 */

(function () {
  'use strict';

  angular
    .module('app.dweller.energy-flows')
    .directive('realtimePowerUsageBarChart', ['$window', '$timeout','d3Service', function ($window, $timeout,d3Service) {
      return {
        restrict: 'EA',
        scope: {
         // consuming: "@",
         // generating: "@",
          data: "@",
          conLabel:"@",
          genLabel:"@",
          netLabel:"@"
        },
        link: function (scope, ele, attrs) {
          d3Service.d3().then(function (d3) {

           // var powerConsuming=JSON.parse(attrs.consuming);
           // var powerGenerating=JSON.parse(attrs.generating);
            var powerUsage=JSON.parse(attrs.data);

            var consumeColor="#FFA500";
            var generateColor="#64bd64";

            var $container=$('#'+attrs.containerId);



            var margin = {top: 20, right: 10, bottom: 50, left: 40},
              width = 270,
              //height = 350,
              //width= $container.width(),
              height =0.72*$container.height(),
              xRoundBands = 0.2;

            if(height<100){
              height=300;
            }

           // var svg = d3.select('#'+attrs.containerId)
            var svg = d3.select(ele[0])
              .append("svg")
              .attr("width", width)
              .attr("height", height);

            var insertLinebreaks = function (d) {
              var conLabel=attrs.conLabel;
              var genLabel=attrs.genLabel;
              var netLabel=attrs.netLabel;

              var powerUsage=JSON.parse(attrs.data);
              var powerConsuming=powerUsage[0].power;
              var powerGenerating=Math.abs(powerUsage[1].power);
              var powerNet=powerUsage[2].power;
              var el = d3.select(this);
              el.text('');
              if(d=="Con/Gen"){
                el.append('tspan').text(conLabel+": "+powerConsuming+" W").style('fill', consumeColor).style("font-size","11px");
                var tspan = el.append('tspan').text(genLabel+": "+powerGenerating+" W");
                tspan.attr('x', 0).attr('dy', '15').style("font-size","11px");
                tspan.style('fill',generateColor);
              }
              if(d=="Net"){
                el.append('tspan').text(netLabel).style("font-size","11px").style('fill', function(d){
                  if(powerNet>0){
                    return consumeColor;
                  }else if(powerNet<0){
                    return generateColor;
                  }

                });
                var tspan = el.append('tspan').text(Math.abs(powerNet)+" W");
                tspan.attr('x', 0).attr('dy', '15');
                if(powerNet<0){
                  tspan.style('fill',generateColor);
                }
                else{
                  tspan.style('fill',consumeColor);
                }
              }
            };

            scope.$watchGroup(['data','conLabel','genLabel','netLabel'], function(newValue, oldValue) {
              if (newValue){
                svg.selectAll('*').remove();
                action();
              }
            }, true);

            function action(){

              var powerUsage=JSON.parse(attrs.data);



              var zeroLineHeight=(height-margin.bottom-margin.top)/2;

              var xScale = d3.scale.ordinal()
                //.domain(["Consuming", "Generating", "Net"])
                .domain(["Con/Gen", "Net"])
                .rangeBands([margin.left, width-margin.right-margin.left], 0.2);

              var xAxis2 = d3.svg.axis()
                .scale(xScale)
                .orient("bottom");

              svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," +(height-margin.bottom) + ")")
                .call(xAxis2);

              var maxY1=Math.max(powerUsage[0].loadLimit+500,powerUsage[0].power+500);
              var maxY2=Math.max(Math.abs(powerUsage[1].loadLimit)+500,Math.abs(powerUsage[1].power)+500);
              var maxY=Math.max(maxY1,maxY2);

              var yScale = d3.scale.linear()
                .domain([0, maxY])
                .range([margin.top+zeroLineHeight, margin.top]);

              var yScale2 = d3.scale.linear()
                .domain([maxY, 0])
                .range([height-margin.bottom, zeroLineHeight+ margin.top]);

              var yAxis = d3.svg.axis()
                .scale(yScale)
                .orient("left")

                .ticks(4)
                ;


              var yAxis2 = d3.svg.axis()
                .scale(yScale2)
                .orient("left")
                .ticks(4)
                ;

//Create Y axis
              var g1= svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" +margin.left + ",0)")
                .call(yAxis);

//Create Y axis
              var g2= svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" +margin.left + ",0)")
                .call(yAxis2);

//Create bars
              svg.selectAll("rect")
                .data(powerUsage)
                .enter()
                .append("rect")
                .style("fill", function(d){
                  if(d.power>0){
                    return consumeColor;
                  }else{
                    return generateColor;
                  }
                })
                .attr("x", function(d, i) {
                  return xScale(d.key);
                })
                .attr("y", function(d) {
                  if(d.power>0){
                    return yScale(d.power);
                  }else{
                    return zeroLineHeight+margin.top;
                  }
                })
                .attr("width", xScale.rangeBand())
                .attr("height", function(d) {
                  if(d.power>0){
                    return height-margin.bottom-zeroLineHeight- yScale(d.power) ;
                  }else{
                    d.power=-d.power;
                    return yScale2(d.power) - zeroLineHeight-margin.top;
                  }
                })
                .transition()
                .duration(500);
         //     svg.selectAll('.x.axis.bottom g text').each(insertLinebreaks);

            /*  yScale.domain([0, powerUsage[0].loadLimit+500]);
              yScale2.domain([Math.abs(powerUsage[1].loadLimit)+500, 0]);

             // yScale.domain([0, 300]);
             // yScale2.domain([300, 0]);
              //Create Y axis
              g1.call(yAxis);
              //Create Y axis
              g2.call(yAxis2);*/

           /*   var bars = svg.selectAll("rect").data(powerUsage);

              bars.transition()
                .duration(500)
                .style("fill", function(d){
                  if(d.power>0){
                    return consumeColor;
                  }else{
                    return generateColor;
                  }
                })
                .attr("x", function(d, i) {
                  return xScale(d.key);
                })
                .attr("y", function(d) {
                  if(d.power>0){
                    return yScale(d.power);
                  }else{
                    return zeroLineHeight+margin.top;
                  }
                })
                .attr("width", xScale.rangeBand())
                .attr("height", function(d) {
                  if(d.power>0){
                    return height-margin.bottom-zeroLineHeight- yScale(d.power) ;
                  }else{
                    d.power=-d.power;
                    return yScale2(d.power) - zeroLineHeight-margin.top;
                  }
                });
*/
              svg.selectAll('.x.axis g text').each(insertLinebreaks);

            /*  svg.selectAll(".axis line")
                .style("stroke-width",function(d){
                  return "1";
                })
                .style("stroke","lightgrey")
                .style("shape-rendering","crispEdges");

              svg.selectAll(".axis path")
                .style("stroke-width",function(d){
                  return "1";
                })
                .style("stroke","lightgrey")
                .style("shape-rendering","crispEdges");*/

              svg.selectAll(".axis g text")
                .style("fill",function(d){
                 // console.log("dddddddddddddddd: "+d);
                  if(d==powerUsage[0].loadLimit){
                    return "red";
                  }
                 // return "grey";
                })
                //.style("stroke","grey")
                .style("shape-rendering","crispEdges");


              svg.append("line")
                .attr("x1", margin.left)
                .attr("y1", yScale(powerUsage[0].loadLimit))
                .attr("x2", width-margin.right-margin.left)
                .attr("y2", yScale(powerUsage[0].loadLimit))
                .attr("stroke-width", 1)
                .style("stroke-dasharray", ("3, 3"))
                .attr("stroke", "red");

              svg.append("line")
                .attr("x1", margin.left)
                .attr("y1", yScale2(Math.abs(powerUsage[1].loadLimit)))
                .attr("x2", width-margin.right-margin.left)
                .attr("y2", yScale2(Math.abs(powerUsage[1].loadLimit)))
                .attr("stroke-width", 1)
                .style("stroke-dasharray", ("3, 3"))
                .attr("stroke", "red");

              svg.selectAll(".axis path")
                .style("stroke-width",function(d){
                  return "2";
                })
                .style("stroke","#BDBDBD")
                .style("shape-rendering","crispEdges")
                .style("fill","none");

              svg.append("line")          // attach a line
                .style("stroke", "#BDBDBD")  // colour the line
                .style("stroke-width",2)
                .attr("x1", margin.left)     // x position of the first end of the line
                .attr("y1", margin.top+ zeroLineHeight)      // y position of the first end of the line
                .attr("x2", width-margin.right-margin.left)     // x position of the second end of the line
                .attr("y2", margin.top+ zeroLineHeight);

            }
          })
        }
      }
    }])
})();
