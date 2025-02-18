import { FastifyInstance } from "fastify";

import { createCategory, getCategories, saysHello, updateCategory } from "../controllers/categories.controller";
import { createSchema, getAllSchema, updateSchema } from "../schema/categories.schema";

export default async function (fastify: FastifyInstance) {
  // List all categories, paginated
  fastify.get('/', { schema: getAllSchema }, getCategories);

  // // Get one category
  // fastify.get('/:id', { schema: getSchema }, getCategory);

  // // Deleteing a Category
  // fastify.delete('/:id', { schema: deleteSchema }, deleteCategory);

  // Create a new Category
  fastify.post('/', { schema: createSchema }, createCategory);

  // Update an existing Category
  fastify.put('/:id', { schema: updateSchema }, updateCategory);

fastify.get("/hello",{schema:{}},saysHello);


}

