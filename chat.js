import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Azure OpenAI Configuration from environment variables
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const DEPLOYMENT_NAME = process.env.DEPLOYMENT_NAME;
const API_VERSION = process.env.API_VERSION || '2023-12-01-preview';


// Function to call Azure OpenAI API
async function callAzureOpenAI(userMessage) {
    try {
        const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`;
        const messages = [
            { role: "user", content: userMessage }
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


async function main() {
    const input = "Essay on summer vacation";
    const response = await callAzureOpenAI(input);
    console.log(`\nAI: ${response}\n`);
}

main();
