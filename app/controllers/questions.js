/**
 * Author: NERO
 * Date: 2019/8/20 0020
 * Time: 22:20
 *
 */
const Question = require('../models/questions')

class QuestionCtl {
  async find(ctx) {
    const { per_page = 10 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1;
    const perPage = Math.max(per_page * 1, 1)
    const q = new RegExp(ctx.query.q)
    ctx.body = await Question
      .find({ $or: [{ title: q }, { description: q }]  })
      .limit(perPage).skip(page * perPage)
  }
  async findById(ctx) {
    const { fields } = ctx.query
    const selectedFields = fields ?
      fields.split(';').filter(v => v).map(v => ' +' + v).join('')
      :
      ''
    const question = await Question.findById(ctx.params.id).select(selectedFields).populate('questioner topics')
    if (!question) {
      ctx.throw(404, '话题不存在')
    }
    ctx.body = question
  }
  async create(ctx) {
    ctx.verifyParams({
      title: { type: 'string', required: true },
      description: { type: 'string', required: false },
    })

    const question = await new Question({ ...ctx.request.body, questioner: ctx.state.user._id }).save()
    ctx.body = question
  }
  async update(ctx) {
    ctx.verifyParams({
      title: { type: 'string', required: false },
      description: { type: 'string', required: false },
    })

    await ctx.state.question.update(ctx.request.body)
    ctx.body = ctx.state.question
  }
  async checkQuestionExist(ctx, next) {
    const question = await Question.findById(ctx.params.id).select('+questioner')
    ctx.state.question = question
    if (!question) { ctx.throw(404, '问题不存在') }
    await next()
  }
  async deleteQuestion(ctx) {
    await Question.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
  }
  async checkQuestioner(ctx, next) {
    const { question } = ctx.state
    if (question.questioner.toString() !== ctx.state.user._id) {
      ctx.throw(403, '没有权限')
    }
    await next()
  }

}

module.exports = new QuestionCtl()