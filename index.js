import { displayZoomableTimeline } from './js/zoom.js';

// localization
const locale = {
  en: {
    'holdings': '1 holding | {n} holdings',
    'in-libraries': 'in one library | in {n} libraries',
    'cities': 'one city | {n} cities',
    'search-qa': 'search records in QA catalogue',
    'lobid-org-link': 'Information about the organisation (hbz lobid)'
  }
}
const $t = msg => locale.en[msg] || msg
const $n = n => (1*n).toLocaleString()
const $tc = (msg, count) => {
  msg = (locale.en[msg] || `{n} ${msg}`).split('|').map(s => s.trim())
  msg = msg[count > 1 && msg.length>1 ? 1 : 0]
  return msg.replaceAll('{n}',count.toLocaleString())
}

const cityTooltipText = d => `${d.name}: ` + $tc('holdings', d.n) + ' ' + $tc('in-libraries', d.libraries.length)

// Setting up the svg element for D3 to draw in
const width = 800,
      height = (width * 1.0)

const selectedColor = 'maroon'
const defaultColor = '#063970'

const slider_margin = {top: 10, bottom: 0, left: 20, right: 20}
const slider_width = width
const slider_height = 70

var selectedCity = null
var selectedCityIsAvailable = false

const map = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height)
const countryCountainer = map.append('g')
    .attr('id', 'countries')
const cityContainer = map.append('g')
    .attr('id', 'cities')

const tooltipSvg = map.append('g')
    .attr('id', 'tooltipSvg')
tooltipSvg.append('text')
      .attr('id', 'tooltip-text')
      .attr('fill', 'maroon')
      .attr('text-anchor', 'start')

const tooltip = map.append('g')
  .attr('class', 'tooltip-group')
  .attr('transform', `translate(0,0)`)
  .style('font-size', '14px')
const tooltipLineVertical = tooltip
  .append('line')
    .attr('id', 'tooltip-line-vertical')
    .attr('x1', 0)
    .attr('y1', height)
    .attr('x2', 0)
    .attr('y2', 0)
    .attr('stroke', '#45343D')
    .attr('stroke-dasharray', '16 4')
    .attr('stroke-opacity', 0.3)

const tooltipLineHorizontal = tooltip
  .append('line')
    .attr('id', 'tooltip-line-horizontal')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', width)
    .attr('y2', 0)
    .attr('stroke', '#45343D')
    .attr('stroke-dasharray', '16 4')
    .attr('stroke-opacity', 0.3)

let minLat = null
let maxLat = null
let minLong = null
let maxLong = null
let currentScale = null
let currentTranslate = null

d3.select('div#value-time').text('')
const searchEl = d3.select('#search')
const submitButton = d3.select('#submit')

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
const userQuery = urlParams.get('query') || ''
searchEl.property('value', userQuery)

let selectedType = urlParams.get('type') != null
                   && (urlParams.get('type') == 'map' || urlParams.get('type') == 'timeline')
                 ? urlParams.get('type')
                 : 'map'
// d3.select('#type-' + selectedType).property('checked', 'checked')

/*
d3.selectAll("input[name='type']").on("change", function(){
  selectedType = this.value
  selectType(selectedType)
})
*/

selectType(mapVis.selectedType)

function selectType(selectedType) {
  if (selectedType == 'map') {
    showOnly('#map-container');
    if (!mapVis.mapCreated)
      displayMap()
  } else if (selectedType == 'timeline') {
    showOnly('#timeline-container');
    if (!mapVis.timelineCreated)
      displayTimeline()
  } else if (selectedType == 'zoomable-timeline') {
    showOnly('#zoomable-timeline-container');
    if (!mapVis.timelineCreated)
      displayZoomableTimeline()
  } else if (selectedType == 'cataloging-timeline') {
    showOnly('#cataloging-timeline-container');
    if (!mapVis.catalogingTimelineCreated)
      displayCatalogingTimeline()
  }
}

function showOnly(container) {
  const containers = ['#map-container', '#timeline-container', '#cataloging-timeline-container'];
  for (let i = 0; i < containers.length; i++) {
    if (container == containers[i]) {
      d3.select(containers[i]).style("visibility", "visible")
      d3.select(containers[i]).style("display", "flex")
    } else {
      d3.select(containers[i]).style("visibility", "hidden")
      d3.select(containers[i]).style("display", "none")
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

  const timelineUrl = 'api/years.php?query=' + encodeURIComponent(userQuery)
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
        window.open(yearQueryLink(userQuery, d.year), '_blank')
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

  const timelineUrl = 'api/cataloging_date.php?query=' + encodeURIComponent(userQuery)
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
          window.open(yearQueryLink(userQuery, d.year), '_blank')
        })
  })
}

function displayMap() {
  mapVis.mapCreated = true

  // A projection tells D3 how to orient the GeoJSON features
  const europeProjection = d3.geoMercator()
    .center([ 13, 52 ])
    .scale([ width / 1.5 ])
    .translate([ width / 2, height / 2 ])

  // The path generator uses the projection to convert the GeoJSON
  // geometry to a set of coordinates that D3 can understand
  const pathGenerator = d3.geoPath().projection(europeProjection)

  // URL to the GeoJSON itself
  const geoJsonUrl = 'https://gist.githubusercontent.com/spiker830/3eab0cb407031bf9f2286f98b9d0558a/raw/7edae936285e77be675366550e20f9166bed0ed5/europe_features.json'

  // Request the GeoJSON
  d3.json(geoJsonUrl).then(geojson => {
    // Tell D3 to render a path for each GeoJSON feature
    countryCountainer
      .selectAll('path')
      .data(geojson.features)
      .enter()
      .append('path')
        .attr('d', pathGenerator) // This is where the magic happens
        .attr('stroke', '#ddd') // Color of the lines themselves
        .attr('fill', 'white') // Color uses to fill in the lines
        .attr('fill-opacity', 0)
  })


  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed)

  map.call(zoom)

  d3.select('#zoom-in').on('click', function(event) {
    zoom.scaleBy(map.transition().duration(750), 1.3)
  })

  d3.select('#zoom-out').on('click', function(event) {
    zoom.scaleBy(map.transition().duration(750), 1 / 1.3)
  })

  const cityScale = d3.scaleSqrt()
    .domain([1, 20])
    .range([1, 5])

  const citiesUrl = 'api/cities.php?query=' + encodeURIComponent(userQuery)

  d3.json(citiesUrl).then(data => {
    const cities = Object.entries(data).map(([id,city]) => {
      city.id = 'id-' + id
      city.n = city.holdings.reduce((a, b) => a + b)
      city.lat = +city.lat
      city.lon = +city.lon
      city.libraries = city.libraries
      const ids = city.libraries
      const counts = city.holdings
      city.libCounts = {};
      for (var i= 0; i < ids.length; i++) {
        city.libCounts[ids[i]] = +counts[i];
      }
      city.lon = +city.lon
      return city
    }).sort((a,b) => b.n - a.n)
    cityScale.domain([1, d3.max(cities, d => d.n)])
    minLat = d3.min(cities, d => d.lat)
    maxLat = d3.max(cities, d => d.lat)
    minLong = d3.min(cities, d => d.lon)
    maxLong = d3.max(cities, d => d.lon)
    console.log(minLat, maxLat)
    console.log(minLong, maxLong)
    const bounds = [europeProjection([minLong, minLat]), europeProjection([maxLong, maxLat])]
    var dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = Math.max(1, Math.min(7, 0.9 / Math.max(dx / width, dy / height))),
        translate = [width / 2 - scale * x, height / 2 - scale * y]

    currentScale = scale
    currentTranslate = translate

    map.transition()
       .duration(750)
       .call(
         zoom.transform,
         d3.zoomIdentity
           .translate(translate[0], translate[1]).scale(scale)
       )

    render(cities, europeProjection, cityScale)
  })
}

function zoomed(event) {
  const transform = event.transform
  currentScale = transform.k
  currentTranslate = [transform.x, transform.y]
  countryCountainer.attr('transform', event.transform)
  cityContainer.attr('transform', event.transform)
  tooltipSvg.attr('transform', event.transform)
}

function render(selectedCities, europeProjection, cityScale) {
  // const selectedCities = cities
  selectedCityIsAvailable = selectedCities.filter(d => d.id == selectedCity).length > 0
  const bookNr = selectedCities.reduce((sum, d) => {return sum + d.n}, 0)
  const libraryNr = selectedCities.reduce((sum, d) => {return sum + d.libraries}, 0)

  d3.select('div#value-time')
    .html(`<b>${$tc('cities',selectedCities.length)}: ${$tc('holdings',bookNr)} ${$tc('in-libraries',libraryNr)}</b>`)

  d3.select('#city-list').html(cityList(selectedCities))

  cityContainer
    .selectAll('circle.city')
    .data(selectedCities, d => d.id)
    .join('circle')
      .attr('class', 'city')
      .attr('id', d => d.id)
      .attr('cx', d => europeProjection([d.lon, d.lat])[0])
      .attr('cy', d => europeProjection([d.lon, d.lat])[1])
      .attr('r', d => cityScale(d.n))
      .attr('title', d => d.name + ': ' + d.n)
      .attr('fill', d => {
        return (d.id == selectedCity) ? selectedColor : defaultColor
      })
      .attr('fill-opacity', 0.5)
      .on('mouseover', (event, d) => {
        tooltipSvg.attr('transform', `translate(${event.pageX},${event.pageY})`)
                  .style('visibility', 'visible')
        d3.select('#tooltip-text').html(cityTooltipText(d))
      })
      .on('click', (event, d) => {
        selectCity(d.id)
      })
      .on('mouseout', (event, d) => {
        if (d.id != selectedCity)
          tooltipSvg.style('visibility', 'hidden')
      })


  d3.selectAll('td.city').on('click', function() {
    const id = this.attributes['data-id'].value
    selectCity(id)
  })


  if (selectedCity != null) {
    selectedCityIsAvailable = cities.filter(d => d.id == selectedCity).length > 0
    selectCity(selectedCity)
  }
}

const selectCity = id => {
  if (selectedCity != null) {
    const oldText = d3.select('td.city[data-id=' + selectedCity + ']')
    if (!oldText.empty())
      oldText
        .style('color', null)
        .style('font-weight', null)
    const oldCircle = cityContainer.select('#' + selectedCity)
    if (!oldCircle.empty())
      oldCircle.attr('fill', defaultColor)
  }

  // text in city list
  d3.select('td.city[data-id=' + id + ']')
    .style('color', selectedColor)
    .style('font-weight', 'bolder');

  const city = cityContainer.select('#' + id)
  if (!city.empty()) {
    city.attr('fill', selectedColor)

    const d = city.data()[0]
    const offsetX = city.attr('cx') * currentScale + currentTranslate[0]
    const offsetY = city.attr('cy') * currentScale + currentTranslate[1]
    tooltipSvg.attr('transform', `translate(${offsetX + 10}, ${offsetY - 10})`)
              .style('visibility', 'visible')
    tooltipSvg.select('#tooltip-text').html(cityTooltipText(d))

    tooltipLineVertical.attr('x1', offsetX).attr('x2', offsetX)
    tooltipLineHorizontal.attr('y1', offsetY).attr('y2', offsetY)

    d3.select('#variants').html("<b>"+cityTooltipText(d)+"</b>")

    d3.json('api/libraries.php?ids=' + d.libraries.join(",")).then(libraries => {
      libraries = Object.entries(libraries).map(([id,details]) => ({id,details}))
      d3.select('#variants')
        .append('ul')
        .attr('id', 'library-list')
        .selectAll('li')
        .data(libraries)
        .enter()
        .append('li')
        .html(lib => {
          let html = `${lib.details.name} (${$tc('holdings',d.libCounts[lib.id])})`
          if (mapVis.qaCatalogueBaseURL) {
            let searchUrl = mapVis.qaCatalogueBaseURL + '?tab=data&type=solr'
                          + '&query=' + encodeURIComponent(userQuery)
                          + `&filters[]=${mapVis.libraryField}:%22`  + lib.id + '%22';
            html += `&nbsp;<a href="${searchUrl}" target="_blank" title="${$t('search-qa')}"><i class="fa fa-search" aria-hidden="true"></i></a>`
          }
          if (lib.details.isil) {
            let lobidUrl = 'http://lobid.org/organisations/' + lib.details.isil
            html += `&nbsp;<a href="${lobidUrl}" target="_blank" title="${$t('lobid-org-link')}"><i class="fa-solid fa-globe" aria-hidden="true"></i></a>`
          }
          return html
        })
    })

  } else {
    tooltipSvg.select('#tooltip-text').text('')
    d3.select('#variants').html('')
  }

  selectedCity = id
}

const yearQueryLink = (query, year) => {
  return mapVis.qaCatalogueBaseURL + '?tab=data&type=solr'
       + '&query=' + encodeURIComponent(query) + `&filters[]=${mapVis.yearField}:%22` + year + '%22'
}

const cityList = (selectedCities) => {
  const all = selectedCities.map(city => `<tr><td class="city" data-id="${city.id}">${city.name}</td><td class="books">${$n(city.n)}</td></tr>`)
  const split_index = (all.length % 4 == 0) ? all.length / 4 : Math.ceil(all.length / 4)

  return '<div class="column"><table>' + all.slice(0, split_index).join('') + '</table></div>'
       + '<div class="column"><table>' + all.slice(split_index, split_index*2).join('') + '</table></div>'
       + '<div class="column"><table>' + all.slice(split_index*2, split_index*3).join('') + '</table></div>'
       + '<div class="column"><table>' + all.slice(split_index*3).join('') + '</table></div>'

}

