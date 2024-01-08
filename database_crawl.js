import { checkDatabaseConnection, getJoinedSongData } from "./HT_database.js";
import { getToken, searchTrack, getTrackInfo, getTrackMetadata } from "./spotify_api.js";


async function getSpotifyTrackIDs() {
    await checkDatabaseConnection();
    const songData = await getJoinedSongData();
    songData.forEach(song => {
        const artistName = song.artist;
        console.log(artistName);
        const songTitle = song.song;
        console.log(songTitle);
        getToken().then(response => {
            searchTrack(artistName,songTitle, response.access_token).then(id => {
              console.log("spotify ID:", id)
            })
          });
    })
  
}

getSpotifyTrackIDs()

// getToken().then(response => {
//     getTrackInfo("11dFghVXANMlKmJXsNCbNl", response.access_token).then(profile => {
//       console.log(profile)
//     })
//   });


