import express, { Request, Response } from 'express';

const router = express.Router();

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Receber arquivo
 *     description: Endpoint para receber um arquivo
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
router.post("/upload", (req: Request, res: Response) => {
	const file = req.body.file;

	const processedData = `O arquivo ${file} foi recebido`;

	res.json({result: processedData});
});


/**
 * @swagger
 * /getData:
 *   get:
 *     summary: Obter dados
 *     description: Endpoint para obter dados
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
