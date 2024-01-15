import "dotenv/config.js";


//spotify auth flow, query functions/api calls, and custom object will live here 
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
 
  const combinedQuery = `${artistName} ${trackName}`.replace(/ /g, '+');
  const encodedQuery = encodeURIComponent(combinedQuery).replace(/%27/g, "'");
  const url = `https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=1`;
  
  console.log("Final URL:", url);

  const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + access_token },
    });
  const spotifyResponse = await response.json();
  console.log("testing output of undefined searchTrack function:", spotifyResponse.tracks.items[0].id)
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


// getToken().then(response => {
//   searchTrack("Buddy Holly", "That'll Be The Day", response.access_token).then(profile => {
//   })
// });


