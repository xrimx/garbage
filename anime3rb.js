// ==MiruExtension==
// @name         Anime3rb
// @version      v0.0.2
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
    try {
      // Assuming pagination for latest is similar to search, e.g., /?page=2
      const res = await this.request(`/?page=${page}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });
      const animeList = await this.querySelectorAll(res, "div.anime-card");
      const anime = [];
      for (const element of animeList) {
        const html = await element.content;
        const url = await this.getAttributeText(html, "a.anime-title", "href");
        const title = await this.querySelector(html, "a.anime-title").text;
        const cover = await this.querySelector(html, "img.anime-poster").getAttributeText("src");
        if (title && url && cover) {
          anime.push({
            title: title.trim(),
            url,
            cover,
          });
        }
      }
      if (anime.length === 0) {
        console.warn("No anime found on page", page);
      }
      return anime;
    } catch (error) {
      console.error("Error in latest:", error);
      return [];
    }
  }

  async search(kw, page = 1) {
    try {
      const res = await this.request(`/search?q=${encodeURIComponent(kw)}&page=${page}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });
      const animeList = await this.querySelectorAll(res, "div.anime-card");
      const anime = [];
      for (const element of animeList) {
        const html = await element.content;
        const url = await this.getAttributeText(html, "a.anime-title", "href");
        const title = await this.querySelector(html, "a.anime-title").text;
        const cover = await this.querySelector(html, "img.anime-poster").getAttributeText("src");
        if (title && url && cover) {
          anime.push({
            title: title.trim(),
            url,
            cover,
          });
        }
      }
      if (anime.length === 0) {
        console.warn("No anime found for search:", kw, "on page", page);
      }
      return anime;
    } catch (error) {
      console.error("Error in search:", error);
      return [];
    }
  }

  async detail(url) {
    try {
      const res = await this.request("", {
        headers: {
          "Miru-Url": url,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const title = await this.querySelector(res, "h1.anime-title").text;
      const cover = await this.querySelector(res, "img.anime-poster").getAttributeText("src");
      const desc = await this.querySelector(res, "div.anime-description").text;

      const episodeList = await this.querySelectorAll(res, "a.episode-link");
      const episodes = [];
      for (const element of episodeList) {
        const html = await element.content;
        const name = await this.querySelector(html, "a.episode-link").text;
        const episodeUrl = await this.getAttributeText(html, "a.episode-link", "href");
        if (name && episodeUrl) {
          episodes.push({
            name: name.trim(),
            url: episodeUrl,
          });
        }
      }

      return {
        title: title ? title.trim() : "Unknown Title",
        cover: cover || "",
        desc: desc ? desc.trim() : "No description available",
        episodes: [
          {
            title: "Episodes",
            urls: episodes,
          },
        ],
      };
    } catch (error) {
      console.error("Error in detail:", error);
      return {
        title: "Error",
        cover: "",
        desc: "Failed to load details",
        episodes: [],
      };
    }
  }

  async watch(url) {
    try {
      const res = await this.request("", {
        headers: {
          "Miru-Url": url,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const urlPatterns = [/https?:\/\/files-3\.vid3rb\.com\/files\/[^"]+\.(mp4|m3u8)[^"]*/];
      let videoUrl = "";

      for (const pattern of urlPatterns) {
        const match = res.match(pattern);
        if (match) {
          videoUrl = match[0];
          break;
        }
      }

      if (!videoUrl) {
        throw new Error("No video URL found");
      }

      return {
        type: "hls",
        url: videoUrl,
      };
    } catch (error) {
      console.error("Error in watch:", error);
      return {
        type: "hls",
        url: "",
      };
    }
  }
}
