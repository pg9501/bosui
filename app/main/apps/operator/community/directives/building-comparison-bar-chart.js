/**
 * Created by pg9501 on 15.06.2017.
 */
(function () {
  'use strict';

  angular
    .module('app.operator.community')
    .directive('buildingComparisonBarChart', ['$window', 'd3Service', function ($window, d3Service) {
      return {
        restrict: 'EA',
        scope: {
           data: "@",
          title:"@"
        },
        link: function (scope, ele, attrs) {
          d3Service.d3().then(function (d3) {


            scope.$watchGroup([ 'data','title'], function(newValue, oldValue) {
              if (newValue){
                d3.select(ele[0]).select("svg").remove();
                render(JSON.parse(attrs.data),attrs.title);
              }
            }, true);

            function render(data,xTitle){


              xTitle = xTitle.split('_').join(' ');

              var xValues = data.map(function(t) {
                return t.x
              });

              var margin = {top: 20, right: 5, bottom: 50, left: 50};
// here, we want the full chart to be 700x200, so we determine
// the width and height by subtracting the margins from those values
              var fullWidth = $('#'+attrs.containerId).width()/2;
              var fullHeight = 200;
// the width and height values will be used in the ranges of our scales
              var width = fullWidth - margin.right - margin.left;
              var height = fullHeight - margin.top - margin.bottom;
              var svg = d3.select('#'+attrs.containerId).append('svg')
                .attr('width', fullWidth)
                .attr('height', fullHeight)
                // this g is where the bar chart will be drawn
                .append('g')
                // translate it to leave room for the left and top margins
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// x value determined by month
              var xScale = d3.scale.ordinal()
                .domain(xValues)
                .rangeBands([0, width], .1)
                ;

// the width of the bars is determined by the scale
              //var bandwidth = monthScale.bandwidth();
              var bandwidth=width/data.length -3;

// y value determined by temp
              var maxyValue = d3.max(data, function(d) { return d.y; });
              var yScale = d3.scale.linear()
                .domain([0, maxyValue])
                .range([height, 0])
                .nice();

             // var xAxis = d3.axisBottom(monthScale);
              var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom")
                .tickPadding(10);

            //  var yAxis = d3.axisLeft(tempScale);

              var yAxis = d3.svg.axis()
                .scale(yScale)
                //.tickValues([1500, 2000, 2500,3000])
                .orient("left")
                .tickPadding(10);

// draw the axes
              svg.append('g')
                .classed('x axis', true)
                .attr('transform', 'translate(0,' + height + ')')
                .call(xAxis);

              var yAxisEle = svg.append('g')
                .classed('y axis', true)
                .call(yAxis);

// add a label to the yAxis
              var yText = yAxisEle.append('text')
                .attr('transform', 'rotate(-90)translate(-' + height/2 + ',-10)')
                .style('text-anchor', 'middle')
                .style('fill', 'grey')
                .attr('dy', '-2.5em')
                .style('font-size', 12)
                .text('Quantity');

              // text label for the x axis
              svg.append("text")
                .attr("transform",
                  "translate(" + (width/2) + " ," +
                  (height + margin.top + 20) + ")")
                .style("text-anchor", "middle")
                .style('font-size', 12)
                .style('fill', 'grey')
                .text(xTitle);

              var barHolder = svg.append('g')
                .classed('bar-holder', true);

              svg.selectAll(".axis path")
                .style("stroke-width",function(d){
                  return "1";
                })
                .style("stroke","grey")
                .style("shape-rendering","crispEdges")
                .style("fill","none");

              svg.selectAll('.axis text')
                .style({
                  'font-family': 'sans-serif',
                  'font-size': '10px'
                });

              svg.selectAll('.axis line')
                .style('stroke', 'black');


// draw the bars
              var bars = barHolder.selectAll('rect.bar')
                .data(data)
                .enter().append('rect')
                .classed('bar', true)
                .attr('x', function(d, i) {
                  // the x value is determined using the
                  // month of the datum
                  return xScale(d.x)
                })
                .attr('width', bandwidth)
                .style({
                  'fill': 'steelblue',
                  'fill-opacity': 0.6
                })
                .attr('y', function(d) {
                  // the y position is determined by the datum's temp
                  // this value is the top edge of the rectangle
                  return yScale(d.y);
                })
                .attr('height', function(d) {
                  // the bar's height should align it with the base of the chart (y=0)
                  return height - yScale(d.y);
                })
                .on('mouseover', function () {
                  d3.select(this)
                    .style({
                      'fill': 'steelblue',
                      'fill-opacity': 1
                    });
                })
                .on('mouseout', function () {
                  d3.select(this)
                    .style({
                      'fill': 'steelblue',
                      'fill-opacity': 0.6
                    });
                });


              //add text labels to the top of each bar
              svg.append("g")
               // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .selectAll(".textlabel")
                .data(data)
                .enter()
                .append("text")
                .style("text-anchor", "middle")
                .style({
                  'font-family': 'sans-serif',
                  'font-size': '10px',
                  'fill':'grey'
                })
                .attr("class", "textlabel")
                .attr("x", function(d){ return xScale(d.x) + (xScale.rangeBand()/2); })
                .attr("y", function(d){ return yScale(d.y) - 3; })
                .text(function(d){ return d.y; });





            }
          })
        }
      }
    }])
})();
