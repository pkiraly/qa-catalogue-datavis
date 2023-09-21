export class ZoomableTimelineConfiguration {
    _container = null;
    _apiUrl = null;
    _hasLink = false;

    get container() {
        return this._container;
    }

    get apiUrl() {
        return this._apiUrl;
    }

    get hasLink() {
        return this._hasLink;
    }

    link(query, year) {
        return null;
    }

    detailsChartLabel(minYear, maxYear) {
        return null;
    }
}