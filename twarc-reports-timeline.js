d3.json("../test.json", function(data) {

  var metadata = data["metadata"];
  var values = data.values;
  var profile = data.profile;
  var opts = profile.opts;
  var tformat = opts.format;
  var tformatter = d3.time.format(tformat);
  var timezone = opts.timezone;
  var template = opts.template;
  var intervalStr = opts.intervalStr;
  var intervalLabel = opts.intervalLabel;

  var html = "<strong>" + metadata["title"] + "</strong><br/>Search: " + metadata["search"] + " | Timezone: " + timezone + " | Template: " + template + " | Interval: " + intervalLabel + "<br/>";
  html += profile.count + " tweets from " + profile.usercount + " users, including " + profile.retweetcount + " retweets (" + (profile.retweetcount / profile.count * 100).toFixed(2) + "%), ";
  html += "and " + profile.geocount + " with geo (" + (profile.geocount / profile.count * 100).toFixed(2) + "%): ";
  html += profile.earliest + " to " + profile.latest;
  d3.select("#metadata").html(html);

  function type(d) { 
      d.name = d3.time.format(tformat).parse(d.name);
  }

  var vlen = values.length;
  for (var i = 0; i < vlen; i++) {
      type(values[i]);
  }

  var margin = {top: 100, right: 100, bottom: 100, left: 100},
      width = parseInt(d3.select("#chart").style("width")) - margin.left - margin.right,
      height = parseInt(d3.select("#chart").style("height")) - margin.top - margin.bottom;

  var svg = d3.select("#chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.time.scale()
      .domain([
          d3.min(values, function(d) {return d.name}), 
          d3.max(values, function(d) {return d.name})
       ])
      .nice(d3.time.day)
      .range([0, width]);

  var y = d3.scale.linear()
      .domain([0, d3.max(values, function(d) { return d.value; })])
      .range([height, 0]);

  var timespan = x.invert(width) - x.invert(0) // time span of x, in milliseconds
  var interval = opts.interval; // interval of datapoints, in milliseconds
  var intervalCount = timespan / interval; // how many intervals in x
  var barWidth = width / intervalCount; // width of one interval, in pixels

  // x-axis
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.svg.axis().scale(x).orient("bottom"))
  .append("text")
    .attr("class", "label")
    .attr("x", width)
    .attr("y", 30)
    .style("text-anchor", "end")
    .text("date");
      
  // y-axis
  svg.append("g")
    .attr("class", "y axis")
    .call(d3.svg.axis().scale(y).orient("left"))
  .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", -70)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("tweets");

  var bar = svg.selectAll(".bar")
    .data(values)
  .enter().append("g")
    .append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return x(d.name); })
    .attr("width", barWidth)
    .attr("y", function(d) { return y(d.value); })
    .attr("height", function(d) { return height - y(d.value); })
    .append("svg:title")
    .text(function(d) { return tformatter(d.name) + ": " + d.value + " tweets"; });
});