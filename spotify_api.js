import "dotenv/config.js";


//spotify auth flow, query functions/api calls, and custom object will live here 
//export custom object from this page into the 
const spotifyClientId = process.env.SPOTIFY_API_CLIENT_ID;
const spotifyClientSecret = process.env.SPOTIFY_API_CLIENT_SECRET;


// console.log("testing process.env", spotifyClientId)
async function getToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body: new URLSearchParams({
      'grant_type': 'client_credentials',
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (Buffer.from(spotifyClientId + ':' + spotifyClientSecret).toString('base64')),
    },
  });

  return await response.json();
}

//this function will return the unique spotify ID for a given track, taking in the artist name and track name as inputs
//need to take artist name and track name from backend database 
async function searchTrack(artistName, trackName, access_token) {
    const query = encodeURIComponent(`artist:${artistName} track:${trackName}`);
    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + access_token },
    });
    const spotifyResponse = await response.json();
    // console.log("testing extraction of ID from Spotify Response:", spotifyResponse.tracks.items[0] )
    const songID = spotifyResponse.tracks.items[0].id;
    return songID
}

async function getTrackInfo(trackID, access_token) {
  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackID}`, {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + access_token },
  });

  return await response.json();
}

async function getTrackMetadata(trackID, access_token) {
    const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackID}`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + access_token },
      });
    return await response.json();

}


export {getToken, searchTrack, getTrackInfo, getTrackMetadata}


getToken().then(response => {
  searchTrack("Buddy Holly", "That'll Be The", response.access_token).then(profile => {
    console.log(profile)
  })
});


