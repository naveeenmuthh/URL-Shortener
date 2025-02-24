const Config = {
  confKey: 'config',
  schema: {
    type: 'object',
    required: [ 'DATABASE_URL' ],
    properties: {
      BIND_PORT: {
        type: 'number',
        default: 5000
      },
      BIND_ADDR: {
        type: 'string',
        default: '127.0.0.1'
      },
      APP_SERVER_NAME: {
        type: 'string',
        default: 'localhost'
      },
      PROJECT_NAME: {
        type: 'string',
        default: 'fastify-rest'
      },
      DATABASE_URL: {
        type: 'string'
      },
      ENABLE_SWAGGER: {
        type: 'boolean',
        default: true
      },
       GOOGLE_CLIENT_ID:{
        type:"string"
       },
       GOOGLE_CLIENT_SECRET:{
         type:"string"
       },
       SECRET_SESSION_KEY:{
          type:"string"
       },
       JWT_SECRET:{
        type:"string",
       },
       REDIS_USER_NAME:{
        type:"string"
       },
       REDIS_PASSWORD:{
        type:"string"
       },
       REDIS_HOST:{
        type:"string"
       },
       REDIS_PORT:{
        type:"number",
        default:18768

       }
    }
  },
};

export default Config;

