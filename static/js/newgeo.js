function geomap(){
//Width and height of map
var width = 700;
var height = 350;


var lowColor = '#E97452'
var highColor = '#8B0001'

// D3 Projection
var projection = d3.geoAlbersUsa()
  .translate([width / 1.8, height / 2]) // translate to center of screen
  .scale([750]); // scale things down so see entire US

// Define path generator
var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
  .projection(projection); // tell path generator to use albersUsa projection

//Create SVG element and append map to the SVG
var svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

  var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-5, 0])
  .html(function(d) {
      console.log(d);
      return d["properties"]["name"]
    // var dataRow = countryById.get(d.properties.name);
    //    if (dataRow) {
    //        console.log(dataRow);
    //        return dataRow.states + ": " + dataRow.mortality;
    //    } else {
    //        console.log("no dataRow", d);
    //        return d.properties.name + ": No data.";
    //    }
  })

svg.call(tip);

var selecteddisease = "Cancer"
// Load in my states data!
d3.csv("/static/data/allMerged.csv", function(data) {
	var dataArray = [];
	for (var d = 0; d < data.length; d++) {
		dataArray.push(parseFloat(data[d][selecteddisease]))
        console.log(data[d][selecteddisease])
	}
	var minVal = d3.min(dataArray)
	var maxVal = d3.max(dataArray)
	var ramp = d3.scaleLinear().domain([minVal,maxVal]).range([lowColor,highColor])
	
  // Load GeoJSON data and merge with states data
  d3.json("/static/data/us-states.json", function(json) {

    // Loop through each state data value in the .csv file
    for (var i = 0; i < data.length; i++) {

      // Grab State Name
      var dataState = data[i].State;
    //   console.log(dataState)

      // Grab data value 
      var dataValue = data[i][selecteddisease];

      // Find the corresponding state inside the GeoJSON
      for (var j = 0; j < json.features.length; j++) {
        var jsonState = json.features[j].properties.name;

        if (dataState == jsonState) {

          // Copy the data value into the JSON
          json.features[j].properties.value = dataValue;
        //   console.log(json.features[j].properties.value)
        
          // Stop looking through the JSON
          break;
        }
      }
    }

    // Bind the data to the SVG and create one path per GeoJSON feature
    svg.selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("stroke", "#fff")
      .style("stroke-width", "1")
	  .on('mouseover', tip.show)
    	.on('mouseout', tip.hide)
	  .on('click',function(d) {
        // console.log(d)
        console.log(d["properties"]["name"]);
		getDataForState(d["properties"]["name"]);
		donut(d["properties"]["name"]);
    })
      .style("fill", function(d) { return ramp(d.properties.value) });
    
		// add a legend
		var w = 80, h = 200;

		var key = d3.select("#map")
			.append("svg")
			.attr("width", w)
			.attr("height", h)
			.attr("class", "legend");

		var legend = key.append("defs")
			.append("svg:linearGradient")
			.attr("id", "gradient")
			.attr("x1", "100%")
			.attr("y1", "0%")
			.attr("x2", "100%")
			.attr("y2", "100%")
			.attr("spreadMethod", "pad");

		legend.append("stop")
			.attr("offset", "0%")
			.attr("stop-color", highColor)
			.attr("stop-opacity", 1);
			
		legend.append("stop")
			.attr("offset", "100%")
			.attr("stop-color", lowColor)
			.attr("stop-opacity", 1);

		key.append("rect")
			.attr("width", w - 50)
			.attr("height", h)
			.style("fill", "url(#gradient)")
			.attr("transform", "translate(0,10)");

		var y = d3.scaleLinear()
			.range([h, 0])
			.domain([minVal, maxVal]);

		var yAxis = d3.axisRight(y);

		key.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(41,10)")
			.call(yAxis)
  });
});

// Map the cities I have lived in!
d3.csv("/static/data/fastfoodloc.csv", function(data1) {
	// console.log(data);
	data = []
	for(var i=0;i<10;i++) {
		data.push[data1[i]];
	}
	svg.selectAll("circle")
	.data(data).enter()
	.append("circle")
	.attr("cx", function (d) {
		var currArray = [d['longitude'], d['latitude']];
		//  console.log(projection(currArray)[0]); 
		 return projection(currArray)[0]; 
		})
	.attr("cy", function (d) {
		var currArray = [d['longitude'], d['latitude']];
		 return projection(currArray)[1]; 
		})
	.attr("r", "30px")
	.attr("fill", "blue")

}); 


}
geomap()