import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";


export async function authPreHandler(
  request: FastifyRequest<{ Body: any; Params: any; Querystring: any; Headers: any }>,
  reply: FastifyReply
) {
  console.log("Headers", request.headers);

  let token = request.headers.authorization;

  if (!token) {
    return reply.status(401).send({ message: "Missing Token!" });
  }

  token = token.split(" ")[1] || "";

  try {
    console.log("Token", token);

     jwt.verify(token, "access_key_secret");

  } catch (error: any) {
    return reply.status(401).send({ message: "Invalid or Expired Token, Login Again!" });
  }
}