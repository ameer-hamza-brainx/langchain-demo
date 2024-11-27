import * as dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import readline from 'readline';

dotenv.config();

const llm = new ChatOpenAI({
  model: 'gpt-4o-mini',
});

const tavilySearch = new TavilySearchResults();

const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You have access to the tavily search tool you can answer any user query including live web search`,
  ],
  new MessagesPlaceholder('chat_history'),
  ('human', '{input}'),
  new MessagesPlaceholder('agent_scratchpad'),
]);

const tools = [tavilySearch];

const openAiFunctionAgent = await createOpenAIFunctionsAgent({
  llm,
  tools,
  prompt,
});

const agentExecutor = new AgentExecutor({
  agent: openAiFunctionAgent,
  tools,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const chat_history = [];

function askQuestion() {
  rl.question('User: ', async (input) => {
    if (input.toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    const response = await agentExecutor.invoke({
      input: input,
      chat_history: chat_history,
    });

    console.log('Agent: ', response.output);

    chat_history.push(new HumanMessage(input));
    chat_history.push(new AIMessage(response.output));

    askQuestion();
  });
}

askQuestion();
