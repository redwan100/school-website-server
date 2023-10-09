const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const port = process.env.PORT || 5000;
require("dotenv").config();
const multer = require("multer");
const path = require("path");

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("school website server is running");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://schoolwebsite:schoolwebsite@cluster0.yq2vgbi.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const noticeCollection = client.db("school-website").collection("notices");

    const galleryCollection = client.db("school-website").collection("gallery");

    const instituteCommunicationCollection = client
      .db("school-website")
      .collection("contacts");

    const studentCollection = client
      .db("school-website")
      .collection("students");

    const aboutCollection = client.db("school-website").collection("about");

    const resultCollection = client.db("school-website").collection("results");
    /* -------------------------------------------------------------------------- */
    /*                          FILE UPLOAD FUNCTIONALITY                         */
    /* -------------------------------------------------------------------------- */

    app.use(express.static("uploads"));
    // Configure multer for file uploads
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "uploads");
      },
      filename: (req, file, cb) => {
        const fileExt = path.extname(file.originalname);
        const fileName =
          file.originalname
            .replace(fileExt, "")
            .toLowerCase()
            .split(" ")
            .join("-") +
          "-" +
          Date.now();
        cb(null, fileName + fileExt);
      },
    });

    const upload = multer({
      storage,
      limits: {
        files: 30,
      },
    });

    /* -------------------------------------------------------------------------- */
    /*                                NOTICE ROUTES                               */
    /* -------------------------------------------------------------------------- */

    // TODO: GET NOTICE ROUTE
    app.get("/notice", async (req, res) => {
      try {
        const result = await noticeCollection
          .find()
          .sort({
            createdAt: -1,
          })
          .toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error uploading file" });
      }
    });

    // TODO: ADD NOTICE ROUTE
    app.post("/add-notice", upload.single("pdf"), async (req, res) => {
      try {
        if (!req.file) {
          return res.send("File Not found ");
        }
        const { filename } = req.file;
        const { noticeName } = req.body;

        await noticeCollection.insertOne({
          filename,
          notice: noticeName,
          createdAt: new Date(),
        });

        res.status(200).json({
          success: true,
          message: "File uploaded successfully",
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error uploading file" });
      }
    });

    // TODO: DELETE NOTICE ROUTE
    app.delete("/delete-notice/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await noticeCollection.deleteOne(filter);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server error");
      }
    });

    // TODO: SINGLE NOTICE
    app.get("/single-notice/:id", async (req, res) => {
      try {
        const id = req.params.id;

        const filter = { _id: new ObjectId(id) };
        const result = await noticeCollection.findOne(filter);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server error");
      }
    });

    // TODO: UPDATE NOTICE
    app.patch("/update-notice/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updated = req.body;

        // Remove undefined or empty string values from the updated object
        Object.keys(updated).forEach((key) =>
          updated[key] === undefined || updated[key] === ""
            ? delete updated[key]
            : null
        );

        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            ...updated,
          },
        };

        const result = await noticeCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error ");
      }
    });

    /* -------------------------------------------------------------------------- */
    /*                               GALLERY ROUTES                               */
    /* -------------------------------------------------------------------------- */
    // TODO: ADD  GALLERY
    app.post("/add-gallery", upload.array("images"), async (req, res) => {
      try {
        const uploadedFiles = req.files.map((file) => {
          return {
            filename: file.filename,
          };
        });

        const information = {
          image: uploadedFiles,
          createAt: new Date(),
        };
        const result = await galleryCollection.insertOne(information);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: GET GALLERY
    app.get("/gallery", async (req, res) => {
      try {
        const result = await galleryCollection
          .find()
          .sort({ createAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    app.delete("/delete-gallery/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await galleryCollection.deleteOne(filter);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    /* -------------------------------------------------------------------------- */
    /*                               STUDENT ROUTES                               */
    /* -------------------------------------------------------------------------- */
    // TODO: STUDENT
    app.post("/add-student", upload.single("image"), async (req, res) => {
      try {
        const image = req.file ? req.file.filename : null;
        console.log(image);
        const body = req.body;
        const info = {
          ...body,
          avatar: image,
        };
        const result = await studentCollection.insertOne(info);

        res.send(result);
      } catch (error) {
        console.log(error);
        res.send({
          error: true,
          message: "There was a server side error",
        });
      }
    });

    app.get("/all-student", async (req, res) => {
      try {
        const result = await studentCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: GET SINGLE student ROUTE
    app.get("/single-student/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await studentCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: DELETE student ROUTE
    app.delete("/delete-student/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const result = await studentCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: UPDATE student INFO ROUTE
    app.patch("/update-student/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updated = req.body;

        console.log(updated);

        // Remove undefined or empty string values from the updated object
        Object.keys(updated).forEach((key) =>
          updated[key] === undefined || updated[key] === ""
            ? delete updated[key]
            : null
        );

        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            ...updated,
          },
        };

        const result = await studentCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    /* -------------------------------------------------------------------------- */
    /*                               EXAM RESULT ROUTES                               */
    /* -------------------------------------------------------------------------- */
    // TODO: STUDENT
    app.post("/add-result", upload.single("image"), async (req, res) => {
      try {
        const body = req.body;
        const info = {
          ...body,
          createdAt: new Date(),
        };
        const result = await resultCollection.insertOne(info);

        res.send(result);
      } catch (error) {
        console.log(error);
        res.send({
          error: true,
          message: "There was a server side error",
        });
      }
    });

    app.get("/all-result", async (req, res) => {
      try {
        const result = await resultCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: GET SINGLE student ROUTE
    app.get("/single-result/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await resultCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: DELETE student ROUTE
    app.delete("/delete-result/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const result = await resultCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: UPDATE student INFO ROUTE
    app.patch("/update-result/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updated = req.body;

        // Remove undefined or empty string values from the updated object
        Object.keys(updated).forEach((key) =>
          updated[key] === undefined || updated[key] === ""
            ? delete updated[key]
            : null
        );

        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            ...updated,
          },
        };

        const result = await resultCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    /* -------------------------------------------------------------------------- */
    /*                               ABOUT US ROUTES                              */
    /* -------------------------------------------------------------------------- */
    // TODO:  ABOUT
    app.post("/add-about", async (req, res) => {
      try {
        const body = req.body;
        const message = {
          ...body,

          createdAt: new Date(),
        };
        const result = await aboutCollection.insertOne(message);

        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: UPDATE about ROUTE
    app.patch("/update-about/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const message = req.body;

        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            ...message,
          },
        };

        const result = await aboutCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // TODO: DELETE about ROUTE
    app.delete("/delete-about/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const result = await aboutCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: GET about MESSAGE DATA ROUTE
    app.get("/about", async (req, res) => {
      try {
        const result = await aboutCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });
    // TODO: GET SINGLE about DATA ROUTE
    app.get("/single-about/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await aboutCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    /* -------------------------------------------------------------------------- */
    /*                             COMMUNICATION ROUTES                            */
    /* -------------------------------------------------------------------------- */

    // TODO: ADD COMMUNICATION
    app.post("/add-communication", async (req, res) => {
      try {
        const data = req.body;
        const communication = {
          ...data,
          createdAt: new Date(),
        };

        const result = await instituteCommunicationCollection.insertOne(
          communication
        );
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: DELETE COMMUNICATION
    app.delete("/delete-communication/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const result = await instituteCommunicationCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: UPDATE COMMUNICATION
    app.patch(
      "/update-communication/:id",

      async (req, res) => {
        try {
          const id = req.params.id;
          const updated = req.body;
          console.log(updated);
          // Remove undefined or empty string values from the updated object
          Object.keys(updated).forEach((key) =>
            updated[key] === undefined || updated[key] === ""
              ? delete updated[key]
              : null
          );

          const filter = { _id: new ObjectId(id) };
          const updateDoc = {
            $set: {
              ...updated,
            },
          };

          const result = await instituteCommunicationCollection.updateOne(
            filter,
            updateDoc
          );
          res.send(result);
        } catch (error) {
          console.log(error);
          res.send("There was a server side error ");
        }
      }
    );

    // TODO: GET COMMUNICATION
    app.get("/communication", async (req, res) => {
      try {
        const result = await instituteCommunicationCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: GET SINGLE COMMUNICATION
    app.get("/single-communication/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await instituteCommunicationCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(" Successfully connected to MongoDB✌️");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});

//TODO: ERROR HANDLER
app.use((req, res, next) => {
  next({
    status: 500,
    message: "route not found",
  });
});

app.use((error, req, res, next) => {
  // Custom error handling logic goes here
  console.error(error);

  // Send an error response to the client
  return res.status(error.status || 500).json({
    error: true,
    message: error.message,
  });
});
