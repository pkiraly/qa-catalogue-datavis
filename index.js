import { $t, $n, $tc } from './js/locale.js';
import { displayZoomableTimeline } from './js/zoom.js';
import { displayMap } from './js/map.js';
import { yearQueryLink } from './js/common.js';
import { PublicationTimelineConfiguration } from "./js/PublicationTimelineConfiguration.js";
import { CatalogingTimelineConfiguration } from "./js/CatalogingTimelineConfiguration.js";

d3.select('div#value-time').text('')
const searchEl = d3.select('#search')
const submitButton = d3.select('#submit')

selectType(mapVis.selectedType)

function selectType(selectedType) {
  if (selectedType == 'map') {
    showOnly('#map-container');
    if (!mapVis.mapCreated)
      displayMap();
  } else if (selectedType == 'publication-timeline') {
    showOnly('#publication-timeline-container');
    if (!mapVis.timelineCreated)
      displayZoomableTimeline(new PublicationTimelineConfiguration());
  } else if (selectedType == 'cataloging-timeline') {
    showOnly('#cataloging-timeline-container');
    if (!mapVis.catalogingTimelineCreated)
      displayZoomableTimeline(new CatalogingTimelineConfiguration());
  }
}

function showOnly(container) {
  const containers = ['#map-container', '#publication-timeline-container', '#cataloging-timeline-container'];
  for (let i = 0; i < containers.length; i++) {
    if (container == containers[i]) {
      d3.select(containers[i]).style("visibility", "visible");
      let defaultDisplay = container == '#map-container' ? 'flex' : 'display';
      d3.select(containers[i]).style("display", defaultDisplay);
    } else {
      d3.select(containers[i]).style("visibility", "hidden");
      d3.select(containers[i]).style("display", "none");
    }
  }
}

function displayTimeline() {
  mapVis.timelineCreated = true
  var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 1500 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom

  // append the svg object to the body of the page
  var svg = d3.select("#timeline-container")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")

  const timelineUrl = 'api/publication-timeline.php?query=' + encodeURIComponent(mapVis.query)
  d3.json(timelineUrl).then(data => {
    const years = Object.keys(data).sort((a,b) => a-b).map(year => {
      return { year: +year, count: +data[year] }
    })

    var x = d3.scaleLinear()
      .domain([d3.min(years, d => d.year) - 5, d3.max(years, d => d.year) + 5])
      .range([ 0, width ])

    const barWidth = (width / (x.domain()[1] - x.domain()[0])) - 1

    // x axis
    svg.append("g")
       .attr("transform", "translate(0," + height + ")")
       .call(d3.axisBottom(x))
       .selectAll("text")
       .text(d => d.toString())
       .attr("transform", "translate(-10,0)rotate(-45)")
       .style("text-anchor", "end")

    let scaleType = 'sqrt2';
    const maxCount = d3.max(years, d => d.count);
    let y;
    if (scaleType == 'log') {
      y = d3.scaleLog().domain([0.3, maxCount]).range([height, 0]).nice();
      // y = d3.scaleLog([0, maxCount], [0, height]).base(10);
    } else if (scaleType == 'log2') {
      y = d3.scaleLog().base(2).domain([0.1, maxCount]).range([height, 0]);
    } else if (scaleType == 'sqrt') {
      y = d3.scaleSqrt().domain([0, maxCount]).range([ height, 0]);
    } else if (scaleType == 'sqrt2') {
      y = d3.scalePow().exponent(0.2).domain([0, maxCount]).range([ height, 0]);
    } else if (scaleType == 'lin') {
      y = d3.scaleLinear().domain([0, maxCount]).range([ height, 0]);
    }

    console.log(y);
    svg.append("g")
      .call(d3.axisLeft(y))

    // Bars
    svg.selectAll("mybar")
     .data(years)
     .enter()
     .append("rect")
      .attr("x", function(d) { return x(d.year); })
      .attr("y", function(d) {
        // console.log(d.count, '->', y(d.count));
        return d.count == 0 ? 0 : y(d.count);
      })
      .attr("width", barWidth)
      .attr("height", function(d) {
        return height - (d.count == 0 ? 0 : y(d.count));
      })
      .attr("fill", "#063970")
      .attr("fill-opacity", 0.5)
      .on('mouseover', function(box, d) {
        d3.select(this).attr('fill-opacity', 1.0)
      })
      .on('mouseout', function(box, d) {
        d3.select(this).attr('fill-opacity', 0.5)
      })
      .on('click', function(box, d) {
        window.open(yearQueryLink(mapVis.query, d.year), '_blank')
      })

  })
}


function displayCatalogingTimeline() {
  mapVis.catalogingTimelineCreated = true;
  const margin = {top: 30, right: 30, bottom: 70, left: 60},
      width = 1500 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#cataloging-timeline-container")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")")

  const timelineUrl = 'api/cataloging-timeline.php?query=' + encodeURIComponent(mapVis.query)
  d3.json(timelineUrl).then(data => {
    const years = Object.keys(data).sort((a,b) => a-b).map(year => {
      return { year: +year, count: +data[year] }
    })

    var x = d3.scaleLinear()
        .domain([d3.min(years, d => d.year) - 5, d3.max(years, d => d.year) + 5])
        .range([ 0, width ])

    const barWidth = (width / (x.domain()[1] - x.domain()[0])) - 1

    // x axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .text(d => d.toString())
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")

    let scaleType = 'lin';
    const maxCount = d3.max(years, d => d.count);
    let y;
    if (scaleType == 'log') {
      y = d3.scaleLog().domain([0.3, maxCount]).range([height, 0]).nice();
      // y = d3.scaleLog([0, maxCount], [0, height]).base(10);
    } else if (scaleType == 'log2') {
      y = d3.scaleLog().base(2).domain([0.1, maxCount]).range([height, 0]);
    } else if (scaleType == 'sqrt') {
      y = d3.scaleSqrt().domain([0, maxCount]).range([ height, 0]);
    } else if (scaleType == 'sqrt2') {
      y = d3.scalePow().exponent(0.2).domain([0, maxCount]).range([ height, 0]);
    } else if (scaleType == 'lin') {
      y = d3.scaleLinear().domain([0, maxCount]).range([ height, 0]);
    }

    console.log(y);
    svg.append("g")
        .call(d3.axisLeft(y))

    // Bars
    svg.selectAll("mybar")
        .data(years)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.year); })
        .attr("y", function(d) {
          // console.log(d.count, '->', y(d.count));
          return d.count == 0 ? 0 : y(d.count);
        })
        .attr("width", barWidth)
        .attr("height", function(d) {
          return height - (d.count == 0 ? 0 : y(d.count));
        })
        .attr("fill", "#063970")
        .attr("fill-opacity", 0.5)
        .on('mouseover', function(box, d) {
          d3.select(this).attr('fill-opacity', 1.0)
        })
        .on('mouseout', function(box, d) {
          d3.select(this).attr('fill-opacity', 0.5)
        })
        .on('click', function(box, d) {
          window.open(yearQueryLink(mapVis.query, d.year), '_blank')
        })
  })
}


