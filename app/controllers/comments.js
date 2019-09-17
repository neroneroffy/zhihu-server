/**
 * Author: NERO
 * Date: 2019/8/20 0020
 * Time: 22:20
 *
 */
const Comment = require('../models/comments')

class CommentCtl {
  async find(ctx) {
    const { per_page = 10 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1;
    const perPage = Math.max(per_page * 1, 1)
    const q = new RegExp(ctx.query.q)
    const { questionId, answerId } = ctx.params
    const { rootCommentId } = ctx.query
    ctx.body = await Comment
      .find({ content: q, questionId, answerId, rootCommentId })
      .limit(perPage).skip(page * perPage)
      .populate('commentator replyTo')
  }
  async findById(ctx) {
    const { fields } = ctx.query
    const selectedFields = fields ?
      fields.split(';').filter(v => v).map(v => ' +' + v).join('')
      :
      ''
    const comment = await Comment.findById(ctx.params.id).select(selectedFields).populate('commentator')
    if (!comment) {
      ctx.throw(404, '答案不存在')
    }
    ctx.body = comment
  }
  async create(ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: true },
      rootCommentId: { type: 'string', required: false },
      replyTo: { type: 'string', required: false },
    })

    const comment = await new Comment({ ...ctx.request.body,
      commentator: ctx.state.user._id,
      questionId: ctx.params.questionId,
      answerId: ctx.params.answerId,
    }).save()
    ctx.body = comment
  }
  async update(ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: false },
    })
    const { content } = ctx.request.body
    await ctx.state.comment.update({ content })
    ctx.body = ctx.state.comment
  }
  async checkCommentExist(ctx, next) {
    const comment = await Comment.findById(ctx.params.id).select('+commentator')
    ctx.state.comment = comment
    if (!comment) { ctx.throw(404, '评论不存在') }
    if (ctx.params.questionId && ctx.params.questionId !== comment.questionId) {
      ctx.throw(404, '该问题下没有此评论')
    }
    if (ctx.params.answerId && ctx.params.answerId !== comment.answerId) {
      ctx.throw(404, '该答案下没有此评论')
    }

    await next()
  }
  async deleteComment(ctx) {
    await Comment.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
  }
  async checkCommentator(ctx, next) {
    const { comment } = ctx.state
    if (comment.commentator.toString() !== ctx.state.user._id) {
      ctx.throw(403, '没有权限')
    }
    await next()
  }

}

module.exports = new CommentCtl()