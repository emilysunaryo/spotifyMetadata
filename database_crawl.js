import { checkDatabaseConnection, getJoinedSongData } from "./HT_database.js";
import { getToken, searchTrack, getTrackInfo, getTrackMetadata } from "./spotify_api.js";

async function getSpotifyTrackIDs() {
    const spotifyIDs = {};
    await checkDatabaseConnection();
    const songData = await getJoinedSongData();
    const tokenResponse = await getToken();
    const accessToken = tokenResponse.access_token;

    //still have access to the wiki id in the songData 
    for (const song of songData) {
        const artistName = song.artist;
        const songTitle = song.song;
        const songID = song.ID;
        console.log("testing songID output:", songID)
        try {
            const trackId = await searchTrack(artistName, songTitle, accessToken);
            console.log("Spotify ID:", trackId);
            spotifyIDs[songID] = trackId;
            // spotifyIDs.push(trackId)

        //     const trackInfo = await getTrackInfo(trackId, accessToken);
        //     console.log("Track Info:", trackInfo);
        } catch (error) {
            console.error("Error getting track info:", error);
        }
    }
    console.log("testing spotify dictionary mapping:", spotifyIDs)
    return spotifyIDs
}

getSpotifyTrackIDs();

//change ID key back into int from string!!
// async function getSpotifyMetadataObjects() {
//     const tokenResponse = await getToken();
//     const accessToken = tokenResponse.access_token;
//     const spotifyIds = getSpotifyTrackIDs();
//     for (const id of spotifyIds) {

//     }
//     const trackInfo = await getTrackInfo(trackId, accessToken);
//        console.log("Track Info:", trackInfo);



// }

let customObject = {
    wikiID: 0,
    spotifyID: 0,
    songName: "",
    artistName: "",
    year: 0,
    genre: "",
    acousticness: 0,

}

// export {getSpotifyMetadataObjects}

// getToken().then(response => {
//     getTrackInfo("11dFghVXANMlKmJXsNCbNl", response.access_token).then(profile => {
//       console.log(profile)
//     })
//   });




