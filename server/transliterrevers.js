const translit = require('cyrillic-to-translit-js')
const trans = new translit()

module.exports = (word) => {
    return trans.reverse(word)
}