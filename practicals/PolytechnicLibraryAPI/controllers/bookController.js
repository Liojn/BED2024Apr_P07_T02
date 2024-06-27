const Book = require("../models/book");


const getAllBooks = async (req, res) => {
  try {
    const books = await Book.getAllBooks();
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving books");
  }
};

const updateBookAvailability = async (req, res) => {
    const bookId = parseInt(req.params.bookId);
    const { availability } = req.body;

    try{
        const success = await Book.updateBookAvailability(bookId, availability);
        if (!success) {
            return res.status(404).send("Book not found");
        }
        res.status(200).json({
          message: 'Update successful!',}
        );
    } catch (error) {
        console.log(error);
        res.status(500).send("Error updating availability of book");

    }
}
module.exports = {
    getAllBooks,
    updateBookAvailability,
}