import {  getJoinedSongData, checkIfCrawled, insertBatch} from "./HT_database.js";
import { getSpotifyMetadataObject } from "./spotify_meta.js";


//BRAINSTORM:
//merge to hookpad repo --> notescripts where all the crawls live and where the cron lives
//how often is the api limit for spotify??? --> crawl first 1000 now and crawl next 1000 later? 
//around 47,000 songs on ht_database

//start of the database crawl function 
async function databaseCrawl() {
    try {
        const batchSize = 50;
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
                    try {
                    const customObject = await getSpotifyMetadataObject(row.ID);
                    customObjectArray.push(customObject);
                    console.log("pushing custom Object to array:", customObject)
                    } catch(error) {
                        if(error.statusCode === 429) {
                            const waitTime = error.retryAfter || 30000;
                            console.log(`Rate Limit Hit! waiting for ${waitTime / 1000} seconds before retrying...`)
                            await new Promise(resolve => setTimeout(resolve, waitTime));
                        }
                    }
                }
            }
            if (customObjectArray.length > 0) {
                await insertBatch(customObjectArray)
            }
            if (songDataBatch.length < batchSize) {
                hasMoreData = false; 
            } else {
                console.log(`Processed a batch of ${batchSize} songs, waiting for 30 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 30000));
                offset += songDataBatch.length;
                iterationCount++; // move offset to the next batch
            }
        }
  
    } catch (error) {
        console.error("Error processing wiki rows:", error);
    }
}


databaseCrawl();




