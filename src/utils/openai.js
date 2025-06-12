import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Fallback responses for when the API is unavailable
const fallbackResponses = [
  'Üzr istəyirəm, hal-hazırda texniki çətinliklər yaşayıram. Zəhmət olmasa bir neçə dəqiqə sonra yenidən cəhd edin.',
  'Hal-hazırda beynimə qoşulmaqda çətinlik çəkirəm. Bir dəqiqə sonra yenidən cəhd edə bilərsinizmi?',
  'Müvəqqəti olaraq offline-dirəm. Zəhmət olmasa sualınızı bir az sonra yenidən soruşun.',
  'Qısa bir fasilə verirəm. Zəhmət olmasa bir az sonra yenidən cəhd edin.',
  'Hal-hazırda sorğunuzu emal etməkdə çətinlik çəkirəm. Zəhmət olmasa tezliklə yenidən cəhd edin.',
];

export const generateAIResponse = async (messages) => {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Get the last user message
    const lastUserMessage = messages.filter((msg) => msg.role === 'user').pop()?.content || '';

    // Generate response
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: lastUserMessage }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI API Error:', error);

    // Handle specific error cases
    if (error.status === 429) {
      return 'Hal-hazırda çox sayda sorğu alıram. Zəhmət olmasa bir neçə dəqiqə sonra yenidən cəhd edin.';
    }

    if (error.status === 401) {
      return 'Kimlik doğrulama ilə bağlı problem yaşayıram. Zəhmət olmasa API konfiqurasiyanızı yoxlayın.';
    }

    // Return a random fallback response for other errors
    const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
    return fallbackResponses[randomIndex];
  }
};
