var MAPcolor_scale = d3.scaleQuantile()
var MAPtooltip = d3.select('body')
  .append('div')
  .attr("class","tooltip");

var columns = ["Pre-education_No of Students Per Million Population","Elementary School_No of Students Per Million Population","Middle School_No of Students Per Million Population","High School_No of Students Per Million Population","Higher Education_No of Students Per Million Population"]
var columnsM1 = ["Number of Students per Million People by Province"]
var columnsM2 = ["Percentage of Population Aged 0-14", "Percentage of Population Aged 65 and over"]
var columnsM3 = ["Provincial Breakdown_Education Funding per Student by Province (RMB)"]
var columnsM4 = ["Provincial Breakdown_Student to Teacher Ratio by Province"]
var columnsM5 = ["Elementary School_Student/Teacher Ratio","Middle School_Student/Teacher Ratio","High School_Student/Teacher Ratio","Vocational School_Student/Teacher Ratio","Higher Education_Student/Teacher Ratio"]

var visDiv='map_multi'
var visDivM1='map'
var visDivM2='map_multi2'
var visDivM3='map_multi3'
var visDivM4='map_multi4'
var visDivM5='map_multi5'

var domainExtent = [11000,101000]
var domainExtentM1 = [117000,261000]
var domainExtentM2 = [4,24]
var domainExtentM3 = [7000,57000]
var domainExtentM4 = [10,19]
var domainExtentM5 = [5,35]


var legendDesc = "Per Million Pop."
var legendDescM1 = "Per Million Pop."
var legendDescM2 = "Percentage"
var legendDescM3 = "RMB"
var legendDescM4 = "Student/Teacher Ratio"
var legendDescM5 = "Student/Teacher"


var individual;
var sizeM;

var colorScheme = ["#ffffff","#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"];
var colorSchemeS = ["#ffffff","#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#006837","#004529"];
var colorSchemeS9 = ["#ffffff","#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#006837"];


var stat_yearbook;
d3.queue()
    .defer(d3.json, "china.geojson")
    .defer(d3.csv, "stat_yearbook.csv")
    .await(function(error, chinaMap, stat){
          if (error) throw error;
          china_data=chinaMap;
          stat_yearbook=stat;

          processingData_Multi(visDiv,columns,false,0.5,colorScheme,domainExtent,legendDesc)
          processingData_Multi(visDivM1,columnsM1,false,1,colorSchemeS,domainExtentM1,legendDescM1)
          processingData_Multi(visDivM2,columnsM2,true,0.95,colorScheme,domainExtentM2,legendDescM2)
          processingData_Multi(visDivM3,columnsM3,false,1,colorSchemeS,domainExtentM3,legendDescM3)
          processingData_Multi(visDivM4,columnsM4,false,1,colorSchemeS9,domainExtentM4,legendDescM4)
          processingData_Multi(visDivM5,columnsM5,false,0.5,colorScheme,domainExtentM5,legendDescM5)
 });



function processingData_Multi (visDiv,columns,individual,sizeM,colorScheme,domainExtent,legendDesc) {

    var width = document.getElementById(visDiv).clientWidth;
    var height = document.getElementById(visDiv).clientHeight;
    // console.log(width,height)
    var margin = {top: 60, right: 0, bottom: 10, left: 0};
    
    if (sizeM===1) {
      width = width;
    } else if (sizeM===0.95) {
      width = width*0.49;
    } else {
      width = width*0.33;
    }
    height = height*sizeM;

    // var columns = ["No of Students Per Million Population", "Pre-education_No of Students Per Million Population", "Primary Education_No of Students Per Million Population", "Junior Secondary_No of Students Per Million Population", "Senior Secondary_No of Students Per Million Population", "Higher Education_No of Students Per Million Population"]
    nestedData=[];
    dataAllInOne=[];
    dataTotal=[];
    dataOther=[];
    // console.log(columns)
    columns.forEach(function(d,ind) {
        var valueArray = [];
        stat_yearbook.forEach(function(v) {
          valueArray.push({"region_id": v.region_id, "region_nameEn": v.region_nameEn, "value": v[columns[ind]]})
        })
      nestedData.push({"key": d, "grouped_value": valueArray})
    })

    nestedData.forEach(function(d,i){
            d.grouped_value.forEach(function(d) {
              dataTotal.push(+d.value)
            })
    })

    domainExtentVis = [d3.extent(dataTotal, function(d) { return +d;})[0],
      d3.extent(dataTotal, function(d) { return +d;})[1]]

    // console.log(domainExtentVis)

    nestedData.forEach(function(d,i) {
      drawmap_Multi(d.grouped_value,d.key,i,individual,colorScheme,domainExtent,legendDesc)
    })

    function drawmap_Multi(data,topic,ind,individual,colorScheme,domainExtent,legendDesc) {

        var InsNumById = {};
        var NameEnById = {};

        // processing data
        data.forEach(function(d) {
          InsNumById[d.region_id] = +d.value;
          NameEnById[d.region_id] = d.region_nameEn;
        });

        if (domainExtent === undefined ) {
          domainExtent = domainExtentVis
        }

        // console.log(domainExtent)
        MAPcolor_scale.range(colorScheme);
        MAPcolor_scale.domain(domainExtent);

        var projection = d3.geoMercator()
            .scale(1)
            .translate([0,0]);

        var path = d3.geoPath()
          .projection(projection);

        var b = path.bounds(china_data),
            s = 0.85 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
            t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        projection
          .scale(s)
          .translate(t);

        var path = d3.geoPath()
          .projection(projection);


        var MAPsvg = d3.select("#"+visDiv).append("svg")
          .attr("class","vis")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", "translate(" + 0 + "," + margin.top*0.2 + ")");

        MAPsvg.selectAll("path")
          .data( china_data.features )
          .enter()
          .append("path")
          .attr("id", function(d) {return ("tag_country_"+ d.properties.id); })
          .attr("stroke","#aaa")
          .attr("stroke-width",1)
          .attr("fill", function(d,i){ 
            return MAPcolor_scale(InsNumById[+d.properties.id] | 0); })
          .attr("opacity", 1)
          .attr("d", path )
          .on("mouseover",mouseOver)
          .on("mousemove",mouseMove)
          .on("mouseout",mouseOut);


        var legend = MAPsvg.selectAll('.maplegend')
          .data(colorScheme);

        var new_legend = legend
            .enter()
            .append('g')
            .attr('class', 'maplegend')
            .attr("transform", "translate(" + width*0.8 + "," + 0 + ")");

        new_legend.merge(legend)
          .append('rect')
            .attr('width', height/25)
              .attr('height', height/25)
              .attr('y', function(d, i){ return ( height-(i+5) * (height/25) ); })
              .attr('x', margin.left/2)
              .attr('fill', function(d){ return d })
              .attr('stroke', '#666')
              .attr('stroke-width', '0.5px');

        new_legend.merge(legend)
            .append('text')
            .attr('font-size','10px')
              //.attr('font-family',"sans-serif")
              .attr('y', function(d, i){ return ( height-(i+5) * (height/25) + 2*5); })
              .attr('x', margin.left/2 + height/25 + 3)
              .text(function(d,i){
                  var high, low;
                  if (i==0) {
                    high = formatSuffixDecimal2(MAPcolor_scale.invertExtent(d)[1]);
                    low = formatSuffixDecimal3(domainExtentVis[0]);
                  } else if (i==MAPcolor_scale.range().length-1) {
                    high = formatSuffixDecimal3(domainExtentVis[1]);
                    low = formatSuffixDecimal2(MAPcolor_scale.invertExtent(d)[0]);                
                  } else {
                    high = formatSuffixDecimal2(MAPcolor_scale.invertExtent(d)[1]);
                    low = formatSuffixDecimal2(MAPcolor_scale.invertExtent(d)[0]);
                  }

                  return low+' - '+high;
              });

          new_legend.merge(legend)
            .append('text')
            .attr('font-size','10px')
              .attr('font-family',"sans-serif")
              .attr('font-weight',300)
              .attr('y', height- 4 * (height/25) + 3*5)
              .attr('x', -margin.left )
              .text(legendDesc);

          // topic
          main_topic = topic.split("_")[0];
          sub_topic = topic.split("_")[1];
          MAPsvg.append("g")
            .attr("class", "topic")
            .append("text")
            .attr("transform", "translate("+ (margin.left+width/2) +","+ 0 + ")")
            .attr('font-weight','bold')
            .attr("font-size",13)
            .attr("text-anchor","middle")
            .text(main_topic)

          if (main_topic==='Provincial Breakdown') {
            MAPsvg.append("g")
              .attr("class", "sub_topic")
              .append("text")
              .attr("transform", "translate("+ (margin.left+width/2) +","+ margin.top*0.3 + ")")
              .attr("font-size",12)
              .attr("text-anchor","middle")
              .text("("+sub_topic+")")
          }

        //////////////////////////////////
        function mouseOver(d){

          d3.selectAll("#tag_country_"+ d.properties.id)
              .transition()
              .duration(100)
              .style('opacity', 1)
              .style("stroke","#fe9929")
              .style("stroke-width",5);

          MAPtooltip
              .style('display', null)
              .html( '<p>Province: ' + NameEnById[+d.properties.id] + " " + d.properties.name 
                + '<br>'+ topic + ': ' + formatSuffixDecimal3(InsNumById[+d.properties.id]) + '</p>');
        // console.log(InsNumById)
        };



        function mouseMove(d){
          MAPtooltip
              .style('top', (d3.event.pageY - 15) + "px")
              .style('left', (d3.event.pageX + 15) + "px");
        };


        function mouseOut(d){
          d3.selectAll("#tag_country_"+ d.properties.id)
              .transition()
              .duration(100)
              .style("stroke","#aaa")
              .style("stroke-width",1);

          MAPtooltip
              .style('display', 'none');

        };

    }
  }



  
var decimalFormat=d3.format(".2n")
var formatSuffixDecimal3 =d3.format('.3s')
var formatSuffixDecimal2 =d3.format('.2s')
