const axios = require("axios");
const { quitarCodigoPais } = require("./utils/quitar_codigo_pais");
//const { query } = require("./stack/query");
const { uuidv4, endpoint, headers } = require("./stack/bot-ia");
const { cleanString } = require("./utils/clean-string");

const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} = require("@bot-whatsapp/bot");

const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MongoAdapter = require("@bot-whatsapp/database/mongo");
const { delay } = require("@whiskeysockets/baileys");

/**
 * Declaramos las conexiones de Mongo
 */

const MONGO_DB_URI =
  "mongodb+srv://williammelo533:KYwbyt2tcEGM7bnQ@supercluster.qylavvv.mongodb.net/?retryWrites=true&w=majority&appName=SuperCluster";
const MONGO_DB_NAME = "db_bot";

const flujoFinal = addKeyword("FINAL").addAnswer(
  "Gracias por pasarte por aquí. Fue muy agradable responderte.",
  null,
  async (ctx, { endFlow }) => {
    return endFlow("Adiós!");
  }
);

//------------------------------FLOW DESICION CLIENTE-------------------------------------------

const flujoPreguntaCliente = addKeyword("ANOTHER_QUESTION").addAnswer(
  ["¿Tienes alguna otra duda?", `Escribe "Si" o "No"`],
  { capture: true },
  async (ctx, { gotoFlow }) => {
    const response = ctx.body.toLowerCase();
    if (response == "si") {
      return gotoFlow(flujoPreguntasFrecuentes);
    } else {
      return gotoFlow(flujoFinal);
    }
  }
);

//------------------------------FLOW REGISTRADOS-------------------------------------------

const flujoUsuariosRegistrados = addKeyword("USUARIOS_REGISTRADOS").addAction(
  async (ctx, { flowDynamic, state, gotoFlow }) => {
    let numero = ctx.from;
    let numeroNoCodigo = quitarCodigoPais(numero);

    let fullName = "";

    try {
      // Esperar a que la solicitud Axios se complete
      const response = await axios.get(
        `https://server-academy.vercel.app/clients?contactNumber=${numeroNoCodigo}`
      );

      fullName = response.data.fullName;
      await state.update({ name: fullName });

      // Utilizar flowDynamic después de que se haya obtenido el nombre del cliente
      await flowDynamic(
        `¿Como estas ${fullName}?, ¡Un gusto tenerte nuevamente!`
      );

      return gotoFlow(flujoPreguntasFrecuentes);
    } catch (err) {
      console.error("Error al obtener el nombre del cliente:", err);
      // Manejo de errores, si es necesario
      await flowDynamic(
        `Lo siento, no pudimos obtener tu nombre en este momento. Por favor, inténtalo de nuevo más tarde.`
      );
    }
  }
);

//------------------------------FLOW PREGUNTAS FRECUENTES-------------------------------------------

const flujoPreguntasFrecuentes = addKeyword("PREGUNTAS FRECUENTES")
  .addAnswer(
    ["¿En qué podria ayudarte?"],
    { capture: true, delay: 5000 },
    async (ctx, { state }) => {
      await state.update({ firstResponse: ctx.body });
    }
  )
  .addAction(async (ctx, { flowDynamic, state, gotoFlow }) => {
    let respuestaIA = "";
    const userId = uuidv4();
    console.log("llegamos a la ia");

    const data = {
      "in-0": ctx.body,
      user_id: userId,
    };

    try {
      const response = await axios.post(endpoint, data, { headers });
      const respuesta = response.data.outputs["out-0"];
      respuestaIA = cleanString(respuesta);

      console.log("Antes del response.data");
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`api-error: ${error.message}`);
      }
      throw new Error(`api-error: ${error}`);
    } finally {
      await flowDynamic(`${respuestaIA}`);
      console.log("pasando por el return del finally");
      return gotoFlow(flujoPreguntaCliente);
    }
  });

//------------------------------FLOW NO REGISTRADOS-------------------------------------------

const flujoUsuariosNORegistrados = addKeyword("USUARIOS_NO_REGISTRADOS")
  .addAnswer("Veo que es tu primera vez por aqui.")
  .addAnswer("Bienvenido a nuestro chat. Quisiera hacerte unas preguntas")
  .addAnswer(null, {
    buttons: [{ body: "Si" }, { body: "No" }],
  });

//------------------------------FLOW BIENVENIDA-------------------------------------------

// Flow de bienvenida que determina si es un usuario nuevo o no consultado la base de datos
const flujoBienvenida = addKeyword(EVENTS.WELCOME).addAnswer(
  "Bienvenido! Soy Carlos, el asistente virtual con IA de la Academia Musical. Puedes preguntarme lo que desees.",
  null,
  async (ctx, { gotoFlow }) => {
    let numero = ctx.from;
    let numeroNoCodigo = quitarCodigoPais(numero);

    await axios
      .get(
        `https://server-academy.vercel.app/clients?contactNumber=${numeroNoCodigo}`
      )
      .then((response) => {
        if (response.data == null) {
          return gotoFlow(flujoUsuariosNORegistrados);
        }
        return gotoFlow(flujoUsuariosRegistrados);
      });
  }
);

const main = async () => {
  const adapterDB = new MongoAdapter({
    dbUri: MONGO_DB_URI,
    dbName: MONGO_DB_NAME,
  });
  const adapterFlow = createFlow([
    flujoBienvenida,
    flujoUsuariosRegistrados,
    flujoUsuariosNORegistrados,
    flujoPreguntasFrecuentes,
    flujoPreguntaCliente,
    flujoFinal,
  ]);
  const adapterProvider = createProvider(BaileysProvider);
  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });
  QRPortalWeb();
};

main();
