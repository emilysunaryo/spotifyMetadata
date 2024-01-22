import { checkDatabaseConnection, getJoinedSongData, checkIfCrawled} from "./HT_database.js";
import { getSpotifyMetadataObject } from "./spotify_meta.js";


//BRAINSTORM:
//merge to hookpad repo --> notescripts where all the crawls live and where the cron lives
//how often is the api limit for spotify??? --> crawl first 1000 now and crawl next 1000 later? 
//around 47,000 songs on ht_database

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
                    const customObject = await getSpotifyMetadataObject(row.ID);
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




