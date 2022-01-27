var collection = require("../config/collection");
var db = require("../config/connection");
const objectId = require("mongodb").ObjectID;
const nodemailer = require("nodemailer");
var generator = require("generate-password");
const jwt = require('jsonwebtoken')

module.exports = {
  addTeacher: (req, res) => {
    return new Promise((resolve, reject) => {
      const { name, email } = req.body;
      var password = generator.generate({
        length: 10,
        numbers: true,
      });
      try {
        db.get()
          .collection(collection.TEACHER_COLLECTION)
          .insertOne({ name, email,password })
          .then((response) => {
            console.log(response);
            res.status(200).json({ result: "success" });
            let transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.FROM_MAIL,
                pass: process.env.PASSWORD,
              },
            });

            let mailOptions = {
              from: process.env.FROM_MAIL,
              to: "shabithkms2035@gmail.com",
              subject: "Registration success",
              text: `
              You have successfully registered for SPS Teacher position.
              Now you can login to your teacher Dashboard using this link and the password,
              link: ${"http://localhost:3000/admin/login"}
              password : ${password}`,
            };

            transporter.sendMail(mailOptions, function (err, data) {
              if (err) {
                console.log(err);
              } else {
                console.log("Email sended");
              }
            });
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        console.log(error);
      }
    });
  },
  getTeacherDetails: (req, res) => {
    try {
      return new Promise(async (resolve, reject) => {
        let teachers = await db
          .get()
          .collection(collection.TEACHER_COLLECTION)
          .find()
          .toArray();
        // console.log(teachers);
        if (teachers.length >= 1) {
          res.status(200).json(teachers);
        } else {
        }
      });
    } catch (error) {
      console.log(error);
    }
  },
  deleteTeacher: (req, res) => {
    console.log(req.params.id);
    var newId = req.params.id.substring(1);
    try {
      db.get()
        .collection(collection.TEACHER_COLLECTION)
        .deleteOne({ _id: objectId(newId) })
        .then((response) => {
          console.log(response);
          res.status(200).json({ message: "Teacher deleted" });
        });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: "Something error" });
    }
  },
};
