/**
 * Created by pg9501 on 21.06.2016.
 */
(function ()
{
  'use strict';

  angular
    .module('app.dweller.energy-flows')
    .directive('powerPriceIndicator',['$window','d3Service',function($window,d3Service){
  return {
    restrict: 'EA',
    scope: {
      price: '@',
      label: '@'
    },
    link: function(scope, ele, attrs) {
      d3Service.d3().then(function(d3) {

        //Browser onresize event
        $window.onresize=function(){
          scope.$apply();
        };

        var currentValueText;
        var textSVG;

        var gauge = function() {

          var containerID = attrs.containerId,
            parentContainerID = attrs.parentContainerId,
            frameColor = attrs.frameColor,
            type = attrs.type,
            labelText=attrs.label,
            unit = attrs.unit,
            currentValue = attrs.price,
            maxValue = attrs.maxValue,
            minValue = attrs.minValue;

          var container = '#' + containerID,
            $parentContainer = $('#' + parentContainerID),
            width = $parentContainer.width(),
          // height=$parentContainer.height();
            height = width;

          var that = {};
          var config = {
            size: 100,
            clipWidth: 100,
            clipHeight: 70,
            ringInset: 15,
            ringWidth: 15,

            pointerWidth: 3,
            pointerTailLength: 5,
            pointerHeadLengthPercent: 0.75,

            minValue: minValue,
            maxValue: maxValue,

            minAngle: -90,
            maxAngle: 90,

            transitionMs: 4000,

            majorTicks: 4,
            labelFormat: d3.format(',g'),
            labelInset: 10,

          //  arcColorFn: d3.interpolateHsl(d3.rgb('#e8e2ca'), d3.rgb('#3e6c0a'))
            arcColorFn: d3.interpolateHsl(d3.rgb('#719e17'),d3.rgb('red'))

          };
          if(type=='PV Feed-in' || type=='CHP Feed-in'){
            config.arcColorFn=d3.interpolateHsl(d3.rgb('#e8e2ca'), d3.rgb('#3e6c0a'))
          }
          if(type=='Frequency' || type=='Voltage'){
            config.arcColorFn=d3.interpolateHsl(d3.rgb('#3e6c0a'),d3.rgb('red'));
            config. majorTicks=3;
          }
          var range = undefined;
          var r = undefined;
          var pointerHeadLength = undefined;
          var value = 0;

          var svg = undefined;
          var arc = undefined;
          var scale = undefined;
          var ticks = undefined;
          var tickData = undefined;
          var pointer = undefined;

          var donut = d3.layout.pie();

          function deg2rad(deg) {
            return deg * Math.PI / 180;
          }

          function newAngle(d) {
            var ratio = scale(d);
            var newAngle = config.minAngle + (ratio * range);
            return newAngle;
          }

          function configure(configuration) {
            var prop = undefined;
            for (prop in configuration) {
              config[prop] = configuration[prop];
            }

            range = config.maxAngle - config.minAngle;
            r = config.size / 2;
            pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

            // a linear scale that maps domain values to a percent from 0..1
            scale = d3.scale.linear()
              .range([0, 1])
              .domain([config.minValue, config.maxValue]);

            ticks = scale.ticks(config.majorTicks);
            tickData = d3.range(config.majorTicks).map(function () {
              return 1 / config.majorTicks;
            });

            arc = d3.svg.arc()
              .innerRadius(r - config.ringWidth - config.ringInset)
              .outerRadius(r - config.ringInset)
              .startAngle(function (d, i) {
                var ratio = d * i;
                return deg2rad(config.minAngle + (ratio * range));
              })
              .endAngle(function (d, i) {
                var ratio = d * (i + 1);
                return deg2rad(config.minAngle + (ratio * range));
              });
          }

          that.configure = configure;

          function centerTranslation() {
            return 'translate(' + r + ',' + r + ')';
          }

          function isRendered() {
            return (svg !== undefined);
          }

          that.isRendered = isRendered;

          function render(newValue) {
            svg = d3.select(container)
              .append('svg:svg')
              .attr('class', 'gauge')
              .attr('width', config.clipWidth)
              .attr('height', config.clipHeight + 10);

            var centerTx = centerTranslation();

            labelText=attrs.label;

            var arcs = svg.append('g')
              .attr('class', 'arc')
              .attr('transform', centerTx);

            arcs.selectAll('path')
              .data(tickData)
              .enter().append('path')
              .attr('fill', function (d, i) {
                if(type=='Frequency' || type=='Voltage'){
                  if(i==0||i==2){
                    return '#d85205';
                  }else{
                    return '#719e17';
                  }
                }

                return config.arcColorFn(d * i);
              })
              .attr('d', arc);

            var lg = svg.append('g')
              .attr('class', 'label')
              .attr('transform', centerTx);
            lg.selectAll('text')
              .data(ticks)
              .enter().append('text')
              .style('font-size', '11px')
              .style('fill', 'gray')
              .attr('transform', function (d) {
                var ratio = scale(d);
                var newAngle = config.minAngle + (ratio * range);
                return 'rotate(' + newAngle + ') translate(0,' + (config.labelInset - r) + ')';
              })
              .text(config.labelFormat);


            textSVG = svg.append('text')
              .attr('x', config.clipWidth / 2)
              .attr('y', config.clipHeight)
              // .attr("font-size", 0.06*width+"px")
              .attr("fill", "gray")
              .style("text-anchor", "middle");
            textSVG.append("tspan")
              .attr("dy", 2)
              .attr("x", config.clipWidth / 2)
              .attr("font-size", 11 + "px")
              // .attr("font-weight","bold")
              .style("font-family", "sans-serif")
              .text(labelText);
            /*   text.append("tspan")
             .attr("dy", (0.2*height))
             .attr("x",0.07*width+(0.85*width)/2)
             .attr("font-size", 0.06*(width+height)+"px")
             // .attr("font-weight","bold")
             .style("font-family","sans-serif")
             .text(currentValue+" "+unit);*/

            var lineData = [[config.pointerWidth / 2, 0],
              [0, -pointerHeadLength],
              [-(config.pointerWidth / 2), 0],
              [0, config.pointerTailLength],
              [config.pointerWidth / 2, 0]];
            var pointerLine = d3.svg.line().interpolate('monotone');
            var pg = svg.append('g').data([lineData])
              .attr('class', 'pointer')
              .attr('transform', centerTx);

            pointer = pg.append('path')
              .attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/)
              .attr('transform', 'rotate(' + config.minAngle + ')');

            currentValueText=svg.append('text')
              .attr('x', config.clipWidth / 2)
              .attr('y', config.size / 2)
              // .attr("font-size", 0.06*width+"px")
              .attr("fill", "black")
              .style("text-anchor", "middle")
              .attr("font-weight", "bold")
              .text(currentValue);

            update(newValue === undefined ? 0 : newValue);
          }

          that.render = render;

          function update(newValue, newConfiguration) {
            if (newConfiguration !== undefined) {
              configure(newConfiguration);
            }
            var ratio = scale(newValue);
            var newAngle = config.minAngle + (ratio * range);
            pointer.transition()
              .duration(config.transitionMs)
              .ease('elastic')
              .attr('transform', 'rotate(' + newAngle + ')');
          }

          that.update = update;

          configure(config);

          //that.render();

          //  update(currentValue);
          return that;
        };

        var powerGauge = gauge();
        powerGauge.render();

        //watch for resize event
        scope.$watch(function(){
          return angular.element($window)[0].innerWidth;
        },function(){
          if(2*$('#'+attrs.containerId).width()> $window.innerWidth){
            $('#'+attrs.containerId).height($('#'+attrs.containerId).width());
          }
          //remove all previous items fefore render
          d3.select("#"+attrs.containerId).select("svg").remove();
        //  scope.render(scope.price);
         // that.render();
          powerGauge = gauge();
          powerGauge.render();
          powerGauge.update(attrs.price);
        });

//        scope.render=function(price){


 //       };
        // Observe the change of the price and label
        scope.$watchGroup(['price','label'], function(newValue, oldValue) {
          if (newValue){

            textSVG.text(attrs.label);
            currentValueText
              .text(attrs.price);
            powerGauge.update(attrs.price);
          }
        }, true);

        // Observe the element's dimensions.
        scope.$watch
        (
          function () {
            return {
              wf: $("#parent_feedInPrice").width(),
              hf: $("#parent_feedInPrice").height(),
              we: $("#parent_electricityPrice").width(),
              he: $("#parent_electricityPrice").height()
            };
          },
          function (newValue, oldValue) {
            if (newValue.wf != oldValue.wf || newValue.hf != oldValue.hf ||
              newValue.we != oldValue.we || newValue.he != oldValue.he) {
              //remove all previous items fefore render
              d3.select("#"+attrs.containerId).select("svg").remove();
             // scope.render(scope.price);
              //console.log(newValue);
              //that.render();
              powerGauge = gauge();
              powerGauge.render();
              powerGauge.update(attrs.price);
            }
          },
          true
        );

      });
    }
  }
}])
})();
