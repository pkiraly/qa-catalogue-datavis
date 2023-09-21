/**
 * This file contains utility functions which could be used in different other places
 */

/**
 * Generates a link for the search page of QA catalogue querying for the user entered query filtered by year of publication
 * @param query
 * @param year
 * @returns {string}
 */
export function yearQueryLink(query, year) {
    return mapVis.qaCatalogueBaseURL + '?tab=data&type=solr'
        + '&query=' + encodeURIComponent(query) + `&filters[]=${mapVis.yearField}:%22` + year + '%22'
}
