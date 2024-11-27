import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';

// Import environment variables
import * as dotenv from 'dotenv';
dotenv.config();

// Instantiate the model
const model = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0.9,
});

// Create Prompt Template using fromTemplate
// const prompt = ChatPromptTemplate.fromTemplate('Tell a joke about {word}');

// Create Prompt Template from fromMessages

const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are a joke star.  Create a joke based on the word provided by the user.`,
  ],
  ['human', '{word}'],
]);

const chain = prompt.pipe(model);

const response = await chain.invoke({
  word: 'watch',
});

console.log(response.content);
