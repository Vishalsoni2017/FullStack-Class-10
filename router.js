const express = require('express');
const router = express.Router();

const userController = require('./controller/userController');
const postController = require('./controller/postController');

const isAuth = require('./middleware/is-auth')

router.get('/', userController.home)

// user related routes
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)

//profile related routes
router.get('/profile/:username', userController.ifUserExists, userController.profilePostsScreen)

// post related routes
router.get('/create-post', isAuth.isAuthenticated, postController.viewCreatePage)
router.post('/create-post', isAuth.isAuthenticated, postController.createPost)
router.get('/post/:id', postController.viewSingle)

module.exports = router;