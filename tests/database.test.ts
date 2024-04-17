import 'dotenv/config';
import { AppDataSource } from "../src/utils/database";


afterAll(async () =>{
	await AppDataSource.close();
})

describe("Teste de conexão com o banco de dados", () => {
	it("deve estabelecer uma conexão com o banco de dados", async() =>{
		try {
			await AppDataSource.initialize();
			expect(true).toBeTruthy();
		} catch (error) {
			throw new Error(`Erro ao conectar ao banco de dados: ${error}`);
		}
	});
})
