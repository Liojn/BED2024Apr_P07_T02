//book.test.js
const Book = require("../models/book");
const sql = require("mssql");

jest.mock("mssql"); // Mock the mssql library

describe("Book.getAllBooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve all books from the database", async () => {
    const mockBooks = [
      {
        book_id: 1,
        title: "The Lord of the Rings",
        author: "J.R.R. Tolkien",
        availability: "Y",
      },
      {
        book_id: 2,
        title: "The Hitchhiker's Guide to the Galaxy",
        author: "Douglas Adams",
        availability: "N",
      },
    ];

    const mockRequest = {
      query: jest.fn().mockResolvedValue({ recordset: mockBooks }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };

    sql.connect.mockResolvedValue(mockConnection); // Return the mock connection

    const books = await Book.getAllBooks();

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockConnection.close).toHaveBeenCalledTimes(1);
    expect(books).toHaveLength(2);
    expect(books[0]).toBeInstanceOf(Book);
    expect(books[0].book_id).toBe(1);
    expect(books[0].title).toBe("The Lord of the Rings");
    expect(books[0].author).toBe("J.R.R. Tolkien");
    expect(books[0].availability).toBe("Y");

    expect(books[1]).toBeInstanceOf(Book);
    expect(books[1].book_id).toBe(2);
    expect(books[1].title).toBe("The Hitchhiker's Guide to the Galaxy");
    expect(books[1].author).toBe("Douglas Adams");
    expect(books[1].availability).toBe("N");
  });

  it("should handle errors when retrieving books", async () => {
    const errorMessage = "Database Error";
    sql.connect.mockRejectedValue(new Error(errorMessage));
    await expect(Book.getAllBooks()).rejects.toThrow(errorMessage);
  });
});

describe("Book.updateBookAvailability", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should successfully update the book availability", async () => {
      const bookId = 1;
      const availability = "N";
      const rowsAffected = 1;

      const mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ rowsAffected: [rowsAffected] }),
      };
      const mockConnection = {
        request: jest.fn().mockReturnValue(mockRequest),
        close: jest.fn().mockResolvedValue(undefined),
      };

      sql.connect.mockResolvedValue(mockConnection);

      const result = await Book.updateBookAvailability(bookId, availability);

      expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
      expect(mockRequest.input).toHaveBeenCalledWith("book_id", bookId);
      expect(mockRequest.input).toHaveBeenCalledWith("availability", availability);
      expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining("UPDATE Books"));
      expect(mockConnection.close).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it("should return false if the book with the given ID doesn't exist", async () => {
      const bookId = 3;
      const availability = "Y";
      const rowsAffected = 0;

      const mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ rowsAffected: [rowsAffected] }),
      };
      const mockConnection = {
        request: jest.fn().mockReturnValue(mockRequest),
        close: jest.fn().mockResolvedValue(undefined),
      };

      sql.connect.mockResolvedValue(mockConnection);

      const result = await Book.updateBookAvailability(bookId, availability);

      expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
      expect(mockRequest.input).toHaveBeenCalledWith("book_id", bookId);
      expect(mockRequest.input).toHaveBeenCalledWith("availability", availability);
      expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining("UPDATE Books"));
      expect(mockConnection.close).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });

    it("should handle database errors when updating book availability", async () => {
      const bookId = 1;
      const availability = "Y";
      const errorMessage = "Database Error";

      sql.connect.mockRejectedValue(new Error(errorMessage));

      await expect(Book.updateBookAvailability(bookId, availability)).rejects.toThrow(errorMessage);
    });
});


