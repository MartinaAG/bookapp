const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./app/model/dbconfig");
const Book = require("./app/model/book");

// automatically creating table on startup
sequelize.sync({ force: true }).then(async () => {
  console.log("db is ready...");
});

const app = express();
app.use(express.json());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const path = require('path')

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get("/", async (req, res) => {
    const books = await Book.findAndCountAll();
    return res.render("index", { books: books.rows });
  });

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Service endpoint = http://localhost:${PORT}`);
});

app.post("/submit", async (req, res) => {
  const book = {
    title: req.body.title,
    author: req.body.author,
    details: req.body.details
  };

  await Book.create(book).then((book) => {
    return res.render('./submitBook', {book});
  });
});

app.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  await Book.findOne({ where: { id: id } }).then((book) => {
    book.destroy();
    return res.send("");
  });
});

app.get("/get-book-row/:id", async (req, res) => {
  const id = req.params.id;
  await Book.findOne({ where: { id: id } }).then((book) => {
    return res.render('./getBook', {book, id});
  });
});
  
app.get("/get-edit-form/:id", async (req, res) => {
  const id = req.params.id;

  await Book.findOne({ where: { id: id } }).then((book) => {
    return res.render('./editBook', {book, id});
  });
});
  
app.put("/update/:id", async (req, res) => {
  const id = req.params.id;

  // update book
  await Book.findByPk(id).then((item) => {
    item
      .update({
        title: req.body.title,
        author: req.body.author,
        details: req.body.details
      })
      .then(() => {
        return res.render('./updateBook', {item, id});
      });
  });
});