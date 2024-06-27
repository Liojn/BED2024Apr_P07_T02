const Book = require("../models/book");

//utilizes the Book.getAllBooks method to retrieve all books. It catches potential errors and sends appropriate error responses to the client.
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.getAllBooks();
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving books");
  }
};


module.exports = {
    getAllBooks,
}