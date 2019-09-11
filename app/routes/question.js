/**
 * Author: NERO
 * Date: 2019/8/19 0019
 * Time: 22:42
 *
 */
const Router = require('koa-router')
const jwt = require('koa-jwt')
const { secret } = require('../config')
const router = new Router({ prefix: '/questions' })
const { find, findById, create, update, listTopicFollowers, checkQuestioner,
  checkQuestionExist, deleteQuestion } = require('../controllers/questions')

const auth = jwt({ secret })

router.get('/', find)
router.get('/:id', checkQuestionExist, findById)
router.patch('/:id', auth, checkQuestionExist, checkQuestioner, update)
router.post('/', auth, create)
router.delete('/:id', auth, checkQuestionExist, checkQuestioner, deleteQuestion)


module.exports = router
