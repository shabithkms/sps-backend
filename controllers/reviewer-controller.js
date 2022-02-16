const db = require('../config/connection');
const collection = require('../config/collection');
const bcrypt = require('bcryptjs/dist/bcrypt');

module.exports = {
  doLogin: async (req, res) => {
    console.log(req.body);
    try {
      const { Email, Password } = req.body;
      let reviewer = await db.get().collection(collection.REVIEWER_COLLECTION).findOne({ Email });

      if (reviewer) {
        let status = await bcrypt.compare(Password, reviewer.Password);
        if (status) {
          delete reviewer.Password;
          res.status(200).json({ message: 'Loggedin successfully', reviewer });
        } else {
          res.status(401).json({ errors: 'Incorrect passowrd' });
        }
      } else {
        return res.status(401).json({ errors: "Reviewer doesn't exist" });
      }
      console.log(reviewer);
    } catch (error) {
      console.log(error);
      res.status(500).json({ errors: error.message });
    }
  },
  doSignup: async (req, res) => {
    try {
      const { Name, Email, Password } = req.body;
      const hashedPassword = await bcrypt.hash(Password, 10);
      const exist = await db.get().collection(collection.REVIEWER_COLLECTION).findOne({ Email });
      if (!exist.Registered) {
        const update = await db
          .get()
          .collection(collection.REVIEWER_COLLECTION)
          .updateOne(
            { Email },
            {
              $set: {
                Name,
                Email,
                Password: hashedPassword,
                Registered: true,
              },
            },
            { upsert: true }
          );
        const reviewer = await db.get().collection(collection.REVIEWER_COLLECTION).findOne({ Email });
        delete reviewer.Password;
        return res.status(200).json({ message: 'Registered successfully', reviewer });
      } else {
        console.log('already');
        return res.status(400).json({ errors: 'This email is already registered' });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: error.message });
    }
  },
};
