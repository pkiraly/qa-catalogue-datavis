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
export const $t = msg => locale.en[msg] || msg
export const $n = n => (1*n).toLocaleString()
export const $tc = (msg, count) => {
    msg = (locale.en[msg] || `{n} ${msg}`).split('|').map(s => s.trim())
    msg = msg[count > 1 && msg.length>1 ? 1 : 0]
    return msg.replaceAll('{n}',count.toLocaleString())
}
