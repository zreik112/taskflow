const express = require('express');
const Joi = require('joi');
const router = express.Router();

const authenticate = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const controller = require('../features/tasks/controller');

const createTaskSchema = Joi.object({
  project_id: Joi.string().uuid().required(),
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow('', null).optional(),
  status: Joi.string().valid('todo', 'in_progress', 'done').default('todo'),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  assigned_to: Joi.string().uuid().allow(null).optional(),
  due_date: Joi.date().iso().allow(null).optional(),
});

router.post('/', authenticate, validate(createTaskSchema), controller.create);
router.get('/', authenticate, controller.list);
router.get('/:id', authenticate, controller.getById);

module.exports = router;
