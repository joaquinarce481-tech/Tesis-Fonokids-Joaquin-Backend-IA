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
    console.log('📁 Archivo recibido:', audioFile.originalname);
    console.log('📍 Path del archivo:', audioFile.path);

    // 1. Transcribir el audio usando Whisper con prompt para mejorar precisión
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFile.path),
      model: 'whisper-1',
      language: 'es',
      prompt: 'El niño está practicando pronunciación de palabras en español. Puede decir palabras simples, frases cortas o hacer ejercicios de fonoaudiología.',
      temperature: 0.2
    });

    const transcription = response.text;
    
    console.log('📝 Transcripción:', transcription);

    // Filtrar transcripciones incorrectas comunes
    if (transcription.includes('Amara.org') || 
        transcription.includes('Subtítulos realizados') ||
        transcription.length < 2) {
      console.log('⚠️ Transcripción inválida detectada');
      return {
        transcription: '[No se pudo detectar audio claro]',
        evaluation: 'No pude escuchar bien tu voz. Por favor, intenta de nuevo hablando más alto y claro, cerca del micrófono.',
        success: false
      };
    }

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

    const evaluationText = evaluation.choices[0].message.content;

    console.log('✅ Evaluación:', evaluationText);

    // 3. Limpiar archivo temporal
    fs.unlinkSync(audioFile.path);

    return {
      transcription: transcription,
      evaluation: evaluationText,
      success: true
    };

  } catch (error) {
    console.error('❌ Error en audioToTextUseCase:', error);
    
    if (audioFile && audioFile.path && fs.existsSync(audioFile.path)) {
      fs.unlinkSync(audioFile.path);
    }
    
    throw new Error('Error al procesar el audio');
  }
};

function buildEvaluationPrompt(): string {
  return `
Eres un fonoaudiólogo pediátrico especializado en evaluar la pronunciación de niños en terapia del lenguaje.

CONTEXTO DEL PACIENTE:
- Edad estimada: 4-12 años
- En proceso de terapia de fonoaudiología
- Puede tener dificultades con fonemas específicos (R, RR, S, L, etc.)
- Necesita feedback constructivo y motivador

INSTRUCCIONES DE ANÁLISIS:
1. Evalúa la claridad general del mensaje
2. Identifica fonemas problemáticos (si los hay)
3. Detecta patrones comunes:
   - Rotacismo (dificultad con /r/)
   - Sigmatismo (dificultad con /s/)
   - Lambdacismo (dificultad con /l/)
   - Omisión de consonantes finales
   - Sustitución de fonemas
4. Considera la edad estimada para la evaluación
5. Enfócate en 1-2 áreas principales de mejora (no abrumes al niño)

FORMATO DE RESPUESTA:
**✅ ¡Muy bien hecho!**
[2-3 aspectos específicos que hizo bien. Ejemplos: "Pronunciaste muy bien las palabras con 'L'", "Tu ritmo al hablar fue excelente"]

**⚠️ Podemos mejorar:**
[Solo SI hay errores evidentes. Máximo 2 áreas. Sé específico: "Noté que la 'R' en 'perro' sonó un poco suave"]

**💡 Ejercicios para practicar:**
[Solo SI mencionaste áreas de mejora. Sugiere 1-2 ejercicios CONCRETOS. Ejemplos:
- Para /r/: "Practica decir 'rrr' como un motor: rrrrrr"
- Para /s/: "Sopla como una serpiente: ssssss"
- Para /l/: "Di 'la-le-li-lo-lu' frente al espejo"]

**🎯 Tu puntuación: [X/10]**
[8-10: Excelente | 6-7: Muy bien, sigue practicando | 4-5: Buen intento, vamos mejorando]

**🌟**
[Termina con una frase alentadora personalizada según el desempeño]

**💬 ¿Más dudas?**
Si tienes más preguntas sobre fonoaudiología, ejercicios o cualquier otra consulta, ¡pregúntale a tu FonoBot! 🤖

REGLAS CRÍTICAS:
- SIEMPRE empieza con algo positivo, incluso si hay errores
- Usa lenguaje simple adaptado a niños (evita términos técnicos)
- Si la pronunciación es 9-10/10, céntrate solo en felicitar
- Si hay errores, menciona solo los 1-2 MÁS IMPORTANTES
- Los ejercicios deben ser divertidos y fáciles de entender
- NUNCA uses términos como "rotacismo", "fonema", etc. con el niño
- Sé breve: máximo 150 palabras en total
- SIEMPRE incluye la sección "¿Más dudas?" al final
  `.trim();
}