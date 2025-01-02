import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js'
import { body } from 'express-validator'

const router = Router();

router.post('/register',
  body('email').isEmail().withMessage('Email Must be a valid email address'),
  body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters long')
  , userController.createUserController);

router.post('/login', 
  body('email').isEmail().withMessage('Email Must be a valid email address'),
  body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters long'),
  userController.loginUserController
)

router.get('/profile',authMiddleware.authUser , userController.getUserProfileController)

router.get('/logout', authMiddleware.authUser, userController.logoutUserController)

router.get('/all', authMiddleware.authUser, userController.getAllUsersController)
export default router;