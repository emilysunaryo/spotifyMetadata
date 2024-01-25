import {  getJoinedSongData, checkIfCrawled, insertBatch} from "./HT_database.js";
import { getSpotifyMetadataObject } from "./spotify_meta.js";


//BRAINSTORM:
//merge to hookpad repo --> notescripts where all the crawls live and where the cron lives
//how often is the api limit for spotify??? --> crawl first 1000 now and crawl next 1000 later? 
//around 47,000 songs on ht_database

//start of the database crawl function 
async function databaseCrawl() {
    try {
        const batchSize = 20;
        let offset = 0;
        let hasMoreData = true;
        let iterationCount = 0; 
        const maxIterations = 3; 
        while(hasMoreData && iterationCount < maxIterations) {
            const songDataBatch = await getJoinedSongData(batchSize, offset);
            const customObjectArray = [];
            for (const row of songDataBatch) {
                const crawled = await checkIfCrawled(row.ID);
                if (!crawled) {
                    const customObject = await getSpotifyMetadataObject(row.ID);
                    customObjectArray.push(customObject);
                    console.log("pushing custom Object to array:", customObject)
                }
            }
            if (customObjectArray.length > 0) {
                await insertBatch(customObjectArray)
            }
            if (songDataBatch.length < batchSize) {
                hasMoreData = false; 
            } else {
                offset += songDataBatch.length;
                iterationCount++; // move offset to the next batch
            }
        }
  
    } catch (error) {
        console.error("Error processing wiki rows:", error);
    }
}


databaseCrawl();




