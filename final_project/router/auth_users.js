const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
     // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}
 
const authenticatedUser = (username,password)=>{ 
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;  // Get the ISBN from the URL parameters
    const review = req.body.review;  // Get the review text from the request body
    const username = req.session.authorization.username;  // Get the logged-in user from the session

    // Check if the book with the given ISBN exists
    if (books[isbn]) {
        const book = books[isbn];

        // Check if the user has already posted a review
        if (book.reviews[username]) {
            // Modify the existing review
            book.reviews[username] = review;
            return res.status(200).json({ message: "Review updated successfully" });
        } else {
            // Add a new review for this user
            book.reviews[username] = review;
            return res.status(200).json({ message: "Review added successfully" });
        }
    } else {
        // If the book is not found, return a 404 error
        return res.status(404).json({ message: "Book not found" });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;  // Get the ISBN from the URL parameters
    const username = req.session.authorization.username;  // Get the logged-in user from the session

    // Check if the book with the given ISBN exists
    if (books[isbn]) {
        const book = books[isbn];

        // Check if the user has posted a review for the book
        if (book.reviews[username]) {
            // Delete the review for the logged-in user
            delete book.reviews[username];
            return res.status(200).json({ message: "Review deleted successfully" });
        } else {
            // If the user has not posted a review, return a message
            return res.status(404).json({ message: "Review not found for this user" });
        }
    } else {
        // If the book is not found, return a 404 error
        return res.status(404).json({ message: "Book not found" });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
