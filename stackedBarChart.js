function drawStackedBarChart1 () {

  const size1 = {};
  var barHeight1, barWidth1;

  const svg1 = d3.select("#chart1");
  const container1 = d3.select("#chartContainer1");
  const win1 = d3.select(window);

  const yScale1 = d3.scaleLinear();
  const xScale1 = d3.scaleBand().padding(0.2);

  const yAxis1 = d3.axisLeft(yScale1).tickFormat(d3.format('.3s'));
  const yAxisRight1 = d3.axisLeft(yScale1);
  const xAxis1 = d3.axisBottom(xScale1);

  const barColor1 = d3.scaleOrdinal()
                      .range(colorbrewer.Paired[8])

  const info1 = d3.select("#info1");

  var margin1 = {
      top: 70,
      left: 30,
      right: 10,
      bottom: 30
  };

  const g1 = svg1.append("g")
                .attr("class", "axis")
                .attr('transform','translate('+ margin1.left + ',' + margin1.top + ')');

  g1.append("g")
    .attr("class", "axis yaxis1");
  g1.append("g")
    .attr("class", "axis yaxis-right1");
  g1.append("g")
    .attr("class", "axis xaxis1");

  var topic1 = svg1.append("text")
              .attr("class", "sub_topicBar1")
              .attr("text-anchor","middle")
              .attr('fill',"black");

  var topic1 = svg1.append("text")
              .attr("class", "sub_topicBar11")
              .attr("text-anchor","middle")
              .attr('fill',"black");

  svg1.append("g")
      .attr("class", "hovered1")
      .attr('transform','translate('+ margin1.left + ',' + margin1.top + ')');

const colorControler1 = d3.select("#colorControler1").append("ul")
const markerSize1 = parseFloat(colorControler1.style("font-size").slice(0,-2));

//////////////////////////////////////////////////////////////////////
  data1=visData;

  // console.log(data1)
  const types1 = data1.columns.concat()

  types1.splice(0,2);

  for (let x of data1){

    const values = [];

    for (let z of types1){
      values.push({name: x.year, type: z, value: parseInt(x[z])});
    }
      x.sum = d3.sum(values.map(d => d.value));
    for (let z of values){
      z.sum = x.sum;
    }
    x.values = values;
    // console.log(x)
    calcLeft(x);
  }

  // console.log(data1)
  // set attribute of barColor 
  barColor1.domain(types1);

  let yDomain = true;

  yScale1.domain([d3.max(data1, d => d.sum),0]).nice();
  xScale1.domain(data1.map(d => d.year));

  const mean = d3.mean(data1, d => d.total);
  const far = d3.max(data1, d => Math.abs(d.total - mean));
  // sumColor.domain([mean-far, mean, mean+far]);

  let infoMargin;

  g1.selectAll(".rows1").remove();

  const rows1 = g1.selectAll(".rows1")
                  .data(data1)
                  .enter()
                  .append("g")
                  .attr("class", "rows1");

  rows1.append("g")
        .attr("class", "base1")
        .append("rect")
        .attr("class", "base-bar1")
        .attr("y", 0)
        .attr("fill", "none");

  rows1.selectAll(".base1")
      .append("text")
      // .attr("fill", d => sumColor(d.sum))
      .attr("text-anchor", "middle")
      // .attr("dominant-baseline", "middle")
      .attr("dx", "0em")
      .attr("dy", 1)
      .text(d =>  formatSuffixDecimal3(d.sum));

  rows1.append("g")
      .attr("class", "overlays1")
        .append("g")
        .attr("class", "parts1")
        .selectAll(".part-bars1")
        .data(d => d.values)
        .enter()
        .append("g")
        .attr("class", "part-bars1")
        .append("rect")
        .attr("y", 0)
        .attr("x", function(v) { return xScale1(v.name)})
        .attr("height", 0)
        .attr("width", 0)
        .attr("class", (v, i) => "parts1-" + i)
        .attr("fill", v => barColor1(v.type));


  rows1.selectAll(".part-bars1")
      .on("click", function(v){
        const primer = v.type === types1[0];
        sortParts(v.type);
        info1.style("display", "none");
        svg1.select(".hovered1").selectAll(".hover_rect1")
            .transition().duration(primer ? 0 : 500)
            .attr("y", function(v) { return Math.max(yScale1(v.sum-v.left),0 )})
            .transition().delay(primer ? 0 : 250).duration(500)
            .attr("x", function(v) { return xScale1(v.name)})
            .transition().delay(500).duration(1000)
            .remove();
      })
      .on("mouseover", function(v){
        info1.style("display", "inline");
        const description = v.type + "，" + formatSuffixDecimal3(v.value);
        createInfo(info1, v.year, description);

        svg1.select(".hovered1")
            .append("rect")
            .attr("class", "hover_rect1")
            .datum(v)
            .attr("fill", "none")
            .attr("stroke", "yellow")
            .attr("stroke-width", 3)
            .attr("y", function(v) { return Math.max(yScale1(v.sum-v.left),0 )})
            .attr("x", function(v) { return xScale1(v.name)})
            .attr("height", function(v) { return Math.max(barHeight1-yScale1(v.value),0 )})
            .attr("width", xScale1.bandwidth());
      })
      .on("mousemove", function(){
        var mouse = d3.mouse(document.getElementById("chart1"));
        info1.style("display", "inline")
            .style("left", (mouse[0] + 45 + infoMargin[1]) + "px")
            .style("top", (mouse[1] + 25 + infoMargin[0]) + "px");
      })
      .on("mouseout", function(v){
        info1.style("display", "none");
        svg1.select(".hovered1").selectAll("rect")
            .remove();
      });

  svg1.call(createLegend)
      .call(resize);

  win1.on("resize", resize);

  function createLegend(){
    // console.log(markerSize1)
    colorControler1.selectAll(".legend")
                  .data(barColor1.domain())
                  .enter()
                  .append("li")
                  .append("svg")
                    .attr("width", markerSize1*1)
                    .attr("height", markerSize1*1)
                    .attr("style", "inline")
                    .append("rect")
                      .attr("transform", "translate("+ markerSize1*0.1 + "," + (-markerSize1*0.2) + ")")
                      .attr("class", "color-switch active")
                      .style("cursor", "pointer")
                      .attr("width", markerSize1*0.8)
                      .attr("height", markerSize1*0.8)
                      .attr("stroke", "#666")
                      .attr("stroke-width", 0)
                      .attr("y", markerSize1*0.4)
                      .attr("x", 0)
                      // .attr("r", markerSize / 2 - 1)
                      .attr("fill", d => barColor1(d))
                      .on("click", function(d, i){
                        const channel = d3.select(this).classed("active");
                        d3.selectAll(".color-switch")
                          .attr("stroke-width", 0)
                          .attr("width", markerSize1*0.8)
                          .attr("height", markerSize1*0.8);

                        d3.select(this)
                          .classed("active", !channel)
                          .attr("stroke-width", channel ? 3 :0)
                          .attr("width", channel ? markerSize1*0.8 : markerSize1*0.8)
                          .attr("height", channel ? markerSize1*0.8 : markerSize1*0.8);

                        const primer = d === types1[0];
                        sortParts(d);
                      });

    colorControler1.selectAll("li")
                  .attr("class", "legend1")
                  .append("text")
                  .attr('font-size','13px')
                  .text(d => d);
                  
  }

  function resize(){
    const colorHeight = parseFloat(d3.select("#colorControler1").style("height").slice(0,-2));
    size1.width = parseFloat(svg1.style("width").slice(0,-2));
    size1.height = parseFloat(svg1.style("height").slice(0,-2));
    // console.log(size1.width,size1.height);
    // size.height = window.innerHeight - colorHeight;

    svg1.attr("width", size1.width)
        .attr("height", size1.height);

    yScale1.range([0, size1.height - margin1.top - margin1.bottom]);
    xScale1.range([0, size1.width - margin1.right - margin1.left]);

    barHeight1 = size1.height - margin1.top - margin1.bottom;
    barWidth1 = size1.width - margin1.right - margin1.left;

    moveAxis(1000);
    moveBars(1500);

    infoMargin = calcMargin(container1);

    d3.select(".sub_topicBar1")
        .text("Number of Students Per Million People")
        .attr('transform','translate('+ (margin1.left + barWidth1/2) + ',' + margin1.top*0.2 + ')')
        .attr('font-weight','bold')
        .attr("font-size",13)
        .attr("text-anchor","middle");


    d3.select(".sub_topicBar11")
        .text("(Students Per Million People by Education Level)")
        .attr('transform','translate('+ (margin1.left + barWidth1/2) + ',' + margin1.top*0.5 + ')')
        .attr("font-size",12)
        .attr("text-anchor","middle");
  }

    function moveAxis(duration = 0, delay = 0){
      yAxis1.tickSize(-(barWidth1));
      yAxisRight1.tickSize(-(barWidth1));
      xAxis1.tickSize(0);

      d3.select(".yaxis1")
        .transition().duration(duration).delay(delay)
        .call(yAxis1);

      const xAxisLength = (svg1.select(".yaxis1").selectAll("text").size() * 4);
      yAxisRight1.ticks(yAxisRight1);

      d3.select(".yaxis-right1")
        .transition().duration(duration).delay(delay)
        .call(yAxisRight1);

      svg1.select(".yaxis-right1").selectAll("text").remove();

      d3.select(".xaxis1")
        .attr('transform','translate('+ 0 + ',' + barHeight1 + ')')
        .transition().duration(duration).delay(delay)
        .call(xAxis1)
      .selectAll("text")
        .attr("dx", "0.5em")
        .attr("dy", "-0.1em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");
    }

    function moveBars(duration = 0, delay = 0){

      // console.log(data1)

      rows1.transition().duration(duration).delay(delay)
          .attr("transform", d => "translate(" + (xScale1(d.year)) + "," + 0 + ")");


      rows1.selectAll(".base1").selectAll("rect")
          .transition().duration(duration).delay(delay)
          .attr("y", d => yScale1(d.sum))
          .attr("x", 0)
          .attr("height", d => barHeight1-yScale1(d.sum))
          .attr("width", xScale1.bandwidth());

      rows1.selectAll(".base1").selectAll("text")
          .transition().duration(duration).delay(delay)
          .attr("y", -margin1.top/10)
          .attr("x", xScale1.bandwidth()/2)
          .attr("font-size",10)
          // .attr("dy", "2em")
          .attr("transform", "rotate(-30)");

      rows1.selectAll(".parts1").selectAll("rect")
          .transition().duration(duration).delay(delay)
          .attr("y", function(v) { return Math.max(yScale1(v.sum-v.left),0 )})
          .attr("x", 0)
          .attr("height", function(v) { return Math.max(barHeight1-yScale1(v.value),0 )})
          .attr("width", xScale1.bandwidth());

      // rows1.selectAll(".parts1").selectAll("text")
      //     .transition().duration(duration).delay(delay)
      //     .attr("transform", v => "translate(" + xScale1(v.year) + "," +  0 + ")")
      //     .attr("y", 0)
      //     .attr("x", 0)
      //     .attr("display", v => yScale1(v.left) < 22 ? "none" : "inline");
      }

    function sortParts(key){
      // console.log(key)
      const prime = types1[types1.length-0];
      sortX(key, prime);
      // sortY(key, prime);
    }

    function sortX(key, prime){
      if(key !== prime){
        types1.splice(types1.indexOf(key), 1)
        types1.push(key)
        for (let x of data1){
          x.values.sort(function(a, b){return types1.indexOf(a.type) - types1.indexOf(b.type);});
          calcLeft(x);
        }

        rows1.data(data1);
        moveBars(500);
        moveAxis(500);
      }
    }

    function calcLeft(datum){
      let sum = 0;
      for (let n of datum.values){
        // console.log(n)
        n.left = sum;
        sum += n.value;
        // console.log(n)
      }
    }

    function calcLeftPercentage(datum){
      let sum = 0;
      for (let n of datum.values){
        // console.log(n)
        n.leftPercentage = sum;
        sum += n.percentage;
        // console.log(n)
      }
    }

    function sortY(key, prime){
      const jake = key === prime;
      const delay = jake ? 0 : 750;
      const sortFunction = function(a, b){
        return jake && !yDomain ? b.sum - a.sum :
        b.values[0].value - a.values[0].value;
      };
      const domain = data1.concat().map(d => d.year);
      xScale1.domain(domain);

      yDomain = jake ? !yDomain : false;

      moveBars(1500, delay);
      moveAxis(1000, delay);

    }


    function createInfo(element, title, ...args){
      element.select("span").text(title);
      const paraphs = element.select(".desc").selectAll("p").data(args);
      paraphs.exit().remove();
      paraphs.enter().append("p").merge(paraphs)
              .text(d => d);
    };

    function calcMargin(parent){
      const marginArr = parent.style("margin").split(" ");
      return marginArr.length === 1 ? [0, 0] : marginArr.map(d => parseFloat(d.slice(0,-2)));
    }
}

var formatSuffixDecimal3 =d3.format('.3s')