import { AzureChatOpenAI, ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { Document } from "langchain/document";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
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

// const prompt = ChatPromptTemplate.fromTemplate('Answer the users question {input}');
// const parser = new StringOutputParser();

// const chain = prompt.pipe(model).pipe(parser);

// const response = await chain.invoke({'input': "Tell me Pricing Plans for Math Program in 98thpercentile"});
// console.log(response);




const prompt = ChatPromptTemplate.fromTemplate(`Answer the users question. 
    Context: {context}
    Question: {input}`);

const document = new Document({
    pageContent:`The program offers two different plans based on grade levels. For Grades K to 8, the plan includes a total of 48 classes over a 24-week billing cycle, with 2 classes per week and up to 4 students per class. The package includes award-winning adaptive homework, weekly assessments, extra help classes if needed, and a monthly report to track progress. The cost for this plan is $113 every 4 weeks.

    For Algebra 1 and above, the structure remains the same — 48 classes over 24 weeks, 2 classes per week, and up to 4 students per class — with the same additional features like adaptive homework, weekly assessments, extra help classes, and monthly reports. However, the cost for this plan is $142 every 4 weeks.`
});

const chain = await createStuffDocumentsChain({
    llm:model,
    prompt
})

const response = await chain.invoke({
    'input': "Tell me Pricing Plans for Math Program in 98thpercentile",
    'context':[document]
});

// // const response = await chain.invoke({
// //     'input': "Tell me Pricing Plans for algebra",
// //     'context':[document]
// // });
console.log(response);




////cheerio web base
// const prompt = ChatPromptTemplate.fromTemplate(`Answer the users question. 
//     Context: {context}
//     Question: {input}`);


// const chain = await createStuffDocumentsChain({
//     llm:model,
//     prompt
// })

// const loader = new CheerioWebBaseLoader("https://www.98thpercentile.com/math_pricing_plans");
// const docs = await loader.load();
// // console.log(docs);
// const response = await chain.invoke({
//     'input': "Tell me Pricing Plans for Math Program in 98thpercentile",
//     'context': docs
// });

// console.log(response);




