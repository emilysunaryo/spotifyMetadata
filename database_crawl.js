import { checkDatabaseConnection, getJoinedSongData } from "./HT_database.js";
import { getToken, searchTrack, getTrackInfo, getTrackMetadata } from "./spotify_api.js";

async function getSpotifyTrackIDs() {
    const spotifyIDs = {};
    await checkDatabaseConnection();
    const songData = await getJoinedSongData();
    const tokenResponse = await getToken();
    const accessToken = tokenResponse.access_token;

    for (const song of songData) {
        const artistName = song.artist;
        const songTitle = song.song;
        const songID = song.ID;
        console.log("testing songID output:", songID)
        try {
            const trackId = await searchTrack(artistName, songTitle, accessToken);
            console.log("Spotify ID:", trackId);
            spotifyIDs[songID] = trackId;
        } catch (error) {
            console.error("Error getting track info:", error);
        }
    }
    console.log("testing spotify dictionary mapping:", spotifyIDs)
    return spotifyIDs
}


// change ID key back into int from string!!
async function getSpotifyMetadataObjects() {
    const allMetaObjects = [];
    const tokenResponse = await getToken();
    const accessToken = tokenResponse.access_token;
    const spotifyIds = await getSpotifyTrackIDs();
    console.log("testing output of dictionary:", spotifyIds)
    for (const key in spotifyIds) {
        if (spotifyIds.hasOwnProperty(key)) {
            const value = spotifyIds[key];

            const trackInfo = await getTrackInfo(value , accessToken);
            console.log("Track Info:", trackInfo);

            const trackMeta = await getTrackMetadata(value , accessToken);
            console.log("Track Info:", trackMeta);
            let customObject = {
                wikiID: parseInt(key), 
                spotifyID: value,
                songName: trackMeta.name, 
                artistName: trackMeta.artists[0].name, 
                year: parseInt(trackMeta.album.release_date.slice(0, 4)), 
                genre: trackMeta.genres[0], 
                acousticness: trackInfo.acousticness,
                danceability: trackInfo.danceability,
                duration_ms: trackInfo.duration_ms,
                energy: trackInfo.energy,
                instrumentalness: trackInfo.instrumentalness,
                time_signature: trackInfo.time_signature,
                key: trackInfo.key,
                liveness: trackInfo.liveness,
                loudness: trackInfo.loudness,
                tempo: trackInfo.tempo,
                valence: trackInfo.valence
            };
            allMetaObjects.push(customObject);
            console.log("Custom Object:", customObject)
        }
    }
}

getSpotifyMetadataObjects();

let customObject = {
    wikiID: 0,
    spotifyID: 0,
    songName: "",
    artistName: "",
    year: 0,
    genre: "",
    acousticness: 0,
    danceability: 0,
    duration_ms: 0,
    energy: 0,
    instrumentalness: 0,
    time_signature: 0,
    key: 0,
    liveness: 0,
    loudness: 0,
    tempo: 0,
    valence: 0
}

export {getSpotifyMetadataObjects}

// getToken().then(response => {
//     getTrackInfo("11dFghVXANMlKmJXsNCbNl", response.access_token).then(profile => {
//       console.log(profile)
//     })
//   });




