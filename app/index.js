/**
 * Author: NERO
 * Date: 2019/8/14 0014
 * Time: 22:00
 *
 */
const Koa = require('koa')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
const app = new Koa()
const routing = require('./routes')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const mongoose = require('mongoose')
const path = require('path')
const { connectionStr } = require('./config')

mongoose.connect(connectionStr, () => console.log('MongoDB已经连接'))
mongoose.connection.on('err', console.error)

app.use(koaStatic(path.join(__dirname, 'public')))
app.use(error({
  postFormat: (e, { stack, ...rest }) => process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
}))

app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, '/public/uploads'),
    keepExtensions: true,
  }
}))
app.use(parameter(app))
routing(app)
app.listen(3000, () => console.log('app lintening on port 3000'))