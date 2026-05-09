const express = require('express');
const Joi = require('joi');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const controller = require('../features/projects/controller');

const createProjectSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
});

router.get('/', authenticate, controller.list);
router.post('/', authenticate, validate(createProjectSchema), controller.create);

module.exports = router;
