const db = require('../config/connection');
const collection = require('../config/collection');

module.exports = {
  editProfile: (req) => {
    return new Promise((resolve, reject) => {
      console.log('fn call');
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
          .then(async () => {
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

            // res.status(200).json({ message: 'updated successfully', student });
            resolve({ message: 'updated successfully', student });
          });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  },
};
