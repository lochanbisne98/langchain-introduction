import { AzureChatOpenAI, ChatOpenAI } from "@langchain/openai";
import dotenv from 'dotenv';
dotenv.config();


// Azure OpenAI Configuration using LangChain
const llm = new AzureChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_KEY,
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.DEPLOYMENT_NAME,
    azureOpenAIApiVersion: process.env.API_VERSION || "2023-12-01-preview",
    temperature: 0.7,
    maxTokens: 500,
});


// const llm = new ChatOpenAI({
//     openAIApiKey: process.env.OPENAI_API_KEY,
//     modelName: process.env.MODEL_NAME || "gpt-3.5-turbo",
//     temperature: 0.7,
//     maxTokens: 500,
// });


const response = await llm.invoke("Current weather of Pune ");
// const response = await llm.batch(["Hello", "How are you"]);
console.log(response);
