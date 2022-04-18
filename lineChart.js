function drawLines() {
  var lineTooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip');

  ////////////////////// init scatter plot////////////////////////////////////////////
  var width = document.getElementById("lineContainer").clientWidth;
  var height = document.getElementById("lineContainer").clientHeight;
  // console.log(width,height)

  var margin = {
      top: 70,
      left: 60,
      right: 30,
      bottom: 30
  };


  // const margin = {top: 50, right: 80, bottom: 40, left: 80}

  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  var SPsvg = d3.select('#lineContainer')
      .append('svg')
          .attr('height',height + margin.top + margin.bottom)
          .attr('width',width + margin.left + margin.right)
          .attr('class','lineplot')
      .append('g')
      .attr('transform','translate('+ margin.left + ',' + margin.top + ')');

  var x = d3.scaleTime()
      .range([0, width]);

  var y = d3.scaleLinear()
      .range([height, 0]);


  /////////////////////  draw topic/////////////////////////////////////////////////////////////

  topic = SPsvg.append("text")
            .attr("class", "sub_topic")
            .attr('transform','translate('+ (width/2) + ',' + (-margin.top*0.8) + ')')
            .attr("text-anchor","middle")
            .attr('fill',"black")
            .attr('font-weight','bold')
            .attr("font-size",13);

  topic = SPsvg.append("text")
            .attr("class", "sub_topic1")
            .attr('transform','translate('+ (width/2) + ',' + (-margin.top*0.5) + ')')
            .attr("text-anchor","middle")
            .attr('fill',"black")
            .attr("font-size",12);

  /////////////////////  draw axis/////////////////////////////////////////////////////////////

  var x_axis = d3.axisBottom(x); ;

  var y_axis = d3.axisLeft(y);

  SPsvg.append('g')
      .attr('transform', 'translate(0, ' + height + ')')
      .attr('class', 'x_axis');

  SPsvg.append('g')
      .attr('class', 'y_axis');

/////////////////////   draw trend lines/////////////////////////////////////////////////

  data=visData;

  var types = data.columns.concat()

  var linesData=[
    {key: types[1], values:[]}
  ];

  d3.select(".sub_topic").text("Money Designated for Student Education");
  d3.select(".sub_topic1").text("Average Education Funding per Student (RMB)");

  var parseDate = d3.timeParse("%Y");

  linesData.forEach(function(d) {
      data.forEach(function(v) {
        d.values.push({key: parseDate(v[types[0]]), value: +v[types[1]]})
      })
  })

  var ticks=[]
  data.forEach (function(d) {
    ticks.push(parseDate(d.year))
  })

  x.domain(d3.extent(data, function(d) {return parseDate(d[types[0]])}));
  y.domain(d3.extent(data,function(d){return +d[types[1]]}))
  // console.log(x.domain())
  
  var SPline = d3.line()
    .x(function(d) { return x(d.key); })
    .y(function(d) { return y(d.value); })


  var regionLines = SPsvg.selectAll('.sp_path')
          .data(linesData);

  // console.log(linesData)
  regionLines
      .exit()
      .remove();

  var new_regionLines = regionLines
      .enter()
      .append('path')
      // .attr("d", function(v) { return line(v);})
      .attr('class','sp_path')
      .attr('id',function(d) { return 'tag_sp_'+ d.key;})
      .attr('stroke-width',2)
      .attr('opacity',0.5);
      // .attr("stroke-dasharray", "2,2");

  new_regionLines.merge(regionLines)
      .transition()
      .duration(1200)
      .attr("d", function(d) { return SPline(d.values);})
      .attr('class','sp_path')
      .attr('id',function(d) { return 'tag_sp_'+ d.key;})
      // .style("stroke", function(d) { return d.key=='Total'? '#b3de69':color_scale(d.key); })
      .style("stroke", 'blue')
      .attr('fill', "none" )
      .attr('stroke-width',2)
      .attr('opacity',1);
      // .attr("stroke-dasharray", "2,2");


  //////////////////////////////////////////////////////////////
  SPsvg.selectAll('.sp_rect').remove();
  rects = SPsvg.selectAll('sp_rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('class','sp_rect')
    // .attr('id',function(d) { console.log(d)})
    .attr("width", 20)
    .attr("height", height)
    .attr("y", 0)
    .attr("x", function (d) { return x(parseDate(d[types[0]]))-10 })
    .attr("fill", "lightblue")
    .attr('stroke-width',2)
    .attr('opacity',0)
    .on("mouseover", RectMouseOver)
    .on("mousemove", RectMouseMove)
    .on("mouseout", RectMouseOut);
    // .attr("stroke-dasharray", "2,2");

  SPsvg.selectAll('.sp_dot').remove();
  dots = SPsvg.selectAll('sp_dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class','sp_dot')
    .attr('id',function(d) { return "sp_dot_"+d[types[0]]})
    .attr("cy", function (d) { return y(+d[types[1]]) })
    .attr("cx", function (d) { return x(parseDate(+d[types[0]])) })
    .attr("r", 5)
    .attr("fill", "lightblue")
    .attr("stroke", "blue")
    .attr('stroke-width',2)
    .attr('opacity',0.5);
    // .attr("stroke-dasharray", "2,2");


  SPsvg.select('.x_axis')
    .transition()
    .duration(1000)
    .call(x_axis.tickValues(ticks))
  .selectAll("text")
    .attr("dx", "0.5em")
    .attr("dy", "-0.5em")
    .attr("transform", "rotate(90)")
    .style("text-anchor", "start");

  SPsvg.select('.y_axis')
      .transition()
      .duration(1000)
      .call(y_axis);


  //////////////////////////////////
function RectMouseOver(d,i){

  d3.select("#sp_dot_"+d[types[0]])
      .transition()
      .duration(100)
      .attr("opacity", 1);

  d3.select(this)
      .transition()
      .duration(100)
      .attr("opacity", 0.5);

  lineTooltip
      .style('display', null)
      .html( '<p>' + types[0] + ': '+ d[types[0]]
        + '<br>'+ types[1] + ': '+ formatSuffixDecimal3(d[types[1]]) + '</p>');

  };

  function RectMouseMove(d){
    lineTooltip
        .style('top', (d3.event.pageY -15) + "px")
        .style('left', (d3.event.pageX +15) + "px");
  };


  function RectMouseOut(d){
    d3.select(this)
        .transition()
        .duration(100)
        .attr("opacity", 0);

    d3.select("#sp_dot_"+d[types[0]])
      .transition()
      .duration(100)
      .attr("opacity", 0.5);

    lineTooltip
        .style('display', 'none');

  };

}


var parseDate = d3.timeParse("%b %Y");
var formatSuffixDecimal3 =d3.format('.3s')
var dateFormat = d3.format(".2n");