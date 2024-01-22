import { checkDatabaseConnection, getJoinedSongDataById } from "./HT_database.js";
import { getToken, searchTrack, getTrackInfo, getTrackMetadata } from "./spotify_api.js";


//spotify_meta.js will create the custom object that will be pushed into the songSpotifyMetadata table in sequel pro

async function getSpotifyTrackIDs(songID) {
    const spotifyIDs = {};
    await checkDatabaseConnection();
    const songData = await getJoinedSongDataById(songID);
    const tokenResponse = await getToken();
    const accessToken = tokenResponse.access_token;
    const artistName = songData.artist;
    const songTitle = songData.song;
    const wikiSongID = songData.ID
        try {
            const trackId = await searchTrack(artistName, songTitle, accessToken);
            console.log("Spotify ID:", trackId);
            spotifyIDs[wikiSongID] = trackId;
        } catch (error) {
            spotifyIDs[wikiSongId] = null;
            console.error("Error getting track info:", error);
        }
    
    return spotifyIDs
}
getSpotifyTrackIDs(3850)

function getGenreString(genres) {
    if (genres && genres.length > 0) {
        return genres.join(', ');
    } else {
        return '';
    }
}

// this function returns a metadata object for a given wikiID
async function getSpotifyMetadataObject(songID) {
    const tokenResponse = await getToken();
    const accessToken = tokenResponse.access_token;
    const spotifyId = await getSpotifyTrackIDs(songID);
    console.log("testing output of getSpotifyTrackIDs:", spotifyId)
    
    const value = spotifyId[songID];
    //check to see if the song does not exist in spotify api, returns empty object
    if (!value) {  // If value is null or undefined, meaning the track was not found
        return {
            wikiID: songID, 
            spotifyID: null,
            songName: null, 
            artistName: null, 
            year: 0, 
            genre: null,
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
            valence: 0,
            isCrawled: 1
        };
    }
    
    console.log("testing dictionary grab of value:", value)

    const trackInfo = await getTrackInfo(value , accessToken);
    const trackMeta = await getTrackMetadata(value , accessToken);

        customObject = {
            wikiID: songID, 
            spotifyID: value,
            songName: trackInfo.name, 
            artistName: trackInfo.artists[0].name, 
            year: parseInt(trackInfo.album.release_date.slice(0, 4)), 
            genre: getGenreString(trackInfo.artists[0].genres), //genres that are associated with the artist, not the specific track
            acousticness: trackMeta.acousticness,
            danceability: trackMeta.danceability,
            duration_ms: trackMeta.duration_ms,
            energy: trackMeta.energy,
            instrumentalness: trackMeta.instrumentalness,
            time_signature: trackMeta.time_signature,
            key: trackMeta.key,
            liveness: trackMeta.liveness,
            loudness: trackMeta.loudness,
            tempo: trackMeta.tempo,
            valence: trackMeta.valence,
            isCrawled: 1
            };
    console.log("Custom Object:", customObject)
    return customObject
}

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
    valence: 0,
    isCrawled: 0
}

export {getSpotifyMetadataObject}






