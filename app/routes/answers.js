/**
 * Author: NERO
 * Date: 2019/8/19 0019
 * Time: 22:42
 *
 */
const Router = require('koa-router')
const jwt = require('koa-jwt')
const { secret } = require('../config')
const router = new Router({ prefix: '/question/:questionId/answers' })
const { find, findById, create, update,
  checkAnswerExist, deleteAnswer, checkAnswerer } = require('../controllers/answer')

const auth = jwt({ secret })

router.get('/', find)
router.get('/:id', checkAnswerExist, findById)
router.patch('/:id', auth, checkAnswerExist, checkAnswerer, update)
router.post('/', auth, create)
router.delete('/:id', auth, checkAnswerExist, checkAnswerer, deleteAnswer)


module.exports = router
