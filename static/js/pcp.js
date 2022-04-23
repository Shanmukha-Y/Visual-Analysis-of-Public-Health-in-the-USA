categoricalAttributes = ["State","Region"];
numericalAttributes = ["Heart","rate","Uninsured","Respiratory","Median AQI","Hospitals","Insurance Firms","Fast Food Centers"];
function pcp() {
  d3.csv("/static/data/allMerged.csv", function (data) {
    console.log("Inside PCP ");
    console.log(data);
    d3.select("#svgPcpPlot").html("");
    var PcpMargin = { top: 30, right: 100, bottom: 10, left: 100 },
      PCPWidth = 900 - PcpMargin.left - PcpMargin.right,
      PCPHeight = 450 - PcpMargin.top - PcpMargin.bottom;

    var x = d3.scalePoint().range([0, PCPWidth], 1),
      y = {},
      dragging = {};

    var line = d3.line(),
      axis = d3.axisLeft(),
      background,
      foreground;

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
        console.log(d);

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
        return "stroke:" + "rgb(188, 56, 61)" + ";";
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
      .each(function (d) {
        d3.select(this).call(axis.scale(y[d]));
      });
    g.append("text")
      .style("text-anchor", "middle")
      .attr("y", -15)
      .text(function (d) {
        console.log(d);
        return d;
      });

    yBrushes = {};
    g.append("g")
      .attr("class", "brush")
      .each(function (d) {
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
      return line(
        dimensions.map(function (p) {
          return [position(p), y[p](d[p])];
        })
      );
    }

    function brushstart() {
      d3.event.sourceEvent.stopPropagation();
    }
  });
}
