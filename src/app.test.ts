
import axios from "axios";
// import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken", () => ({
  decode: jest.fn(() => ({ google_id: "test_user" })),
}));

describe("API Tests", () => {
  let token="";

  beforeAll(() => {
    token = "Bearer test_token";
  });

  describe("POST /shorten", () => {
    it("should shorten a URL successfully", async () => {
      const response = await axios.post(
       "/shorten",
       {
         longUrl: "https://example.com",
         customAlias: "testalias",
       },
       {
         headers: {
           Authorization: token,
         },
       }
     );
     
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("shortUrl");
    });
  });

  describe("GET /redirect/:alias", () => {
    it("should redirect to the original URL", async () => {
      const response = await axios.get("/redirect/testalias");
      expect(response.status).toBe(301);
    });
  });

  describe("GET /analytics/:alias", () => {
    it("should fetch analytics for a URL", async () => {
      const response = await axios.get("/analytics/testalias",
       {
       headers: {
         Authorization: token,
       },
     });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("totalClicks");
    });
  });

  describe("GET /analytics/overall", () => {
    it("should fetch overall analytics", async () => {
      const response = await axios.get("/analytics/overall",{
       headers: {
         Authorization: token,
       },
     });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("totalUrls");
    });
  });

  describe("GET /analytics/topic/:topic", () => {
    it("should fetch topic-wise analytics", async () => {
      const response = await axios.get("/analytics/topic/testtopic",{
       headers: {
         Authorization: token,
       },
     });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("totalUrls");
    });
  });
});
