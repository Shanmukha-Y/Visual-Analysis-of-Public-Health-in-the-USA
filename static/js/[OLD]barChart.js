function barChart(selectedState) {
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 90, left: 40},
    width = 460 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    d3.select("#barChart").html("");


    var svg = d3.select("#barChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


        var tooltip = d3.select("#barChart")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")


    var rowNames = ["Hospitals Count","Insurance Firms","Uninsured","Fast Food Centers"];


    // Parse the Data
    
d3.csv("/static/data/allMerged.csv", function(data1) {

    var rowData = [];
    var max = Number.MIN_SAFE_INTEGER;
    for(var i=0;i<data1.length;i++) {
        if(data1[i]['State'] == selectedState) {
            max = Math.max(data1[i]["Hospitals"], Math.max(Math.sqrt(data1[i]["Insurance Firms"]), data1[i]["Uninsured"],data1[i]["Fast Food Centers"]));
            rowData.push(parseInt(data1[i]["Hospitals"]));
            rowData.push(parseInt(Math.sqrt(data1[i]["Insurance Firms"])));
            rowData.push(parseInt(data1[i]["Uninsured"]));
            rowData.push(parseInt(data1[i]["Fast Food Centers"]));
        }
    }

    var mouseover = function(d,i) {
      var x = d3.event.x,
        y = d3.event.y;
        console.log(i);
        tooltip
            .html(rowNames[i] + "<br>" + "Count: " + d)
            .style("opacity", 1)
            tooltip.style('top', y + 'px'); // edited
            tooltip.style('left', x+'px'); // edited
            
      }
      var mouseleave = function(d) {
        tooltip
          .style("opacity", 0)
      }

    // X axis
    var x = d3.scaleBand()
      .range([ 0, width ])
      .domain(rowNames)
      .padding(0.2);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "translate(30,0)")
        .style("text-anchor", "end");
    
    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, max])
      .range([ height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y));
    
    // Bars
    svg.selectAll("rect")
      .data(rowData)
      .enter()
      .append("rect")
        .attr("x", function(d, i) {
            console.log(rowData);
             return x(rowNames[i]); })
        .attr("width", x.bandwidth())
        .attr("fill", "#1A3A3A")

      .on("mouseover", mouseover)
      .on("mouseleave", mouseleave)
        // no bar at the beginning thus:
        .attr("height", function(d) { return height - y(0); }) // always equal to 0
        .attr("y", function(d) { return y(0); });
    
    // Animation
    svg.selectAll("rect")
      .transition()
      .duration(800)
      .attr("y", function(d) {
          console.log(d);
        return y(d); })
      .attr("height", function(d, i) { return height - y(d); })
      .delay(function(d,i){console.log(i) ; return(i*100)})
    
    })








    
}