
import mysql from 'mysql2';

// Create a connection pool using mysql2's promise-based API
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',  // replace with your database username
    password: 'root',  // replace with your database password
    socketPath  : '/Applications/MAMP/tmp/mysql/mysql.sock',
    database: 'HTDB_local'  // replace with your database name
}).promise();


async function checkDatabaseConnection() {
    try {
      // Get a connection from the pool
      const connection = await pool.getConnection();
  
      console.log('Successfully connected to the database. Connection ID:', connection.threadId);
  
      // Release the connection back to the pool
      connection.release();
    } catch (error) {
      console.error('Error connecting to the database:', error);
    }
  }

  // checkDatabaseConnection()

//should be able to create a 
async function getAllData() {
    try {
        // Replace 'your_table' with the actual table name
        const [rows, fields] = await pool.query('SELECT * FROM wiki');
        console.log(rows);
    } catch (err) {
        console.error('Error during database query', err);
    }
}

async function getAllHTSongData() {
  try {
      // Replace 'your_table' with the actual table name
      const [rows, fields] = await pool.query('SELECT * FROM ht_songs LIMIT 10');
      console.log(rows);
  } catch (err) {
      console.error('Error during database query', err);
  }
}

async function getJoinedSongData() {
  try {
      const query = `
          SELECT ht_songs.ID, ht_songs.artist, ht_songs.song 
          FROM ht_songs
          JOIN wiki ON ht_songs.ID = wiki.ht_songs_id
          LIMIT 4
      `;
      const [rows, fields] = await pool.query(query);
      console.log(rows);
      return rows
  } catch (err) {
      console.error('Error during database query', err);
  }
}


export { getJoinedSongData, checkDatabaseConnection};