import mongoose from "mongoose";
import 'dotenv/config';
const MONGO_URI = process.env.MONGO_URI;
console.log(process.env.MONGO_URI);
function connect() {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      console.error("Failed to connect to MongoDB");
      console.log(error.message);
    });


}
export default connect;