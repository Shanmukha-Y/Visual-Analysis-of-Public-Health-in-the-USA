function bubbleChart(selectedDisease) {

var bubbleHeading = document.getElementById("bubbleChartText");
bubbleHeading.innerHTML= "Bubble Chart of "+selectedDisease +" Disease";

    // selectedDisease = "Stroke"
  var margin = { top: 10, right: 20, bottom: 30, left: 50 },
    width = 500 - margin.left - margin.right,
    height = 420 - margin.top - margin.bottom;

  // append the svg object to the body of the page

  d3.select("#bubbleChart").html("");

  var bubbleSvg = d3
    .select("#bubbleChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //Read the data
  d3.csv("/static/data/allMerged.csv", function (data) {
    console.log(data);
    var allCityNames = [];
    var x_max = 0;
    var y_max = 0;
    var z_max = 0;
    for(var i=0;i<data.length;i++) {
        allCityNames.push(data[i]['State']);
        y_max = Math.max(y_max, data[i][selectedDisease]);
        x_max = Math.max(x_max, data[i]['Fast Food Centers']);
        z_max = Math.max(x_max, parseInt(data[i]['Hospitals']));
    }

    // Add X axis
    var x = d3.scaleLinear().domain([0, x_max]).range([0, width]);
    bubbleSvg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

      bubbleSvg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", 200)
      .attr("y", 410 )
      .text("No.of Fast food centres");

    // Add Y axis
    var y = d3.scaleLinear().domain([0, y_max]).range([height, 0]);
    bubbleSvg.append("g").call(d3.axisLeft(y));

    bubbleSvg.append("text")
      .attr("text-anchor", "end")
      .attr("x", 20)
      .attr("y",  0)
      .text(selectedDisease+' Related Deaths')
      .attr("text-anchor", "start")

    // Add a scale for bubble size
    var z = d3.scaleLinear().domain([0, z_max]).range([4, 40]);

    // Add a scale for bubble color
    var myColor = d3
      .scaleOrdinal()
      .domain(allCityNames)
      .range(d3.schemeSet2);


      

    // -1- Create a tooltip div that is hidden by default:
    var bubbleTooltip = d3
      .select("#bubbleChart")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "black")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("color", "white");

      bubbleSvg.append("text")
      .attr("text-anchor", "end")
      .attr("x", 0)
      .attr("y", -20 )
      .text(selectedDisease)
      .attr("text-anchor", "start")

    // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
    var showTooltip = function (d) {
      bubbleTooltip.transition().duration(200);
      bubbleTooltip
        .style("opacity", 1)
        .html("State: " + d["State"]+"<br/>"+"Hospitals: "+d['Hospitals'])
        .style("left", d3.mouse(this)[0] + 30 + "px")
        .style("top", d3.mouse(this)[1] + "px");
    };
    var moveTooltip = function (d) {
      bubbleTooltip
        .style("left", d3.mouse(this)[0] + 30 + "px")
        .style("top", d3.mouse(this)[1] + 500 + "px");
    };
    var hideTooltip = function (d) {
      bubbleTooltip.transition().duration(200).style("opacity", 0);
    };

    // Add dots
    bubbleSvg
      .append("g")
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "bubbles")
      .attr("cx", function (d) {
        return x(d["Fast Food Centers"]);
      })
      .attr("cy", function (d) {
        return y(d[selectedDisease]);
      })
      .attr("r", function (d) {
        //   console.log(Math.log10(d[selectedDisease]/d["Fast Food Centers"]));
        return z(d['Hospitals'])/2;
        // if(selectedDisease == 'Cancer' || selectedDisease == "Heart") {
        //     return d[selectedDisease]/(10*d["Fast Food Centers"]);
        // }
        // return d[selectedDisease]/(3*d["Fast Food Centers"]);
        // return Math.pow(d[selectedDisease], 1/3);
      })
      .style("fill", function (d) {
        return myColor(d["State"]);
      })
      // -3- Trigger the functions
      .on("mouseover", showTooltip)
      .on("mousemove", moveTooltip)
      .on("mouseleave", hideTooltip);
  });


}
