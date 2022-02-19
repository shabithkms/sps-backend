const collection = require('../config/collection');
const db = require('../config/connection');
const bcrypt = require('bcryptjs');
const objectId = require('mongodb').ObjectID
const { uploadFile } = require('../utils/s3');
const fs = require('fs');

module.exports = {
  doSignup: async (req, res) => {
    try {
      const { Name, Email, Password } = req.body;
      const hashedPassword = await bcrypt.hash(Password, 10);
      return new Promise(async () => {
        // Checking the student is selected for SPS
        const exist = await db.get().collection(collection.PASSED_STUDENT_COLLECTION).findOne({ Email });
        const student = await db.get().collection(collection.STUDENT_COLLECTION).findOne({ Email });
        if (exist) {
          if (!student) {
            db.get()
              .collection(collection.STUDENT_COLLECTION)
              .insertOne({
                Name,
                Email,
                hashedPassword,
                Week: 1,
                Batch: exist.Batch,
              })
              .then(() => {
                return res.status(200).json({ message: 'Registered successfully' });
              });
          } else {
            return res.status(401).json({ errors: 'This email is already registered' });
          }
        } else {
          // Student not selected
          return res.status(401).json({ errors: 'You are not selected for SPS' });
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ errors: error.message });
    }
  },
  doLogin: (req, res) => {
    return new Promise(async () => {
      console.log(req.body);

      const { Email, Password } = req.body;

      try {
        // Checking the user is valid or invalid
        const student = await db.get().collection(collection.STUDENT_COLLECTION).findOne({ Email });
        console.log(student);
        if (student) {
          // Comparing the passwords with bcrypt
          const status = await bcrypt.compare(Password, student.hashedPassword);

          if (status) {
            // Password matched logged in success
            delete student.hashedPassword;
            return res.status(200).json({ message: 'Signed in successfully', student });
          } else {
            // Invalid password
            return res.status(401).json({ errors: 'Incorrect password' });
          }
        } else {
          // Student not exist with the Email
          return res.status(404).json({ errors: 'Student doesnot exist' });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ errors: error.message });
      }
    });
  },
  editProfile: (req, res) => {
    return new Promise(() => {
      const file = req.file;
      try {
        const {
          Name,
          Domain,
          DOB,
          Age,
          Gender,
          Email,
          Mobile,
          FatherName,
          FatherNo,
          MotherName,
          MotherNo,
          Guardian,
          Relationship,
          Address,
          Village,
          Taluk,
          Qualification,
          School,
          Experience,
          PaymentMethod,
        } = req.body;
        db.get()
          .collection(collection.STUDENT_COLLECTION)
          .updateOne(
            { Email },
            {
              $set: {
                Name,
                Domain,
                DOB,
                Age,
                Gender,
                Mobile,
                FatherName,
                FatherNo,
                MotherName,
                MotherNo,
                Guardian,
                Relationship,
                Address,
                Village,
                Taluk,
                Qualification,
                School,
                Experience,
                PaymentMethod,
              },
            }
          )
          .then(async (response) => {
            console.log(response);
            if (file) {
              const fileName = file.filename;
              const result = await uploadFile(file);
              fs.unlinkSync(`uploads/${fileName}`);
              console.log('file deleted');

              db.get()
                .collection(collection.STUDENT_COLLECTION)
                .updateOne(
                  { Email },
                  {
                    $set: {
                      ID_Proof: result.Location,
                    },
                  }
                );
            }
            // Get student data with Email
            const student = await db.get().collection(collection.STUDENT_COLLECTION).findOne({ Email });

            res.status(200).json({ message: 'updated successfully', student });
          });
      } catch (error) {
        console.log(error);
        return res.status(500).json({ errors: error.message });
      }
    });
  },
  getStudentData: async (req, res) => {
    try {
      let { id } = req.params;
      console.log('id', id);
      const student = await db
        .get()
        .collection(collection.STUDENT_COLLECTION)
        .findOne({ _id: ObjectId(id) });
      console.log(student);
      return res.status(200).json({ student });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: error.message });
    }
  },
  editProfilePhoto: (req, res) => {
    try {
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
              .collection(collection.STUDENT_COLLECTION)
              .updateOne(
                { _id: objectId(_id) },
                {
                  $set: {
                    Profile: result.Location,
                  },
                },
                { upsert: true }
              )
              .then(async () => {
                const student = await db
                  .get()
                  .collection(collection.STUDENT_COLLECTION)
                  .findOne({ _id: objectId(_id) });
                fs.unlinkSync(`uploads/${oldFilename}`);
                console.log('file deleted');
                res.json({
                  message: 'image changed successfully',
                  profile: result.Location,
                  student,
                });
              });
          } catch (error) {
            console.log(error);
            res.status(500).json({ errors: error.message });
          }
        }
      });
    } catch (error) {
      res.status(500).json({ errors: error.message });
    }
  },
};
