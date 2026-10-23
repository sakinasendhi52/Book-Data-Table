<div align="center">

# 📚 Project: Book Management System API

**A Node.js and Express REST API for managing books with MongoDB, CRUD operations, book-cover image uploads, input validation, and ISBN uniqueness checks.**

</div>

---

## 🧭 Table of Contents

- [Project Description](#project-description)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [How It Works](#how-it-works)
- [Book Data Model](#book-data-model)
- [Form Validation](#form-validation)
- [CRUD Operations](#crud-operations)
- [API Endpoints](#api-endpoints)
- [Example Requests](#example-requests)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Installation and Setup](#installation-and-setup)
- [Running the Project](#running-the-project)
- [Error Handling](#error-handling)
- [Screenshots](#screenshots)
- [Explanation Video](#explanation-video)
- [Screen Recording](#screen-recording)
- [Author](#author)

---

## 📌 Project Description

The **Book Management System API** is a backend application built with Node.js, Express, and MongoDB. It provides REST API endpoints to add, display, update, and delete book records.

Each book includes details such as its title, author, publisher, price, published year, ISBN, quantity, description, category, number of pages, and cover image.

MongoDB stores the book records, while Mongoose defines the book schema and communicates with the database. Multer handles book-cover uploads, and uploaded images are stored in the `uploads/` directory and served as static files.

The API also uses `express-validator` to validate book data when a new book is added.

---

## ✨ Features

- Add a new book

- Retrieve all books

- Update an existing book

- Delete a book

- Upload a book-cover image

- Serve uploaded images through the `/uploads` path

- Validate book fields when adding a book

- Enforce unique ISBN values in MongoDB

- Return appropriate HTTP status codes for common errors

- Validate MongoDB ObjectId values before update and delete operations

- Delete a book's cover image when the book is deleted

- Replace an existing cover image when a new one is uploaded

- Store creation and update timestamps using Mongoose

---

## 🔧 Technologies Used

### Backend

- Node.js

- Express.js

- MongoDB

- Mongoose

- Multer

- express-validator

- dotenv

### Node.js Built-in Modules

- `path` — handles file and directory paths

- `fs` — handles cover-image file deletion

### Development Tools

- npm

- Postman (for API testing)

---

## ⚙️ How It Works

### 1. Add a Book

**Endpoint:** `POST /add-book`

The API accepts book details and a cover image using `multipart/form-data`.

The request is validated before the book is saved. If the required cover image is missing, the API returns a `400 Bad Request` response. If the ISBN already exists, it returns `409 Conflict`.

On success, the API returns the new book's MongoDB ID.

### 2. Display Books

**Endpoint:** `GET /display-books`

The API retrieves all books from MongoDB, sorts them from newest to oldest using `createdAt`, excludes the Mongoose `\_\_v` field, and returns the total count with the book data.

### 3. Update a Book

**Endpoint:** `PUT /update-book/:id`

The API finds the book by its MongoDB ID and updates only the fields included in the request. A new cover image is optional. If a new image is uploaded, the API saves the updated book first and then attempts to delete the old cover image.

### 4. Delete a Book

**Endpoint:** `DELETE /delete-book/:id`

The API validates the ID, checks that the book exists, and deletes its cover image if one is associated with the record. It then deletes the book record from MongoDB.

### 5. Home Route

**Endpoint:** `GET /`

Returns the text `Home Page` to confirm that the server is responding.

---

## 📖 Book Data Model

The `Book` model is defined in `models/Book.js`.

| Field | Type | Rules |

|---|---|---|

| `title` | String | Required; trimmed |

| `author` | String | Required; trimmed |

| `publisher` | String | Required |

| `price` | Number | Required; minimum `0` |

| `publishedYear` | Number | Required |

| `isbn` | String | Required; unique |

| `quantity` | Number | Required; minimum `0`; defaults to `1` |

| `description` | String | Required |

| `category` | String | Required; must be an allowed category |

| `pages` | Number | Required; minimum `0` in the schema |

| `bookCover` | String | Required |

| `createdAt` | Date | Automatically generated |

| `updatedAt` | Date | Automatically generated |

Allowed categories:

- `Novel`

- `Education`

- `Technology`

- `History`

- `Biography`

- `Fiction`

The schema uses Mongoose timestamps, so `createdAt` and `updatedAt` are maintained automatically.

---

## 📝 Form Validation

The `POST /add-book` route uses `express-validator` to validate the submitted book details.

| Field | Validation |

|---|---|

| `title` | Required; maximum 200 characters |

| `author` | Required; maximum 100 characters |

| `publisher` | Required |

| `price` | Required; numeric value greater than or equal to `0` |

| `publishedYear` | Required; integer from `1` through the current year |

| `isbn` | Required; matches the configured ISBN-10 or ISBN-13 pattern |

| `quantity` | Optional in the request; if supplied, must be a non-negative integer |

| `description` | Required |

| `category` | Required; must be one of the six allowed categories |

| `pages` | Required; positive integer |

| `bookCover` | Required file; checked by the route handler |

When validation fails, the API returns `400 Bad Request` with a message and an array of field-level errors.

**Note:** In the current code, these `express-validator` rules are attached to the add-book route. The update route does not use the same validation middleware.

---

## 🔄 CRUD Operations

| Operation | HTTP Method | Endpoint | Purpose |

|---|---|---|---|

| Create | `POST` | `/add-book` | Add a book and upload its cover |

| Read | `GET` | `/display-books` | Retrieve all books |

| Update | `PUT` | `/update-book/:id` | Update supplied book fields and optionally replace its cover |

| Delete | `DELETE` | `/delete-book/:id` | Delete a book and its cover image |

| Home | `GET` | `/` | Return a basic home-page response |

---

## 🛣️ API Endpoints

Assuming the server is running locally on port `3000`:

| Method | URL | Body | Success Response |

|---|---|---|---|

| `GET` | `http://localhost:3000/` | None | `Home Page` |

| `POST` | `http://localhost:3000/add-book` | `multipart/form-data` | `201 Created` with message and book ID |

| `GET` | `http://localhost:3000/display-books` | None | `200 OK` with count and book data |

| `PUT` | `http://localhost:3000/update-book/:id` | Form fields; optional cover file | `200 OK` with updated book |

| `DELETE` | `http://localhost:3000/delete-book/:id` | None | `200 OK` confirmation |

Replace `:id` with the `\_id` of the book in MongoDB. The example port is only illustrative; the application uses the `PORT` environment variable.

### Book Cover URL

Uploaded images are served from:

```text

http://localhost:3000/uploads/<filename>

```

Replace `<filename>` with the stored `bookCover` filename and use the actual configured port.

---

## 🧪 Example Requests

### Add a Book

In Postman:

1\. Select **POST**.

2\. Enter `http://localhost:3000/add-book`.

3\. Open **Body → form-data**.

4\. Add the following text fields.

5\. Add `bookCover` as a **File** field and select an image.

| Key | Example Value | Type |

|---|---|---|

| `title` | The Example Book | Text |

| `author` | Alex Writer | Text |

| `publisher` | Example Publishing | Text |

| `price` | `499.99` | Text |

| `publishedYear` | `2024` | Text |

| `isbn` | `9781234567897` | Text |

| `quantity` | `5` | Text |

| `description` | An example book description. | Text |

| `category` | Technology | Text |

| `pages` | `250` | Text |

| `bookCover` | Choose an image file | File |

Example success response:

```json

{

  "message": "Book Added",

  "id": "YOUR_CREATED_BOOK_ID"

}

```

The example values are illustrative. Use an ISBN that passes the configured pattern and is not already present in your database.

### Display All Books

**Request**

```http

GET /display-books

```

Example response shape:

```json

{

  "count": 1,

  "data": [

    {

      "\_id": "YOUR_BOOK_ID",

      "title": "The Example Book",

      "author": "Alex Writer",

      "publisher": "Example Publishing",

      "price": 499.99,

      "publishedYear": 2024,

      "isbn": "9781234567897",

      "quantity": 5,

      "description": "An example book description.",

      "category": "Technology",

      "pages": 250,

      "bookCover": "YOUR_COVER_FILENAME.jpg",

      "createdAt": "2026-01-01T00:00:00.000Z",

      "updatedAt": "2026-01-01T00:00:00.000Z"

    }

  ]

}

```

The ID, filename, and timestamps above are placeholders for illustration.

### Update a Book

**Request**

```http

PUT /update-book/YOUR_BOOK_ID

```

Send the fields you want to change. The route accepts the updated fields in the request body and can also accept a new `bookCover` file. In Postman, use **Body → form-data** when uploading a cover.

### Delete a Book

**Request**

```http

DELETE /delete-book/YOUR_BOOK_ID

```

Replace `YOUR_BOOK_ID` with an existing MongoDB book ID.

---

## 📂 Project Structure

The following structure is based on the files shown in the project explorer:

```text

book-management/

│

├── .postman/

│   └── resources.yaml

│

├── models/

│   └── Book.js

│

├── node_modules/

│

├── postman/

│

├── uploads/

│   ├── <uploaded-cover-image>.jpg

│   ├── <uploaded-cover-image>.webp

│   └── ...

│

├── .env

├── app.js

├── package-lock.json

├── package.json

└── README.md

```

The image filenames shown above are illustrative. The `uploads/` directory contains the cover images saved by Multer. `node_modules/` is installed locally and generally should not be committed to version control.

---

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env

PORT=3000

MONGO_URI=mongodb://127.0.0.1:27017/book-management

```

- `PORT` — port on which the Express server listens.

- `MONGO_URI` — MongoDB connection string.

The MongoDB URI above is an example for a local database. Replace it with your own connection string if needed. Do not commit credentials or secrets to a public repository.

---

## 🚀 Installation and Setup

### Prerequisites

Install Node.js and npm, and make sure MongoDB is available either locally or through a hosted MongoDB service.

### 1. Clone or Download the Project

Open a terminal in the project directory.

### 2. Install Dependencies

```bash

npm install

```

The application uses these main packages:

```bash

npm install express mongoose multer dotenv express-validator

```

If the dependencies are already listed in `package.json`, running `npm install` is sufficient.

### 3. Configure Environment Variables

Create and configure the `.env` file as described above.

### 4. Ensure the Upload Directory Exists

Make sure an `uploads/` directory exists in the project root. Multer is configured to save uploaded files there.

---

## ▶️ Running the Project

Start the server with:

```bash

node app.js

```

If a start script is configured in `package.json`, you can use:

```bash

npm start

```

The second command works only if the package's `scripts` section defines a `start` script.

When the database connection succeeds, the application logs:

```text

Connected Successfully!

```

When the Express server starts, it logs the local URL using the configured port.

Test the endpoints with Postman or another API client.

---

## ⚠️ Error Handling

The API uses HTTP status codes to indicate success or failure.

| Status Code | Meaning | Example |

|---|---|---|

| `200 OK` | Request completed | Books fetched, updated, or deleted |

| `201 Created` | Resource created | Book added successfully |

| `400 Bad Request` | Invalid input | Validation failure or invalid book ID |

| `404 Not Found` | Resource not found | Book ID does not exist |

| `409 Conflict` | Duplicate value | ISBN already exists |

| `500 Internal Server Error` | Unexpected server or database error | Failed database operation |

---

## 📸 Screenshots

Add screenshots of the project or API responses here. Upload image files to the repository (for example, in a `screenshots/` folder), then update the paths below.

<!-- Replace these placeholders with your actual screenshot paths. -->

- **API testing in Postman:** `screenshots/postman-api.png`
- **Book data in MongoDB:** `screenshots/mongodb-books.png`
- **Uploaded book cover:** `screenshots/book-cover.png`

Example Markdown image syntax:

```markdown
![API testing in Postman](screenshots/postman-api.png)
```

---

## 🎬 Explanation Video

Add a link to a video explaining the project architecture, API endpoints, validation, and database integration.

**Video link:** `Add your explanation video URL here`

---

## 🖥️ Screen Recording

Add a screen recording demonstrating the application workflow, such as starting the server and testing the add, display, update, and delete endpoints.

**Screen recording link:** `Add your screen recording URL here`

---

## 👤 Author

**Author name:** `Sakina Mufaddal Sendhi`

- GitHub: `Add your GitHub profile URL`
- Email/Contact: `Add your preferred contact information (optional)`

---

<div align="center">

⭐ Thank you for visiting this repository!

</div>
