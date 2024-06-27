const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Book {
    constructor(id, title, author) {
        this.id = id;
        this.title = title;
        this.author = author;
    }

    static async getAllBooks() {
        const connection = await sql.connect(dbConfig); //wait for connection before proceeding

        const sqlQuery = `SELECT * FROM Books`; // Replace with your actual table name

        const request = connection.request();
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset.map(
        (row) => new Book(row.book_id, row.title, row.author)
        ); // Convert rows to Book objects
    }

    static async updateBook() {
        
    }
}

module.exports = Book;