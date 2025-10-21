import * as path from 'path';
import * as fs from 'fs';

import OpenAI from 'openai';

interface Options {
  prompt: string;
  voice?: string;
}

export const textToAudioUseCase = async (
  openai: OpenAI,
  { prompt, voice }: Options,
) => {

  const voices = {
    nova: 'nova',
    alloy: 'alloy',
    echo: 'echo',
    fable: 'fable',
    onyx: 'onyx',
    shimmer: 'shimmer',
  };

  const selectedVoice = voices[voice as keyof typeof voices] ?? 'nova';

  // Mejorar el texto con enfoque pedagógico
  const improvedText = await improveTextForSpeech(openai, prompt);

  console.log('📝 Texto original:', prompt);
  console.log('✨ Texto mejorado:', improvedText);

  const folderPath = path.resolve(__dirname, '../../../generated/audios/');
  const speechFile = path.resolve(`${folderPath}/${new Date().getTime()}.mp3`);

  fs.mkdirSync(folderPath, { recursive: true });

  const mp3 = await openai.audio.speech.create({
    model: 'tts-1-hd',
    voice: selectedVoice,
    input: improvedText,
    response_format: 'mp3',
    speed: 0.9,
  });

  const buffer = Buffer.from( await mp3.arrayBuffer() );
  fs.writeFileSync( speechFile, buffer );

  return speechFile;
};

async function improveTextForSpeech(openai: OpenAI, text: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: buildTextToAudioPrompt()
      },
      {
        role: 'user',
        content: `Texto a convertir a audio: "${text}"`
      }
    ],
    temperature: 0.3,
    max_tokens: 400
  });

  return response.choices[0].message.content?.trim() || text;
}

function buildTextToAudioPrompt(): string {
  return `
Eres un fonoaudiólogo especializado en crear material de audio para ejercicios de pronunciación.

Tu tarea es mejorar el texto que te dan para que sea óptimo para que un niño lo escuche y practique su pronunciación.

INSTRUCCIONES:
1. Si el texto es una palabra simple, repítela 3 veces con pausas
2. Si es una frase, divídela en partes más lentas y claras
3. Enfatiza los fonemas difíciles (R, RR, S, L, etc.)
4. Agrega instrucciones claras para el niño
5. Invita al niño a practicar junto contigo
6. SIEMPRE termina invitándolo a evaluar su pronunciación
7. Mantén un tono motivador y amigable
8. Si detectas errores ortográficos, corrígelos

ESTRUCTURA DEL AUDIO:
1. Presentación de la palabra/frase
2. Repetición lenta y clara (2-3 veces)
3. Invitación a practicar juntos
4. CIERRE: Invitar a "Evaluar Pronunciación"

REGLAS IMPORTANTES:
- SIEMPRE incluir la invitación final a "Evaluar Pronunciación"
- Usar frases como: "cuando te sientas seguro", "cuando estés listo"
- Mantener el texto entre 30-60 palabras
- Usar un lenguaje claro adaptado a niños

FRASES DE CIERRE (usa variaciones):
- "Cuando te sientas seguro, ve a la sección de Evaluar Pronunciación para grabar tu voz"
- "Practica varias veces y luego grábate en Evaluar Pronunciación"
- "Cuando domines esta palabra, grábate en la sección Evaluar Pronunciación"

DEVUELVE SOLO EL TEXTO MEJORADO, sin explicaciones adicionales.
  `.trim();
}