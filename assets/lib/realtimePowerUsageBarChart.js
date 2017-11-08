/**
 * Created by pg9501 on 21.07.2016.
 */

(function () {
  'use strict';

  angular
    .module('app.dweller.energy-flows')
    .directive('realtimePowerUsageBarChart', ['$window', 'd3Service', function ($window, d3Service) {
      return {
        restrict: 'EA',
        scope: {
          powerConsuming: '=',
          powerGenerating: '='
        },
        link: function (scope, ele, attrs) {
          d3Service.d3().then(function (d3) {

            var margin = {top: 20, right: 10, bottom: 30, left: 30},
              width = 270,
              height = 220,
              xRoundBands = 0.2;

            /*var data=[{key : "Consuming", value : 200}];*/
          /*  var data=vm.data;

            var data2=[{key : "Generating", value : 100}];*/

            var svg = d3.select(this)
              .append("svg")
              .attr("width", width)
              .attr("height", height);




            var zeroLineHeight=(height-margin.bottom-margin.top)/2;

            var xScale = d3.scale.ordinal()
              .domain(["Consuming", "Generating", "Net"])
              .rangeBands([margin.left, width-margin.right-margin.left], 0.2);
            var xAxis = d3.svg.axis()
              .scale(xScale)
              .ticks(0)
              .orient("bottom")
              .tickFormat("");

            var xAxis2 = d3.svg.axis()
              .scale(xScale)
              .orient("bottom");

            svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," +(margin.top+ zeroLineHeight) + ")")
              .call(xAxis);

            svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," +(height-margin.bottom) + ")")
              .call(xAxis2);

            var yScale = d3.scale.linear()
              .domain([0, 300])
              .range([margin.top+zeroLineHeight, margin.top]);

            var yScale2 = d3.scale.linear()
              .domain([300, 0])
              .range([height-margin.bottom, zeroLineHeight+ margin.top]);

            var yAxis = d3.svg.axis()
              .scale(yScale)
              .orient("left")
              .ticks(3);

            var yAxis2 = d3.svg.axis()
              .scale(yScale2)
              .orient("left")
              .ticks(3);

//Create Y axis
            svg.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(" +margin.left + ",0)")
              .call(yAxis);

//Create Y axis
            svg.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(" +margin.left + ",0)")
              .call(yAxis2);

//Create bars
            svg.selectAll("rect")
              .data(powerConsuming, function(d){
                return d.key;
              })
              .enter()
              .append("rect")
              .style("fill", "green")
              .style("stroke", "green")
              .attr("x", function(d, i) {
                return xScale(d.key);
              })
              .attr("y", function(d) {
                return yScale(d.value);
              })
              .attr("width", xScale.rangeBand())
              .attr("height", function(d) {
                return height-margin.bottom-zeroLineHeight- yScale(d.value) ;
              })
              .on("click",function(d){
                alert("hello");
              });


//Create bars
            svg.selectAll("rect")
              .data(powerGenerating, function(d){
                return d.key;
              })
              .enter()
              .append("rect")
              .style("fill", "red")
              .style("stroke", "red")
              .attr("x", function(d, i) {
                return xScale(d.key);
              })
              .attr("y", function(d) {
                return zeroLineHeight+margin.top;
              })
              .attr("width", xScale.rangeBand())
              .attr("height", function(d) {
                return yScale2(d.value) - zeroLineHeight-margin.top;
              })
              .on("click",function(d){
                alert("hello");
              });


          })
        }
      }
    }])
})






/*var margin = {top: 20, right: 10, bottom: 30, left: 30},
  width = 270,
  height = 220,
  xRoundBands = 0.2;

/!*var data=[{key : "Consuming", value : 200}];*!/
var data=vm.data;

var data2=[{key : "Generating", value : 100}];

var svg = d3.select("#div_RealtimePowerUsage")
  .append("svg")
  .attr("width", width)
  .attr("height", height);




var zeroLineHeight=(height-margin.bottom-margin.top)/2;

var xScale = d3.scale.ordinal()
  .domain(["Consuming", "Generating", "Net"])
  .rangeBands([margin.left, width-margin.right-margin.left], 0.2);
var xAxis = d3.svg.axis()
  .scale(xScale)
  .ticks(0)
  .orient("bottom")
  .tickFormat("");

var xAxis2 = d3.svg.axis()
  .scale(xScale)
  .orient("bottom");

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," +(margin.top+ zeroLineHeight) + ")")
  .call(xAxis);

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," +(height-margin.bottom) + ")")
  .call(xAxis2);

var yScale = d3.scale.linear()
  .domain([0, 300])
  .range([margin.top+zeroLineHeight, margin.top]);

var yScale2 = d3.scale.linear()
  .domain([300, 0])
  .range([height-margin.bottom, zeroLineHeight+ margin.top]);

var yAxis = d3.svg.axis()
  .scale(yScale)
  .orient("left")
  .ticks(3);

var yAxis2 = d3.svg.axis()
  .scale(yScale2)
  .orient("left")
  .ticks(3);

//Create Y axis
svg.append("g")
  .attr("class", "axis")
  .attr("transform", "translate(" +margin.left + ",0)")
  .call(yAxis);

//Create Y axis
svg.append("g")
  .attr("class", "axis")
  .attr("transform", "translate(" +margin.left + ",0)")
  .call(yAxis2);

//Create bars
svg.selectAll("rect")
  .data(data, function(d){
    return d.key;
  })
  .enter()
  .append("rect")
  .style("fill", "green")
  .style("stroke", "green")
  .attr("x", function(d, i) {
    return xScale(d.key);
  })
  .attr("y", function(d) {
    return yScale(d.value);
  })
  .attr("width", xScale.rangeBand())
  .attr("height", function(d) {
    return height-margin.bottom-zeroLineHeight- yScale(d.value) ;
  })
  .on("click",function(d){
    alert("hello");
  });


//Create bars
svg.selectAll("rect")
  .data(data2, function(d){
    return d.key;
  })
  .enter()
  .append("rect")
  .style("fill", "red")
  .style("stroke", "red")
  .attr("x", function(d, i) {
    return xScale(d.key);
  })
  .attr("y", function(d) {
    return zeroLineHeight+margin.top;
  })
  .attr("width", xScale.rangeBand())
  .attr("height", function(d) {
    return yScale2(d.value) - zeroLineHeight-margin.top;
  })
  .on("click",function(d){
    alert("hello");
  });*/



/*d3.select("#btn_test")
  .on("click", function() {

     var newNumber = Math.floor(Math.random() * 300);
     var newNumber2 = Math.floor(Math.random() * 300);

     data.shift();
     data2.shift();
     data.push({key : "Consuming", value : newNumber});
     data2.push({key : "Generating", value : newNumber2});

     var newNumber3 =newNumber2 - newNumber;
     var bars = svg.selectAll("rect").data(data);
     var bars2 = svg.selectAll("rect").data(data2);
    bars.enter()
      .append("rect")
      .style("fill", "green")
      .style("stroke", "green")
      .attr("x", function(d, i) {
        return xScale(d.key);
      })
      .attr("y", function(d) {
        return yScale(d.value);
      })
      .attr("width", xScale.rangeBand())
      .attr("height", function(d) {
        return height-margin.bottom-zeroLineHeight- yScale(d.value) ;
      })
      .on("click",function(d){
        alert("hello");
      });

     bars.transition()
     .duration(500)
     .style("fill", "red")
     .style("stroke", "red")
     .attr("x", function(d, i) {
     return xScale(d.key);
     })
     .attr("y", function(d) {
     return yScale(d.value);
     })
     .attr("width", xScale.rangeBand())
     .attr("height", function(d) {
     return height-margin.bottom-zeroLineHeight- yScale(d.value) ;
     });
    console.log(data[0]);
  });*/


