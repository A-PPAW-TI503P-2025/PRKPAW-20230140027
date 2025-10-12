const express = require('express');
const router = express.Router();

// Data Array buku
let books = [
    {id: 1, title: 'Book 1', author: 'Author 1'},
    {id: 2, title: 'Book 2', author: 'Author 2'},
    {id: 3, title: 'Book 3', author: 'Author 3'},
    {id: 4, title: 'Book 4', author: 'Author 4'}
];

// GET all books
router.get("/", (req, res) => {
    res.json(books);
});

// GET a single book by ID
router.get("/:id", (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) return res.status(404).send('Book not found');
    res.json(book);
});

// CREATE a new book
router.post("/", (req, res) => {
    const { title, author } = req.body;
    if (!title || !author) {
        return res.status(400).json({ message: 'Title and author are required' });
    }
    const book = {
        id: books.length ? books[books.length - 1].id + 1 : 1, // Better ID generation
        title,
        author
    };
    books.push(book);
    res.status(201).json(book);
});

// UPDATE a book by ID (HTTP PUT)
router.put("/:id", (req, res) => {
    // 1. Cari buku berdasarkan ID
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) return res.status(404).send('Book not found'); // Jika tidak ada, kirim 404

    // 2. Validasi input dari body
    const { title, author } = req.body;
    if (!title || !author) {
        return res.status(400).json({ message: 'Title and author are required' });
    }

    // 3. Update data buku
    book.title = title;
    book.author = author;

    // 4. Kirim kembali data buku yang sudah di-update
    res.json(book);
});

// DELETE a book by ID (HTTP DELETE)
router.delete("/:id", (req, res) => {
    // 1. Cari buku berdasarkan ID
    const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
    if (bookIndex === -1) return res.status(404).send('Book not found'); // Jika tidak ada, kirim 404

    // 2. Hapus buku dari array menggunakan splice
    books.splice(bookIndex, 1);

    // 3. Kirim pesan sukses
    res.status(200).send('Book deleted successfully');
});


module.exports = router;