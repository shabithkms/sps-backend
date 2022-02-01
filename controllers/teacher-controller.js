var collection = require("../config/collection");
var db = require("../config/connection");
const objectId = require("mongodb").ObjectID;
const nodemailer = require("nodemailer");
var generator = require("generate-password");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET;
const BASE_URL = process.env.BASE;

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
      let teacherData = await db
        .get()
        .collection(collection.TEACHER_COLLECTION)
        .findOne({ _id: objectId(id) });
      delete teacherData.password;
      return res.status(200).json({ response: "success", teacherData });
    });
  },
};
