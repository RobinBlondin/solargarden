import { AlbumLinks } from "../models/albumLinks.js";
import { AlbumModel } from "../models/albumModel.js";

let albums = [];
let startIndex = 0;

async function getSpotifyAlbums(artistId) {
  const tokenResponse = await fetch("http://localhost:3000/api/spotify/token");
  const { access_token } = await tokenResponse.json();

  const albumsResponse = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&market=US&limit=50`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  const albums = await albumsResponse.json().then((data) =>
    data.items.map((item) => {
      const links = new AlbumLinks();
      links.spotifyUrl = item.external_urls.spotify;

      return new AlbumModel(
        item.name,
        item.release_date,
        item.images[0]?.url || "",
        links
      );
    })
  );

  return albums;
}

async function getAlbumLinks(spotifyUrl) {
  const res = await fetch(
    `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(
      spotifyUrl
    )}`
  );
  const data = await res.json();

  const platforms = data.linksByPlatform;

  const links = {
    spotify: platforms.spotify?.url,
    appleMusic: platforms.appleMusic?.url || platforms.itunes?.url,
    amazon: platforms.amazonMusic?.url,
    youtubeMusic: platforms.youtubeMusic?.url,
  };

  /* if (!links.youtubeMusic) {
    links.youtubeMusic = await findYouTubeMusicLink(
      data.entitiesByUniqueId[data.entityUniqueId].title,
      data.entitiesByUniqueId[data.entityUniqueId].artistName
    );
  } */

  return links;
}

async function findYouTubeMusicLink(albumTitle, artistName) {
  const query = `${albumTitle} ${artistName}`;
  const apiKey = "apikey";

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=playlist&q=${encodeURIComponent(
      query
    )}&key=${apiKey}`
  );
  const json = await res.json();

  const playlist = json.items[0];
  if (playlist) {
    return `https://music.youtube.com/playlist?list=${playlist.id.playlistId}`;
  }
  return null;
}

export function updateIndex(direction) {
  if (direction === "next") {
    startIndex += 1 % albums.length;
  } else {
    startIndex -= 1 % albums.length;
  }
  paintAlbums();
}

function paintAlbums() {
  for (let i = 0; i < 5; i++) {
    const index = (startIndex + i) % albums.length;
    console.log(albums.length, index);
    const album = albums[index];
    console.log("Album", album);
    document.getElementById(`album-title${i}`).textContent = album.title;
    document
      .getElementById(`album-cover-img${i}`)
      .setAttribute("src", album.cover);
    document
      .getElementById(`album-cover-img${i}`)
      .setAttribute("alt", album.title);
    document
      .getElementById(`album-link-spotify${i}`)
      .setAttribute("href", album.links.spotify);
    document
      .getElementById(`album-link-youtube${i}`)
      .setAttribute("href", album.links.youtubeMusic);
    document
      .getElementById(`album-link-itunes${i}`)
      .setAttribute("href", album.links.itunes);
    document
      .getElementById(`album-link-amazon${i}`)
      .setAttribute("href", album.links.amazon);
  }
}

document.getElementById("next-button").addEventListener("click", () => {
  updateIndex("next");
});

document.getElementById("prev-button").addEventListener("click", () => {
  updateIndex("prev");
});

document.addEventListener("DOMContentLoaded", async (event) => {
  albums = await getSpotifyAlbums("3j005h5jbfkStCqpaugreW");

  for (const album of albums) {
    if (!album.links.spotifyUrl) continue;
    const links = await getAlbumLinks(album.links.spotifyUrl);
    if (links) {
      album.links = links;
    }
  }

  setTimeout(() => {
    paintAlbums();
  }, 5000);

  /* for (const album of albums) {
    const albumElement = document.createElement("div");
    albumElement.classList.add("album");
    albumElement.innerHTML = `
        <div class="album-title">${album.title}</div>
        <div class="album-cover">
            <img class="album-cover-img" src="${album.cover}" alt="${album.title}">
        </div>
        <div class="album-links">
          <a class="album-link" href="${album.links.spotify}" target="_blank">
            <img src="images/icons/spotify.png" alt="Spotify" width="24" height="24">
          </a>
           <a class="album-link" href="${album.links.youtubeMusic}" target="_blank">
            <img src="images/icons/youtube-music.png" alt="YouTube Music" width="24" height="24">
          </a>
          <a class="album-link" href="${album.links.appleMusic}" target="_blank">
            <img src="images/icons/itunes.png" alt="iTunes" width="24" height="24">
          </a>
         
          <a class="album-link" href="${album.links.amazon}" target="_blank">
            <img src="images/icons/amazon.png" alt="Amazon Music" width="24" height="24">
          </a>
        </div>
      `;
    albumsContainer.appendChild(albumElement);
  } */
});
