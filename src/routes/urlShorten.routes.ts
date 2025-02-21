import { getOverallAnalytics, getTopicWiseAnalytics, getUrlAnalytics, redirectURL, urlShorten } from "../controllers/urlShort.controller";
import { FastifyInstance } from "fastify";
import { authPreHandler } from "../prehandlers/auth.prehandlers";
import { getOverallAnalyticsSchema, getTopicWiseAnalyticsSchema, getUrlAnalyticsSchema, redirectURLSchema, urlShortenSchema } from "../schema/urlshorten.schema";


export default async function(fastify:FastifyInstance) {

fastify.post("/shorten",{schema:urlShortenSchema,preHandler:authPreHandler},urlShorten);

fastify.get("/shorten/:alias",{schema:redirectURLSchema},redirectURL);

fastify.get("/analytics/:alias",{schema:getUrlAnalyticsSchema,preHandler:authPreHandler},getUrlAnalytics);

fastify.get("/analytics/topic/:topic",{schema:getTopicWiseAnalyticsSchema,preHandler:authPreHandler},getTopicWiseAnalytics);

fastify.get("/analytics/overall",{schema:getOverallAnalyticsSchema,preHandler:authPreHandler},getOverallAnalytics);

}