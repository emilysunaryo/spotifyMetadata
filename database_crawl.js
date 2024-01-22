import { checkDatabaseConnection, getJoinedSongData} from "./HT_database.js";
import { getSpotifyMetadataObjects } from "./spotify_meta.js";


//BRAINSTORM:
//brainstorm isCrawled flag, could populate a model with nothing in it: 'not found' if song does not exist on spotify???
//link wiki to corresponding model in second table - list of wiki: spotifymetaId
//merge to hookpad repo --> notescripts where all the crawls live and where the cron lives
//how often is the api limit for spotify??? --> crawl first 1000 now and crawl next 1000 later? 
//around 47,000 --> 


//isCrawled will check if the songSpotifyMetadata has already been populated or not, default set to false
async function checkIfCrawled(dbconnection, wikiID) {
    const query = 'SELECT isCrawled FROM songSpotifyMetadata WHERE wikiID = ?';
    try {
        const results = await dbconnection.query(query, [wikiID]);
        if (results[0].isCrawled) {
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error in checkIfPopulated:", error);
        throw error;
    }
}

//start of the database crawl function 
async function databaseCrawl() {
    try {
        const dbconnection = await checkDatabaseConnection();
        const batchSize = 1000;
        let offset = 0;
        let hasMoreData = true;
        while(hasMoreData) {
            const songDataBatch = await getJoinedSongData(batchSize, offset);
            const customObjectArray = [];
            for (const row of songDataBatch) {
                const crawled = await checkIfCrawled(dbconnection, row.ID);
                if (!crawled) {
                    const customObject = await getSpotifyMetadataObjects(row.ID);
                    customObjectArray.push(customObject);
                }
            }
            if (customObjectArray.length > 0) {
                await insertBatch(dbconnection, customObjectArray)
            }
            if (songDataBatch.length < batchSize) {
                hasMoreData = false; // No more data to process
            } else {
                offset += songDataBatch.length; // Move offset to the next batch
            }
        }
  
    } catch (error) {
        console.error("Error processing wiki rows:", error);
    }
}

//ususally batch sending 1000 at a time
async function insertBatch(dbconnection, data) {
    const query = `
        INSERT INTO songSpotifyMetadata (
            wikiID, spotifyID, songName, artistName, year, genre,
            acousticness, danceability, duration_ms, energy, instrumentalness,
            time_signature, key, liveness, loudness, tempo, valence, isPopulated
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
            key = VALUES(key),
            liveness = VALUES(liveness),
            loudness = VALUES(loudness),
            tempo = VALUES(tempo),
            valence = VALUES(valence),
            isCrawled = VALUES(isCrawled);
    `;

    const values = data.map(item => Object.values(item));
    await dbconnection.query(query, [values]);
}

