const req = new XMLHttpRequest();
const w = 1000;
const h = 500;
const padding = 50;
const r = 9;

req.open("GET", "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json", "true");
req.send();

req.onload = function () {


  const data = JSON.parse(req.responseText);

  var parseTime = d3.timeParse("%M:%S");
  var timeFormat = d3.timeFormat("%M:%S");

  var timeYear = data.map(item => {
    return [item["Year"], parseTime(item["Time"])];
  });

  var doping = data.map(item => item["Doping"]);

  var person = data.map(item => {
    return [item["Name"], item["Nationality"]];
  });

  var dopingKeys = [0, 1];

  var dopingColors = d3.scaleOrdinal().
  domain(dopingKeys).
  range(d3.schemeSet1);

  const domainX = d3.extent(timeYear, d => d[0]);
  const domainY = d3.extent(timeYear, d => d[1]);

  const xScale = d3.scaleLinear().
  domain([domainX[0] - 1, domainX[1] + 1]).
  range([padding, w - padding]);

  const yScale = d3.scaleTime().
  domain(domainY).
  range([h - padding, padding]);

  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

  const yAxis = d3.axisLeft(yScale).tickFormat(timeFormat);

  const svg = d3.select("#plot").
  append("svg").
  attr("height", h).
  attr("width", w);

  const legend = svg.append("g").attr("id", "legend");
  const size = 10;
  const legendKeys = ["Riders with doping allegations", "No doping allegations"];

  var legendColor = d3.scaleOrdinal().
  domain(legendKeys).
  range(d3.schemeSet1);

  legend.selectAll("#legend").
  data(legendKeys).
  enter().
  append("rect").
  attr("x", "970").
  attr("y", (d, i) => 200 + i * (size * 2)).
  attr("width", size).
  attr("height", size).
  attr("fill", (d, i) => legendColor(d));

  legend.selectAll("#legend").
  data(legendKeys).
  enter().
  append("text").
  attr("x", "750").
  attr("y", (d, i) => 200 + i * (size * 2) + size / 2).
  text((d, i) => d).
  style("alignment-baseline", "middle");

  var tooltip = d3.select("#main").
  append("div").
  attr("id", "tooltip");

  svg.append("g").
  transition().
  duration(1000).
  attr("id", "x-axis").
  attr("transform", "translate(0," + (h - padding) + ")").
  call(xAxis);

  svg.append("g").
  transition().
  duration(1000).
  attr("id", "y-axis").
  attr("transform", "translate(" + padding + ",0)").
  call(yAxis);




  svg.selectAll("circle").
  data(timeYear).
  enter().
  append("circle").
  datum(([x, y], i) => [x, y, i]).
  attr("data-xvalue", (d, i) => d[0]).
  attr("data-yvalue", (d, i) => d[1]).
  attr("cx", (d, i) => xScale(d[0])).
  attr("cy", (d, i) => yScale(d[1])).
  attr("r", r).
  attr("class", "dot").
  attr("fill", (d, i) => {
    if (doping[i].length === 0) {
      return dopingColors(1);
    } else
    {
      return dopingColors(0);
    }
  }).
  on("mouseover", function (event, d) {
    tooltip.attr("data-year", d[0]).
    html(JSON.stringify(person[d[2]][0]) + ", " +
    person[d[2]][1] + "<br>" +
    "Time: " + d[0] + "<br>" +
    doping[d[2]] + "<br>").
    transition().
    duration(200).
    style("opacity", "1").
    style("top", event.pageY + "px").
    style("left", event.pageX + "px");
  }).
  on("mouseout", function () {
    tooltip.transition().
    duration(1).
    style("opacity", "0");
  });


};