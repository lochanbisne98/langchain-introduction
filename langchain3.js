import { AzureChatOpenAI, ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser, CommaSeparatedListOutputParser, StructuredOutputParser } from "@langchain/core/output_parsers";
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

//create a prompt template
// const prompt = ChatPromptTemplate.fromMessages([
//     ["system", "create a essay based on the title provided by user"],
//     ["human","{input}"]
// ]);

// //create parser
// const parser = new StringOutputParser();

// // //chain
// const chain = prompt.pipe(model).pipe(parser);

// const response = await chain.invoke({'input': "summer vacation"});
// console.log(response);






////list parser
const prompt = ChatPromptTemplate.fromTemplate('Provide 5 synonyms, seperated by commas, for the following word {word}');
const parser = new CommaSeparatedListOutputParser();
const chain = prompt.pipe(model).pipe(parser);
const response = await chain.invoke({'word': "happy"});
console.log(response);






