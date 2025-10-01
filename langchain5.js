import { AzureChatOpenAI, ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import dotenv from 'dotenv';
dotenv.config();


// Azure OpenAI Configuration using LangChain
const model = new AzureChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_KEY,
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.DEPLOYMENT_NAME,
    azureOpenAIApiVersion: process.env.API_VERSION || "2023-12-01-preview",
    temperature: 0.7,
    maxTokens: 500,
});

// Create in-memory chat history
const chatHistory = new ChatMessageHistory();

// 1. Add a system message to define AI behavior
await chatHistory.addMessage(
new SystemMessage("You are a friendly assistant that remembers previous conversations.")
);

// 2. Add first user message
await chatHistory.addMessage(new HumanMessage("Hi! My name is Alex."));

// 3. Send conversation history to the model
const response1 = await model.invoke(await chatHistory.getMessages());
console.log("AI:", response1.content);

// Save AI response
await chatHistory.addMessage(new AIMessage(response1.content));

// 4. Add second user message (context-based question)
await chatHistory.addMessage(new HumanMessage("Can you remind me what my name is?"));

// 5. Send updated conversation history to model
const response2 = await model.invoke(await chatHistory.getMessages());
console.log("AI:", response2.content);

// Save AI response
await chatHistory.addMessage(new AIMessage(response2.content));

// Print complete conversation history
console.log("\n=== Conversation History ===");
console.log(await chatHistory.getMessages());

