/**
 * Author: NERO
 * Date: 2019/8/19 0019
 * Time: 22:50
 *
 */
const fs = require('fs')
module.exports = app => {
  fs.readdirSync(__dirname).forEach(file => {
    if (file === 'index.js') return
    const route = require(`./${file}`)
    app.use(route.routes()).use(route.allowedMethods())
  })
}