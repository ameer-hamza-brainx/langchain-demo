import { DynamicStructuredTool } from 'langchain/tools';
import Book from './bookSchema.js';
import { z } from 'zod';

export const bookLoggingTool = new DynamicStructuredTool({
  name: 'book_logging',
  description: `
    call this function if Assistant response containing adding information of books.
    `,
  schema: z.object({
    title: z.string(),
    author_id: z.number(),
    count: z.number(),
  }),
  func: async ({ title, author_id, count }) => {
    await Book.create({
      title,
      author_id,
      count,
    });

    return 'Book Added successfully.';
  },
});

export const updateBookTool = new DynamicStructuredTool({
  name: 'book_updating',
  description:
    'Call this tool if assistant response containing data to update the book',
  schema: z.object({
    title: z.string().describe('Book title'),
    count: z.number().optional().describe('Count/copies of book'),
    author_id: z.string().optional().describe('Author ID of the book'),
  }),
  func: async ({ title, count, author_id }) => {
    try {
      const updateFields = {};
      if (count !== undefined) updateFields.count = count;
      if (author_id !== undefined) updateFields.author_id = author_id;

      const response = await Book.findOneAndUpdate(
        { title: title },
        { $set: updateFields },
        { new: true }
      );

      return 'Book data updated';
    } catch (err) {
      return 'Something went Wrong';
    }
  },
});

export const getBooksTool = new DynamicStructuredTool({
  name: 'book_retrieving',
  description: `
    call this function if Assistant response containing getting information of books by author id.
    `,
  schema: z.object({
    author_id: z.number(),
  }),
  func: async ({ author_id }) => {
    const book = await Book.find({
      author_id: author_id,
    });

    return JSON.stringify(book);
  },
});

export const getAllBooksTool = new DynamicStructuredTool({
  name: 'all_books_retrieving',
  description: `
    call this function if Assistant response containing getting information of any book this tool will return all books.
    `,
  func: async ({}) => {
    try {
      const books = await Book.find({});
      return JSON.stringify(books);
    } catch (err) {
      return 'Something went wrong';
    }
  },
});

export const deleteBook = new DynamicStructuredTool({
  name: 'book_deleting',
  description: `
    call this function if Assistant response containing id to delete book.
    `,
  schema: z.object({
    id: z.string().describe('Id in prompt'),
  }),
  func: async ({ id }) => {
    try {
      const response = await Book.deleteOne({
        _id: id,
      });
      console.log(response);
      return 'Book removed successfully.';
    } catch (err) {
      console.log(err);
      return 'Something Went Wrong';
    }
  },
});
