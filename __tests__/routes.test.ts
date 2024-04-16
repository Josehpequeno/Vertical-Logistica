import axios from 'axios';
import path from 'path';
import fs from "fs";
import app from '../src/app';
import FormData from "form-data";

const PORT = 3000;
const FILE_PATH_1 = path.resolve(__dirname, '../data_1.txt'); 
const FILE_PATH_2 = path.resolve(__dirname, '../data_2.txt'); 


describe('Teste para upload', () => {
	it("Deve retornar 200 ok ao enviar um arquivo via rota /upload", async () => {
		const formData = new FormData();
		formData.append('file', fs.createReadStream(FILE_PATH_1));
		
		const response = await axios.post(`http://localhost:${PORT}/upload`,
		formData, {
			headers: {
		        'Content-Type': 'multipart/form-data',
		    },
		});

		expect(response.status).toBe(200);
	});

	it("Deve retornar 200 ok ao enviar um arquivo via rota /upload", async () => {
			const formData = new FormData();
			formData.append('file', fs.createReadStream(FILE_PATH_2));
			
			const response = await axios.post(`http://localhost:${PORT}/upload`,
			formData, {
				headers: {
			        'Content-Type': 'multipart/form-data',
			    },
			});
	
			expect(response.status).toBe(200);
		});
})

describe("Teste para getData", () => {
	it("Deve retornar 200 OK ao acessar a rota /getData", async() => {
		const response = await axios.get(`http://localhost:${PORT}/getData`);
		expect(response.status).toBe(200);
		expect(response.data.result).toEqual('ok');
	})
})
