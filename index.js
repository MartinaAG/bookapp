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

app.set("view engine", "pug");

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
    await Book.create(book).then((x) => {
      // send id of recently created item
      return res.send(`<tr>
      <td>${x.id}</td>
      <td>${x.title}</td>
      <td>${x.author}</td>
      <td>${x.details}</td>
      <td>
          <button class="btn btn-primary"
              hx-get="/get-edit-form/${x.id}">
              Edit Book
          </button>

          <button hx-delete="/delete/${x.id}"
              class="btn btn-primary">
              Delete
          </button>
      </td>
  </tr>`);
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
      return res.send(`<tr>
      <td>${id}</td>
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.details}</td>
      <td>
          <button class="btn btn-primary"
              hx-get="/get-edit-form/${id}">
              Edit Book
          </button>
          <button hx-delete="/delete/${id}"
              class="btn btn-primary">
              Delete
          </button>
      </td>
  </tr>`);
    });
  });
  
  app.get("/get-edit-form/:id", async (req, res) => {
    const id = req.params.id;

    await Book.findOne({ where: { id: id } }).then((book) => {
      return res.send(`<tr hx-trigger='cancel' class='editing' hx-get="/get-book-row/${id}">
      <td>${id}</td>
      <td><input name="title" value="${book.title}"/></td>
      <td><input name="author" value="${book.author}"/></td>
      <td><input name="details" value="${book.details}"/></td>
      <td>
        <button class="btn btn-primary" hx-put="/update/${id}" hx-include="closest tr">
          Save
        </button>
        <button class="btn btn-primary" hx-get="/get-book-row/${id}">
          Cancel
        </button>
      </td>
    </tr>`);
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
          return res.send(`<tr>
      <td>${id}</td>
      <td>${req.body.title}</td>
      <td>${req.body.author}</td>
      <td>${req.body.details}</td>
      <td>
          <button class="btn btn-primary"
              hx-get="/get-edit-form/${id}">
              Edit Book
          </button>
          <button hx-delete="/delete/${id}"
              class="btn btn-primary">
              Delete
          </button>
      </td>
  </tr>`);
        });
    });
  });