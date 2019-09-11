/**
 * Author: NERO
 * Date: 2019/8/20 0020
 * Time: 22:20
 *
 */
const Topic = require('../models/topics')
const Users = require('../models/users')
const Question = require('../models/questions')

class TopicCtl {
  async find(ctx) {
    const { per_page = 10 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1;
    const perPage = Math.max(per_page * 1, 1)
    ctx.body = await Topic
      .find({ name: new RegExp(ctx.query.q) })
      .limit(perPage).skip(page * perPage)
  }
  async findById(ctx) {
    const { fields } = ctx.query
    const selectedFields = fields ?
      fields.split(';').filter(v => v).map(v => ' +' + v).join('')
      :
      ''
    const topic = await Topic.findById(ctx.params.id).select(selectedFields)
    if (!topic) {
      ctx.throw(404, '话题不存在')
    }
    ctx.body = topic
  }
  async create(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false }
    })

    const topic = await new Topic(ctx.request.body).save()
    ctx.body = topic
  }
  async update(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false }
    })

    const topic = await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    ctx.body = topic
  }
  async checkTopicExist(ctx, next) {
    const topic = await Topic.findById(ctx.params.id)
    if (!topic) { ctx.throw(404, '话题不存在') }
    await next()
  }
  async listTopicFollowers(ctx) {
    const users = await Users.find({ followingTopics: ctx.params.id })
    ctx.body = users
  }
  async listQuestions(ctx) {
    const questions = await Question.find({ topics: ctx.params.id })
    ctx.body = questions
  }
}

module.exports = new TopicCtl()