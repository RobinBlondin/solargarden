import { AlbumModel } from "../models/albumModel.js";

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
      const links = getAlbumLinks(item.external_urls.spotify);
      console.log("Links for album", item.name, links);
      return new AlbumModel(
        item.name,
        item.release_date,
        item.images[0]?.url || "",
        links
      );
    })
  );

  console.log("Fetched albums:", albums);
  return albums;
}

async function getAlbumLinks(spotifyAlbumUrl) {
  const response = await fetch(
    `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(
      spotifyAlbumUrl
    )}`
  );
  const data = await response.json();

  if (!data) {
    return null;
  }

  return new AlbumModel(
    data.linksByPlatform.spotify?.url || "",
    data.linksByPlatform.appleMusic?.url || "",
    data.linksByPlatform.itunes?.url || "",
    data.linksByPlatform.youtubeMusic?.url || "",
    data.linksByPlatform.amazonMusic?.url || "",
    data.linksByPlatform.boomplay?.url || "",
    data.linksByPlatform.deezer?.url || "",
    data.linksByPlatform.tidal?.url || "",
    data.linksByPlatform.pandora?.url || ""
  );
}

document.addEventListener("DOMContentLoaded", (event) => {
  getSpotifyAlbums("3j005h5jbfkStCqpaugreW").then((albums) => {
    const albumsContainer = document.querySelector(".albums");
    albums.forEach((album) => {
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
          <a class="album-link" href="${album.links.appleMusic}" target="_blank">
            <img src="images/icons/apple.png" alt="Apple Music" width="24" height="24">
          </a>
          <a class="album-link" href="${album.links.itunes}" target="_blank">
            <img src="images/icons/itunes.png" alt="iTunes" width="24" height="24">
          </a>
          <a class="album-link" href="${album.links.youtubeMusic}" target="_blank">
            <img src="images/icons/youtube-music.png" alt="YouTube Music" width="24" height="24">
          </a>
          <a class="album-link" href="${album.links.amazonMusic}" target="_blank">
            <img src="images/icons/amazon.png" alt="Amazon Music" width="24" height="24">
          </a>
          <a class="album-link" href="${album.links.boomplay}" target="_blank">
            <img src="images/icons/boomplay.png" alt="Boomplay" width="24" height="24">
          </a>
          <a class="album-link" href="${album.links.deezer}" target="_blank">
            <img src="images/icons/deezer.png" alt="Deezer" width="24" height="24">
          </a>
          <a class="album-link" href="${album.links.tidal}" target="_blank">
            <img src="images/icons/tidal.png" alt="Tidal" width="24" height="24">
          </a>
          <a class="album-link" href="${album.links.pandora}" target="_blank">
            <img src="images/icons/pandora.png" alt="Pandora" width="24" height="24">
          </a>
        </div>
      `;
      albumsContainer.appendChild(albumElement);
    });
  });
});
