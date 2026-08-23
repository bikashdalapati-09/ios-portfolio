import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import personalData from "./personalData.json";

const key = import.meta.env.VITE_GROQ_API_KEY;

// Using llama-3.3-70b-versatile for fast, high-quality responses
const llm = new ChatGroq({
  apiKey: key,
  model: "openai/gpt-oss-120b",
  temperature: 0.3,
});

export async function aiService(query) {
  try {
    if (!key) {
      return "API key missing. Check your .env setup.";
    }

    const stringifiedData = JSON.stringify(personalData, null, 2);
    const messages = [
      new SystemMessage(
        `You are Siri in a Dynamic Island interface. Answer questions about Bikash Dalapati using ONLY this context:        
        ${stringifiedData}.

        Current time is ${new Date().toLocaleString()}

Rules:
- Speak directly in first person as Siri.
- not always tell my full name when need information about myself tell my full name, otherwise to describe my work or any other thing tell Bikash  
- Output ONLY plain text suitable for speech synthesis.
- If user tells to open any link or application simply tell sorry i can't do that.
- Detect the language of the query. If asked in Hindi or Hinglish, respond in simple, spoken Hindi.
- NEVER include action descriptions, roleplay, or stage directions inside asterisks (e.g. *Dynamic Island expands*).
- DO NOT use markdown like asterisks, bolding, or lists.
- Maximum 1-2 concise sentences.
- if anyone ask about projects first give project summary then tell, You can check project folder, project information is there. at the end`
      ),
      new HumanMessage(query),
    ];

    const response = await llm.invoke(messages);
    return response.content;
  } catch (error) {
    console.error("aiService error:", error);
    return "Sorry, I ran into an error getting that information.";
  }
}