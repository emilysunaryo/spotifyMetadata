
import mysql from 'mysql2';

// Create a connection pool using mysql2's promise-based API
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',  
    password: 'root',  
    socketPath  : '/Applications/MAMP/tmp/mysql/mysql.sock',
    database: 'HTDB_local'  
}).promise();

async function checkDatabaseConnection() {
    try {
  
      const connection = await pool.getConnection();
      console.log('Successfully connected to the database. Connection ID:', connection.threadId);

      connection.release();
    } catch (error) {
      console.error('Error connecting to the database:', error);
    }
  }

  // checkDatabaseConnection()

async function getJoinedSongData() {
  try {
      const query = `
          SELECT ht_songs.ID, ht_songs.artist, ht_songs.song 
          FROM ht_songs
          JOIN wiki ON ht_songs.ID = wiki.ht_songs_id
          LIMIT 10
      `;
      const [rows, fields] = await pool.query(query);
      console.log(rows);
      return rows
  } catch (err) {
      console.error('Error during database query', err);
  }
}

async function getJoinedSongDataById(songId) {
  try {
      const query = `
          SELECT ht_songs.ID, ht_songs.artist, ht_songs.song 
          FROM ht_songs
          JOIN wiki ON ht_songs.ID = wiki.ht_songs_id
          WHERE ht_songs.ID = ?
          LIMIT 1
      `;
      const [rows, fields] = await pool.query(query, [songId]);
      console.log(rows);
      return rows.length > 0 ? rows[0] : null;
  } catch (err) {
      console.error('Error during database query', err);
  }
}

// getJoinedSongDataById(3850);


export { getJoinedSongData, getJoinedSongDataById, checkDatabaseConnection};