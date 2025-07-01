const axios = require('axios');
const ChatMessage = require('../models/ChatMessage');
const { Child, HotlineAgent } = require('../models/User');

const SYSTEM_PROMPT = "You are a safe chatbot for kids aged 10–17 who are dealing with online bullying or inappropriate messages. You give short, kind, supportive advice. You never give personal, legal, or medical advice. Always remind them to talk to a trusted adult. Never respond to inappropriate or unsafe requests.";

async function handleChildChat(childId, message) {
  try {
    // Save child's message
    await ChatMessage.create({
      sender: childId,
      receiver: 'bot',
      text: message,
      role: 'user',
    });
    // Get Groq's chat reply (normal LLM answer)
    let botReply;
    try {
      const groqRes = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama3-70b-8192',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: message }
          ],
          max_tokens: 512,
          temperature: 0.2
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      botReply = groqRes.data.choices[0].message.content;
    } catch (apiErr) {
      let errMsg;
      if (apiErr.response?.data) {
        errMsg = JSON.stringify(apiErr.response.data);
      } else if (apiErr.errors && Array.isArray(apiErr.errors)) {
        errMsg = apiErr.errors.map(e => e.message || JSON.stringify(e)).join(' | ');
      } else if (apiErr.message) {
        errMsg = apiErr.message;
      } else {
        errMsg = JSON.stringify(apiErr);
      }
      console.error('Groq API chat error:', errMsg);
      return { reply: `Groq API chat error: ${errMsg}` };
    }

    // Save bot's reply
    await ChatMessage.create({
      sender: 'bot',
      receiver: childId,
      text: botReply,
      role: 'assistant',
    });

    return { reply: botReply };
  } catch (err) {
    console.error('Groq API error:', err.message || err);
    return { reply: 'Sorry, something went wrong while generating a response.' };
  }
}

module.exports = { handleChildChat };
