export class AlbumModel {
  constructor(
    title,
    releaseDate,
    cover,
    spotifyUrl,
    appleMusicUrl,
    youtubeMusicUrl,
    amazonMusicUrl
  ) {
    this.title = title;
    this.releaseDate = releaseDate;
    this.cover = cover;
    this.spotifyUrl = spotifyUrl;
    this.appleMusicUrl = appleMusicUrl;
  }
}
