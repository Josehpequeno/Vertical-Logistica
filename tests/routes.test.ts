import axios from "axios";
import path from "path";
import fs from "fs";
import FormData from "form-data";

const PORT = 3000;
const FILE_PATH_1 = path.resolve(__dirname, "../data_1.txt");
const FILE_PATH_2 = path.resolve(__dirname, "../data_2.txt");

describe("Testes para rotas", () => {
  it("Teste com envio na rota /upload e depois list do arquivo 1", async () => {
    try {
      const formData = new FormData();
      formData.append("file", fs.createReadStream(FILE_PATH_1));

      const responseUpload = await axios.post(
        `http://localhost:${PORT}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
      expect(responseUpload.status).toBe(200);

      const responseList = await axios.get("http://localhost:3000/list");
      expect(responseList.status).toBe(200);
      expect(responseList.data.users).toBeDefined();
    } catch (error) {
      console.error(`Erro no upload de arquivos ${error}`);
      expect(error).toBe(null);
    }
  });

  it("Teste com envio na rota /upload e depois list do arquivo 2", async () => {
    try {
      const formData = new FormData();
      formData.append("file", fs.createReadStream(FILE_PATH_2));

      const responseUpload = await axios.post(
        `http://localhost:${PORT}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
      expect(responseUpload.status).toBe(200);

      const responseList = await axios.get("http://localhost:3000/list");
      expect(responseList.status).toBe(200);
      expect(responseList.data.users).toBeDefined();
    } catch (error) {
      console.error(`Erro no upload de arquivos ${error}`);
      expect(error).toBe(null);
    }
  });
});
