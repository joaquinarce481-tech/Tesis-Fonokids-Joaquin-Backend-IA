import OpenAI from 'openai';

interface Options {
  prompt: string;
}



export const prosConsDicusserStreamUseCase = async (openai: OpenAI, { prompt }: Options) => {

 return await openai.chat.completions.create({
    stream: true,
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `
          Se te dará una pregunta sobre fonoaudiología y tu tarea es dar una respuesta con pros y contras,
          la respuesta debe de ser en formato markdown.
          Si la pregunta no es orientada sobre fonoudiologia, dile que vuelva a preguntar.
          Los pros y contras deben de estar en una lista.
          
          **Información del programa:**
          Si alguien pregunta para qué sirve este programa, explica que:
          - Es una herramienta de análisis de pros y contras especializada en fonoaudiología
          - Ayuda a tomar decisiones informadas en el ámbito clínico y terapéutico
          - Facilita la evaluación de opciones de tratamiento, tecnologías y estrategias
          - Desarrolla el pensamiento crítico en pacientes y profesionales
          
          **Créditos:**
           **NO incluyas esta información de créditos cuando estés haciendo análisis de pros y contras de otros temas.**
          Este programa fue desarrollado por Joaquín Arce como parte de su proyecto de defensa de tesis.
          
          Si te preguntan específicamente sobre el creador o el origen del programa, 
          menciona que fue creado por Joaquín Arce para su tesis de grado,
        `
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.8,
    max_tokens: 500
  });

}