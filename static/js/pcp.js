categoricalAttributes = ["State","Region"];
numericalAttributes = ["Heart PC","Unemp rate","Cancer PC","Respiratory PC","Median AQI","Hospitals","Firms PC","Stroke PC"];
function pcp(displayOnly) {
  d3.csv("/static/data/allMerged.csv", function (data) {
    // console.log("Inside PCP ");
    // console.log(data);
    console.log(displayOnly);
    if(displayOnly.length != 0) {
      var d = [];

      for(var i=0;i<data.length;i++) {
        if(data[i]['Region'] === displayOnly) {
          d.push(data[i]);
        }
      }

      data = d;
    }
    d3.select("#svgPcpPlot").html("");
    var PcpMargin = { top: 30, right: 100, bottom: 10, left: 100 },
      PCPWidth = 859 - PcpMargin.left - PcpMargin.right,
      PCPHeight = 450 - PcpMargin.top - PcpMargin.bottom;

    var colors = ["rgb(247, 129, 191)","rgb(166, 86, 40)","rgb(255, 255, 51)","rgb(255, 127, 0)","rgb(152, 78, 163)","rgb(77, 175, 74)","rgb(55, 126, 184)","rgb(228, 26, 28)","rgb(153, 153, 153)"];
    var regions = getRegions();

    var x = d3.scalePoint().range([0, PCPWidth], 1),
      y = {},
      dragging = {};

    var line = d3.line(),
      axis = d3.axisLeft(),
      regionAxis = d3.axisRight(),
      background,
      foreground;

    // var regionLine = d3.line(),
    // axis = d3.axisRight(),
    // background,
    // foreground;

    var svg = d3
      .select("#svgPcpPlot")
      .append("svg")
      .attr("width", PCPWidth + PcpMargin.left + PcpMargin.right)
      .attr("height", PCPHeight + PcpMargin.top + PcpMargin.bottom)
      .append("g")
      .attr(
        "transform",
        "translate(" + PcpMargin.left + "," + PcpMargin.top + ")"
      );

    x.domain(
      (dimensions = d3.keys(data[0]).filter(function (d) {
        // console.log(d);

        if (categoricalAttributes.includes(d)) {
          return (y[d] = d3
            .scalePoint()
            .domain(
              data.map(function (p) {
                return p[d];
              })
            )
            .range([PCPHeight, 0]));
        } else if(numericalAttributes.includes(d)) {
          return (
            d != "clusters" &&
            (y[d] = d3
              .scaleLinear()
              .domain(
                d3.extent(data, function (p) {
                  return +p[d];
                })
              )
              .range([PCPHeight, 0]))
          );
        }
      }))
    );

    background = svg
      .append("g")
      .attr("class", "background")
      .selectAll("path")
      .data(data)
      .enter()
      .append("path")
      .attr("d", path);

    foreground = svg
      .append("g")
      .attr("class", "foreground")
      .selectAll("path")
      .data(data)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("style", function (d) {
        // return "stroke:" + "rgb(188, 56, 61)" + ";";
        // console.log("Inside this :p");
        // console.log(colors[regions.get(d["Region"])]);
        return "stroke:" + colors[regions.get(d["Region"])] + ";";
      });

    var g = svg
      .selectAll(".dimension")
      .data(dimensions)
      .enter()
      .append("g")
      .attr("class", "dimension")
      .attr("transform", function (d) {
        return "translate(" + x(d) + ")";
      })
      .call(
        d3
          .drag()
          .subject(function (d) {
            return { x: x(d) };
          })
          .on("start", function (d) {
            dragging[d] = x(d);
            background.attr("visibility", "hidden");
          })
          .on("drag", function (d) {
            dragging[d] = Math.min(PCPWidth, Math.max(0, d3.event.x));
            foreground.attr("d", path);
            dimensions.sort(function (a, b) {
              return position(a) - position(b);
            });
            x.domain(dimensions);
            g.attr("transform", function (d) {
              return "translate(" + position(d) + ")";
            });
          })
          .on("end", function (d) {
            delete dragging[d];
            transition(d3.select(this)).attr(
              "transform",
              "translate(" + x(d) + ")"
            );
            transition(foreground).attr("d", path);
            background
              .attr("d", path)
              .transition()
              .delay(500)
              .duration(0)
              .attr("visibility", null);
          })
      );

    g.append("g")
      .attr("class", "axis")
      .attr("class", "axisWhite")
      .each(function (d) {
        console.log(d);
        if(d == "Region") {
          d3.select(this).call(regionAxis.scale(y[d]));
        } else {
          d3.select(this).call(axis.scale(y[d]));
        }
      });
    g.append("text")
      .style("text-anchor", "middle")
      .style("fill","white")
      .attr("y", -15)
      .text(function (d) {
        // console.log(d);
        return d;
      });

    yBrushes = {};
    g.append("g")
      .attr("class", "brush")
      .each(function (d) {
        // console.log(d)
        d3.select(this).call(
          (y[d].brush = d3
            .brushY()
            .extent([
              [-10, 0],
              [10, PCPHeight],
            ])
            .on("start", brushstart)
            .on("brush", brush)
            .on("end", brush))
        );
      });

    function brush() {
      var actives = [];
      var regions = [];
      svg
        .selectAll(".brush")
        .filter(function (d) {
          
          return d3.brushSelection(this);
        })
        .each(function (d) {
          
          actives.push({
            dimension: d,
            extent: d3.brushSelection(this),
          });
        });
      foreground.classed("fade", function (d, i) {
        // console.log(d)
        return !actives.every(function (active) {
          var dim = active.dimension;
          return (
            active.extent[0] <= y[dim](d[dim]) &&
            y[dim](d[dim]) <= active.extent[1]
          );
        });
      });
    }

    function position(d) {
      var v = dragging[d];
      return v == null ? x(d) : v;
    }

    function transition(g) {
      return g.transition().duration(500);
    }

    function path(d) {
      // console.log(d);
      return line(
        dimensions.map(function (p) {
          // console.log([position(p), y[p](d[p])]);
          return [position(p), y[p](d[p])];
        })
      );
    }

    function brushstart() {
      d3.event.sourceEvent.stopPropagation();
    }

    function getRegions() {
      let map = new Map();

      map.set('West North Central', 0);
      map.set('East North Central', 1);
      map.set('South Atlantic', 2);
      map.set('New England', 3);
      map.set('West South Central', 4);
      map.set('Mountain', 5);
      map.set('Pacific', 6);
      map.set('East South Central', 7);
      map.set('Middle Atlantic', 8);

      return map;
    }


  });
}
