import axios from 'axios';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

// Azure OpenAI Configuration from environment variables
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const DEPLOYMENT_NAME = process.env.DEPLOYMENT_NAME;
const API_VERSION = process.env.API_VERSION || '2023-12-01-preview';

// System prompt with question details
const SYSTEM_PROMPT = `You are a helpful educational assistant. Your role is to guide students to discover answers  themselves through Socratic questioning rather than giving direct answers.

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

// Chat history storage 
let chatHistory = [];

// Function to call Azure OpenAI API
async function callAzureOpenAI(userMessage) {
    try {
        const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`;
        
        // Add user message to history
        chatHistory.push({ role: "user", content: userMessage });
        
        // Prepare messages for API
        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...chatHistory
        ];
        
        const response = await axios.post(url, {
            messages: messages,
            max_tokens: 500,
            temperature: 0.7
        }, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': AZURE_OPENAI_KEY
            }
        });

        // Safely extract AI response with proper error handling
        if (!response.data) {
            throw new Error('No data in API response');
        }
        
        if (!response.data.choices || !Array.isArray(response.data.choices) || response.data.choices.length === 0) {
            throw new Error('No choices in API response');
        }
        
        if (!response.data.choices[0].message || !response.data.choices[0].message.content) {
            throw new Error('No message content in API response');
        }

        const aiResponse = response.data.choices[0].message.content;
        
        // Add AI response to history
        chatHistory.push({ role: "assistant", content: aiResponse });
        
        return aiResponse;

    } catch (error) {
        if (error.response) {
            throw new Error(`Azure OpenAI API Error: ${error.response.status} - ${error.response.data.error?.message || error.response.statusText}`);
        } else if (error.request) {
            throw new Error('No response from Azure OpenAI API');
        } else {
            throw new Error(`Request error: ${error.message}`);
        }
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
                const response = await callAzureOpenAI(input);
                console.log(`\nAI: ${response}\n`);
                console.log("CHATHISTORY===", chatHistory);
                
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
    await startConversation();
}

// Start the chatbot
main();