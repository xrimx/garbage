// ==MiruExtension==
// @name         Anime3rb
// @version      v0.0.1
// @author       YourName
// @lang         en
// @license      MIT
// @package      anime3rb.com
// @type         bangumi
// @icon         https://anime3rb.com/favicon.ico
// @webSite      https://anime3rb.com
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/page/${page}/`);
    const animeList = await this.querySelectorAll(res, "div.anime-card");
    const anime = [];
    for (const element of animeList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a.anime-title", "href");
      const title = await this.querySelector(html, "a.anime-title").text;
      const cover = await this.querySelector(html, "img.anime-poster").getAttributeText("src");
      anime.push({
        title: title.trim(),
        url,
        cover,
      });
    }
    return anime;
  }

  async search(kw) {
    const res = await this.request(`/search?q=${encodeURIComponent(kw)}`);
    const animeList = await this.querySelectorAll(res, "div.anime-card");
    const anime = [];
    for (const element of animeList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a.anime-title", "href");
      const title = await this.querySelector(html, "a.anime-title").text;
      const cover = await this.querySelector(html, "img.anime-poster").getAttributeText("src");
      anime.push({
        title: title.trim(),
        url,
        cover,
      });
    }
    return anime;
  }

  async detail(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
      },
    });

    const title = await this.querySelector(res, "h1.anime-title").text;
    const cover = await this.querySelector(res, "img.anime-poster").getAttributeText("src");
    const desc = await this.querySelector(res, "div.anime-description").text;

    // Fetch episode list
    const episodeList = await this.querySelectorAll(res, "a.episode-link");
    const episodes = [];
    for (const element of episodeList) {
      const html = await element.content;
      const name = await this.querySelector(html, "a.episode-link").text;
      const episodeUrl = await this.getAttributeText(html, "a.episode-link", "href");
      episodes.push({
        name: name.trim(),
        url: episodeUrl,
      });
    }

    return {
      title: title.trim(),
      cover,
      desc: desc.trim(),
      episodes: [
        {
          title: "Episodes",
          urls: episodes,
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
      },
    });

    const urlPatterns = [/https?:\/\/files-3\.vid3rb\.com\/files\/[^"]+\.mp4[^"]*/];
    let videoUrl = "";

    for (const pattern of urlPatterns) {
      const match = res.match(pattern);
      if (match) {
        videoUrl = match[0];
        break;
      }
    }

    return {
      type: "hls",
      url: videoUrl || "",
    };
  }
}
