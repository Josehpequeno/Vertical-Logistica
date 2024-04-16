import {DB} from "../src/utils/database";
import 'dotenv/config';

afterAll(async () => {
  await DB.close();
});

describe("Teste de conexão com o banco de dados", () => {
	it("deve estabelecer uma conexão com o banco de dados", async() =>{
		try {
			await DB.initialize();
			expect(true).toBeTruthy();
		} catch (error) {
			throw new Error(`Erro ao conectar ao banco de dados: ${error}`);
		}
	});
})
