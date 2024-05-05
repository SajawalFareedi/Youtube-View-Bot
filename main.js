const { YoutubeBot } = require("./bot");

const main = async (url) => {
    try {
        const bot = new YoutubeBot(url, 'socks5://127.0.0.1:9050')
        await bot.start()
    } catch (e) {
        console.log(e);
    }
};


main('https://www.youtube.com/watch?v=Zy1UqCGx1Yo');
