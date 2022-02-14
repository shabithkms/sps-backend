const collection = require('../config/collection');
const db = require('../config/connection');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const { uploadFile } = require('../utils/s3');
const fs = require('fs');

module.exports = {
  doSignup: (req, res) => {
    return new Promise(async (resolve, reject) => {
      const { Name, Email, Password } = req.body;
      const hashedPassword = await bcrypt.hash(Password, 10);
      try {
        const exist = await db
          .get()
          .collection(collection.PASSED_STUDENT_COLLECTION)
          .findOne({ Email });
        console.log(exist);
        if (exist) {
          db.get()
            .collection(collection.STUDENT_COLLECTION)
            .updateOne(
              { Email },
              {
                $set: {
                  Name,
                  Email,
                  hashedPassword,
                  Week: 1,
                  Batch: exist.Batch,
                },
              },
              { upsert: true }
            )
            .then((response) => {
              return res
                .status(200)
                .json({ message: 'Registered successfully' });
            });
        } else {
          return res
            .status(401)
            .json({ errors: 'You are not selected for SPS' });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ errors: 'Something error' });
      }
    });
  },
  doLogin: (req, res) => {
    return new Promise(async (resolve, reject) => {
      console.log(req.body);
      const { Email, Password } = req.body;
      try {
        const student = await db
          .get()
          .collection(collection.STUDENT_COLLECTION)
          .findOne({ Email });
        console.log(student);
        if (student) {
          const status = await bcrypt.compare(Password, student.hashedPassword);
          if (status) {
            delete student.hashedPassword;
            return res
              .status(200)
              .json({ message: 'Signed in successfully', student });
          } else {
            return res.status(401).json({ errors: 'Incorrect password' });
          }
        } else {
          return res.status(404).json({ errors: 'Student doesnot exist' });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ errors: 'Something error' });
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

            let student = await db
              .get()
              .collection(collection.STUDENT_COLLECTION)
              .findOne({ Email });
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
};
