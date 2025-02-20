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
    preValidation: fastifyPassport.authenticate('google', { scope: ['profile', 'email'] }),
  },
  async function (req, res) {
    // Ensure authentication was successful
    if (!req.user || !req.headers.authorization) {
      return res.status(401).send({ error: "Authentication failed" });
    }

    // Extract the access token from req.user
    const access_token = req.headers.authorization;

    console.log("access_token:", access_token);

    // Redirect to homepage
    res.send({ message:"Congratulations!!, you have Logged in Successfully. Kindly use following access_token for accessing other apis.",
      access_token});
  }
);


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