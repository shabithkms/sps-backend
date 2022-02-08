const collection = require("../config/collection");
const db = require("../config/connection");
const bcrypt = require("bcryptjs");
const { response } = require("express");

module.exports = {
  doSignup: (req, res) => {
    return new Promise(async (resolve, reject) => {
      const { Name, Email, Password } = req.body;
      let hashedPassword = await bcrypt.hash(Password, 10);
      try {
        let exist = await db
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
                .json({ message: "Registered successfully" });
            });
        } else {
          return res
            .status(401)
            .json({ errors: "You are not selected for SPS" });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ errors: "Something error" });
      }
    });
  },
  doLogin: (req, res) => {
    return new Promise(async (resolve, reject) => {
      console.log(req.body);
      let { Email, Password } = req.body;
      try {
        let student = await db
          .get()
          .collection(collection.STUDENT_COLLECTION)
          .findOne({ Email });
        console.log(student);
        if (student) {
          let status = await bcrypt.compare(Password, student.hashedPassword);
          if (status) {
            delete student.hashedPassword;
            return res
              .status(200)
              .json({ message: "Signed in successfully", student });
          } else {
            return res.status(401).json({ errors: "Incorrect password" });
          }
        } else {
          return res.status(404).json({ errors: "Student doesnot exist" });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ errors: "Something error" });
      }
    });
  },
  editProfile: (req, res) => {
    return new Promise((resolve, reject) => {
      console.log(req.body);
      try {
        db.get().collection(collection.STUDENT_COLLECTION).updateOne({})
      } catch (error) {
        console.log(error);
        return res.status(500).json({ errors: "Sometthing error" });
      }
    });
  },
};
