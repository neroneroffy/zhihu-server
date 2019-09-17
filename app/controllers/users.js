/**
 * Author: NERO
 * Date: 2019/8/20 0020
 * Time: 22:20
 *
 */
const jsonwebtoken = require('jsonwebtoken')
const User = require('../models/users')
const Question = require('../models/questions')
const Answer = require('../models/answers')
const { secret } = require('../config')

class UsersCtl {
  async find(ctx) {
    const { per_page = 10 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1;
    const perPage = Math.max(per_page * 1, 1)
    ctx.body = await User
      .find({ name: new RegExp(ctx.query.q) })
      .limit(perPage).skip(page * perPage)

  }
  async findById(ctx) {
    const { fields } = ctx.query
    const selectedFields = fields ?
      fields.split(';').filter(v => v).map(v => ' +' + v).join('')
      :
      ''
    const populateStr = fields.split(';').filter(v => v).map(v => {
      if (v === 'employments') {
        return 'employments.company employments.job'
      }
      if (v === 'educations') {
        return 'educations.school educations.major'
      }
      return v
    }).join(' ')
    const user = await User.findById(ctx.params.id).select(selectedFields)
      .populate(populateStr)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user
  }
  async create(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true },
    })
    const { name } = ctx.request.body
    const repeatedUser = await User.findOne({ name })
    if (repeatedUser) {
      ctx.throw(409, '用户名已存在')
    }
    const user = await new User(ctx.request.body).save()
    ctx.body = user
  }
  async update(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      password: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false },
      gender: { type: 'string', required: false },
      headLine: { type: 'string', required: false },
      locations: { type: 'array', itemType: 'string', required: false },
      business: { type: 'string', required: false },
      employments: { type: 'array', itemType: 'object', required: false },
      educations: { type: 'array', itemType: 'object', required: false },
    })

    const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)

    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user
  }
  async deleteUser(ctx) {
    const user = await User.findByIdAndRemove(ctx.params.id)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.status = 204
  }
  async checkOwner(ctx, next) {
    if (ctx.params.id !== ctx.state.user._id) {
      ctx.throw(403, '没有权限')
    }
    await next()
  }
  async login(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true },
    })
    const user = await User.findOne(ctx.request.body)
    if (!user) {
      ctx.throw(401, '用户名或密码不正确')
    }
    const { _id, name } = user
    const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn: '1d' })
    ctx.body = { token }
  }
  async listFollowing(ctx) {
    const user = await User.findById(ctx.params.id).select('+following').populate('following')
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user.following
  }
  async checkUserExist(ctx, next) {
    const user = await User.findById(ctx.params.id)
    if (!user) { ctx.throw(404, '用户不存在') }
    await next()
  }
  async follow(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following')
    if (!me.following.map(v => v.toString()).includes(ctx.params.id)) {
      me.following.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
  }
  async listFollowers(ctx) {
    const users = await User.find({ following: ctx.params.id })
    ctx.body = users
  }
  async unfollow(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following')
    const index = me.following.map(v => v.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.following.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }
  async unfollowTopic(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingTopics')
    const index = me.followingTopics.map(v => v.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.followingTopics.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }
  async followTopic(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingTopics')
    if (!me.followingTopics.map(v => v.toString()).includes(ctx.params.id)) {
      me.followingTopics.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
  }
  async followQuestion(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingQuestions')
    if (!me.followingQuestions.map(v => v.toString()).includes(ctx.params.id)) {
      me.followingQuestions.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
  }
  async listFollowingQuestion(ctx) {
    const user = await User.findById(ctx.params.id).select('+followingQuestions').populate('followingQuestions')
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user.followingQuestions
  }
  async unfollowQuestion(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingQuestions')
    const index = me.followingQuestions.map(v => v.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.followingQuestions.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }
  async listFollowingTopics(ctx) {
    const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics')
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user.followingTopics
  }
  async listQuestions(ctx) {
    const questions = await Question.find({ questioner: ctx.params.id })
    ctx.body = questions
  }
  async listLikingAnswers(ctx) {
    const user = await User.findById(ctx.params.id).select('+likingAnswers').populate('likingAnswers')
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user.likingAnswers
  }
  async unlikeAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+likingAnswers')
    const index = me.likingAnswers.map(v => v.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.likingAnswers.splice(index, 1)
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: -1 } })

    }
    ctx.status = 204
  }
  async likeAnswer(ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+likingAnswers')
    if (!me.likingAnswers.map(v => v.toString()).includes(ctx.params.id)) {
      me.likingAnswers.push(ctx.params.id)
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } })
    }
    ctx.status = 204
    await next()
  }

  async listDisLikingAnswers(ctx) {
    const user = await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers')
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user.dislikingAnswers
  }
  async undislikeAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
    const index = me.dislikingAnswers.map(v => v.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.dislikingAnswers.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }
  async dislikeAnswer(ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
    if (!me.dislikingAnswers.map(v => v.toString()).includes(ctx.params.id)) {
      me.dislikingAnswers.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
    await next()
  }

  async listCollectingAnswers(ctx) {
    const user = await User.findById(ctx.params.id).select('+collectingAnswers').populate('collectingAnswers')
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user.collectingAnswers
  }
  async uncollectAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+collectingAnswers')
    const index = me.collectingAnswers.map(v => v.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.collectingAnswers.splice(index, 1)
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: -1 } })

    }
    ctx.status = 204
  }
  async collectAnswer(ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+collectingAnswers')
    if (!me.collectingAnswers.map(v => v.toString()).includes(ctx.params.id)) {
      me.collectingAnswers.push(ctx.params.id)
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } })
    }
    ctx.status = 204
    await next()
  }

}

module.exports = new UsersCtl()