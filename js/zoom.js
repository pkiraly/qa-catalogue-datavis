const zoomVars = {};

export function displayZoomableTimeline() {
    mapVis.zoomableTimelineCreated = true;
    const margin = {top: 30, right: 30, bottom: 20, left: 60};
    zoomVars.outerWidth = 1500;
    zoomVars.width = zoomVars.outerWidth - margin.left - margin.right;
    zoomVars.height = 400 - margin.top - margin.bottom;
    zoomVars.separation = 20;
    zoomVars.focusHeight = 100;

    zoomVars.years = null;
    zoomVars.currentDataset = null;
    zoomVars.bandWidth = null;
    zoomVars.brushInit = 'manual';

    const svg = d3
        .select("#chart")
        .append("svg")
        .attr("width", zoomVars.outerWidth)
        .attr("height", zoomVars.height + margin.top + margin.bottom)
    ;

    const overviewSvg = d3
        .select("#overview")
        .append("svg")
        .attr("width", zoomVars.outerWidth)
        .attr("height", margin.top + zoomVars.focusHeight + margin.bottom)
    ;

    zoomVars.detailsBarGroup = svg.append("g")
        .attr("class", "details-bars")
        .attr("width", zoomVars.width)
        .attr("height", zoomVars.height)
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    zoomVars.overviewBarGroup = overviewSvg.append("g")
        .attr("class", "overview-bars")
        .attr("width", zoomVars.width)
        .attr("height", zoomVars.focusHeight)
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    zoomVars.xScale = d3.scaleTime()
        .range([0, zoomVars.width]);

    zoomVars.xOverviewScale = d3.scaleTime()
        .range([0, zoomVars.width]);

    zoomVars.xAxis = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(${margin.left}, ${margin.top + zoomVars.height})`)
        .call(d3.axisBottom(zoomVars.xScale));

    zoomVars.xOverviewAxis = overviewSvg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(${margin.left}, ${zoomVars.focusHeight + margin.top})`)
        .call(d3.axisBottom(zoomVars.xOverviewScale));

    zoomVars.yScale = d3.scaleLinear()
        .range([zoomVars.height, 0]);

    zoomVars.yOverviewScale = d3.scaleLinear()
        .range([zoomVars.focusHeight, 0]);

    zoomVars.yAxis = svg.append("g")
        .attr("class", "y axis")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(zoomVars.yScale));

    zoomVars.yOverviewAxis = overviewSvg.append("g")
        .attr("class", "y axis overview")
        .attr("height", zoomVars.focusHeight)
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(zoomVars.yOverviewScale));

    const brush = d3.brushX()               // Add the brush feature using the d3.brush function
        // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .extent([[0, 0], [zoomVars.width + margin.right, zoomVars.focusHeight]])
        .on("end", brushed);

    const area = overviewSvg.append('g')
            .attr("class", "brush-group")
            .attr("width", zoomVars.width)
            .attr("height", zoomVars.focusHeight)
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
        // .attr("clip-path", "url(#clip)")
    ;

    area.append("g")
        .attr("class", "brush")
        .call(brush);

    updateData();
}

function updateData() {
    const timelineUrl = 'api/years.php?query=' + encodeURIComponent(mapVis.query)
    d3.json(timelineUrl).then(data => {
        zoomVars.years = Object
            .keys(data)
            .map(year => ({
                year: +year,
                date: d3.timeParse("%Y")(+year),
                count: +data[year],
                value: +data[year]
            }))
        zoomVars.currentDataset = zoomVars.years;
        updateOverviewChart();
        updateDetailsChart();
    });
}

function updateDetailsChart() {
    updateScales(zoomVars.xScale, zoomVars.yScale);
    updateAxes(zoomVars.xAxis, zoomVars.xScale, zoomVars.yAxis, zoomVars.yScale);

    const minX = zoomVars.xScale.domain()[0].getFullYear();
    const maxX = zoomVars.xScale.domain()[1].getFullYear();
    let range = Math.max(1, (maxX - minX));
    // d3.select('h1').html(`${minX}&mdash;${maxX}`);
    zoomVars.bandWidth = Math.round(zoomVars.width / range)
    if (zoomVars.bandWidth > 10)
        zoomVars.bandWidth -= 1;

    // JOIN new data with old elements
    const bars = zoomVars.detailsBarGroup
        .selectAll(".bar")
        .data(zoomVars.currentDataset, d => d.year);
    removeOldElements(bars);
    updateExistingElements(bars, zoomVars.xScale, zoomVars.yScale);
    enterNewElements(bars, zoomVars.xScale, zoomVars.yScale);
}

function updateOverviewChart() {
    updateScales(zoomVars.xOverviewScale, zoomVars.yOverviewScale);
    updateAxes(zoomVars.xOverviewAxis, zoomVars.xOverviewScale, zoomVars.yOverviewAxis, zoomVars.yOverviewScale);

    const minX = zoomVars.xOverviewScale.domain()[0].getFullYear();
    const maxX = zoomVars.xOverviewScale.domain()[1].getFullYear();
    let range = Math.max(1, (maxX - minX));
    zoomVars.bandWidth = Math.round(zoomVars.width / range)
    if (zoomVars.bandWidth > 10)
        zoomVars.bandWidth -= 1;

    // JOIN new data with old elements
    const bars = zoomVars.overviewBarGroup
        .selectAll(".bar")
        .data(zoomVars.currentDataset, d => d.year);
    removeOldElements(bars);
    updateExistingElements(bars, zoomVars.xOverviewScale, zoomVars.yOverviewScale);
    enterNewElements(bars, zoomVars.xOverviewScale, zoomVars.yOverviewScale);
}

function updateScales(currentXScale, currentYScale) {
    const min = d3.min(zoomVars.currentDataset.map(d => d.date));
    const max = d3.max(zoomVars.currentDataset.map(d => d.date));
    currentXScale.domain([min, max]);
    currentYScale.domain([0, d3.max(zoomVars.currentDataset, d => d.count)]).nice();
}

function updateAxes(currentXAxis, currentXScale, currentYAxis, currentYScale) {
    currentXAxis.transition().call(d3.axisBottom(currentXScale));
    currentYAxis.transition().call(d3.axisLeft(currentYScale));
}

function removeOldElements(bars) {
    // EXIT old elements not present in new data
    bars.exit()
        .attr("class", "bar")
        .transition()
        .attr("y", d => zoomVars.height) // old elements which are leaving the chart, their y position transitions to the xaxis
        .attr("height", d => 0) // old elements which are leaving the chart, therir height trasnitions to 0
        .remove();
}

function updateExistingElements(bars, currentXScale, currentYScale) {
    // UPDATE old elements present in new data
    bars.attr("class", "bar")
        .transition()
        .attr("x", d => currentXScale(d.date))  // old elememnts in new data transition to their new position
        .attr("y", d => currentYScale(d.count)) // old elememnts in new data transition to their y position
        .attr("height", (d, i) => zoomVars.height - currentYScale(d.count)) // old elememnts in new data transition to their correct height
        .attr("width", zoomVars.bandWidth)
        .attr("fill", "#063970")
        .attr("fill-opacity", 0.5)
    /*
    .on('mouseover', function(box, d) {
      d3.select(this).attr('fill-opacity', 1.0)
    })
    .on('mouseout', function(box, d) {
      d3.select(this).attr('fill-opacity', 0.5)
    })
    .on('click', function(box, d) {
      window.open(yearQueryLink(userQuery, d.year), '_blank')
    })
     */
    ;
}

function enterNewElements(bars, currentXScale, currentYScale) {
    // ENTER new elements present in new data
    // EXIT and UPDATE above will not apply first time render as there is no change to the data.

    const height = (bars._parents[0].getAttribute('class') == 'overview-bars')
                             ? zoomVars.focusHeight
                             : zoomVars.height;
    bars.enter()
        .append('rect')
        .attr("class", "bar") // fill green
        .attr("x", d => currentXScale(d.date))
        .attr("y", height) // bars start on xaxis or position y=height
        .attr("height", d => 0) // bars start with zero height
        .attr("width", zoomVars.bandWidth)
        .transition()
        .attr("y", (d, i) => currentYScale(d.count))
        .attr("height", (d, i) => height - currentYScale(d.count))
        .attr("fill", "#063970")
        .attr("fill-opacity", 0.5)
    /*
    .on('mouseover', function(box, d) {
      d3.select(this).attr('fill-opacity', 1.0)
    })
    .on('mouseout', function(box, d) {
      d3.select(this).attr('fill-opacity', 0.5)
    })
    .on('click', function(box, d) {
      window.open(yearQueryLink(userQuery, d.year), '_blank')
    })
     */
    ;
    // d3.select('g.details-bars rect.bar').on('click', () => console.log('hello'));
}

function brushed(event) {
    let extent = event.selection

    // If no selection, back to initial coordinate. Otherwise, update X axis domain
    if (!extent) {
        if (zoomVars.brushInit == 'manual')
            zoomVars.currentDataset = zoomVars.years;
        zoomVars.brushInit = 'manual';
    } else {
        let minYear = zoomVars.xOverviewScale.invert(extent[0]).getFullYear();
        let maxYear = zoomVars.xOverviewScale.invert(extent[1]).getFullYear();
        zoomVars.currentDataset = zoomVars.years.filter(d => (d.year >= minYear && d.year <= maxYear));
        zoomVars.brushInit = 'automate';
        // area.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
    }

    updateDetailsChart();
}

function restoreStatus() {
    zoomVars.currentDataset = zoomVars.years;
    updateDetailsChart();
}
