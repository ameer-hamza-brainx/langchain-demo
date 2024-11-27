import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { MessagesPlaceholder } from '@langchain/core/prompts';
import * as dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

// Initialize Readline Interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const historyAware = async () => {
  // Define the prompt template
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'Based on our chat history answer user questions'],
    new MessagesPlaceholder('chat_history'),
    ['user', '{input}'],
  ]);

  // Initialize OpenAI Chat Model
  const llm = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0.9,
  });

  // Combine the prompt template with the model
  const chain = prompt.pipe(llm);

  // Initialize chat history
  const chatHistory = [
    new HumanMessage('Hi'),
    new AIMessage('Hi, How can I help you?'),
    new HumanMessage('My name is Ameer'),
    new AIMessage('Hi Ameer, How can I help you?'),
    new HumanMessage('can you tell me what is 3^2'),
    new AIMessage('3^2 is 9'),
  ];

  console.log("Type 'exit' to end the chat.");
  askQuestion(chain, chatHistory);
};

const askQuestion = async (chain, chatHistory) => {
  rl.question('User: ', async (input) => {
    if (input.toLowerCase() === 'exit') {
      console.log('Exiting chat...');
      rl.close();
      return;
    }

    try {
      const response = await chain.invoke({
        input: input,
        chat_history: chatHistory,
      });

      console.log('Agent: ', response.content);

      // Add new messages to the chat history
      chatHistory.push(new HumanMessage(input));
      chatHistory.push(new AIMessage(response.content));
    } catch (error) {
      console.error('Error during response generation:', error.message);
    }

    // Recurse to continue asking
    askQuestion(chain, chatHistory);
  });
};

// Run the history-aware chat
historyAware();

export default historyAware;
