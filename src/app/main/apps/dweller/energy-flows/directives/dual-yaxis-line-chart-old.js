/**
 * Created by pg9501 on 26.07.2016.
 */

(function () {
  'use strict';

  angular
    .module('app.dweller.energy-flows')
    .directive('dualYaxisLineChartOld', ['$window','$timeout', 'd3Service2','moment', function ($window,$timeout, d3Service2,moment) {
      return {
        restrict: 'EA',
        scope: {
          data1: "@",
          data2: "@"
        },
        link: function (scope, ele, attrs) {
          d3Service2.d3().then(function (d3) {

            var renderTimeout;
            //var $container = $('#'+ele[0].id);
            var $container=$('#'+attrs.containerId);
            var margin = {top: 10, right: 45, bottom: 25, left: 60};
            var   width = $container.width(),
              //height =width*0.2;
              height =0.85*$container.height();

            var svg1 = d3.select(ele[0]).append("svg:svg");

            //Browser onresize event
            $window.onresize=function(){
              scope.$apply();
            };



            //watch for resize event
            scope.$watch(function(){
              return $container.width();
            },function(){
              if(scope.data1==null || scope.data1=="" || scope.data2==null|| scope.data2==""){
                return;
              }
              d3.select(ele[0]).select("svg").remove();
              scope.render(JSON.parse(scope.data1),JSON.parse(scope.data2));
            });

            scope.$watchGroup([ 'data1', 'data2'], function(newValues, oldValues, scope) {
             // console.log(scope.data1);
              if(scope.data1==null || scope.data1=="" || scope.data2==null|| scope.data2==""){
                return;
              }
              d3.select(ele[0]).select("svg").remove();
              //console.log("scope.data1 is :");
              //console.log(scope.data1);
              scope.render(JSON.parse(scope.data1),JSON.parse(scope.data2));
            });

            scope.render=function(data1,data2){
             // console.log(data2);



              var svg1 = d3.select(ele[0]).append("svg:svg");

              svg1.selectAll('*').remove();
              //if we don't pass any data, return out of the element
              if(!data1 && !data2)return;
             // if (renderTimeout) clearTimeout(renderTimeout);

             // renderTimeout = $timeout(function() {
                width = $container.width();
                //height =width*0.2;
                height =0.85*$container.height();
                svg1.attr("width", width )
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
                  .domain([convertToDate(data1[0].x),convertToDate(data1[data1.length-1].x)])
                  ;
                var xScale2 = d3.time.scale()
                    .range([0,width-margin.right-margin.left])
                    .domain([convertToDate(data2[0].x),convertToDate(data2[data2.length-1].x)])
                    ;*/

              var y1min=Math.min.apply(Math,data1.map(function(o){return o.y;}));
              var y1max=y1min+300;
              while(y1max<Math.max.apply(Math,data1.map(function(o){return o.y;}))){
                y1max+=300;
              }
              var y2min=Math.min.apply(Math,data2.map(function(o){return o.y;}));
              var y2max=y2min+30;
              while(y2max<Math.max.apply(Math,data2.map(function(o){return o.y;}))){
                y2max+=30;
              }
              var currentDate=moment.unix(data1[0].x);
              var xScale = d3.time.scale()
                .range([0, width-margin.right-margin.left])
                .domain([currentDate.toDate(),currentDate.add(24, 'h').toDate()])
              ;

                var yScale1 = d3.scale.linear()
                  .domain([y1min, y1max])
                  .range([(height-margin.bottom)*0.85, margin.top]);

                var yScale2 = d3.scale.linear()
                  .domain([y2min, y2max])
                  .range([(height-margin.bottom)*0.85, margin.top]);



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
                .style("stroke","lightgrey")
                .style("shape-rendering","crispEdges");

              svg.append("line") //the last tick
                .attr("x1",width-margin.left-margin.right)
                .attr("y1",0)
                .attr("x2",width-margin.left-margin.right)
                .attr("y1",height-margin.bottom-margin.top)
                .style("stroke-width",function(d){
                  return "2";
                })
                .style("stroke","lightgrey")
                .style("shape-rendering","crispEdges");

                var yaxis1=svg.append("g")
                  .attr("class", "y axis")
                  .attr("transform", "translate("+0+",0)")
                  .call(yAxis1);

              var yaxis2=svg.append("g")
                    .attr("class", "y axis")
                    .attr("transform", "translate("+(width-margin.right-margin.left)+",0)")
                    .call(yAxis2);

                svg.append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", -margin.left)
                    .attr("x",0 - ( (height-margin.top-margin.bottom) / 2))
                    .attr("dy", "1em")
                    .style("text-anchor", "middle")
                    .style("fill","#9b59b6")
                    .text("Load Limit (W)")
                    .style("font-size","x-medium");

                svg1.append("text")
                    .attr("transform", "rotate(90)")
                    .attr("y", -(width))
                    .attr("x",( (height-margin.top-margin.bottom) / 2))
                    .attr("dy", "1em")
                    .style("text-anchor", "middle")
                    .style("fill","#1abc9c")
                    .text("Tariff (ct)")
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
                  .style("font-size","x-small");

                d3.selectAll(".axis.y text")
                    .style("fill", function(d){

                    if(d>100){
                      return '#9b59b6';
                    }
                      return '#1abc9c';
                    })
                    .style("font-size","x-small");

                /* d3.selectAll(".x.axis text")
                 .call(insertLinebreaks);*/

           //     svg.selectAll('g.x.axis g text').each(insertLinebreaks);


               var path1= svg.append("path")
                  .data([data1])
                  .attr("class", "line")
                  .attr("d", line1)
                 .attr("id","line1")
                  .style("fill","none")
                  .style("stroke","#9b59b6")
                    .style("stroke-width",2);

               var path2= svg.append("path")
                  .data([data2])
                  .attr("class", "line")
                  .attr("d", line2)
                 .attr("id","line2")
                  .style("fill","none")
                  .style("stroke","#1abc9c")
                    .style("stroke-width",2);

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
             var div= d3.select("body").append("div")
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

                  var loadLimitValue;
                  var tariffValue;
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

                        if(lines[i].id=='line1'){
                          loadLimitValue=yScale1.invert(pos.y).toFixed(0)+" W";
                          d3.select(this).select('text')
                            .text(""+xValue+" : "+yScale1.invert(pos.y).toFixed(0)+" W");
                        }
                        if(lines[i].id=='line2'){
                          tariffValue=yScale2.invert(pos.y).toFixed(0)+" ct";
                          d3.select(this).select('text')
                            .text(""+xValue+" : "+yScale2.invert(pos.y).toFixed(0)+" ct");
                        }

                        div
                          .style("opacity", .9);

                        var s_Top = document.documentElement.scrollTop || document.body.scrollTop;
                        var s_Left = document.documentElement.scrollLeft || document.body.scrollLeft;

                        div	.html("<p style='margin-bottom: -7px;margin-top: 0px'><b>Time: "+xValue +"</b></p>"  + "<p style='margin-bottom: -7px'><b>Load Limit: "+loadLimitValue+"</b></p>"  +"<p style='margin-bottom: 0px'><b>Tariff: "+tariffValue +"</b></p>")
                         // .style("left", mouse[0] + "px" )
                         // .style("top",pos.y + "px");
                          .style("left", (d3.event.pageX) + "px")
                          .style("top", (d3.event.pageY +25) + "px");


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





                 // xScale1.domain([new Date(data1[0].x),new Date(data1[data1.length-1].x)]);
                 // xScale2.domain([new Date(data2[0].x),new Date(data2[data2.length-1].x)]);
                  var interval=2;
                  var breakPoint=768;
                  if($(window).width() < breakPoint) {
                    interval=6;
                  }
                /*  var dates = [];
                  dates.push(convertToDate(data1[0].x));
                  dates.push(convertToDate(data2[0].x));
                  dates.push(convertToDate(data1[data1.length-1].x));
                  dates.push(convertToDate(data2[data2.length-1].x));

                  //console.log(new Date(data1[0].x));
                  var sorted = dates.sort(sortDates);*/
                 // console.log(convertToDate(sorted[3]));
                  var currentDate=moment.unix(data1[0].x);
                //  console.log(currentDate);
                  xScale = d3.time.scale()
                    // .rangePoints([width_x_tick/2+margin.left, width-margin.right-width_x_tick/2])
                    .range([0, width-margin.right-margin.left])
                   // .domain([sorted[0],moment(sorted[0]).add(1440, 'minutes')])
                    .domain([convertToDate(data1[0].x),convertToDate(data1[data1.length-1].x)])
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


                  path1.data([data1]).attr("d", line1);

                  path2 .data([data2]).attr("d", line2);
                   // .transition()
                   // .duration(60000)
                   // .ease("linear")
                   // .each("end", tick);



                 // rect.attr('width', xScale(convertToDate(sorted[3])));
                  rect.attr('width', xScale(convertToDate(data1[data1.length-1].x)));

             /*     var diff_ms1 = moment(data1[data1.length-1].x).diff(moment(data1[0].x));
                  var duration1 = moment.duration(diff_ms1);
                  var hours1 = duration1.asHours();
                  var diff_ms2 = moment(data2[data2.length-1].x).diff(moment(data2[0].x));
                  var duration2 = moment.duration(diff_ms2);
                  var hours2 = duration2.asHours();

                  if(moment(data1[1].x).diff(moment(data2[1].x)) ==0){
                    data1.shift();
                    data2.shift();
                  }else if(moment(data1[1].x).diff(moment(data2[1].x)) >0){
                    data2.shift();
                  }else{
                    data1.shift();
                  }
                  if(data1[0].x==data1[1].x){
                    data1.shift();
                  }
                  if(data2[0].x==data2[1].x){
                    data2.shift();
                  }*/

                  utcChange=false;
                  svg.selectAll(".x.axis line")
                    .style("stroke-width",function(d){
                      return "1";
                    })
                    .style("stroke",function(d){
                      if(utcChange==false && moment().utcOffset()=="120" && moment(d).utcOffset()=="60"){//there will be one more hour when changing from summer time to winter time, hide this hour
                        utcChange=true;
                        return "transparent";
                      }
                      return "lightgrey";
                    })
                    .style("shape-rendering","crispEdges");

                  svg.selectAll(".axis path")
                    .style("stroke-width",function(d){
                      return "1";
                    })
                    .style("stroke","lightgrey")
                    .style("shape-rendering","crispEdges");

               /*   var lastTime=data1[data1.length-1].x;
                  var newTime=parseInt(lastTime)+60;
                  var newData1={"x":newTime, "y": data1[data1.length-1].y};
                  var newData2={"x":newTime, "y": data2[data2.length-1].y};
                  data1.push(newData1);
                  data2.push(newData2);

                  console.log(data1[data1.length-1].x + " : "+ data1[data1.length-1].y);
                  console.log(data2[data2.length-1].x + " : "+ data2[data2.length-1].y);*/


                }





              //},200);
            }



          })
        }
      }
    }])
})();
