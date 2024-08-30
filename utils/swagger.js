const swaggerJsDoc = require("swagger-jsdoc");

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "API Shop",
      version: "1.0.0",
      description: "Danh sách api",
      contact: {
        name: "Developer",
      },
      servers: [{ url: "http://localhost:4000" }],
    },
  },
  // đường dẫn tới các file chứa tài liệu cho các route
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
module.exports = swaggerDocs;
