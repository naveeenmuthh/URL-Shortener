/*
* Some types used mostly to extract data from:
* - Request parameters
* - POST body
* - Query string
*/

type CrudAllRequest = {
  Querystring: {
    take: number;
    from?: string;
  }
}

type CrudIdRequest = {
  Params: {
    id: string;
  }
};

type PostCategory = {
  Body: {
    name: string;
  }
}

type PutCategory = {
  Body: {
    name: string;
  }
  Params: {
    id: string;
  }
}

type PostProduct = {
  Body: {
    name: string;
    published: boolean;
    price: number;
    categoryId: string;
  }
}

type PutProduct = {
  Body: {
    name: string;
    published: boolean;
    price: number;
    categoryId: string;
  }
  Params: {
    id: string;
  }
}

type PostShortenURL={
  Body:{
    longUrl:string;
    customAlias?:string;
    topic?:string  
  }
  Headers:{
    google_id:string;
  }
}

type GetRedirectURL={
  Params:{
    alias:string;
  }
  Headers:{
    google_id:string;
  }
}

type GetAnalyticsShortURL={
  Params:{
    alias:string;
  }
}

type GetTopicWiseAnalytics = {
 Params:{
  topic:string;
 }
}