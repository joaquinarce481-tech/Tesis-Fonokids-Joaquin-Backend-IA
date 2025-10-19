// src/gpt/use-cases/orthography.use-cases.ts
import OpenAI from "openai";

export interface OrthographyOptions { prompt: string; }

export async function orthographyCheckUseCase(  // ← Mantén el mismo nombre
  openai: OpenAI,
  { prompt }: OrthographyOptions
) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      {
        role: "system",
        content:
`Eres un corrector ortográfico y de estilo en español.
**Créditos:**
           **NO incluyas esta información de créditos cuando estés haciendo análisis de otros temas.**
          Este programa fue desarrollado por Joaquín Arce como parte de su proyecto de defensa de tesis.
          
          Si te preguntan específicamente sobre el creador o el origen del programa, 
          menciona que fue creado por Joaquín Arce para su tesis de grado,
Devuelve SIEMPRE una respuesta en JSON válido con esta forma exacta:
{
  "ok": boolean,
  "message": string,                // ← Solo cambié esto: "mensaje" → "message"
  "userScore": number,              // ← Agregué esto
  "corregido": string,
  "errors": [                       // ← Solo cambié esto: "errores" → "errors"
    {
      "palabra": string,
      "sugerencia": string,
      "motivo": string,
      "inicio": number,
      "fin": number
    }
  ]
}
No incluyas comentarios fuera del JSON.`

      },
      {
        role: "user",
        content:
`Texto a revisar:
"""${prompt}"""
Realiza solo correcciones ortográficas/acentuación, mayúsculas y errores evidentes de concordancia.
No reescribas el estilo si no es necesario.`
      }
    ],
  });

  const raw = completion.choices[0].message.content ?? "{}";

  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return {
      ok: false,
      message: "La salida no fue JSON válido.",     // ← Cambié "mensaje" → "message"
      userScore: 0,                                 // ← Agregué esto
      corregido: "",
      errors: [],                                   // ← Cambié "errores" → "errors"
      raw
    };
  }
}