const Joi = require('joi');

const agentSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Name cannot be empty',
    'any.required': 'Name is required'
  }),
  type: Joi.string().valid('github', 'shopify', 'email', 'calendar', 'custom').required().messages({
    'any.only': 'Invalid agent type',
    'any.required': 'Type is required'
  }),
  description: Joi.string().trim().allow('', null),
  configuration: Joi.object().pattern(Joi.string(), Joi.string()).default({}),
  status: Joi.string().valid('active', 'inactive', 'error').default('active')
});

const validateAgent = (req, res, next) => {
  const { error } = agentSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({ 
      error: 'Validation Error',
      messages: errorMessages 
    });
  }
  
  next();
};

module.exports = {
  validateAgent
};
