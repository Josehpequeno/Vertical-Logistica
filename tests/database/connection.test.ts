import "dotenv/config";
import { prismaContext } from "../../src/utils/prismaContext";

describe("Teste de conexão com o banco de dados", () => {
  it("deve estabelecer uma conexão com o banco de dados", async () => {
    let error = null;
    try {
      await prismaContext.$connect();
    } catch (error) {
      error = "database connection error: " + error;
      console.log(error);
    } finally {
      await prismaContext.$disconnect();
      expect(error).toBe(null);
    }
  });
});

