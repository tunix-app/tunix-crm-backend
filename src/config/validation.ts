import * as Joi from 'joi';

export const validate = (cfg: Record<string, unknown>) => {
  const schema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'test', 'production').required(),
    PORT: Joi.number().default(3000),
    DATABASE_URL: Joi.string().required(),
    DIRECT_URL: Joi.string().optional(),
    SUPABASE_URL: Joi.string().uri().required(),
    SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
  }).unknown(true);

  const { error, value } = schema.validate(cfg);
  if (error) throw new Error(`Config validation error: ${error.message}`);
  return value;
};
