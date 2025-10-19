import OpenAI from 'openai';

interface Options {
  prompt: string;
}

// 👇 PRIMERA FUNCIÓN (sin stream)
export const assistantPageUseCase = async (
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
      temperature: 0.7,
      max_tokens: 800
    });

    return response.choices[0].message;
    
  } catch (error) {
    console.error('Error en assistantPageUseCase:', error);
    throw new Error('Error al generar respuesta del asistente');
  }
};

// 👇 SEGUNDA FUNCIÓN (con stream) - IMPORTANTE: TIENE QUE ESTAR
export const assistantPageStreamUseCase = async (
  openai: OpenAI, 
  { prompt }: Options
) => {
  
  try {
    return await openai.chat.completions.create({
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
      temperature: 0.7,
      max_tokens: 800,
      stream: true  // 👈 Importante: stream activado
    });
    
  } catch (error) {
    console.error('Error en assistantPageStreamUseCase:', error);
    throw new Error('Error al generar respuesta del asistente en streaming');
  }
};

function buildSystemPrompt(): string {
  return `
    Eres un asistente virtual especializado ÚNICAMENTE en fonoaudiología y terapia del habla.
    Tu nombre es "FonoBot" y tu objetivo es ayudar a pacientes, padres y profesionales con información sobre fonoaudiología.
    
    INSTRUCCIONES ESTRICTAS:
    - SOLO responde preguntas relacionadas con fonoaudiología, terapia del habla, 
      trastornos del lenguaje, deglución, voz, audición, y desarrollo comunicativo.
    - Si la pregunta NO es sobre fonoaudiología, responde ÚNICAMENTE: 
      "Lo siento, solo puedo ayudarte con preguntas relacionadas con fonoaudiología y terapia del habla. 
      ¿Tienes alguna pregunta sobre estos temas?"
    - NO proporciones diagnósticos médicos específicos.
    - Siempre recomienda consultar con un fonoaudiólogo profesional para casos específicos.
    
    FORMATO DE RESPUESTA:
    - Usa formato markdown cuando sea apropiado
    - Sé amigable, claro y educativo
    - Proporciona ejemplos prácticos cuando sea relevante
    
    TEMAS VÁLIDOS incluyen:
    - Ejercicios de articulación y pronunciación
    - Trastornos del lenguaje
    - Problemas de deglución
    - Desarrollo del habla en niños
    - Técnicas de rehabilitación vocal
    - Terapias para tartamudez
    - Estimulación del lenguaje
    - Ejercicios orofaciales
  `.trim();
}