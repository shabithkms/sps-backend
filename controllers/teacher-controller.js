var collection = require('../config/collection');
var db = require('../config/connection');
const objectId = require('mongodb').ObjectID;
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET;
const BASE_URL = process.env.BASE;
const upload = multer({ dest: 'uploads/' });
var generator = require('generate-password');

const { uploadFile } = require('../utils/s3');

module.exports = {
  // Teacher Authentication section
  teacherLogin: (req, res) => {
    return new Promise(async () => {
      const { Email, Password } = req.body;

      try {
        const teacher = await db.get().collection(collection.TEACHER_COLLECTION).findOne({ Email });

        if (teacher) {
          const status = await bcrypt.compare(Password, teacher.Password);
          delete teacher.Password;
          if (status) {
            return res.status(200).json({ message: 'Loggedin successfully', teacher });
          } else {
            return res.status(401).json({ errors: 'Invalid password' });
          }
        } else {
          return res.status(401).json({ errors: 'Not a registered email' });
        }
      } catch (error) {
        console.log(error);
        return res.status(500).json({ errors: error.message });
      }
    });
  },
  teacherSignup: (req, res) => {
    return new Promise(async () => {
      try {
        console.log(req.body);
        const { Name, Email, Password, token } = req.body;
        const decoded = jwt_decode(token);
        const hashedPassword = await bcrypt.hash(Password, 10);

        // Checking the email and token email
        if (Email === decoded.email) {
          const hi = await db
            .get()
            .collection(collection.TEACHER_COLLECTION)
            .updateOne(
              { Email },
              {
                $set: {
                  Name,
                  Email,
                  Password: hashedPassword,
                },
              },
              { upsert: true }
            );
          const teacher = await db.get().collection(collection.TEACHER_COLLECTION).findOne({ Email });
          delete teacher.Password;
          return res.status(200).json({ message: 'Registered successfully', teacher });
        } else {
          return res.status(401).json({ errors: 'Not a registered Email' });
        }
      } catch (error) {
        console.log(error);
        return res.status(500).json({ errors: error.message });
      }
    });
  },
  getTeacherData: (req, res) => {
    const id = req.params.id;
    return new Promise(async () => {
      try {
        const teacherData = await db
          .get()
          .collection(collection.TEACHER_COLLECTION)
          .findOne({ _id: objectId(id) });
        delete teacherData.password;
        return res.status(200).json({ response: 'success', teacherData });
      } catch (error) {
        console.log(error);
        res.status(500).json({ errors: error.message });
      }
    });
  },

  // Domain management
  getDomains: (req, res) => {
    return new Promise(async () => {
      try {
        const domains = await db.get().collection(collection.DOMAIN_COLLECTION).find().toArray();
        res.status(200).json({ domains });
      } catch (error) {
        console.log(error);
        return res.status(500).json({ errors: error.message });
      }
    });
  },
  addNewDomain: (req, res) => {
    return new Promise(async () => {
      console.log(req.body);
      const { DomainName } = req.body;
      try {
        const domain = await db.get().collection(collection.DOMAIN_COLLECTION).findOne({ DomainName });
        if (!domain) {
          db.get()
            .collection(collection.DOMAIN_COLLECTION)
            .insertOne({ DomainName })
            .then(() => {
              return res.status(200).json({ message: 'Domain added successfully' });
            });
        } else {
          return res.status(400).json({ errors: 'This doamin already exist' });
        }
      } catch (error) {
        console.log(error);
        return res.status(500).json({ errors: error.message });
      }
    });
  },
  deleteDomain: (req, res) => {
    return new Promise(() => {
      const { id } = req.body;
      db.get()
        .collection(collection.DOMAIN_COLLECTION)
        .deleteOne({ _id: objectId(id) })
        .then(() => {
          return res.status(200).json({ response: 'deleted successfully' });
        });
      try {
      } catch (error) {
        console.log(error);
        return res.json({ errors: error.message });
      }
    });
  },

  // Teacher profile section
  updateProfile: (req, res) => {
    return new Promise(async () => {
      let Address = '';
      let Mobile = '';
      try {
        const { _id, Name, Email } = req.body;

        if (req.body.Mobile) Mobile = req.body.Mobile;
        if (req.body.Address) Address = req.body.Address;

        db.get()
          .collection(collection.TEACHER_COLLECTION)
          .updateOne(
            { _id: objectId(_id) },
            {
              $set: {
                Name,
                Email,
                Mobile,
                Address,
              },
            }
          )
          .then(() => {
            res.status(200).json({ response: 'Profile edited successfully' });
          })
          .catch((err) => {
            res.status(500).json({ errors: err.message });
          });
      } catch (error) {
        console.log(error);
        res.status(500).json({ errors: error.message });
      }
    });
  },
  editPhoto: (req, res) => {
    return new Promise(async () => {
      console.log('api call');
      const file = req.file;

      const { _id } = req.body;
      console.log(_id);
      if (file) {
        try {
          const oldFilename = file.filename;
          const result = await uploadFile(file);
          db.get()
            .collection(collection.TEACHER_COLLECTION)
            .updateOne(
              { _id: objectId(_id) },
              {
                $set: {
                  Profile: result.Location,
                },
              },
              { upsert: true }
            )
            .then(() => {
              fs.unlinkSync(`uploads/${oldFilename}`);
              console.log('file deleted');
              res.json({
                message: 'image changed successfully',
                profile: result.Location,
              });
            });
        } catch (error) {
          console.log(error);
          res.status(500).json({ errors: error.message });
        }
      }
    });
  },
  // Student Management
  getAllBatches: (req, res) => {
    return new Promise(async () => {
      try {
        const batches = await db.get().collection(collection.BATCH_COLLECTION).find().sort({ $natural: -1 }).toArray();
        return res.status(200).json({ message: 'Batches got successfully', batches });
      } catch (error) {
        console.log(error);
        return res.status(500).json({ errors: error.message });
      }
    });
  },
  addStudent: (req, res) => {
    return new Promise(async () => {
      console.log(req.body);
      const { Email, Name, Batch } = req.body;

      console.log(Email);
      try {
        const student = await db.get().collection(collection.PASSED_STUDENT_COLLECTION).findOne({ Email });
        if (!student) {
          db.get()
            .collection(collection.PASSED_STUDENT_COLLECTION)
            .insertOne({ Name, Email, Batch })
            .then(() => {
              res.status(200).json({ message: 'Student added successfully' });
            });
        } else {
          return res.status(400).json({ errors: 'Student already exist' });
        }
      } catch (error) {
        console.log(error);
        return res.status(500).json({ errors: error.message });
      }
    });
  },
  getAllStudents: (req, res) => {
    return new Promise(async () => {
      try {
        const students = await db.get().collection(collection.PASSED_STUDENT_COLLECTION).find().toArray();
        return res.status(200).json({ message: 'Students got successfully', students });
      } catch (error) {
        console.log(error);
        res.status(500).json({ errors: error.message });
      }
    });
  },

  //Reviewer Management
  getAllReviewer: async (req, res) => {
    try {
      const reviewers = await db.get().collection(collection.REVIEWER_COLLECTION).find().toArray();
      return res.status(200).json({ message: 'Success', reviewers });
    } catch (error) {
      console.log(error);
    }
  },
  addNewReviewer: async (req, res) => {
    try {
      const { Name, Email } = req.body;
      let reviewerExist = await db.get().collection(collection.REVIEWER_COLLECTION).findOne({ Email });
      req.body.Registered = false;
      console.log(reviewerExist);
      if (!reviewerExist) {
        db.get().collection(collection.REVIEWER_COLLECTION).insertOne(req.body);

        // Creating one time link for to email
        const secret = JWT_SECRET + password;
        const payload = {
          Name,
          Email,
        };
        var password = generator.generate({
          length: 10,
          numbers: true,
        });
        const token = jwt.sign(payload, secret, {
          expiresIn: '15m',
        });
        const link = `${BASE_URL}/reviewer/register/${token}`;
        console.log(link);
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.FROM_MAIL,
            pass: process.env.PASSWORD,
          },
        });

        const mailOptions = {
          from: process.env.FROM_MAIL,
          to: 'shabithkms2035@gmail.com',
          subject: 'Registration success',
          html: `
          <h2>Hi <span style="color: #00d2b5">${Name}</span>,</h2>
          <p>Click the Button  for Register to Your Reviewer account</p>
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
              Register as a Reviewer
            </a>
          </div>
          `,
        };

        transporter.sendMail(mailOptions, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log('Email sended');
          }
        });
        return res.status(200).json({ message: 'Reviewer added successfully' });
      } else {
        return res.status(400).json({ errors: 'Reviewer already exist' });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: error.message });
    }
  },
  deleteReviewer: async (req, res) => {
    console.log('api call');
    const { id } = req.params;
    console.log(id);
    try {
      console.log(id);
      let deleted = await db
        .get()
        .collection(collection.REVIEWER_COLLECTION)
        .deleteOne({ _id: objectId(id) });
      console.log(deleted);
      return res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: error.message });
    }
  },
};
