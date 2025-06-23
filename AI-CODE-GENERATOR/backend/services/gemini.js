const axios = require('axios');

const generateCode = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    return content || 'No response generated.';
  } catch (err) {
    console.error('Gemini API Error:', JSON.stringify(err.response?.data || err.message, null, 2));
    throw new Error('Failed to generate content from Gemini API');
  }
};

module.exports = { generateCode };
