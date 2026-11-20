import { NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-120b";

const SYSTEM_PROMPT = `Eres Axioma AI, el asistente comercial inteligente integrado en Axioma-X (impulsado por Groq).
Axioma-X es una plataforma para PyMEs y profesionales en Latinoamérica que convierte mensajes informales de WhatsApp, dictado por voz o imágenes en cotizaciones PDF profesionales con enlace de aprobación para clientes en segundos.

Tu rol:
- Responder siempre en español claro, directo, amigable y profesional.
- Ayudar a los usuarios a entender cómo usar Axioma-X (Cotizador, Catálogo de Servicios, Historial Comercial, Configuración de Empresa, Portal Cliente /q).
- Redactar mensajes de seguimiento por WhatsApp, correos de envío de cotizaciones, términos y condiciones de pago, y estrategias para cerrar más ventas.
- Mantener las respuestas concisas y accionables (usa listas breves cuando ayude).`;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Falta configurar GROQ_API_KEY en el servidor (.env.local o variables de entorno).",
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as ChatRequestBody;
    const rawMessages = Array.isArray(body?.messages) ? body.messages : [];

    const sanitizedMessages: ChatMessage[] = rawMessages
      .filter(
        (m): m is ChatMessage =>
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      )
      .slice(-20)
      .map((m) => ({
        role: m.role,
        content: m.content.trim().slice(0, 4000),
      }));

    if (sanitizedMessages.length === 0) {
      return NextResponse.json(
        { error: "Debes enviar al menos un mensaje." },
        { status: 400 }
      );
    }

    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...sanitizedMessages,
        ],
        temperature: 0.5,
        max_tokens: 1024,
      }),
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      const errorMessage =
        data?.error?.message ||
        `Error al consultar Groq (${groqRes.status}).`;
      return NextResponse.json(
        { error: errorMessage },
        { status: groqRes.status }
      );
    }

    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "No pude generar una respuesta en este momento.";

    return NextResponse.json({
      reply,
      model: data?.model || DEFAULT_MODEL,
    });
  } catch (err) {
    console.error("Error in /api/chat:", err);
    return NextResponse.json(
      { error: "Ocurrió un error inesperado al procesar tu consulta." },
      { status: 500 }
    );
  }
}
