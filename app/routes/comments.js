/**
 * Author: NERO
 * Date: 2019/8/19 0019
 * Time: 22:42
 *
 */
const Router = require('koa-router')
const jwt = require('koa-jwt')
const { secret } = require('../config')
const router = new Router({ prefix: '/question/:questionId/answers/:answerId/comments' })
const { find, findById, create, update,
  checkCommentExist, deleteComment, checkCommentator } = require('../controllers/comments')

const auth = jwt({ secret })

router.get('/', find)
router.get('/:id', checkCommentExist, findById)
router.patch('/:id', auth, checkCommentExist, checkCommentator, update)
router.post('/', auth, create)
router.delete('/:id', auth, checkCommentExist, checkCommentator, deleteComment)


module.exports = router
