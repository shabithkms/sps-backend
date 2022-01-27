var collection = require("../config/collection");
var db = require("../config/connection");
const objectId = require("mongodb").ObjectID;
const nodemailer = require("nodemailer");
var generator = require("generate-password");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const BASE_URL = process.env.BASE;
console.log(BASE_URL);

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
          .insertOne({ name, email, password })
          .then((response) => {
            console.log(response);
            res.status(200).json({ result: "success" });

            // Creating one time link for to email
            const secret = JWT_SECRET + password;
            const payload = {
              name,
              email,
            };
            const token = jwt.sign(payload, secret, {
              expiresIn: "15m",
            });
            const link = `${BASE_URL}/teacher/${token}`;
            console.log(link);
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
              html: `
              <h2>Hi <span style="color: #00d2b5">Teacher</span>,</h2>
              <p>Click the Button  to SignUp to Your Teacher account</p>
              <div class="" style="margin-bottom: 30px; margin-top: 30px">
                <a
                  style="
                    color: #fff;
                    background-color: #00d2b5;
                    padding: 20px 30px 20px 30px;
                    text-decoration: none;
                    margin-top: 30px;
                    margin-bottom: 30px;
                  "
                  href="${link}"
                >
                  Signup as a Teacher
                </a>
              </div>
              `,
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
