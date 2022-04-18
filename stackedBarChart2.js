function drawStackedBarChart2 () {

  var size2 = {};
  var barHeight2, barWidth2;

  const svg2 = d3.select("#chart2");
  const container2 = d3.select("#chartContainer2");
  const win2 = d3.select(window);

  const yScale2 = d3.scaleLinear();
  const xScale2 = d3.scaleBand().padding(0.2);

  const yAxis2 = d3.axisLeft(yScale2).tickFormat(d3.format('.3s'));
  const yAxisRight2 = d3.axisLeft(yScale2);
  const xAxis2 = d3.axisBottom(xScale2);

  const barColor2 = d3.scaleOrdinal()
                      .range(colorbrewer.Paired[8])

  const info2 = d3.select("#info2");

  var margin2 = {
      top: 50,
      left: 30,
      right: 10,
      bottom: 30
  };

  const g2 = svg2.append("g")
                .attr("class", "axis")
                .attr('transform','translate('+ margin2.left + ',' + margin2.top + ')');

  g2.append("g")
    .attr("class", "axis yaxis2");
  g2.append("g")
    .attr("class", "axis yaxis-right2");
  g2.append("g")
    .attr("class", "axis xaxis2");

  var topic2 = svg2.append("text")
              .attr("class", "sub_topicBar2")
              .attr("text-anchor","middle")
              .attr('fill',"black");

  svg2.append("g")
      .attr("class", "hovered2")
      .attr('transform','translate('+ margin2.left + ',' + margin2.top + ')');

const colorControler2 = d3.select("#colorControler2").append("ul")
const markerSize2 = parseFloat(colorControler2.style("font-size").slice(0,-2));

  data2=visData;

  // console.log(data2)
  const types2 = data2.columns.concat()

  types2.splice(0,2);

  for (let x of data2){

    const values = [];

    for (let z of types2){
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

  // console.log(data2)
  // set attribute of barColor 
  barColor2.domain(types2);

  let yDomain = true;

  yScale2.domain([d3.max(data2, d => d.sum),0]).nice();
  xScale2.domain(data2.map(d => d.year));

  const mean = d3.mean(data2, d => d.total);
  const far = d3.max(data2, d => Math.abs(d.total - mean));
  // sumColor.domain([mean-far, mean, mean+far]);

  let infoMargin;

  g2.selectAll(".rows2").remove();

  const rows2 = g2.selectAll(".rows2")
                  .data(data2)
                  .enter()
                  .append("g")
                  .attr("class", "rows2");

  rows2.append("g")
        .attr("class", "base2")
        .append("rect")
        .attr("class", "base-bar2")
        .attr("y", 0)
        .attr("fill", "none");

  rows2.selectAll(".base2")
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dx", "0em")
      .attr("dy", 1)
      .text(d =>  formatSuffixDecimal3(d.sum).split("G")[0]+"b");

  rows2.append("g")
      .attr("class", "overlays2")
        .append("g")
        .attr("class", "parts2")
        .selectAll(".part-bars2")
        .data(d => d.values)
        .enter()
        .append("g")
        .attr("class", "part-bars2")
        .append("rect")
        .attr("y", 0)
        .attr("x", function(v) { return xScale2(v.name)})
        .attr("height", 0)
        .attr("width", 0)
        .attr("class", (v, i) => "parts2-" + i)
        .attr("fill", v => barColor2(v.type));


  rows2.selectAll(".part-bars2")
      .on("click", function(v){
        const primer = v.type === types2[0];
        sortParts(v.type);
        info2.style("display", "none");
        svg2.select(".hovered2").selectAll(".hover_rect2")
            .transition().duration(primer ? 0 : 500)
            .attr("y", function(v) { return Math.max(yScale2(v.sum-v.left),0 )})
            .transition().delay(primer ? 0 : 250).duration(500)
            .attr("x", function(v) { return xScale2(v.name)})
            .transition().delay(500).duration(1000)
            .remove();
      })
      .on("mouseover", function(v){
        info2.style("display", "inline");
        if (formatSuffixDecimal3(v.value).includes("G")) {
          num=formatSuffixDecimal3(v.value).split("G")[0]+"b"
        } else {
          num=formatSuffixDecimal3(v.value).split("G")[0]
        }

        const description = v.type + "，" + num;
        createInfo(info2, v.year, description);

        svg2.select(".hovered2")
            .append("rect")
            .attr("class", "hover_rect2")
            .datum(v)
            .attr("fill", "none")
            .attr("stroke", "yellow")
            .attr("stroke-width", 3)
            .attr("y", function(v) { return Math.max(yScale2(v.sum-v.left),0 )})
            .attr("x", function(v) { return xScale2(v.name)})
            .attr("height", function(v) { return Math.max(barHeight2-yScale2(v.value),0 )})
            .attr("width", xScale2.bandwidth());
      })
      .on("mousemove", function(){
        var mouse = d3.mouse(document.getElementById("chart2"));
        info2.style("display", "inline")
            .style("left", (mouse[0] + 45 + infoMargin[1]) + "px")
            .style("top", (mouse[1] + 25 + infoMargin[0]) + "px");
      })
      .on("mouseout", function(v){
        info2.style("display", "none");
        svg2.select(".hovered2").selectAll("rect")
            .remove();
      });

  svg2.call(createLegend)
      .call(resize);

  win2.on("resize", resize);

  function createLegend(){
    // console.log(markerSize2)
    colorControler2.selectAll(".legend")
                  .data(barColor2.domain())
                  .enter()
                  .append("li")
                  .append("svg")
                    .attr("width", markerSize2*1)
                    .attr("height", markerSize2*1)
                    .attr("style", "inline")
                    .append("rect")
                      .attr("transform", "translate("+ markerSize2*0.1 + "," + (-markerSize2*0.2) + ")")
                      .attr("class", "color-switch active")
                      .style("cursor", "pointer")
                      .attr("width", markerSize2*0.8)
                      .attr("height", markerSize2*0.8)
                      .attr("stroke", "#666")
                      .attr("stroke-width", 0)
                      .attr("y", markerSize2*0.4)
                      .attr("x", 0)
                      // .attr("r", markerSize / 2 - 1)
                      .attr("fill", d => barColor2(d))
                      .on("click", function(d, i){
                        const channel = d3.select(this).classed("active");
                        d3.selectAll(".color-switch")
                          .attr("stroke-width", 0)
                          .attr("width", markerSize2*0.8)
                          .attr("height", markerSize2*0.8);

                        d3.select(this)
                          .classed("active", !channel)
                          .attr("stroke-width", channel ? 3 :0)
                          .attr("width", channel ? markerSize2*0.8 : markerSize2*0.8)
                          .attr("height", channel ? markerSize2*0.8 : markerSize2*0.8);

                        const primer = d === types2[0];
                        sortParts(d);
                      });

    colorControler2.selectAll("li")
                  .attr("class", "legend2")
                  .append("text")
                  .attr('font-size','13px')
                  .text(d => d);
                  
  }

  function resize(){
    const colorHeight = parseFloat(d3.select("#colorControler2").style("height").slice(0,-2));
    size2.width = parseFloat(svg2.style("width").slice(0,-2));
    size2.height = parseFloat(svg2.style("height").slice(0,-2));

    svg2.attr("width", size2.width)
        .attr("height", size2.height);

    yScale2.range([0, size2.height - margin2.top - margin2.bottom]);
    xScale2.range([0, size2.width - margin2.right - margin2.left]);

    barHeight2 = size2.height - margin2.top - margin2.bottom;
    barWidth2 = size2.width - margin2.right - margin2.left;

    moveAxis(1000);
    moveBars(1500);

    infoMargin = calcMargin(container2);

    d3.select(".sub_topicBar2")
        .text(topicVar)
        .attr('transform','translate('+ (margin2.left + barWidth2/2) + ',' + margin2.top*0.2 + ')')
        .attr('font-weight','bold')
        .attr("font-size",13)
        .attr("text-anchor","middle");
    }

    function moveAxis(duration = 0, delay = 0){
      yAxis2.tickSize(-(barWidth2));
      yAxisRight2.tickSize(-(barWidth2));
      xAxis2.tickSize(0);

      d3.select(".yaxis2")
        .transition().duration(duration).delay(delay)
        .call(yAxis2);

      const xAxisLength = (svg2.select(".yaxis2").selectAll("text").size() * 4);
      yAxisRight2.ticks(yAxisRight2);

      d3.select(".yaxis-right2")
        .transition().duration(duration).delay(delay)
        .call(yAxisRight2);

      svg2.select(".yaxis-right2").selectAll("text").remove();

      d3.select(".xaxis2")
        .attr('transform','translate('+ 0 + ',' + barHeight2 + ')')
        .transition().duration(duration).delay(delay)
        .call(xAxis2)
      .selectAll("text")
        .attr("dx", "0.5em")
        .attr("dy", "-0.1em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");
    }

    function moveBars(duration = 0, delay = 0){

      // console.log(data2)

      rows2.transition().duration(duration).delay(delay)
          .attr("transform", d => "translate(" + (xScale2(d.year)) + "," + 0 + ")");


      rows2.selectAll(".base2").selectAll("rect")
          .transition().duration(duration).delay(delay)
          .attr("y", d => yScale2(d.sum))
          .attr("x", 0)
          .attr("height", d => barHeight2-yScale2(d.sum))
          .attr("width", xScale2.bandwidth());

      rows2.selectAll(".base2").selectAll("text")
          .transition().duration(duration).delay(delay)
          .attr("y", -margin2.top/10)
          .attr("x", xScale2.bandwidth()/2)
          .attr("font-size",10)
          .attr("dx", "1em")
          .attr("dy", "1.5em")
          .attr("transform", "rotate(-90)");

      rows2.selectAll(".parts2").selectAll("rect")
          .transition().duration(duration).delay(delay)
          .attr("y", function(v) { return Math.max(yScale2(v.sum-v.left),0 )})
          .attr("x", 0)
          .attr("height", function(v) { return Math.max(barHeight2-yScale2(v.value),0 )})
          .attr("width", xScale2.bandwidth());

      // rows1.selectAll(".parts1").selectAll("text")
      //     .transition().duration(duration).delay(delay)
      //     .attr("transform", v => "translate(" + xScale1(v.year) + "," +  0 + ")")
      //     .attr("y", 0)
      //     .attr("x", 0)
      //     .attr("display", v => yScale1(v.left) < 22 ? "none" : "inline");
      }

    function sortParts(key){
      // console.log(key)
      const prime = types2[types2.length-0];
      sortX(key, prime);
      // sortY(key, prime);
    }

    function sortX(key, prime){
      if(key !== prime){
        types2.splice(types2.indexOf(key), 1)
        types2.push(key)
        for (let x of data2){
          x.values.sort(function(a, b){return types2.indexOf(a.type) - types2.indexOf(b.type);});
          calcLeft(x);
        }

        rows2.data(data2);
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
      const domain = data2.concat().map(d => d.year);
      xScale2.domain(domain);

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
var formatSuffixDecimal2 =d3.format('.2s')