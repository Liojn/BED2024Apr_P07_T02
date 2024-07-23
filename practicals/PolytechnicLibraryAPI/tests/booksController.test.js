const booksController = require("../controllers/bookController");
const Book = require("../models/book");

// Mock Book model
jest.mock("../models/book");



describe("booksController.getAllBooks", () => {
    beforeEach(() => {
      jest.clearAllMocks(); // Clear mock calls before each test
    });
  
    it("should fetch all books and return a JSON response", async () => {
      const mockBooks = [
        { id: 1, title: "The Lord of the Rings" },
        { id: 2, title: "The Hitchhiker's Guide to the Galaxy" },
      ];
  
      // Mock the Book.getAllBooks function to return the mock data
      Book.getAllBooks.mockResolvedValue(mockBooks);
  
      const req = {};
      const res = {
        json: jest.fn(), // Mock the res.json function
      };
  
      await booksController.getAllBooks(req, res);
  
      expect(Book.getAllBooks).toHaveBeenCalledTimes(1); // Check if getAllBooks was called
      expect(res.json).toHaveBeenCalledWith(mockBooks); // Check the response body
    });
  
    it("should handle errors and return a 500 status with error message", async () => {
      const errorMessage = "Database error";
      Book.getAllBooks.mockRejectedValue(new Error(errorMessage)); // Simulate an error
  
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
  
      await booksController.getAllBooks(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error retrieving books");
    });
});

  /*Use jest.fn() and .mockResolvedValue() or .mockRejectedValue() to set up your mocks.
    Structure your tests using describe and it blocks to organize your test cases. */


describe("updateBookAvailability", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mock calls before each test
    });

    it("should update book availability and return a success message", async () => {
        const bookId = 1;
        const availability = true;

        const req = {
            params: { bookId },
            body: { availability },
          };
      
          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const success = true;
        Book.updateBookAvailability.mockResolvedValue(success);

        await booksController.updateBookAvailability(req, res);

        expect(Book.updateBookAvailability).toHaveBeenCalledWith(bookId, availability);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Update successful!" });
    });

    it("should return a 404 error if book is not found", async () => {
        const bookId = 3;
        const availability = true;
    
        const req = {
          params: { bookId },
          body: { availability },
        };
    
        const res = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn(),
        };
    
        const success = false;
        Book.updateBookAvailability.mockResolvedValue(success);
    
        await booksController.updateBookAvailability(req, res);
    
        expect(Book.updateBookAvailability).toHaveBeenCalledWith(bookId, availability);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith("Book not found");
    });

    it("should return a 500 error if an error occurs", async () => {
        const bookId = 1;
        const availability = true;
    
        const req = {
          params: { bookId },
          body: { availability },
        };
    
        const res = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn(),
        };
    
        const error = new Error("Database error");
        Book.updateBookAvailability.mockRejectedValue(error);
    
        await booksController.updateBookAvailability(req, res);
    
        expect(Book.updateBookAvailability).toHaveBeenCalledWith(bookId, availability);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith("Error updating availability of book");
    });
});