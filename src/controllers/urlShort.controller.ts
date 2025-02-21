// import axios from "axios";
import useragent from "useragent";
import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import {subDays,format} from "date-fns";
import crypto from "crypto";
import axios from "axios";

export async function urlShorten(request:FastifyRequest<PostShortenURL>, reply:FastifyReply) {
   try {
     const { longUrl, customAlias, topic } = request.body;
     const token = request.headers.authorization?.split(" ")[1] || "";
     
     if (!token) {
       return reply.status(401).send({ message: "Unauthorized: No token provided." });
     }
     
     let decoded:any;
     try {
       decoded = jwt.decode(token);
       if (!decoded || !decoded.google_id) {
         return reply.status(401).send({ message: "Unauthorized: Invalid token." });
       }
     } catch (error) {
       return reply.status(400).send({ message: "Bad Request: Malformed token." });
     }
 
     const google_id = decoded.google_id;
     const db = request.server.prisma;
 
     const user_auth = await db.user_Auth.findUnique({ where: { google_id } });
     if (!user_auth) {
       return reply.status(404).send({ message: "User not found." });
     }
 
     // Rate limiting
     if (user_auth.limit >= 5) {
       return reply.status(429).send({ message: "Rate limit exceeded: You can only create 5 short URLs within 2 hours." });
     }
 
     let shorten_url_data;
     
     try {

      if(customAlias && await db.short_urls.findUnique({where:{shortUrl:customAlias}}))
        return reply.status(409).send({message:"Unauthorized: CustomAlias Already Exists, Try a different one!"});

       if (customAlias && topic) {

         //error here

         if(await db.short_urls.findUnique({
          where: { longUrl_shortUrl_topic: { longUrl, shortUrl: customAlias, topic } }
        }))
             return reply.status(409).send({message:"Unauthorized: Custom Alias Already Exists."});

         shorten_url_data = await db.short_urls.create({
           data: { longUrl, shortUrl: customAlias, topic, createdAt: new Date(), google_id }
         });

        //  console.log(shorten_url_data);
       } else if (customAlias) {

         shorten_url_data =  await db.short_urls.create({
           data: { longUrl, shortUrl: customAlias, createdAt: new Date(), google_id }
         });
       } else {

        let uniqueHash;
        let exists; 

        do{

      uniqueHash = crypto.randomBytes(2).toString('hex');
      exists = await db.short_urls.findUnique({where:{shortUrl:uniqueHash}});

        }while(exists)

         shorten_url_data = await db.short_urls.create({ data: { longUrl, createdAt: new Date(), google_id, shortUrl:uniqueHash } });
       }
     } catch (error:any) {
       return reply.status(500).send({ message: "Internal Server Error: Database operation failed.", error: error.message });
     }

     await db.user_Auth.update({ where: { google_id }, data: { limit: user_auth.limit + 1 } }); 
     await request.server.redis.setex(shorten_url_data.shortUrl,60, shorten_url_data.longUrl);
     return reply.status(201).send({
       shortUrl: `${request.protocol}://${request.hostname}/api/shorten/${shorten_url_data.shortUrl}`,
       createdAt: shorten_url_data.createdAt
     });
   } catch (error:any) {
     return reply.status(500).send({ message: "Internal Server Error", error: error.message });
   }
 }


export async function redirectURL(request: FastifyRequest<GetRedirectURL>, reply: FastifyReply) {
  try {
    const { alias } = request.params as { alias: string };
    

    console.log("Alias received:", alias);

    const db = request.server.prisma;

    // Ensure alias exists in DB
    const long_url = await request.server.redis.get(alias) || (await db.short_urls.findFirst({
      where: { shortUrl: alias },
    }))?.longUrl;

    if (!long_url) {
      console.error("Invalid alias:", alias);
      return reply.status(404).send({ error: "Invalid alias!" });
    }

    console.log("Shortened URL found:", long_url);

    let geoData:string="Unknown";
    const { data } = await axios.get(`http://ip-api.com/json/${request.ip}`);
    if (data.status === "success") {
        geoData = `${{ country: data.country, region: data.regionName, city: data.city} }`;
    }

    console.log("geo-data",data);

 const user_data = request.headers["user-agent"] || "Unknown";

  const agent = useragent.parse(request.headers["user-agent"]);

  const osName = agent.os.toString() || "Unknown"; 
  const host_ip = request.ip || "Unknown";

  const deviceName = agent.device.toString().toLowerCase().includes("mobile")?"mobile":"desktop";

  const url_analytics_data =  await db.url_analytics.create({data:{
  user_data,
  osName,
  short_Url:alias,
  clickedAt: new Date(),
  host_ip,
  deviceName,
  geoData,
  }});

console.log(url_analytics_data);

    // Ensure the URL is absolute (http/https)
    const destination = long_url.startsWith("http")
      ? long_url
      : `https://${long_url}`; 

      await request.server.redis.setex(alias,60,long_url);

    // Redirect to the original long URL
    return reply.status(301).redirect(destination);
  } catch (error) {
    console.error("Redirection error:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}



// URL Analytics 

export async function getUrlAnalytics(request: FastifyRequest<GetAnalyticsShortURL>, reply: FastifyReply) {
  try {
    const { alias:shortUrl } = request.params;

  const cachedAnalytics = await request.server.redis.get(`${shortUrl}_analytics`);

  if(cachedAnalytics)
    return reply.status(200).send(JSON.parse(cachedAnalytics));

    const db = request.server.prisma;

    // Total Clicks
    const totalClicks = await db.url_analytics.count({
      where: { short_Url: shortUrl },
    });

    // Unique Users
    const uniqueUsers = await db.url_analytics.groupBy({
      by: ["user_data"],
      where: { short_Url: shortUrl },
      _count: { _all: true },
    });

    // Clicks by Date (Last 7 Days)
    const startDate = subDays(new Date(), 7);
    const clicksByDate = await db.url_analytics.groupBy({
      by: ["clickedAt"],
      where: {
        short_Url: shortUrl,
        clickedAt: { gte: startDate },
      },
      _count: { _all: true },
      orderBy: { clickedAt: "asc" },
    });

    // Format the date results
    const formattedClicksByDate = clicksByDate.map((item) => ({
      date: format(new Date(item.clickedAt), "yyyy-MM-dd"),
      clickCount: item._count._all,
    }));

    // OS Type Data
    const osType = await db.url_analytics.groupBy({
      by: ["osName"],
      where: { short_Url: shortUrl },
      _count: { _all: true },
    });

    const osTypeData = osType.map((item) => ({
      osName: item.osName,
      uniqueClicks: item._count._all,
      uniqueUsers: uniqueUsers.filter((u) => u.user_data === item.osName).length,
    }));

    // Device Type Data
    const deviceType = await db.url_analytics.groupBy({
      by: ["deviceName"],
      where: { short_Url: shortUrl },
      _count: { _all: true },
    });

    const deviceTypeData = deviceType.map((item) => ({
      deviceName: item.deviceName,
      uniqueClicks: item._count._all,
      uniqueUsers: uniqueUsers.filter((u) => u.user_data === item.deviceName).length,
    }));

    await request.server.redis.setex(`${shortUrl}_analytics`,10,JSON.stringify({
      totalClicks,
      uniqueUsers: uniqueUsers.length,
      clicksByDate: formattedClicksByDate,
      osType: osTypeData,
      deviceType: deviceTypeData,
    }));

    // Response JSON
    return reply.status(200).send({
      totalClicks,
      uniqueUsers: uniqueUsers.length,
      clicksByDate: formattedClicksByDate,
      osType: osTypeData,
      deviceType: deviceTypeData,
    });
  } catch (error: any) {
    console.error("Error fetching analytics:", error.message);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
}

export async function getTopicWiseAnalytics(request: FastifyRequest<GetTopicWiseAnalytics>, reply: FastifyReply) {
  try {
    const token = request.headers.authorization?.split(" ")[1] || "";
    const {topic} = request.params;
    let decoded: any = jwt.decode(token);
    const google_id = decoded.google_id;
    const db = request.server.prisma;

    const cachedAnalytics = await request.server.redis.get(`${google_id}_${topic}_analytics`);

    if(cachedAnalytics)
      return reply.status(200).send(JSON.parse(cachedAnalytics));

    // Get all URLs created by the user
    const userUrls = await db.short_urls.findMany({
      where: { google_id,topic },
      select: { shortUrl: true },
    });

    if (!userUrls.length) {
      return reply.status(404).send({ message: "No URLs found for the user!" });
    }

    const shortUrls = userUrls.map((url) => url.shortUrl);

    // Total URLs created
    const totalUrls = shortUrls.length;

    // Total Clicks
    const totalClicks = await db.url_analytics.count({
      where: { short_Url: { in: shortUrls } },
    });

    // Unique Users
    const uniqueUsers = await db.url_analytics.groupBy({
      by: ["user_data"],
      where: { short_Url: { in: shortUrls } },
      _count: { _all: true },
    });

    // Clicks by Date (Last 7 Days)
    const startDate = subDays(new Date(), 7);
    const clicksByDate = await db.url_analytics.groupBy({
      by: ["clickedAt"],
      where: {
        short_Url: { in: shortUrls },
        clickedAt: { gte: startDate },
      },
      _count: { _all: true },
      orderBy: { clickedAt: "asc" },
    });

    // Format the date results
    const formattedClicksByDate = clicksByDate.map((item) => ({
      date: format(new Date(item.clickedAt), "yyyy-MM-dd"),
      clickCount: item._count._all,
    }));

    await request.server.redis.setex(`${google_id}_${topic}_analytics`,10,JSON.stringify({
      totalUrls,
      totalClicks,
      clicksByDate: formattedClicksByDate,
      uniqueUsers: uniqueUsers.length,
    }));

    // Response JSON
    return reply.status(200).send({
      totalUrls,
      totalClicks,
      clicksByDate: formattedClicksByDate,
      uniqueUsers: uniqueUsers.length,
      
    });
  } catch (error: any) {
    console.error("Error fetching overall analytics:", error.message);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
}

export async function getOverallAnalytics(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.headers.authorization?.split(" ")[1] || "";
    let decoded: any = jwt.decode(token);
    const google_id = decoded.google_id;
    const db = request.server.prisma;

    const cachedAnalytics = await request.server.redis.get(`${google_id}_overall_analytics`);

    if(cachedAnalytics)
      return reply.status(200).send(JSON.parse(cachedAnalytics));

    // Get all URLs created by the user
    const userUrls = await db.short_urls.findMany({
      where: { google_id },
      select: { shortUrl: true },
    });

    if (!userUrls.length) {
      return reply.status(404).send({ message: "No URLs found for the user!" });
    }

    const shortUrls = userUrls.map((url) => url.shortUrl);

    // Total URLs created
    const totalUrls = shortUrls.length;

    // Total Clicks
    const totalClicks = await db.url_analytics.count({
      where: { short_Url: { in: shortUrls } },
    });

    // Unique Users
    const uniqueUsers = await db.url_analytics.groupBy({
      by: ["user_data"],
      where: { short_Url: { in: shortUrls } },
      _count: { _all: true },
    });

    // Clicks by Date (Last 7 Days)
    const startDate = subDays(new Date(), 7);
    const clicksByDate = await db.url_analytics.groupBy({
      by: ["clickedAt"],
      where: {
        short_Url: { in: shortUrls },
        clickedAt: { gte: startDate },
      },
      _count: { _all: true },
      orderBy: { clickedAt: "asc" },
    });

    // Format the date results
    const formattedClicksByDate = clicksByDate.map((item) => ({
      date: format(new Date(item.clickedAt), "yyyy-MM-dd"),
      clickCount: item._count._all,
    }));

    // OS Type Data
    const osType = await db.url_analytics.groupBy({
      by: ["osName"],
      where: { short_Url: { in: shortUrls } },
      _count: { _all: true },
    });

    const osTypeData = osType.map((item) => ({
      osName: item.osName,
      uniqueClicks: item._count._all,
      uniqueUsers: uniqueUsers.filter((u) => u.user_data === item.osName).length,
    }));

    // Device Type Data
    const deviceType = await db.url_analytics.groupBy({
      by: ["deviceName"],
      where: { short_Url: { in: shortUrls } },
      _count: { _all: true },
    });

    const deviceTypeData = deviceType.map((item) => ({
      deviceName: item.deviceName,
      uniqueClicks: item._count._all,
      uniqueUsers: uniqueUsers.filter((u) => u.user_data === item.deviceName).length,
    }));

    await request.server.redis.setex(`${google_id}_overall_analytics`,10,JSON.stringify({
      totalUrls,
      totalClicks,
      uniqueUsers: uniqueUsers.length,
      clicksByDate: formattedClicksByDate,
      osType: osTypeData,
      deviceType: deviceTypeData,
    }));

    // Response JSON
    return reply.status(200).send({
      totalUrls,
      totalClicks,
      uniqueUsers: uniqueUsers.length,
      clicksByDate: formattedClicksByDate,
      osType: osTypeData,
      deviceType: deviceTypeData,
    });
  } catch (error: any) {
    console.error("Error fetching overall analytics:", error.message);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
}








