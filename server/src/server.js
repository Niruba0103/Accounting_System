const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const app = require('./app');

console.log('DB_HOST =', process.env.DB_HOST);
console.log('DB_USER =', process.env.DB_USER);
console.log('DB_NAME =', process.env.DB_NAME);
console.log('JWT_SECRET =', process.env.JWT_SECRET);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});