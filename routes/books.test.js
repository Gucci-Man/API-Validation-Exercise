const request = require("supertest");
const app = require("../app");
const jsonschema = require("jsonschema");
const bookSchema = require("../schemas/bookSchema.json");

process.env.NODE_ENV === "test"

const db = require("../db");
const Book = require("../models/book");

let b1 = null;

describe("Books Routes Test", function() {

    beforeEach(async function() {
        await db.query("DELETE FROM books");

        b1 = await Book.create({
            isbn: "1111",
            amazon_url: "http://a.co/eobPtX2",
            author: "Test author",
            language: "english",
            pages: 10,
            publisher: "Test Publishing",
            title: "Test Title",
            year: 2023
        });
    });

    /** POST /books/ => book object */

    describe("POST /books", function() {
        test("Valid JSON passes as valid schema", function() {
            let book_request = {
                isbn: "2222",
                amazon_url: "http://a.co/eobPtX2",
                author: "John Wick",
                language: "english",
                pages: 10,
                publisher: "Wick Publishing",
                title: "The Baba Yaga",
                year: 2023
            }
            const result = jsonschema.validate(book_request, bookSchema);
            expect(result.valid).toBeTruthy
        })

        test("Can create book resource with valid data", async function() {
            let response = null;
            let book_request = {
                isbn: "2222",
                amazon_url: "http://a.co/eobPtX2",
                author: "John Wick",
                language: "english",
                pages: 10,
                publisher: "Wick Publishing",
                title: "The Baba Yaga",
                year: 2023
            }
            // If JSON data is valid, it will send the request
            const result = jsonschema.validate(book_request, bookSchema);
            if(result.valid) {
                response = await request(app).post("/books/").send({
                    isbn: "2222",
                    amazon_url: "http://a.co/eobPtX2",
                    author: "John Wick",
                    language: "english",
                    pages: 10,
                    publisher: "Wick Publishing",
                    title: "The Baba Yaga",
                    year: 2023
                });
            }
            expect(response.statusCode).toEqual(201);
            expect(response.body.book.isbn).toBe("2222");
        });

        test("Cannot create book resource with invalid data", function() {
            let book_request = {
                language: "english",
                pages: 10,
                publisher: "Wick Publishing",
                title: "The Baba Yaga",
                year: 2023
            }
            const result = jsonschema.validate(book_request, bookSchema);
            expect(result.valid).toBeFalsy()
        });
    });

    describe("GET /books", function() {
        test("Can get list of one book", async function() {
            let response = await request(app).get("/books")

            expect(response.body).toEqual({
                books: [{
                    isbn: "1111",
                    amazon_url: "http://a.co/eobPtX2",
                    author: "Test author",
                    language: "english",
                    pages: 10,
                    publisher: "Test Publishing",
                    title: "Test Title",
                    year: 2023
                }]
            });
        });
    });

    describe("GET /books/:id", function() {
        test("Can get one book from it's id", async function() {
            let response = await request(app).get(`/books/${b1.isbn}`)

            expect(response.body).toEqual({
                book: {
                    isbn: "1111",
                    amazon_url: "http://a.co/eobPtX2",
                    author: "Test author",
                    language: "english",
                    pages: 10,
                    publisher: "Test Publishing",
                    title: "Test Title",
                    year: 2023
                }
            });
        });

        test("Fail with invalid book id", async function() {
            let response = await request(app).get(`/books/gucci`);

            expect(response.statusCode).toEqual(404)
        });
    });

    describe("PUT /books/:isbn", function() {
        test("Can update book resource with valid data", async function() {
            let response = null;
            let book_request = {
                isbn: "1111",
                amazon_url: "http://a.co/eobPtX2",
                author: "Tatsuki Fujimoto",
                language: "Japanese",
                pages: 10,
                publisher: "Shonen Jump",
                title: "Chainsaw Man",
                year: 2023
            }
            // If JSON data is valid, it will send the request
            const result = jsonschema.validate(book_request, bookSchema);
            if(result.valid) {
                response = await request(app).put(`/books/${b1.isbn}`).send({
                    isbn: "1111",
                    amazon_url: "http://a.co/eobPtX2",
                    author: "Tatsuki Fujimoto",
                    language: "Japanese",
                    pages: 10,
                    publisher: "Shonen Jump",
                    title: "Chainsaw Man",
                    year: 2023
                });
            }
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual({
                book: {
                    isbn: "1111",
                    amazon_url: "http://a.co/eobPtX2",
                    author: "Tatsuki Fujimoto",
                    language: "Japanese",
                    pages: 10,
                    publisher: "Shonen Jump",
                    title: "Chainsaw Man",
                    year: 2023
                }
            });
        });

        test("Cannot update book resource with invalid data", function() {
            let book_request = {
                language: "english",
                pages: 10,
                publisher: "Wick Publishing",
                title: "The Baba Yaga",
                year: 2023
            }
            const result = jsonschema.validate(book_request, bookSchema);
            expect(result.valid).toBeFalsy()
        });
    });

    describe("DELETE /books/:isbn", function() {
        test("Delete an existing book", async function() {
            let response = await request(app).delete(`/books/${b1.isbn}`);

            expect(response.body).toEqual({ message: "Book deleted" });
        });

        test("Unable to delete a non-existent book", async function() {
            let response = await request(app).delete(`/books/wiggles`);

            expect(response.statusCode).toEqual(404);
        })
    });
});

afterAll(async function () {
    await db.end();
 });