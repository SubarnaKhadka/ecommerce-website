import express from "express";
import request from "supertest";
import { expect } from "@jest/globals";
import productCategoryRoute from "../../src/routes/product-category.route";
import { catchHttpException, tenantResolver, transformResponse } from "shared";

jest.mock("shared", () => {
  const original = jest.requireActual("shared");
  return {
    ...original,
    requireAuth: (req: any, res: any, next: any) => {
      req.user = { id: 19, role: "admin" };
      next();
    },
    roleGuard: () => (req: any, res: any, next: any) => next(),
  };
});

describe("Product Category Routes", () => {
  const app = express();
  app.use(express.json());
  app.use(tenantResolver);
  app.use(transformResponse);
  app.use("/category", productCategoryRoute);
  app.use(catchHttpException);

  let createdCategoryId: string;

  it("GET /list should return categories with pagination", async () => {
    const res = await request(app)
      .get("/category/list")
      .query({ page: 1, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);

    res.body.data.forEach((item: any) => {
      expect(item).not.toHaveProperty("tenant_id");

      expect(item).toMatchObject({
        id: expect.any(String),
        category_name: expect.any(String),
        slug: expect.any(String),
      });

      expect(
        item.parent_category_id === null ||
          typeof item.parent_category_id === "string"
      ).toBe(true);
    });
  });

  it("POST /create should create a new category", async () => {
    const random = crypto.randomUUID();

    const res = await request(app)
      .post("/category/create")
      .send({ name: `Electronics-${random}` });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("id");

    createdCategoryId = res.body.data.id;
  });

  it("PATCH /update/:id should update a category", async () => {
    const random = crypto.randomUUID();
    const res = await request(app)
      .patch(`/category/update/${createdCategoryId}`)
      .send({ name: `Updated Electronics-${random}` });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("id");
  });

  it("DELETE /delete/:id should delete a category", async () => {
    const res = await request(app).delete(
      `/category/delete/${createdCategoryId}`
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("id");
  });

  it("should fail validation if required fields are missing", async () => {
    const res = await request(app).post("/category/create").send({});
    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("errors");
    expect(Array.isArray(res.body.errors)).toBe(true);
  });
});
