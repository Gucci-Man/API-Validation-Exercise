/** Common config for bookstore. */

let DB = null;

if (process.env.NODE_ENV === "test") {
  DB = `books-test`;
} else {
  DB = `books`;
}


module.exports = { DB };