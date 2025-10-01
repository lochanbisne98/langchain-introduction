import { AzureChatOpenAI } from "@langchain/openai";
import { DynamicTool } from "@langchain/core/tools";
import { AgentExecutor, createToolCallingAgent  } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const DEPLOYMENT_NAME = process.env.DEPLOYMENT_NAME;
const API_VERSION = process.env.API_VERSION || '2024-02-15-preview';

// Function to get current weather from OpenWeatherMap API
async function getCurrentWeather(location) {
    console.log(`Fetching weather data for: ${location}`);
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${WEATHER_API_KEY}&units=metric`;
        
        const response = await axios.get(url);
        const data = response.data;
        
        const weatherData = {
            location: data.name,
            country: data.sys.country,
            temperature: data.main.temp,
            feels_like: data.main.feels_like,
            humidity: data.main.humidity,
            description: data.weather[0].description,
            wind_speed: data.wind.speed,
            pressure: data.main.pressure
        };
        
        console.log(`Weather data retrieved:`, weatherData);
        return JSON.stringify(weatherData);
    } catch (error) {
        const errorMsg = error.response?.status === 404 
            ? `Location "${location}" not found. Please check the spelling or try a different city.`
            : error.response?.status === 401
            ? 'Weather API key is invalid. Please check your WEATHER_API_KEY in .env file.'
            : `Weather API error: ${error.message}`;
        
        console.error(`Weather API Error:`, errorMsg);
        return JSON.stringify({ error: errorMsg });
    }
}

// Initialize Azure OpenAI LLM
const llm = new AzureChatOpenAI({
    azureOpenAIApiKey: AZURE_OPENAI_KEY,
    azureOpenAIApiInstanceName: AZURE_OPENAI_ENDPOINT.split('//')[1]?.split('.')[0] || '',
    azureOpenAIApiDeploymentName: DEPLOYMENT_NAME,
    azureOpenAIApiVersion: API_VERSION,
    temperature: 0.7,
    maxTokens: 800,
});

// Create the weather tool
const weatherTool = new DynamicTool({
    name: "get_current_weather",
    description: "Get the current weather for a specified location. Input should be a city name or location.",
    func: async (input) => {
        try {
            const result = await getCurrentWeather(input);
            console.log(`Tool execution completed\n`);
            return result;
        } catch (error) {
            return JSON.stringify({ error: error.message });
        }
    },
});

// Create tools array
const tools = [weatherTool];

// Create the prompt template
const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are a helpful weather assistant. When a user asks about weather for a location, you will:
1. Extract the location from their message
2. Use the get_current_weather function to fetch weather data
3. Provide a natural, conversational response about the weather

If the user doesn't specify a location clearly, ask them to clarify which city they want weather for.

Always be friendly and conversational in your responses.`],
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
]);



// Create the agent
const agent = await createToolCallingAgent({
    llm,
    tools,
    prompt,
});

// Create the agent executor
const agentExecutor = new AgentExecutor({
    agent,
    tools,
    // verbose: true,
    maxIterations: 5,
    returnIntermediateSteps: true,
});


// Function to process user message
async function processUserMessage(userMessage) {
    try {
        const result = await agentExecutor.invoke({
            input: userMessage,
        });
        return result.output;
    } catch (error) {
        throw new Error(`Agent error: ${error.message}`);
    }
}


// Main function
async function main() {
    try {
        const input = "temperature in delhi";
        const response = await processUserMessage(input);
        if (!response || response.trim() === '') {
            console.log("Agent: I apologize, but I couldn't generate a response. Please try again.\n");
        } else {
            console.log(`Agent: ${response}\n`);
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

main();