import { Router } from 'express';
import { body } from 'express-validator';
import * as projectController from '../controllers/project.controller.js'
const router = Router();
import * as authMiddleware from '../middleware/auth.middleware.js';

router.post('/create',
  body('name').isString().withMessage('Name is required'),
  authMiddleware.authUser,
  projectController.createProject
)

router.get('/all', authMiddleware.authUser, projectController.getAllProjects);


router.put('/add-user',
  body('users').isArray({min : 1}).withMessage('Users must be an array of string ').bail().custom((users) => users.every(user => typeof user === 'string')).withMessage('Each Users must be a string'),
  body('projectId').isString().withMessage('ProjectId is required'),
  authMiddleware.authUser,
  projectController.addUserToProject
)

router.get('/get-project/:projectId',
  // body('projectId').isString().withMessage('ProjectId is required'),
  authMiddleware.authUser,
  projectController.getProjectById
)

router.put('/update-file-tree',
  authMiddleware.authUser,
  body('projectId').isString().withMessage('Project ID is required'),
  body('fileTree').isObject().withMessage('File tree is required'),
  projectController.updateFileTree
)
export default router;