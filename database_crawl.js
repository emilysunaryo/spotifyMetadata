import { checkDatabaseConnection, getJoinedSongData, getWikiData } from "./HT_database.js";
import { getToken, searchTrack, getTrackInfo, getTrackMetadata } from "./spotify_api.js";


//isPopulated will check if the songSpotifyMetadata has already been populated or not
async function checkIfPopulated(dbconnection, wikiID) {
    const query = 'SELECT isPopulated FROM songSpotifyMetadata WHERE wikiID = ?';
    try {
        const results = await dbconnection.query(query, [wikiID]);
        if (results.length > 0 && results[0].isPopulated) {
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error in checkIfPopulated:", error);
        throw error;
    }
}

async function processWikiRows() {
    try {
        const dbconnection = await checkDatabaseConnection();
        const wikiRows = await getWikiData();

        for (const row of wikiRows) {
            const populated = await checkIfPopulated(dbconnection, row.wikiID);
            if (!populated) {
                const spotifyID = await searchTrack(row.artistName, row.songName, accessToken);
                const trackInfo = await getTrackInfo(spotifyID, accessToken);
                const trackMeta = await getTrackMetadata(spotifyID, accessToken);

                let customObject = {
                    wikiID: row.wikiID,
                    spotifyID: spotifyID,
                    songName: trackInfo.name,
                    // ... other fields
                };

                await insertOrUpdateSongSpotifyMetadata(dbconnection, customObject);
            }
        }
    } catch (error) {
        console.error("Error processing wiki rows:", error);
    }
}