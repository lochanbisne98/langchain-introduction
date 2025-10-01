import { AzureChatOpenAI, ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
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

const prompt = ChatPromptTemplate.fromTemplate('Please give me essay on {input}')
// const promptResponse = await prompt.format({input: "summer vacation"}) 
// console.log(promptResponse);


// //create a chain
const chain = prompt.pipe(model);

const response = await chain.invoke({'input': "summer vacation"});
console.log(response);


//second method prompt
const prompt = ChatPromptTemplate.fromMessages([
    ["system", "create a essay based on the title provided by user"],
    ["human","{input}"]
]);

// const chain = prompt.pipe(model);

// const response = await chain.invoke({'input': "summer vacation"});
// console.log(response);



