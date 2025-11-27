/// <reference types="cypress" />

describe("Product Category Flow E2E", () => {
  it("logs in, creates a product category, and fetches it", () => {
    cy.request({
      method: "POST",
      url: "/users/login",
      body: {
        email: "test@gmail.com",
        password: "Test@123",
      },
    }).then((loginResponse) => {
      const token = loginResponse.body.data.accessToken;

      cy.request({
        method: "POST",
        url: "/products/category/create",
        headers: { Authorization: `Bearer ${token}` },
        body: { name: `Electronics-${Date.now()}` },
      }).then((productCategoryResponse) => {
        const id = productCategoryResponse.body.data.id;

        cy.request({
          method: "GET",
          url: `/products/category/list`,
          headers: { Authorization: `Bearer ${token}` },
        })
          .its("body.data")
          .should("be.an", "array")
          .then((categories) => {
            const ids = categories.map((c: any) => c.id);
            expect(ids).to.include(id);
          });
      });
    });
  });
});
