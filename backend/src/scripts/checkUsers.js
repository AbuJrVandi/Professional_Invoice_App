const db = require('../config/database');

// Query all users
db.all('SELECT id, fullName, email, username FROM users', [], (err, rows) => {
  if (err) {
    console.error('Error querying users:', err);
    process.exit(1);
  }
  
  console.log('Existing users in database:');
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}); 