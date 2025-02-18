import { FastifyInstance } from "fastify";
import fastifyPassport from "@fastify/passport";

export default async function (fastify:FastifyInstance) {


 fastify.get(
  '/login',
  {
    preValidation: fastifyPassport.authenticate('google', { scope: [ 'profile', 'email'] })
  },
  async () => {
    console.log('GOOGLE API forward')
  }
)

fastify.get(
  '/google/callback',
  {
    preValidation: fastifyPassport.authenticate('google', { scope: [ 'profile', 'email']})
  },
  function (req, res) {
    res.redirect('/');
  }
)

fastify.get('/',
  {
    preValidation: (req, res, done) => { 
      if (!req.user) {
        res.redirect('/auth/login')
      }
      done()
    }
  },
  async (req:any, res) => {
    console.log(req.user)
    if (req.user) {
      res.send(`Hello ${req.user.displayName}!`)
    }
    else {
      res.send(`Hello World`)
    }
  }
)
fastify.get('/login-fail', (req, res) => {
  res.send('Login Failure')
})

}