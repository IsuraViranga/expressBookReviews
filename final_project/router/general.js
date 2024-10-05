const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    //Write your code here
    function getBooks(callback) {
      const bookList = JSON.stringify(books, null, 4);
      callback(bookList);
    }

    getBooks((bookList) => {
        return res.status(200).send(bookList);
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
          resolve(book);
      } else {
          reject(new Error("Book not found"));
      }
  })
  .then(bookDetails => {
      res.status(200).send(JSON.stringify(bookDetails, null, 4));
  })
  .catch(error => {
      res.status(404).json({ message: error.message });
  });
});
  

// Get book details based on author using async/await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
      const filteredBooks = Object.values(books).filter(book => book.author === author);
      if (filteredBooks.length > 0) {
          res.status(200).send(JSON.stringify(filteredBooks, null, 4));
      } else {
          throw new Error("No books found for this author");
      }
  } catch (error) {
      res.status(404).json({ message: error.message });
  }
});

// Get all books based on title using Promises
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  new Promise((resolve, reject) => {
      const filteredBooks = Object.values(books).filter(book => book.title === title);
      if (filteredBooks.length > 0) {
          resolve(filteredBooks);
      } else {
          reject(new Error("No books found with this title"));
      }
  })
  .then(bookDetails => {
      res.status(200).send(JSON.stringify(bookDetails, null, 4));
  })
  .catch(error => {
      res.status(404).json({ message: error.message });
  });
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.status(200).send(JSON.stringify(book.reviews, null, 4));
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
