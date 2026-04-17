import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Script de teste para validar a conexão SMTP.
 * Execute com: npx tsx src/scratch/test-smtp.ts
 */
async function testSMTP() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  console.log("=== TESTANDO CONEXÃO SMTP ===");
  console.log("Host:", SMTP_HOST);
  console.log("Porta:", SMTP_PORT);
  console.log("Usuário:", SMTP_USER);

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    // Timeout maior para teste
    connectionTimeout: 10000,
  });

  try {
    console.log("Tentando verificar conexão...");
    await transporter.verify();
    console.log("✅ CONEXÃO ESTABELECIDA COM SUCESSO!");
    
    // Opcional: Enviar e-mail de teste para o próprio usuário
    /*
    await transporter.sendMail({
      from: `"Teste On-line" <${SMTP_USER}>`,
      to: 'onlineproducoes@gmail.com', // E-mail de admin
      subject: '🚀 Teste de Conexão SMTP - On-line Produções',
      text: 'Se você está vendo isso, o sistema de e-mail está configurado corretamente!',
    });
    console.log("✅ E-mail de teste enviado!");
    */
  } catch (error) {
    console.error("❌ FALHA NA CONEXÃO SMTP:", error);
  }
}

testSMTP();
