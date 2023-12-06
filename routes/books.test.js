const request = require("supertest");
const app = require("../app");
const jsonschema = require("jsonschema");
const bookSchema = require("../schemas/bookSchema.json");

process.env.NODE_ENV === "test"

const db = require("../db");
const Book = require("../models/book");

describe("Books Routes Test", function() {

    beforeEach(async function() {
        await db.query("DELETE FROM books");

        let b1 = await Book.create({
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
            let response = null;
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
});

afterAll(async function () {
    await db.end();
 });