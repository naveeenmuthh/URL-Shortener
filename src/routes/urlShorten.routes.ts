import { getOverallAnalytics, getTopicAnalytics, getUrlAnalytics, redirectURL, urlShorten } from "../controllers/urlShort.controller";
import { FastifyInstance } from "fastify";
import { authPreHandler } from "../prehandlers/auth.prehandlers";


export default async function(fastify:FastifyInstance) {

fastify.post("/shorten",{schema:{},preHandler:authPreHandler},urlShorten);

fastify.get("/shorten/:alias",{schema:{}},redirectURL);

fastify.get("/analytics/:alias",{schema:{},preHandler:authPreHandler},getUrlAnalytics);

fastify.get("/analytics/topic/:topic",{schema:{},preHandler:authPreHandler},getTopicAnalytics);

fastify.get("/analytics/overall",{schema:{},preHandler:authPreHandler},getOverallAnalytics);

}