/**
 * Author: NERO
 * Date: 2019/8/19 0019
 * Time: 22:42
 *
 */
const Router = require('koa-router')
const jwt = require('koa-jwt')
const { secret } = require('../config')
const router = new Router({ prefix: '/users' })
const { find, findById, create, update, deleteUser, login,
  checkOwner, listFollowing, checkUserExist, follow, unfollow,
  listFollowers, unfollowTopic, followTopic, listFollowingTopics,
  listQuestions, followQuestion, listFollowingQuestion, unfollowQuestion } = require('../controllers/users')
const { checkTopicExist } = require('../controllers/topics')
const { checkQuestionExist } = require('../controllers/questions')
const auth = jwt({ secret })

router.get('/', find)
router.get('/:id', findById)
router.patch('/:id', auth, checkOwner, update)
router.delete('/:id', auth, checkOwner, deleteUser)
router.post('/', create)
router.post('/login', login)
router.get('/:id/following', listFollowing)
router.get('/:id/followers', listFollowers)
router.put('/following/:id', auth, checkUserExist, follow)
router.delete('/following/:id', auth, checkUserExist, unfollow)
router.get('/:id/followingTopics', listFollowingTopics)
router.put('/followingTopics/:id', auth, checkTopicExist, followTopic)
router.put('/followQuestion/:id', auth, checkQuestionExist, followQuestion)
router.get('/:id/followQuestion', auth, listFollowingQuestion)
router.delete('/followQuestion/:id', auth, checkQuestionExist, unfollowQuestion)
router.delete('/followingTopics/:id', auth, checkTopicExist, unfollowTopic)
router.get('/:id/questions', listQuestions)

module.exports = router
