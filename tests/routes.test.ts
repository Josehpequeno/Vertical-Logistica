import axios from "axios";
import path from "path";
import fs from "fs";
import FormData from "form-data";

const PORT = 3000;
const FILE_PATH_1 = path.resolve(__dirname, "../data_1.txt");
const FILE_PATH_2 = path.resolve(__dirname, "../data_2.txt");

describe("Testes para rotas", () => {
  it("Deve retornar 200 OK ao enviar arquivos via rota /upload", async () => {
    try {
      const formData1 = new FormData();
      formData1.append("file", fs.createReadStream(FILE_PATH_1));

      const formData2 = new FormData();
      formData2.append("file", fs.createReadStream(FILE_PATH_2));

      const [response1, response2] = await Promise.all([
        axios.post(`http://localhost:${PORT}/upload`, formData1, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }),
        axios.post(`http://localhost:${PORT}/upload`, formData2, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
      ]);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    } catch (error: any) {
      console.error(`Erro no upload de arquivos ${error}`);
      expect(error.message).toBe(null);
    }
  });

  it("Deve retornar 200 OK ao acessar a rota /list", async () => {
    try {
      const response = await axios.get(`http://localhost:${PORT}/list`);
      expect(response.status).toBe(200);
      // console.log(response.data)
      //JSON.parse(response.data);
      expect(true).toBeTruthy();
    } catch (error: any) {
      console.error(`Erro no upload de arquivos ${error}`);
      expect(error.message).toBe(null);
    }
  });
});
