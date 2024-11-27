import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  author_id: {
    type: Number,
  },
  genre: {
    type: String,
    trim: true,
  },
  count: {
    type: Number,
  },
});

const Book = mongoose.model('Book', bookSchema);
export default Book;
