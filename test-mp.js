require('dotenv').config();
const { MercadoPagoConfig, Payment } = require('mercadopago');

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN, options: { timeout: 5000 } });
const payment = new Payment(client);

async function run() {
  console.log("Testando fluxo com payment_method_id EXPLICITO...");
  try {
    const paymentBody = {
      transaction_amount: 1.00,
      description: "Teste Backend",
      installments: 1,
      // Passando payment_method_id, mas um token falso.
      // Esperamos um erro sobre o TOKEN inválido, mas NÃO o erro de payment_method_id nulo.
      payment_method_id: "master",
      token: "tok_falso123", 
      payer: {
        email: "claforum@gmail.com",
      },
    };
    const res = await payment.create({ body: paymentBody });
    console.log("Sucesso inesperado (visto que o token é falso):", res);
  } catch (error) {
    if (error.message.includes("payment_method_id")) {
      console.log("ERRO REAL: payment_method_id ainda está falhando:", error.message);
    } else {
      console.log("APROVADO: O Mercado Pago passou da validação do payment_method_id e parou no token (como esperado).", error.message);
      console.log("Detalhes do erro do MP:", error.cause);
    }
  }
}
run();
