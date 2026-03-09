const express = require("express");
const cors = require("cors");
const { MercadoPagoConfig, Preference } = require("mercadopago");

const app = express();
const port = 3000;

// Habilitamos CORS para que tu página HTML se pueda conectar sin bloqueos
app.use(cors());
// Habilitamos que el servidor entienda formato JSON
app.use(express.json());

// ⚠️ ACÁ VA TU CREDENCIAL SECRETA DE MERCADO PAGO NUEVA ⚠️
const client = new MercadoPagoConfig({ accessToken: "TU_ACCESS_TOKEN_NUEVO_ACA" });

// Esta es la "puerta" que va a golpear tu página cuando alguien haga clic en Comprar
app.post("/crear-preferencia", async (req, res) => {
  try {
    // Agarramos los datos que nos manda tu HTML (nombre, precio, stock)
    const { titulo, precio, cantidad } = req.body;

    const body = {
      items: [
        {
          title: titulo,
          quantity: Number(cantidad),
          unit_price: Number(precio),
          currency_id: "ARS",
        },
      ],
      // A dónde mandamos al cliente después de que paga
      back_urls: {
        success: "https://agus-tech-tienda.web.app", // <--- AHORA VUELVEN A TU TIENDA
        failure: "https://agus-tech-tienda.web.app",
        pending: "https://agus-tech-tienda.web.app",
      },
      auto_return: "approved",
    };

    // Le pedimos a Mercado Pago que genere el link de cobro
    const preference = new Preference(client);
    const result = await preference.create({ body });

    // Le devolvemos a tu HTML el link generado
    res.json({ id: result.id, init_point: result.init_point });
    
  } catch (error) {
    console.error("Error al generar el link:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Prendemos el servidor
app.listen(port, () => {
  console.log(`¡Servidor de Mercado Pago corriendo joya en el puerto ${port}! 🚀`);
});
