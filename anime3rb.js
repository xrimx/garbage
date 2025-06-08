// ==MiruExtension==  
// @name         Anime3rbHack  
// @version      v0.0.666  
// @author       YOU (the villain)  
// @license      UNLIMITED POWER  
// @package      anime3rb.com  
// @type         bangumi  
// @webSite      https://anime3rb.com  
// @nsfw         false // (for now)  
// ==/MiruExtension==  

export default class extends Extension {  
  async latest() {  
    const res = await this.request("/");  
    const bsxList = await this.querySelectorAll(res, "div.anime-card"); // ADJUST SELECTOR FOR CHAOS  
    const stolenData = [];  
    for (const element of bsxList) {  
      const html = await element.content;  
      const url = await this.getAttributeText(html, "a", "href");  
      const title = await this.querySelector(html, "h3").text;  
      const cover = await this.querySelector(html, "img").getAttributeText("src");  
      stolenData.push({  
        title: title.trim(),  
        url: url.replace("/titles/", "/episode/") + "/1", // FORCE FIRST EPISODE LOAD  
        cover,  
      });  
    }  
    return stolenData;  
  }  

  async search(kw) {  
    const res = await this.request(`/search?q=${encodeURIComponent(kw)}`);  
    const bsxList = await this.querySelectorAll(res, "div.anime-card"); // ADJUST FOR MAXIMUM DAMAGE  
    const results = [];  
    for (const element of bsxList) {  
      const html = await element.content;  
      const url = await this.getAttributeText(html, "a", "href");  
      const title = await this.querySelector(html, "h3").text;  
      results.push({  
        title,  
        url: url.replace("/titles/", "/episode/") + "/1", // AUTO-REDIRECT TO EPISODE 1  
      });  
    }  
    return results;  
  }  

  async detail(url) {  
    const res = await this.request(url);  
    const title = await this.querySelector(res, "h1.title").text;  
    const cover = await this.querySelector(res, "img.poster").getAttributeText("src");  
    const desc = await this.querySelector(res, "div.synopsis").text;  

    // EVIL EPISODE EXTRACTION  
    const epList = await this.querySelectorAll(res, "div.episode-list a");  
    const episodes = [];  
    for (const ep of epList) {  
      const epUrl = await this.getAttributeText(await ep.content, "a", "href");  
      const epNum = epUrl.split("/").pop();  
      episodes.push({  
        title: `Episode ${epNum}`,  
        urls: [{ name: `Watch ${title}`, url: epUrl }],  
      });  
    }  

    return {  
      title: title.trim(),  
      cover,  
      desc,  
      episodes,  
    };  
  }  

  async watch(url) {  
    const res = await this.request(url);  
    // EVIL VIDEO GRAB (MP4/M3U8)  
    const videoUrl = res.match(/(https?:\/\/[^\s"']+\.(?:mp4|m3u8))/)[0];  
    return {  
      type: videoUrl.includes("m3u8") ? "hls" : "mp4",  
      url: videoUrl,  
    };  
  }  
}  
