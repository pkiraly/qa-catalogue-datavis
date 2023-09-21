import { ZoomableTimelineConfiguration } from './ZoomableTimelineConfiguration.js';
import { yearQueryLink } from './common.js';

export class PublicationTimelineConfiguration extends ZoomableTimelineConfiguration {
    _container = '#publication-timeline-container';
    _apiUrl = 'api/years.php';
    _hasLink = true;

    link(query, year) {
        return yearQueryLink(query, year)
    }

    detailsChartLabel(minYear, maxYear) {
        return `publications between ${minYear}-${maxYear}`;
    }
}