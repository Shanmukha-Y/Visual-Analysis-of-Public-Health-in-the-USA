

function donut(selectedState){
    console.log('i am here')
var width = 450;
height = 450;
margin = 40;
var diseases = ["Alzheimer's", "Cancer", "Heart", "Respiratory", "Stroke"]
// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
var radius = Math.min(width, height) / 2 - margin * 2;
var divNode = d3.select("body").node();
var outerRadius = radius*0.9;

// var selectedState = "New York";
d3.csv("/static/data/allMerged.csv", function (data1) {
  // console.log(data1);
  var data = [];
  var totalCount = 0;
  for (var i = 0; i < data1.length; i++) {
    if (data1[i]["State"] == selectedState) {
        totalCount = parseInt(data1[i]["Alzheimer's"]) + parseInt(data1[i]["Cancer"]) + parseInt(data1[i]["Heart"]) + parseInt(data1[i]["Respiratory"]) + parseInt(data1[i]["Stroke"])
      data.push(parseInt(data1[i]["Alzheimer's"]));
      data.push(parseInt(data1[i]["Cancer"]));
      data.push(parseInt(data1[i]["Heart"]));
      data.push(parseInt(data1[i]["Respiratory"]));
      data.push(parseInt(data1[i]["Stroke"]));
      break;

    }
  }

  // console.log(data);
  // console.log(totalCount);

  // set the color scale
  var color = d3
    .scaleOrdinal()
    .domain(["Alzheimer's", "Cancer", "Heart", "Respiratory", "Stroke"])
    .range(["#067BC2","#ABDAE1","#AB2135","#F0CF65","#8E6E53"]);

var arc = d3.arc()
    .padRadius(outerRadius)
    .innerRadius(radius * 0.5);


var pie = d3.pie()
    .sort(null)
    .padAngle(0.03)
    .value(function(d) {
        // console.log("Inside pie");
        // console.log(d);
         return d; });



d3.select("#chart").append("div")
    .attr("id","mainPie")
    .attr("class","pieBox");

    d3.select("#mainPie").html("");

var svgdonut = d3.select("#mainPie").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var defs = svgdonut.append("defs");
var filter = defs.append("filter")
                .attr("id", "drop-shadow")
               .attr("height","130%");

filter.append("feGaussianBlur")
        .attr("in","SourceAlpha")
        .attr("stdDeviation", 0)
        .attr("result", "blur");

filter.append("feOffset")
    .attr("in", "blur")
    .attr("dx", 0)
    .attr("dy", 0)
    .attr("result", "offsetBlur");
    var feMerge = filter.append("feMerge");



feMerge.append("feMergeNode")
    .attr("in", "offsetBlur")
feMerge.append("feMergeNode")
    .attr("in", "SourceGraphic");

var g = svgdonut.selectAll(".arc")
      .data(pie(data))
    .enter().append("g")
      .attr("class", "arc")
      .each(function(d) { d.outerRadius = outerRadius - 10; });

  g.append("path")
      .attr("d", arc)
      .style("fill", function(d, i) { return color(diseases[i]); })
      .each(function(d) {
        // console.log(d);
         d.outerRadius = outerRadius - 10; })
         .on('click',function(d) {
          // console.log(d);
      })
      .on("mousemove", function(d, i) {
          d3.select(this)
              //.transition()
              // .duration(200)
              // .attr("d", arcOver);
              

              .style("filter", "url(#drop-shadow)");
          d3.select(this)
            .transition()
            .duration(10)
            .ease(d3.easeBounce)
            .attr('transform',function(d){
              var dist = 1;
              d.midAngle = ((d.endAngle - d.startAngle)/2) + d.startAngle;
              var x = Math.sin(d.midAngle) * dist;
              var y = Math.cos(d.midAngle) * dist;
              return 'translate(' + x + ',' + y + ')';
              

            });
            var mousePos = d3.mouse(divNode);
            // console.log("Toltip Bug");
            // console.log(d);
            d3.select("#mainTooltip")
              .style("left", mousePos[0] - 40 + "px")
              .style("top", mousePos[1] - 70 + "px")
              .select("#value")
              .attr("text-anchor", "middle")
              .html(diseases[i] + "<br />" + d.data);

          d3.select("#mainTooltip").classed("hidden", false);
        d3.select(this).transition().duration(50).delay(0).attrTween("d", function(d) {
          var i = d3.interpolate(d.outerRadius, outerRadius);
          return function(t) { d.outerRadius = i(t); return arc(d); };
        });
        })

      .on("mouseout", function(d){
          d3.select(this)
              .attr("stroke","none")
              .style("filter","none");
          d3.select(this)
            .transition()
            .duration(50)
            .ease(d3.easeBounce)
            .attr('transform','translate(0,0)');

          d3.select("#mainTooltip").classed("hidden", true);
        d3.select(this).transition().duration(200).delay(0).attrTween("d", function(d) {
          var i = d3.interpolate(d.outerRadius, outerRadius  - 10);
          return function(t) { d.outerRadius = i(t); return arc(d); };
        });
      })
      
      .on("click", function() { 
        d3.select(this).transition().duration(200).delay(0).attrTween("d", function(d) {
          console.log(diseases[d['index']]);
          geomap(diseases[d['index']], color(diseases[d['index']]));
          getDataForState(selectedState, color(diseases[d['index']]));
          betterbubbleChart(diseases[d['index']]);
          var i = d3.interpolate(d.outerRadius, outerRadius);
          return function(t) { d.outerRadius = i(t); return arc(d); };
        });
      })
      .on("dblclick", function() { 
        d3.select(this).transition().duration(200).delay(0).attrTween("d", function(d) {
          var i = d3.interpolate(d.outerRadius, outerRadius  - 10);
          return function(t) { d.outerRadius = i(t); return arc(d); };
        });
      }) 

      //Number 4
    //   var centerSvg = svgdonut.append("g")
    //   .attr("font-family", "'Work sans', sans-serif")
    //   .attr("font-size", 24)
    //   .attr("font-weight", 900)
    //   .attr("text-anchor", "middle")
    //   .append("text")
    //   .text("Deaths" );
        // .append('circle') 
        // .attr('fill','#42A5F5')
        // .attr('r','62');

    svgdonut.append('text')
        .attr('class', 'toolCircle')
        .attr('dy', 0) 
        .html("<br> </br>"+"<br />" +selectedState) 
        .style('font-size', 20)
        .style('color','grey')
        .style('text-anchor', 'middle')
        .style('fill','white') 

    svgdonut.append('circle')
        .attr('class', 'toolCircle')
        .attr('r', radius * 0.45) 
        .style('fill', '#42A5F5') 
        .style('fill-opacity', 0.35);

    });

}

// donut()