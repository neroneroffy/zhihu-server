/**
 * Author: NERO
 * Date: 2019/8/19 0019
 * Time: 22:42
 *
 */
const Router = require('koa-router')
const jwt = require('koa-jwt')
const { secret } = require('../config')
const router = new Router({ prefix: '/topics' })
const { find, findById, create, update, listTopicFollowers, checkTopicExist, listQuestions } = require('../controllers/topics')

const auth = jwt({ secret })

router.get('/', find)
router.get('/:id', checkTopicExist, findById)
router.get('/:id/followers', checkTopicExist, listTopicFollowers)
router.patch('/:id', auth, checkTopicExist, update)
router.post('/', auth, create)
router.get('/:id/questions', checkTopicExist, listQuestions)


module.exports = router
