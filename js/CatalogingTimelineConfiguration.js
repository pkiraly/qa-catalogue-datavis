import { ZoomableTimelineConfiguration } from './ZoomableTimelineConfiguration.js';

export class CatalogingTimelineConfiguration extends ZoomableTimelineConfiguration {
    _container = '#cataloging-timeline-container';
    _apiUrl = 'api/cataloging-timeline.php';

    detailsChartLabel(minYear, maxYear) {
        return `catalogued between ${minYear} and ${maxYear}`;
    }
}
