function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

// usage example:
//   var unique = a.filter(onlyUnique);

function betterbubbleChart(selectedDisease) {
var bubbleHeading = document.getElementById("bubbleChartText");
bubbleHeading.innerHTML = "Bubble Chart of " + selectedDisease + " Disease";
// set the dimensions and margins of the graph
var margin = {top: 40, right: 250, bottom: 20, left: 50},
width = 880 - margin.left - margin.right,
height = 420 - margin.top - margin.bottom;

  d3.select("#betterBubbleChart").html("");

var bettersvg = d3
  .select("#betterBubbleChart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("/static/data/allMerged.csv", function (data) {
  var allCityNames = [];
  var allRegionNames = [];
  var x_max = 0;
  var y_max = 0;
  var z_max = 0;
  for (var i = 0; i < data.length; i++) {
    allCityNames.push(data[i]["State"]);
    allRegionNames.push(data[i]["Region"]);
    y_max = Math.max(y_max, data[i][selectedDisease]);
    x_max = Math.max(x_max, data[i]["Fast Food Centers"]);
    z_max = Math.max(x_max, parseInt(data[i]["Hospitals"]));
  }
  var uniqueRegionNames = allRegionNames.filter(onlyUnique);


  var x = d3.scaleLinear().domain([0, x_max]).range([0, width]);
  bettersvg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class", "axisWhite")
    .call(d3.axisBottom(x).ticks(5));

  // Add X axis label:
  bettersvg
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width+130)
    .attr("y", height)
    .attr("fill", "white")
    .text("No. of Fast food centers");

  var y = d3.scaleLinear().domain([0, y_max]).range([height, 0]);
  bettersvg.append("g").call(d3.axisLeft(y)).attr("class", "axisWhite");

  bettersvg
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", 20)
    .attr("y", 0)
    .text(selectedDisease + " Related Deaths")
    .style("fill","white")
    .attr("text-anchor", "start");

  var z = d3.scaleSqrt().domain([0, z_max]).range([4, 40]);

  var myColor = d3.scaleOrdinal().domain(allRegionNames).range(d3.schemeSet1);


  var bettertooltip = d3
    .select("#betterBubbleChart")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "black")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("color", "white");

  var showTooltip = function (d) {
    highlight(d);
    bettertooltip.transition().duration(200);
    bettertooltip
      .style("opacity", 1)
      .html("State: " + d["State"] + "<br/>" + "Fast food centers: " + d["Fast Food Centers"] + "<br/>" + "Hospitals: " + d["Hospitals"])
      .style("left", d3.mouse(this)[0] + 30 + "px")
      .style("top", d3.mouse(this)[1] + "px");
  };
  var moveTooltip = function (d) {
    highlight(d);
    bettertooltip
      .style("left", d3.mouse(this)[0] + 830 + "px")
      .style("top", d3.mouse(this)[1] + 50 + "px");
  };
  var hideTooltip = function (d) {
    noHighlight(d);
    bettertooltip.transition().duration(200).style("opacity", 0);
  };


  var highlight = function (d) {
    console.log(typeof d);
    if(typeof d === 'object') {
      console.log("Its an array");
      d = d['Region']
    } else {
      console.log("Inside else");
      pcp(d);
      console.log(d);
    }

    // console.log(d);
    // reduce opacity of all groups
    d = d.replaceAll(" ",".");
    d3.selectAll(".bubbles").style("opacity", 0.05);
    // expect the one that is hovered
    d3.selectAll("." + d).style("opacity", 1);

    // console.log(d);
  };

  var noHighlight = function (d) {
    if(typeof d === 'string') {
      pcp("");
    }
    
    // console.log(d);
    d3.selectAll(".bubbles").style("opacity", 0.8);
  };



  bettersvg
    .append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", function (d) {
      return "bubbles " + d["Region"];
    })
    .attr("cx", function (d) {
      return x(d["Fast Food Centers"]);
    })
    .attr("cy", function (d) {
      return y(d[selectedDisease]);
    })
    .attr("r", function (d) {
      return z(d["Hospitals"]/3);
    })
    .style("fill", function (d) {
      return myColor(d["Region"]);
    })
    .on("mouseover", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseleave", hideTooltip);

    // d3.select("circle")
    // .call( d3.brushX()                     
    //   .extent( [ [0,0], [width,height] ] )       
    // )


  var valuesToShow = [100, 10, 5];
  var xCircle = 390;
  var xLabel = 440;


  var size = 20;
  var allgroups = uniqueRegionNames //["East South Central", "Pacific", "Mountain", "West South Central", "New England", "South Atlantic", "East North Central", "West North Central", "Middle Atlantic"];
  bettersvg
    .selectAll("myrect")
    .data(allgroups)
    .enter()
    .append("circle")
    .attr("cx", 650)
    .attr("cy", function (d, i) {
      return 10 + i * (size + 5);
    }) 
    .attr("r", 7)
    .style("fill", function (d) {
      return myColor(d);
    })
    .on("mouseover", highlight)
    .on("mouseleave", noHighlight);

  bettersvg
    .selectAll("mylabels")
    .data(allgroups)
    .enter()
    .append("text")
    .attr("x", 650 + size * 0.8)
    .attr("y", function (d, i) {
      return i * (size + 5) + size / 2;
    }) 
    .style("fill", function (d) {
      return myColor(d);
    })
    .text(function (d) {
      return d;
    })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .on("mouseover", highlight)
    .on("mouseleave", noHighlight);
});
}