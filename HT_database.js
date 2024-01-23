
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

  async function getJoinedSongData(batchSize, offset) {
    try {
        const query = `
            SELECT ht_songs.ID, ht_songs.artist, ht_songs.song 
            FROM ht_songs
            JOIN wiki ON ht_songs.ID = wiki.ht_songs_id
            LIMIT ?, ?
        `;
        const [rows, fields] = await pool.query(query, [offset, batchSize]);
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

//isCrawled will check if the songSpotifyMetadata has already been populated or not, default set to false
async function checkIfCrawled(wikiID) {
  const query = 'SELECT isCrawled FROM songSpotifyMetadata WHERE wikiID = ?';
  try {
      const results = await pool.query(query, [wikiID]);
      if (results.length > 0 && results[0].isCrawled) {
          return true;
      }
      return false;
  } catch (error) {
      console.error("Error in checkIfPopulated:", error);
      throw error;
  }
}

async function checkSpotifyMetaDataInsertion() {
  const query = `SELECT * FROM songSpotifyMetadata`;
  try {
    const results = await pool.query(query);
    console.log("testing results from songSpotifyMeta table", results)

  } catch(error) {
    console.log("error fetching data from songSpotifyMeta", error);

  }

}

//batch sending 1000 at a time
async function insertBatch(data) {
  const query = `
  INSERT INTO songSpotifyMetadata (
      wikiID, spotifyID, songName, artistName, year, genre,
      acousticness, danceability, duration_ms, energy, instrumentalness,
      time_signature, \`key\`, liveness, loudness, tempo, valence, isCrawled
  ) VALUES ?
  ON DUPLICATE KEY UPDATE
      spotifyID = VALUES(spotifyID),
      songName = VALUES(songName),
      artistName = VALUES(artistName),
      year = VALUES(year),
      genre = VALUES(genre),
      acousticness = VALUES(acousticness),
      danceability = VALUES(danceability),
      duration_ms = VALUES(duration_ms),
      energy = VALUES(energy),
      instrumentalness = VALUES(instrumentalness),
      time_signature = VALUES(time_signature),
      \`key\` = VALUES(\`key\`),
      liveness = VALUES(liveness),
      loudness = VALUES(loudness),
      tempo = VALUES(tempo),
      valence = VALUES(valence),
      isCrawled = VALUES(isCrawled);
`;
  const values = data.map(item => Object.values(item));
  try {
    console.log("Initiating database push with data:", values);
    const result = await pool.query(query, [values]);
    console.log("Database push complete, result:", result);
} catch (error) {
    console.error('Error during batch insert:', error);
    throw error; 
  }
}

checkSpotifyMetaDataInsertion();


export { 
  getJoinedSongData,
  getJoinedSongDataById,
  checkDatabaseConnection, 
  checkIfCrawled, 
  insertBatch
};