import express, { Request, Response } from 'express';
import fs from "fs";

import multer from 'multer';

// configurando multer para armazenamento em memória
const storage = multer.memoryStorage();
const upload = multer({storage: storage})

const router = express.Router();

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Receber arquivo
 *     description: Endpoint para receber um arquivo
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Arquivo recebido com sucesso
 */
router.post("/upload", upload.single('file'),(req: Request, res: Response) => {
	if (!req.file) {
	    console.error("Arquivo não fornecido");
        return res.status(400).json({ error: "Arquivo não fornecido" });
	}

	const fileContent = req.file.buffer.toString('utf8');
	console.log('Conteúdo do arquivo:', fileContent);

	res.status(200).json({messsage: 'Conteúdo do arquivo lido com sucesso'});
});


/**
 * @swagger
 * /getData:
 *   get:
 *     summary: Obter dados
 *     description: Endpoint para obter dados
 *     tags: [GetData]
 *     responses:
 *       '200':
 *         description: Dados obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 */
router.get("/getData", (req: Request, res: Response)=>{
	const result = "ok";

	res.json({result});
});

export default router;
