/**
 * Created by pg9501 on 22.06.2016.
 */

(function ()
  {
    'use strict';

    angular
      .module('app.dweller.energy-flows')
      .directive('dynamicArrow', ['$window','$timeout', 'd3Service', function ($window,$timeout, d3Service) {
      return {
        restrict: 'EA',
        scope: {
          direction:"@",
          color:"@"
        },
        link: function(scope, ele, attr) {
          d3Service.d3().then(function (d3) {

            var margin =  20,
              barHeight = 10,
              barPadding = 3,
              barWidth= 20;

            var svg=d3.select(ele[0])
              .append('svg')
              //.style('width',$('#powerGrid').width())
              .style('width',75)
            ;
            var data = [21,22,23,24];

            //Browser onresize event
            $window.onresize=function(){
              scope.$apply();
            };


            $timeout(function() {
              scope.render(scope.direction);
            });

            //watch for resize event
            scope.$watch(function(){
              return angular.element($window)[0].innerWidth;
            },function(){
              scope.render(scope.direction);

            });

            scope.render=function(direction){

              //stop all transitions (scheduled and running)
              svg.selectAll('*').transition();
              //remove all previous items before render
              svg.selectAll('*').remove();


              var color=scope.color;

              var homeWidth=$('#smartHome').width(),
                homeHeight=$('#smartHome').height(),
                homeStartX=0,
                homeStartY=0,
                width=10;

              // set the height based on the calculations above
              svg.attr('height', homeHeight);

              var arrowWidth=3*barHeight/4,
                arrowHeight=barHeight/2,
                lastX,
                lastY=homeStartY+homeHeight/2,
                firstX=homeStartX+5,
                firstY= homeStartY+homeHeight/2;

              if(direction==='in'){
                firstX+=arrowWidth;
              }

              svg.selectAll('rect')
                .data(data)
                .enter()
                .append('rect')
                .attr('width', width)
                .attr('height', barHeight)
                .attr('x', function(d,i) {
                  if(i==(data.length-1)){
                    lastX=firstX+i*(width+barPadding)+width;
                  }
                  return  firstX+i*(width+barPadding);
                })
                .attr('y', function(d,i) {
                  return lastY;
                })
                //  .attr('fill', function(d) { return color(d.score); })
                .attr('fill', '#EEEEEE');

              var poly =[];
              if(direction==='out'){
                var polygonX1=lastX,
                  polygonY1=lastY-arrowHeight,
                  polygonX2=lastX+arrowWidth,
                  polygonY2=lastY+barHeight/2,
                  polygonX3=lastX,
                  polygonY3= lastY+barHeight+arrowHeight;
                poly = [{"x":polygonX1, "y":polygonY1},
                  {"x":polygonX2,"y":polygonY2},
                  {"x":polygonX3,"y":polygonY3}];

              }else{
                var polygonX1=firstX,
                  polygonY1=lastY-arrowHeight,
                  polygonX2=firstX-arrowWidth,
                  polygonY2=lastY+barHeight/2,
                  polygonX3=firstX,
                  polygonY3= lastY+barHeight+arrowHeight;
                poly = [{"x":polygonX1, "y":polygonY1},
                  {"x":polygonX2,"y":polygonY2},
                  {"x":polygonX3,"y":polygonY3}];


              }

              svg.selectAll("polygon")
                .data([poly])
                .enter().append("polygon")
                .attr("points",function(d) {
                  return d.map(function(d) { return [d.x,d.y].join(","); }).join(" ");})
                //.attr("stroke","#EEEEEE")
                .style("stroke","#EEEEEE")
                .style("stroke-width",1)
                .style("fill","#EEEEEE");

              var n = 0;
              animation();

              function animation(){
                svg.selectAll('rect')
                  //.data(data)
                  .sort(function(a, b) {
                    if(direction==='out'){
                      return d3.ascending(a, b);
                    }
                    return d3.descending(a,b);

                  })
                  .each(function() {
                    n++;
                  })
                  .transition()
                  .duration(600)
                  .delay(function(d, i) {
                    return i * 600;
                  })
                  //.attr('fill',color)
                  .style("stroke",color)
                  .style("fill",color)

                  .each('start',function(d,i){

                      if(i==(data.length-1)){
                        svg.selectAll("polygon")
                          .data([poly])
                          .transition()
                          .duration(600)
                         // .attr("stroke",color)
                         // .attr("stroke-width",2)
                          .style("stroke-width",2)
                          .style("stroke",color)
                          .style("fill",color);
                      }


                  })
                  .each('end', function() {
                    n--;
                    if (!n) {

                      endAll();
                      animation();
                    }
                  });
              };

              function endAll() {

                svg.selectAll('rect')
                  //.data(data)
                  .style("fill","#EEEeee");

                svg.selectAll("polygon")
                  .data([poly])
                  .transition()
                  .duration(10)
                  //.attr("stroke","#EEEeee")
                  //.attr("stroke-width",2)
                  .style("stroke-width",1)
                  .style("stroke",color)
                  .style("fill","#EEEeee");
              }



            }




          });
        }
      };
      }])
  })();
