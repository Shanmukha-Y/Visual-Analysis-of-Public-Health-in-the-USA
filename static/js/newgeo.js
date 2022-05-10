function geomap(selectedDisease){
//Width and height of map
var width = 800;
var height = 400;

var geoHeading = document.getElementById("geoHeadingText");
geoHeading.innerHTML= "Geo Map of "+selectedDisease +" Disease";

if (selectedDisease=="Heart"){
var lowColor = '#E97452'
var highColor = '#AB2135'}

if (selectedDisease=="Cancer"){
  var lowColor = '#ABDAE1'
  var highColor = '#20525A'}

if (selectedDisease=="Stroke"){
var lowColor = '#E97452'
var highColor = '#8E6E53'}

if (selectedDisease=="Alzheimer's"){
  var lowColor = '#B0DFFD'
  var highColor = '#067BC2'}

if (selectedDisease=="Respiratory"){
var lowColor = '#F7E9B6'
var highColor = '#CAA316'}

// D3 Projection
var projection = d3.geoAlbersUsa()
  .translate([width / 1.8, height / 2]) // translate to center of screen
  .scale([750]); // scale things down so see entire US

// Define path generator
var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
  .projection(projection); // tell path generator to use albersUsa projection

//Create SVG element and append map to the SVG
d3.select("#map").html("");

var svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

  var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-5, 0])
  .html(function(d) {
      // console.log(d);
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


// Load in my states data!
d3.csv("/static/data/allMerged.csv", function(data) {
	var dataArray = [];
	for (var d = 0; d < data.length; d++) {
		dataArray.push(parseFloat(data[d][selectedDisease]))
        // console.log(data[d][selectedDisease])
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
      var dataValue = data[i][selectedDisease];

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
        // console.log(d["properties"]["name"]);
		getDataForState(d["properties"]["name"]);
		donut(d["properties"]["name"]);
    // barChart(d["properties"]["name"]);
    })
      .style("fill", function(d) { return ramp(d.properties.value) });

	  d3.csv("/static/data/fastfoodloc.csv", function(data) {
		// console.log(data);

		
		
		svg.selectAll('.pin')
        .data(data) // i.e. ds = {[12.521, 15.312], [616.122, -31.160]}
        .enter().append('circle', '.pin')
        .attr('r', 1)
		.attr('transform', function (d) {
			// console.log(d['longitude']+"  -> "+d['latitude']);
			// console.log(projection([d['longitude'],d['latitude']])[0]);
			var long = d['longitude'], lat = d['latitude'];
			if(long > 0 ) {
				long*=-1;
			}
      if (long>-10){
        long*=10
      }
			// console.log(long, lat)
            return 'translate(' + projection([long,lat])[0] + "," + projection([long,lat])[1] + ')';
        });
	
	}); 

	  
    
		// add a legend
		var w = 80, h = 250;

		var key = d3.select("#map")
			.append("svg")
			.attr("width", w)
			.attr("height", h)
			.attr("class", "legend")
      .style("margin-top","100px");

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

    legend.append("text")
    .attr("class", "axisWhite")
    .text(function (d) {
      // console.log("Hola Amigos");
      // console.log(d);
      return "Check if it is here";
    });

		key.append("rect")
			.attr("width", w - 50)
			.attr("height", h)
			.style("fill", "url(#gradient)")
			.attr("transform", "translate(0,10)")
      ;

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





}
