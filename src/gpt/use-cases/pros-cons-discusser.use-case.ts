import OpenAI from 'openai';

/**
 * Interfaz para las opciones del caso de uso
 */
interface Options {
  prompt: string;
}

/**
 * Caso de uso para generar respuestas de pros y contras
 * especializado únicamente en fonoaudiología
 */
export const prosConsDicusserUseCase = async (
  openai: OpenAI, 
  { prompt }: Options
): Promise<OpenAI.Chat.Completions.ChatCompletionMessage> => {
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt()
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 500
    });

    return response.choices[0].message;
    
  } catch (error) {
    console.error('Error en prosConsDicusserUseCase:', error);
    throw new Error('Error al generar respuesta de pros y contras');
  }
};

/**
 * Construye el prompt del sistema para el asistente de fonoaudiología
 */
function buildSystemPrompt(): string {
  return `
    Eres un asistente especializado ÚNICAMENTE en fonoaudiología y terapia del habla.
    
    INSTRUCCIONES ESTRICTAS:
    - SOLO responde preguntas relacionadas con fonoaudiología, terapia del habla, 
      trastornos del lenguaje, deglución, voz, audición, y desarrollo comunicativo.
    - Si la pregunta NO es sobre fonoaudiología o temas relacionados, responde ÚNICAMENTE: 
      "Lo siento, solo puedo ayudarte con preguntas sobre fonoaudiología y terapia del habla. 
      Por favor, reformula tu pregunta sobre estos temas."
    - NO proporciones información médica que requiera diagnóstico profesional.
    - Siempre recomienda consultar con un fonoaudiólogo profesional para casos específicos.
    
    FORMATO DE RESPUESTA:
    - Usa formato markdown
    - Organiza la respuesta con pros y contras en listas
    - Mantén un tono profesional y educativo
    - Incluye recomendaciones prácticas cuando sea apropiado
    
    TEMAS VÁLIDOS incluyen:
    - Ejercicios de articulación y pronunciación
    - Trastornos del lenguaje (afasia, dislexia, etc.)
    - Problemas de deglución
    - Desarrollo del habla en niños
    - Técnicas de rehabilitación vocal
    - Terapias para tartamudez
    - Estimulación del lenguaje
    - Evaluación y diagnóstico fonoaudiológico
    - Tecnologías de apoyo comunicativo
    - Prevención de trastornos del habla
  `.trim();
}

/**
 * Interfaz para el resultado del caso de uso
 */
export interface ProsConsResult {
  success: boolean;
  message?: OpenAI.Chat.Completions.ChatCompletionMessage;
  error?: string;
}

/**
 * Versión alternativa que devuelve un resultado estructurado
 */
export const prosConsDicusserUseCaseSafe = async (
  openai: OpenAI, 
  { prompt }: Options
): Promise<ProsConsResult> => {
  
  try {
    const message = await prosConsDicusserUseCase(openai, { prompt });
    
    return {
      success: true,
      message
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Constantes para la configuración
 */
export const AI_CONFIG = {
  MODEL: 'gpt-4' as const,
  TEMPERATURE: 0.8,
  MAX_TOKENS: 500
} as const;

/**
 * Mensajes predefinidos
 */
export const MESSAGES = {
  OUT_OF_SCOPE: `Lo siento, solo puedo ayudarte con preguntas sobre fonoaudiología y terapia del habla. 
                 Por favor, reformula tu pregunta sobre estos temas.`,
  
  ERROR_GENERIC: 'Error al generar respuesta de pros y contras',
  
  PROFESSIONAL_DISCLAIMER: `**Nota importante:** Esta información es educativa. 
                           Para casos específicos, consulta con un fonoaudiólogo profesional.`
} as const;

/**
 * Valida si un prompt está relacionado con fonoaudiología
 * (función auxiliar para uso futuro)
 */
export function isPhonologyRelated(prompt: string): boolean {
  const keywords = [
    'fonoudiolog', 'fonoaudiolog', 'habla', 'lenguaje', 'pronunciación', 
    'articulación', 'deglución', 'voz', 'tartamudez', 'afasia', 
    'dislexia', 'comunicación', 'terapia del habla', 'logopedia'
  ];
  
  const lowercasePrompt = prompt.toLowerCase();
  return keywords.some(keyword => lowercasePrompt.includes(keyword));
}