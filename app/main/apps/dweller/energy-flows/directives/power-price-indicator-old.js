/**
 * Created by pg9501 on 21.06.2016.
 */
(function ()
{
  'use strict';

  angular
    .module('app.dweller.energy-flows')
    .directive('powerPriceIndicatorOld',['$window','d3Service',function($window,d3Service){
  return {
    restrict: 'EA',
    scope: {
      price: '@'
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
          if(2*$('#'+attrs.containerId).width()> $window.innerWidth){
            $('#'+attrs.containerId).height($('#'+attrs.containerId).width());
          }
          //remove all previous items fefore render
          d3.select("#"+attrs.containerId).select("svg").remove();
          scope.render(scope.price);
        });

        scope.render=function(price){

          var containerID=attrs.containerId,
            parentContainerID=attrs.parentContainerId,
            frameColor=attrs.frameColor,
            type=attrs.type,
            unit=attrs.unit,
            price=attrs.price;
          var $container = $('#'+containerID),
            $parentContainer = $('#'+parentContainerID),
            width = $parentContainer.width(),
           // height=$parentContainer.height();
            height=width;

          var svg = d3.select("#" + containerID).append("svg:svg")
            .attr("width", width )
            .attr("height", height );

          var g = svg.append('g');

          width = $parentContainer.width(),
            height=$parentContainer.height();

          if(type=="Electricity Price"){
            if(price>25){frameColor='red';}
            else if(price<20){frameColor='green';}
            else {{frameColor='orange';}}
          }

          g.append("rect")
            .attr("x", (width-0.85*width)/2).attr("y", 0.07* height)
            .attr("rx",  0.2*width).attr("ry", 0.2*height)
            .attr("width",0.85*width).attr("height",0.85* height)
            .style("fill","white")
            .style( "stroke",frameColor)
            .style( "stroke-width",0.03*width)
            .style( "opacity","0.5");

          var text = g.append('text')
            .attr('x', 0.07*width+(0.85*width)/2)
            .attr('y', 0.07* height+(0.23*height))
            .attr("font-size", 0.1*width+"px")
            .attr("fill", "black")
            .style("text-anchor", "middle");

          text.append("tspan")
            .attr("dy", 0)
            .attr("x",(1*width)/2)
            .text(type);
          text.append("tspan")
            .attr("dy", (0.25*height))
            .attr("x",0.07*width+(0.85*width)/2)
            .attr("font-size", 0.1*(width+height)+"px")
            .attr("font-weight","bold")
            .style("font-family","sans-serif")
            .text(price);
          text.append("tspan")
            .attr("dy", 0.2* height)
            .attr("x",0.07*width+(0.85*width)/2)
            .text(unit);

        };
        // Observe the change of the price
        scope.$watch('price', function(newValue, oldValue) {
          if (newValue){
            //remove all previous items fefore render
            d3.select("#"+attrs.containerId).select("svg").remove();
            scope.render(scope.price);
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
              scope.render(scope.price);
              //console.log(newValue);
            }
          },
          true
        );

      });
    }
  }
}])
})();
