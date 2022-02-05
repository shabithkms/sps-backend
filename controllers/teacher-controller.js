var collection = require("../config/collection");
var db = require("../config/connection");
const objectId = require("mongodb").ObjectID;
const nodemailer = require("nodemailer");
var generator = require("generate-password");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const bcrypt = require("bcryptjs");
const multer = require("multer");

const JWT_SECRET = process.env.JWT_SECRET;
const BASE_URL = process.env.BASE;
const upload = multer({ dest: "uploads/" });

const { uploadFile, getFileStream } = require("../utils/s3");

module.exports = {
  teacherLogin: (req, res) => {
    return new Promise(async (resolve, reject) => {
      const { email, password } = req.body;

      try {
        let teacher = await db
          .get()
          .collection(collection.TEACHER_COLLECTION)
          .findOne({ email });

        if (teacher) {
          let status = await bcrypt.compare(password, teacher.password);
          delete teacher.password;
          if (status) {
            return res
              .status(200)
              .json({ message: "Loggedin successfully", teacher });
          } else {
            return res.status(401).json({ errors: "Invalid password" });
          }
        } else {
          return res.status(401).json({ errors: "Not a registered email" });
        }
      } catch (error) {
        return res.status(500).json({ errors: "Something error" });
      }
    });
  },
  teacherSignup: (req, res) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { name, email, password, token } = req.body;
        let decoded = jwt_decode(token);
        let hashedPassword = await bcrypt.hash(password, 10);

        // Checking the email and token email
        if (email === decoded.email) {
          let hi = await db
            .get()
            .collection(collection.TEACHER_COLLECTION)
            .updateOne(
              { email },
              {
                $set: {
                  name,
                  email,
                  password: hashedPassword,
                },
              },
              { upsert: true }
            );
          let teacher = await db
            .get()
            .collection(collection.TEACHER_COLLECTION)
            .findOne({ email });
          delete teacher.password;
          return res
            .status(200)
            .json({ message: "Registered successfully", teacher });
        } else {
          return res.status(401).json({ errors: "Not a registered Email" });
        }
      } catch (error) {
        return res.status(500).json({ errors: "Something error" });
      }
    });
  },
  getTeacherData: (req, res) => {
    let id = req.params.id;
    return new Promise(async (resolve, reject) => {
      try {
        let teacherData = await db
          .get()
          .collection(collection.TEACHER_COLLECTION)
          .findOne({ _id: objectId(id) });
        delete teacherData.password;
        return res.status(200).json({ response: "success", teacherData });
      } catch (error) {
        res.status(500).json({ errors: "Something error" });
      }
    });
  },
  getDomains: (req, res) => {
    return new Promise(async (resolve, reject) => {
      try {
        let domains = await db
          .get()
          .collection(collection.DOMAIN_COLLECTION)
          .find()
          .toArray();
        res.status(200).json({ domains });
      } catch (error) {
        return res.status(500).json({ errors: "Something error" });
      }
    });
  },
  addNewDomain: (req, res) => {
    return new Promise(async (resolve, reject) => {
      const { name } = req.body;
      try {
        let domain = await db
          .get()
          .collection(collection.DOMAIN_COLLECTION)
          .findOne({ DomainName: name });
        if (!domain) {
          db.get()
            .collection(collection.DOMAIN_COLLECTION)
            .insertOne({ DomainName: name })
            .then((response) => {
              return res.status(200).json({ response: "Added successfully" });
            });
        } else {
          return res.status(400).json({ errors: "This doamin already exist" });
        }
      } catch (error) {}
    });
  },
  deleteDomain: (req, res) => {
    return new Promise((resolve, reject) => {
      let { domainId } = req.body;
      db.get()
        .collection(collection.DOMAIN_COLLECTION)
        .deleteOne({ _id: objectId(domainId) })
        .then((response) => {
          return res.status(200).json({ response: "deleted successfully" });
        });
      try {
      } catch (error) {
        return res.json({ errors: "Something error" });
      }
    });
  },
  updateProfile: (req, res) => {
    return new Promise(async (resolve, reject) => {
      let address = "";
      let mobile = "";
      try {
        const { _id, name, email } = req.body;

        if (req.body.mobile) mobile = req.body.mobile;
        if (req.body.address) address = req.body.address;

        db.get()
          .collection(collection.TEACHER_COLLECTION)
          .updateOne(
            { _id: objectId(_id) },
            {
              $set: {
                name,
                email,
                mobile,
                address,
              },
            }
          )
          .then((response) => {
            res.status(200).json({ response: "Profile edited successfully" });
          })
          .catch((err) => {
            res.status(500).json({ errors: "Something error" });
          });
      } catch (error) {
        console.log(error);
        res.status(500).json({ errors: "Something error" });
      }
    });
  },
  editPhoto: (req, res) => {
    return new Promise(async (resolve, reject) => {
      console.log("api call");
      const file = req.file;
      console.log("fil", file);
      let { _id } = req.body;
      if (file) {
        try {
          let result = await uploadFile(file);
          db.get()
            .collection(collection.TEACHER_COLLECTION)
            .updateOne(
              { _id: objectId(_id) },
              {
                $set: {
                  profile: result.Location,
                },
              },
              { upsert: true }
            )
            .then((response) => {
              res.json({ message: "image changed successfully" });
            });
        } catch (error) {
          console.log(error);
          res.status(500).json({ errors: "Something error" });
        }
      }
    });
  },
};
