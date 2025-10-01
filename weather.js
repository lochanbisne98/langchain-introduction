import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Configuration
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const DEPLOYMENT_NAME = process.env.DEPLOYMENT_NAME;
const API_VERSION = process.env.API_VERSION || '2023-12-01-preview';

// System prompt for the agent
const SYSTEM_PROMPT = `You are a helpful weather assistant. When a user asks about weather for a location, you will:
1. Extract the location from their message
2. Use the get_current_weather function to fetch weather data
3. Provide a natural, conversational response about the weather

If the user doesn't specify a location clearly, ask them to clarify which city they want weather for.

Always be friendly and conversational in your responses.`;

// Function to get current weather from OpenWeatherMap API
async function getCurrentWeather(location) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${WEATHER_API_KEY}&units=metric`;
        
        const response = await axios.get(url);
        const data = response.data;
        
        return {
            location: data.name,
            country: data.sys.country,
            temperature: data.main.temp,
            feels_like: data.main.feels_like,
            humidity: data.main.humidity,
            description: data.weather[0].description,
            wind_speed: data.wind.speed,
            pressure: data.main.pressure
        };
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error(`Location "${location}" not found. Please check the spelling or try a different city.`);
        } else if (error.response?.status === 401) {
            throw new Error('Weather API key is invalid. Please check your WEATHER_API_KEY in .env file.');
        } else {
            throw new Error(`Weather API error: ${error.message}`);
        }
    }
}

// Function definitions for Azure OpenAI
const functions = [
    {
        name: "get_current_weather",
        description: "Get the current weather for a specified location",
        parameters: {
            type: "object",
            properties: {
                location: {
                    type: "string",
                    description: "The city name or location to get weather for"
                }
            },
            required: ["location"]
        }
    }
];

async function callAzureOpenAI(userMessage) {
    try {
        const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`;
        
        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage }
        ];
        
        const response = await axios.post(url, {
            messages: messages,
            max_tokens: 800,
            temperature: 0.7,
            functions: functions,
            function_call: "auto"
        }, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': AZURE_OPENAI_KEY
            }
        });

        if (!response.data?.choices?.[0]?.message) {
            throw new Error('Invalid response from Azure OpenAI');
        }

        const message = response.data.choices[0].message;
        console.log("First Response", message);
        
        // Check if the model wants to call a function
        if (message.function_call) {
            const functionName = message.function_call.name;
            const functionArgs = JSON.parse(message.function_call.arguments);
            
            console.log(`===Looking up weather for ${functionArgs.location}...`);
            
            let functionResult;
            
            if (functionName === "get_current_weather") {
                try {
                    functionResult = await getCurrentWeather(functionArgs.location);
                } catch (error) {
                    functionResult = { error: error.message };
                }
            }
            
            // Create new messages array with function call and result
            const messagesWithFunction = [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userMessage },
                {
                    role: "assistant",
                    content: null,
                    function_call: message.function_call
                },
                {
                    role: "function",
                    name: functionName,
                    content: JSON.stringify(functionResult)
                }
            ];
            
            // Make another call to get the final response
            const finalResponse = await axios.post(url, {
                messages: messagesWithFunction,
                max_tokens: 800,
                temperature: 0.7,
                functions: functions,
                function_call: "auto"
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': AZURE_OPENAI_KEY
                }
            });
            
            return finalResponse.data.choices[0].message.content;
        } else {
            return message.content;
        }

    } catch (error) {
        if (error.response) {
            console.error('Azure OpenAI Error Details:', error.response.data);
            throw new Error(`Azure OpenAI API Error: ${error.response.status} - ${error.response.data.error?.message || error.response.statusText}`);
        } else {
            throw new Error(`Request error: ${error.message}`);
        }
    }
}

// Main function
async function main() {
   try {
        const input = "temperature in delhi";
        const response = await callAzureOpenAI(input);
        console.log(`\nAgent: ${response}\n`);
    } catch (error) {
        console.error(`Error: ${error.message}\n`);
    }
}

// Start the agent
main();