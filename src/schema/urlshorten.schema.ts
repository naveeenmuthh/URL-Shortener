export const urlShortenSchema = {
 description: "Shortens a given long URL with an optional custom alias and topic.",
 tags: ["URL Shortener"],
 summary: "Shorten URL API",
 securityDefinitions: {

  bearerAuth: {

      type: 'apiKey',

      name: 'Authorization',

      in: 'header'

  }

},
 headers: {
   type: "object",
   properties: {
     Authorization: {
       type: "string",
       description: "Bearer token for authentication",
     },
   },
   required: ["Authorization"],
 },
 body: {
   type: "object",
   required: ["longUrl"],
   properties: {
     longUrl: { 
       type: "string", 
       format: "uri", 
       description: "The long URL to be shortened" 
     },
     customAlias: { 
       type: "string", 
       minLength: 3, 
       maxLength: 50, 
       description: "Optional custom alias for the shortened URL" 
     },
     topic: { 
       type: "string", 
       description: "Optional topic for categorization" 
     },
   },
 },
 response: {
   201: {
     description: "URL successfully shortened",
     type: "object",
     properties: {
       shortUrl: { type: "string", description: "The generated short URL" },
       createdAt: { type: "string", format: "date-time", description: "Timestamp of URL creation" },
     },
   },
   400: {
     description: "Bad Request: Malformed token",
     type: "object",
     properties: {
       message: { type: "string", description: "Error message" },
     },
   },
   401: {
     description: "Unauthorized: Invalid or missing token",
     type: "object",
     properties: {
       message: { type: "string", description: "Error message" },
     },
   },
   404: {
     description: "User not found",
     type: "object",
     properties: {
       message: { type: "string", description: "Error message" },
     },
   },
   409: {
     description: "Conflict: Custom alias already exists",
     type: "object",
     properties: {
       message: { type: "string", description: "Error message" },
     },
   },
   500: {
     description: "Internal Server Error",
     type: "object",
     properties: {
       message: { type: "string", description: "Error message" },
       error: { type: "string", description: "Detailed error information" },
     },
   },
 },
};


export const redirectURLSchema = {
 description: "Redirects to the original long URL based on the provided short alias",
 tags: ["URL Shortener"],
 summary: "Redirect Short URL API",
 securityDefinitions: {

  bearerAuth: {

      type: 'apiKey',

      name: 'Authorization',

      in: 'header'

  }

},
 params: {
   type: "object",
   required: ["alias"],
   properties: {
     alias: { type: "string", description: "Shortened URL alias" }
   }
 },
 response: {
   301: {
     description: "Redirects to the original long URL"
   },
   404: {
     description: "Invalid alias provided",
     type: "object",
     properties: {
       error: { type: "string" }
     }
   },
   500: {
     description: "Internal Server Error",
     type: "object",
     properties: {
       error: { type: "string" }
     }
   }
 }
};

export const getUrlAnalyticsSchema = {
 description: "Retrieves analytics for a given short URL alias",
 tags: ["URL Shortener"],
 summary: "Get URL Analytics API",
 securityDefinitions: {

  bearerAuth: {

      type: 'apiKey',

      name: 'Authorization',

      in: 'header'

  }

},
 headers: {
  type: "object",
  properties: {
    Authorization: {
      type: "string",
      description: "Bearer token for authentication",
    },
  },
  required: ["Authorization"],
},
 params: {
   type: "object",
   required: ["alias"],
   properties: {
     alias: { type: "string", description: "Shortened URL alias" }
   }
 },
 response: {
   200: {
     description: "Successfully retrieved analytics",
     type: "object",
     properties: {
       totalClicks: { type: "integer", description: "Total number of clicks" },
       uniqueUsers: { type: "integer", description: "Number of unique users" },
       clicksByDate: {
         type: "array",
         items: {
           type: "object",
           properties: {
             date: { type: "string", format: "date", description: "Date of clicks" },
             clickCount: { type: "integer", description: "Number of clicks on that date" }
           }
         }
       },
       osType: {
         type: "array",
         items: {
           type: "object",
           properties: {
             osName: { type: "string", description: "Operating system type" },
             uniqueClicks: { type: "integer", description: "Clicks from this OS" },
             uniqueUsers: { type: "integer", description: "Unique users from this OS" }
           }
         }
       },
       deviceType: {
         type: "array",
         items: {
           type: "object",
           properties: {
             deviceName: { type: "string", description: "Device type (mobile/desktop)" },
             uniqueClicks: { type: "integer", description: "Clicks from this device" },
             uniqueUsers: { type: "integer", description: "Unique users from this device" }
           }
         }
       }
     }
   },
   404: {
     description: "Analytics not found for given alias",
     type: "object",
     properties: {
       message: { type: "string" }
     }
   },
   500: {
     description: "Internal Server Error",
     type: "object",
     properties: {
       message: { type: "string" }
     }
   }
 }
};

export const getOverallAnalyticsSchema = {
 description: "Retrieves overall analytics for a user's shortened URLs.",
 tags: ["URL Shortener"],
 summary: "Get Overall Analytics API",
 securityDefinitions: {

  bearerAuth: {

      type: 'apiKey',

      name: 'Authorization',

      in: 'header'

  }

},
 headers: {
   type: "object",
   properties: {
     Authorization: {
       type: "string",
       description: "Bearer token for authentication",
     },
   },
   required: ["Authorization"],
 },
 response: {
   200: {
     description: "Successfully retrieved overall analytics",
     type: "object",
     properties: {
       totalUrls: { 
         type: "integer", 
         description: "Total number of URLs created by the user" 
       },
       totalClicks: { 
         type: "integer", 
         description: "Total number of clicks across all URLs" 
       },
       uniqueUsers: { 
         type: "integer", 
         description: "Number of unique users who interacted with the URLs" 
       },
       clicksByDate: {
         type: "array",
         items: {
           type: "object",
           properties: {
             date: { 
               type: "string", 
               format: "date-time", 
               description: "Date of clicks" 
             },
             clickCount: { 
               type: "integer", 
               description: "Number of clicks on that date" 
             },
           },
         },
       },
     },
   },
   500: {
     description: "Internal Server Error",
     type: "object",
     properties: {
       message: { 
         type: "string", 
         description: "Error message" 
       },
     },
   },
 },
};


export const getTopicWiseAnalyticsSchema = {
 description: "Retrieves topic-wise analytics for a user's shortened URLs.",
 tags: ["URL Shortener"],
 summary: "Get Topic-wise Analytics API",
 securityDefinitions: {

  bearerAuth: {

      type: 'apiKey',

      name: 'Authorization',

      in: 'header'

  }

},
 headers: {
   type: "object",
   properties: {
     Authorization: {
       type: "string",
       description: "Bearer token for authentication",
     },
   },
   required: ["Authorization"],
 },
 params: {
   type: "object",
   required: ["topic"],
   properties: {
     topic: { 
       type: "string", 
       description: "Topic for categorization of shortened URLs" 
     },
   },
 },
 response: {
   200: {
     description: "Successfully retrieved topic-wise analytics",
     type: "object",
     properties: {
       totalUrls: { 
         type: "integer", 
         description: "Total number of URLs created under this topic" 
       },
       totalClicks: { 
         type: "integer", 
         description: "Total number of clicks on URLs under this topic" 
       },
       uniqueUsers: { 
         type: "integer", 
         description: "Number of unique users who interacted with the URLs in this topic" 
       },
       clicksByDate: {
         type: "array",
         items: {
           type: "object",
           properties: {
             date: { 
               type: "string", 
               format: "date-time", 
               description: "Date of clicks" 
             },
             clickCount: { 
               type: "integer", 
               description: "Number of clicks on that date" 
             },
           },
         },
       },
     },
   },
   500: {
     description: "Internal Server Error",
     type: "object",
     properties: {
       message: { 
         type: "string", 
         description: "Error message" 
       },
     },
   },
 },
};
