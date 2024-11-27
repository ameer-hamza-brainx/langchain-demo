import * as dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import mongoose from 'mongoose';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import express from 'express';
import cors from 'cors';
import {
  getAllBooksTool,
  getBooksTool,
  deleteBook,
  bookLoggingTool,
  updateBookTool,
} from './books/tools.js';

const app = express();
const port = 5000;

app.use(express.json());

app.use(cors());

mongoose
  .connect('mongodb://localhost:27017/sampleDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB', err));

dotenv.config();

const llm = new ChatOpenAI({
  model: 'gpt-4o',
  // model: 'gpt-4o-mini',
});

const tavilySearch = new TavilySearchResults();

const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are a helpful assistant. If you are calling book logging tools, always confirm with the user before adding data to the database by listing the fields using <ol> and <li>. Use one line for each book/option and use <strong></strong> for bold text. Do the same for listing books. If the user confirms, add the data to the database; otherwise, ask the user to provide the data again.

  For deleting a book, if the prompt does not include the book ID, ask the user for the ID of the book to delete before proceeding with the deletion.
  If the user asks for database interactions unrelated to books, respond with: "I can only assist with book-related queries." 
  If it is not related to db interaction you should answer user queries

  You can also use Tavily Search to answer real-time questions.
  `,
  ],
  new MessagesPlaceholder('chat_history'),
  ('human', '{input}'),
  new MessagesPlaceholder('agent_scratchpad'),
]);

const tools = [
  tavilySearch,
  bookLoggingTool,
  deleteBook,
  getBooksTool,
  updateBookTool,
  getAllBooksTool,
];

const openAiFunctionAgent = await createOpenAIFunctionsAgent({
  llm,
  tools,
  prompt,
});

const agentExecutor = new AgentExecutor({
  agent: openAiFunctionAgent,
  tools,
});

const chat_history = [];

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await agentExecutor.invoke({
      input: message,
      chat_history: chat_history,
    });
    chat_history.push(new HumanMessage(message));
    chat_history.push(new AIMessage(response.output));
    res.status(200).json(response.output);
  } catch (error) {
    res.status(500).json({ error: 'Error generating response' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
