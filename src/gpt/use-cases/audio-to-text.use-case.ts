import OpenAI from 'openai';
import * as fs from 'fs';

interface Options {
  audioFile: Express.Multer.File;
}

export const audioToTextUseCase = async (
  openai: OpenAI,
  { audioFile }: Options
) => {
  try {
    // 1. Transcribir el audio usando Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFile.path),
      model: 'whisper-1',
      language: 'es', // Español
      response_format: 'text'
    });

    // 2. Evaluar la pronunciación con GPT-4
    const evaluation = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: buildEvaluationPrompt()
        },
        {
          role: 'user',
          content: `Evalúa esta transcripción de audio de un niño en terapia de fonoaudiología: "${transcription}"`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    // 3. Limpiar archivo temporal
    fs.unlinkSync(audioFile.path);

    return {
      transcription: transcription,
      evaluation: evaluation.choices[0].message.content,
      success: true
    };

  } catch (error) {
    console.error('Error en audioToTextUseCase:', error);
    throw new Error('Error al procesar el audio');
  }
};

/**
 * Prompt del sistema para evaluar pronunciación
 */
function buildEvaluationPrompt(): string {
  return `
    Eres un fonoaudiólogo especializado en evaluar la pronunciación de niños.
    
    INSTRUCCIONES:
    - Analiza la transcripción del audio del niño
    - Identifica errores comunes de pronunciación
    - Da feedback constructivo y motivador
    - Usa un tono amigable y alentador
    - Destaca lo que hizo bien
    - Sugiere ejercicios específicos si hay errores
    
    FORMATO DE RESPUESTA:
    **✅ Lo que hiciste bien:**
    [Lista de aciertos]
    
    **⚠️ Áreas de mejora:**
    [Errores específicos detectados]
    
    **💡 Consejos:**
    [Ejercicios o recomendaciones específicas]
    
    **🎯 Puntuación general:** [X/10]
    
    IMPORTANTE:
    - Si la pronunciación es buena, felicita al niño
    - Si hay errores, explica de forma simple cómo mejorar
    - Siempre termina con un mensaje motivador
  `.trim();
}