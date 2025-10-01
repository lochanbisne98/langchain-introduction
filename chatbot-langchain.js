import { AzureChatOpenAI, ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import readline from 'readline';

// Azure OpenAI Configuration
const aiObj = new AzureChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_KEY,
    azureOpenAIApiVersion: process.env.API_VERSION || "2023-12-01-preview",
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.DEPLOYMENT_NAME,
    temperature: 0.7,
    maxTokens: 500,
});

// System prompt with question details
const SYSTEM_PROMPT = `You are a helpful educational assistant similar to Khanmigo. 
    Your role is to guide students to discover  answers      
    themselves through Socratic questioning rather than giving direct answers.

    Here is a question that a student is working on:

    Question: There are 8 balls in a container, 4 are red, 1 is yellow and 3 are blue. What is the probability of picking a yellow ball?

    Options: A: 2/3, B: 1/8, C: 5/3, D: 4/6

    Student Answer: A (2/3)
    Correct Answer: B (1/8)

    The student got this question wrong. Help them discover their mistake and learn the concept through:
    - Asking guiding questions
    - Having them work through each step
    - Encouraging them to think about the problem components
    - Only providing hints when they're stuck
    - Celebrating their progress and thinking
    - Never giving the direct answer unless they've worked through it completely

    Use the Socratic method to help them learn probability concepts effectively.`;

// Chat history using LangChain's message history
const chatHistory = new ChatMessageHistory();

// Function to get chat messages for API call
async function getChatMessages() {
    const messages = await chatHistory.getMessages();
    return [
        new SystemMessage(SYSTEM_PROMPT),
        ...messages
    ];
}

// Function to call Azure OpenAI using LangChain
async function callAI(userMessage) {
    try {
        // Add user message to history
        await chatHistory.addMessage(new HumanMessage(userMessage));
        
        // Get all messages including system prompt
        const messages = await getChatMessages();
        
        // Call Azure OpenAI
        const response = await aiObj.invoke(messages);
        
        // Add AI response to history
        await chatHistory.addMessage(response);
        
        return response.content;

    } catch (error) {
        throw new Error(`LangChain Azure OpenAI Error: ${error.message}`);
    }
}


// Function to start conversation
async function startConversation() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log("Azure OpenAI Chatbot Started!");
    console.log("How can I help you with this question?\n");

    function askQuestion() {
        rl.question("You: ", async (input) => {
            if (input.toLowerCase() === 'exit') {
                console.log("Goodbye!");
                rl.close();
                return;
            }

            try {
                const response = await callAI(input);
                console.log(`\nAI: ${response}\n`);
                
            } catch (error) {
                console.error(`Error: ${error.message}\n`);
            }

            // Continue conversation
            askQuestion();
        });
    }

    askQuestion();
}

// Main function
async function main() {
    try {
        await startConversation();
    } catch (error) {
        console.error("Failed to start chatbot:", error.message);
        process.exit(1);
    }
}

// Start the chatbot
main();