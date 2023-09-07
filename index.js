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
d3.select('#type-' + selectedType).property('checked', 'checked')

d3.selectAll("input[name='type']").on("change", function(){
  selectedType = this.value
  selectType(selectedType)
})

selectType(selectedType)

function selectType(selectedType) {
  if (selectedType == 'map') {
    d3.select('#timeline-container').style("visibility", "hidden")
    d3.select('#timeline-container').style("display", "none")
    d3.select('#map-container').style("visibility", "visible")
    d3.select('#map-container').style("display", "flex")
    if (!mapVis.mapCreated)
      displayMap()
  } else if (selectedType == 'timeline') {
    d3.select('#map-container').style("visibility", "hidden")
    d3.select('#map-container').style("display", "none")
    d3.select('#timeline-container').style("visibility", "visible")
    d3.select('#timeline-container').style("display", "flex")
    if (!mapVis.timelineCreated)
      displayTimeline()
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
  console.log(timelineUrl)
  d3.json(timelineUrl).then(data => {
    const years = Object.keys(data).sort((a,b) => a-b).map(year => {
      return { year: +year, count: +data[year] }
    })
    console.log(years)

    console.log([d3.min(years, d => d.year), d3.max(years, d => d.year)])

    var x = d3.scaleLinear()
      .domain([d3.min(years, d => d.year), d3.max(years, d => d.year)])
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

    var y = d3.scaleLinear()
      .domain([0, d3.max(years, d => d.count)])
      .range([ height, 0])

    svg.append("g")
      .call(d3.axisLeft(y))

    // Bars
    svg.selectAll("mybar")
     .data(years)
     .enter()
     .append("rect")
      .attr("x", function(d) { return x(d.year); })
      .attr("y", function(d) { return y(d.count); })
      .attr("width", barWidth)
      .attr("height", function(d) { return height - y(d.count); })
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

  const citiesUrl = 'get-libraries.php?query=' + userQuery

  let cities = null
  d3.csv(citiesUrl).then(data => {
    cities = data.map(city => {
      // city.id = 'id-' + ('x' + city.lat).replace('.', '_') + '-' + ('y' + city.long).replace('.', '_')
      city.id = 'id-' + city.id
      city.name = city.name
      city.n = +city.count
      city.lat = +city.lat
      city.long = +city.long
      city.libraries = +city.libraries
      return city
    })
    cityScale.domain([1, d3.max(cities, d => d.n)])
    minLat = d3.min(cities, d => d.lat)
    maxLat = d3.max(cities, d => d.lat)
    minLong = d3.min(cities, d => d.long)
    maxLong = d3.max(cities, d => d.long)
    console.log(minLat, maxLat)
    console.log(minLong, maxLong)
    const bounds = [europeProjection([minLong, minLat]), europeProjection([maxLong, maxLat])]
    console.log(bounds)
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
    .html(`<b>${bookNr.toLocaleString()} copies available in ${selectedCities.length.toLocaleString()} cities, ${libraryNr.toLocaleString()} libraries</b>`)

  d3.select('#city-list').html(cityList(selectedCities))

  cityContainer
    .selectAll('circle.city')
    .data(selectedCities, d => d.id)
    .join('circle')
      .attr('class', 'city')
      .attr('id', d => d.id)
      .attr('cx', d => europeProjection([d.long, d.lat])[0])
      .attr('cy', d => europeProjection([d.long, d.lat])[1])
      .attr('r', d => cityScale(d.n))
      .attr('title', d => d.name + ': ' + d.n)
      .attr('fill', d => {
        return (d.id == selectedCity) ? selectedColor : defaultColor
      })
      .attr('fill-opacity', 0.5)
      .on('mouseover', (event, d) => {
        // const text = `${d.name}: ${d.n} ` + (d.n == 1 ? 'copy' : 'copies')
        //            + ` in ${d.libraries} `  + (d.libraries == 1 ? 'library' : 'libraries')
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

    d3.json('api/libraries.php?ids=' + d.ids).then(libraries => {
      libraries = Object.entries(libraries).map(([id,name]) => ({id,name}))
      d3.select('#variants')
        .append('ul')
        .attr('id', 'library-list')
        .selectAll('li')
        .data(libraries)
        .enter()
        .append('li')
        .html(lib => {
          if (mapVis.qaCatalogueBaseURL) {
            let url = mapVis.qaCatalogueBaseURL + '?tab=data&type=solr'
            + '&query=' + encodeURIComponent(userQuery) + '&filters[]=001x400_ss:%22'
            + lib.id + '%22'
            return `${lib.name} <a href="${url}" target="_blank"><i class="fa fa-search" aria-hidden="true"></i></a>`
          } else {
            return lib.name
          }
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
       + '&query=' + encodeURIComponent(query) + '&filters[]=011x40a_ss:%22' + year + '%22'
}

const cityList = (selectedCities) => {
  const all = selectedCities.map(city => `<tr><td class="city" data-id="${city.id}">${city.name}</td><td class="books">${city.n.toLocaleString()}</td></tr>`)
  const split_index = (all.length % 4 == 0) ? all.length / 4 : Math.ceil(all.length / 4)

  return '<div class="column"><table>' + all.slice(0, split_index).join('') + '</table></div>'
       + '<div class="column"><table>' + all.slice(split_index, split_index*2).join('') + '</table></div>'
       + '<div class="column"><table>' + all.slice(split_index*2, split_index*3).join('') + '</table></div>'
       + '<div class="column"><table>' + all.slice(split_index*3).join('') + '</table></div>'

}

const cityTooltipText = (d) =>
    `${d.name}: ${d.n.toLocaleString()} ` + (d.n == 1 ? 'copy' : 'copies')
             + ` in ${d.libraries.toLocaleString()} ` + (d.libraries == 1 ? 'library' : 'libraries')
