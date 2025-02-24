export const swaggerConfig = {
  swagger: {
    info: {
      title: 'RESTful APIs using Fastify',
      description: 'APIS for URL Shortener',
      version: '0.0.1'
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here'
    },
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'Url-Shortener', description: 'Url Shortening end points.' }
    ],
  }
};
