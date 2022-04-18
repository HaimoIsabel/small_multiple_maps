
function drawMultiLines() {

  var lineTooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip');
  ////////////////////// init scatter plot////////////////////////////////////////////
  var multiWidth = document.getElementById("multiLineContainer").clientWidth;
  var multiHeight = document.getElementById("multiLineContainer").clientHeight;
  // console.log(multiWidth,multiHeight)

  var multiMargin = {
      top: 50,
      left: 50,
      right: 170,
      bottom: 30
  };


  multiWidth = multiWidth - multiMargin.left - multiMargin.right;
  multiHeight = multiHeight - multiMargin.top - multiMargin.bottom;

  var MultiSvg = d3.select('#multiLineContainer')
      .append('svg')
          .attr('height',multiHeight + multiMargin.top + multiMargin.bottom)
          .attr('width',multiWidth + multiMargin.left + multiMargin.right)
          .attr('class','MultiLineplot')
      .append('g')
      .attr('transform','translate('+ multiMargin.left + ',' + multiMargin.top + ')');

  var MultiLegend = MultiSvg.append('g')
      .attr('transform','translate('+ multiWidth + ',' + multiHeight*0.3 + ')')
      .attr("class", "multiline-legend")

  var xScale = d3.scaleTime()
      .range([0, multiWidth]);

  // console.log(multiWidth,multiHeight)

  var yScale = d3.scaleLinear()
      .range([multiHeight, 0]);

  var zScale = d3.scaleOrdinal(d3.schemeCategory10);


  /////////////////////  draw axis/////////////////////////////////////////////////////////////

  topic = MultiSvg.append("text")
            .attr("class", "sub_topic_multi")
            .attr('transform','translate('+ (multiWidth/2) + ',' + (-multiMargin.top/2) + ')')
            .attr("text-anchor","middle")
            .attr('fill',"black")
            .attr('font-weight','bold')
            .attr("font-size",13);

  /////////////////////  draw axis/////////////////////////////////////////////////////////////

  var x_axis_multi = d3.axisBottom(xScale); ;

  var y_axis_multi = d3.axisLeft(yScale);

  MultiSvg.append('g')
      .attr('transform', 'translate(0, ' + multiHeight + ')')
      .attr('class', 'x_axis');

  MultiSvg.append('g')
      .attr('class', 'y_axis');

/////////////////////   draw trend lines/////////////////////////////////////////////////


  data=visData;

  // console.log(data)

  var types = data.columns.concat()

  var linesData=[]
  typesShort=types.slice(1)

  // console.log(typesShort)

  typesShort.forEach(function (d,i) {
    linesData.push({key: typesShort[i],values:[]})
  })


  d3.select(".sub_topic_multi").text("Student to Teacher Ratio For Each Category");

  var parseDate = d3.timeParse("%Y");

  linesData.forEach(function(d,i) {
      data.forEach(function(v) {
        d.values.push({id: typesShort[i],key: parseDate(v[types[0]]), value: +v[typesShort[i]]})
      })
  })

  // console.log(linesData)

  var ticks=[]
  var valueArray=[]
  data.forEach (function(d) {
    ticks.push(parseDate(d.year))
    typesShort.forEach(function(v) {
      valueArray.push(+d[v])
    })
  })

  // console.log(valueArray)
  
  xScale.domain(d3.extent(data, function(d) {return parseDate(d[types[0]])}));
  yScale.domain([0, Math.max(...valueArray)]);
  zScale.domain(typesShort);

  // console.log(y.domain())

  var SPline = d3.line()
    .x(function(d) { return xScale(d.key); })
    .y(function(d) { return yScale(d.value); })

  d3.selectAll('.item').remove();
  var line = MultiSvg.selectAll(".item")
    .data(linesData)
    .enter().append("g")
      .attr("class", "item");

  line.append("path")
      .attr("class", "line")
      .attr("id", function(d,i) { return "multiline_"+i })
      .attr("d", function(d) { return SPline(d.values); })
      .attr("stroke", function(d) { return zScale(d.key); })
      .attr("stroke-width", 1.5)
      .attr("fill", "none");

  // //////////////////////////////////////////////////////////////
  MultiSvg.selectAll('.sp_rect').remove();
  rects = MultiSvg.selectAll('sp_rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('class','sp_rect')
    // .attr('id',function(d) { console.log(d)})
    .attr("width", 20)
    .attr("height", multiHeight)
    .attr("y", 0)
    .attr("x", function (d) { return xScale(parseDate(d[types[0]]))-10 })
    .attr("fill", "lightblue")
    .attr('stroke-width',2)
    .attr('opacity',0)
    .on("mouseover", rectMouseOver)
    .on("mousemove", rectMouseMove)
    .on("mouseout", rectMouseOut);

  ///////////////////// legend //////////////////////////////
  d3.selectAll(".legend").remove();

  MultiLegend.selectAll(".legend")
      .data(typesShort)
      .enter()
      .append("rect")
      .attr("class", "legend")
      .attr("id", function(d,i) { return "legend_"+i })
      .attr('x', 30)
      .attr('y', function(d,i) { return (multiHeight/typesShort.length*0.6)*i})
      .attr('width', multiHeight/25)
      .attr('height', multiHeight/25)
      .attr("fill", function(d,i) { return zScale(d)})
      .on("mouseover", lineMouseOver)
      .on("mouseout", lineMouseOut);

  d3.selectAll(".legendText").remove();
  MultiLegend.selectAll(".legendText")
    .data(typesShort)
    .enter()
    .append("text")
    .attr("class", "legendText")
    .attr("id", function(d,i) { return "legendText_"+i })
    .attr('x', multiHeight/20+35)
    .attr('y', function(d,i) { return (multiHeight/typesShort.length*0.6)*i + multiHeight/25 })
    .text(function(d){return d})
    .attr("font-size", 12)
    .on("mouseover", lineMouseOver)
    .on("mouseout", lineMouseOut);

  ///////////////////// axis //////////////////////////////
  MultiSvg.select('.x_axis')
    .transition()
    .duration(1000)
    .call(x_axis_multi.tickValues(ticks))
  .selectAll("text")
    .attr("dx", "0.5em")
    .attr("dy", "-0.5em")
    .attr("transform", "rotate(90)")
    .style("text-anchor", "start");

  MultiSvg.select('.y_axis')
      .transition()
      .duration(1000)
      .call(y_axis_multi);


//////////////////////////////////
function lineMouseOver(d,i){

  d3.select("#legendText_"+i)
      .transition()
      .duration(300)
      .attr("fill", zScale(d))
      .attr("font-size", 14)
      .attr("opacity", 1);

  d3.selectAll("#legend_"+i)
      .transition()
      .duration(300)
      .attr("opacity", 1)
      .attr("width", multiHeight/20)
      .attr("height", multiHeight/20);

  d3.selectAll(".line")
      .transition()
      .duration(300)
      .attr("opacity", 0.3);

  d3.select("#multiline_"+i)
      .transition()
      .duration(300)
      .attr("stroke-width", 3)
      .attr("opacity", 1);

  };


  function lineMouseOut(d){

    d3.selectAll(".line")
      .transition()
      .duration(300)
      .attr("stroke-width", 1.5)
      .attr("opacity", 1);

    d3.selectAll(".legendText")
        .transition()
        .duration(300)
        .attr("fill", "#000")
        .attr("font-size", 12)
        .attr("opacity", 1);

    d3.selectAll(".legend")
        .transition()
        .duration(300)
        .attr("opacity", 1)
        .attr("width", multiHeight/25)
        .attr("height", multiHeight/25);

  };

//////////////////////////////////
function rectMouseOver(d,i){

  d3.select(this)
      .transition()
      .duration(100)
      .attr("opacity", 0.5);

  tooltipContent=""

  // console.log(d[typesShort[i]])
  typesShort.forEach(function (v,ind) {
    tooltipContent=tooltipContent+'<br>'+ typesShort[ind] + ": " + d3.format(".2f")(d[typesShort[ind]])
  })

  lineTooltip
      .style('display', null)
      .html( '<p>' + types[0] + ': '+ d[types[0]]
        + '<br>'+ "================="
        + tooltipContent + '</p>');

  };

  function rectMouseMove(d){
    lineTooltip
        .style('top', (d3.event.pageY -15) + "px")
        .style('left', (d3.event.pageX +15) + "px");
  };


  function rectMouseOut(d){
    d3.select(this)
        .transition()
        .duration(100)
        .attr("opacity", 0);

    lineTooltip
        .style('display', 'none');

  };

}


var parseDate = d3.timeParse("%b %Y");
var dateFormat = d3.format(".2n");