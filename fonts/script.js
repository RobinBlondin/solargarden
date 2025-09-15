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

  const albums = await albumsResponse
    .json()
    .then((data) =>
      data.items.map(
        (item) =>
          new AlbumModel(
            item.name,
            item.release_date,
            item.images[0]?.url || "",
            item.external_urls.spotify
          )
      )
    );

  console.log("Fetched albums:", albums);
  return albums;
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
          <a class="album-link" href="${album.link}" target="_blank">
            <img src="images/icons/spotify.png" alt="Spotify" width="24" height="24">
          </a>
        </div>
      `;
      albumsContainer.appendChild(albumElement);
    });
  });
});
