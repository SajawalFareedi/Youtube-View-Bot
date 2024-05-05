const puppeteer = require("puppeteer-extra").default;
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const userAgent = require("random-useragent").getRandom;
const proxyChain = require('proxy-chain');

puppeteer.use(stealthPlugin());


class YoutubeBot {
    constructor(videoUrl, proxy) {
        this.url = videoUrl;
        this.proxy = proxy;
    }

    async initializeBrowser() {
        // const newProxyUrl = await proxyChain.anonymizeProxy(this.proxy);

        const browser = await puppeteer.launch({
            timeout: 0, // Timeout 0 for slow internet connections
            headless: false, // Headless True, so you won't get disturbed with an extra chromium browser opened in front of you
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            ignoreHTTPSErrors: true, // Preventing Chromium from shuting down due to HTTPS errors
            ignoreHTTPErrors: true, // Preventing Chromium from shuting down due to HTTP errors
            args: ["--start-maximized", `--proxy-server=${this.proxy}`], // Starting the window with maximum viewport
            // defaultViewport: { width: 1920, height: 1080 },
            ignoreDefaultArgs: ["--disable-extensions", "--enable-automation"], // simple workaround, so website will think its not a bot
            slowMo: 200, // Speed of working, setting it to 0 can cause problems because puppeteer will work with full speed and website can easily recognize the bot
        });

        const page = await browser.newPage(); // New page so the bot can use it for doing the crawling part

        console.log("Browser launched, configuring the new page...");

        // Setting default timeouts to 0 (it's for slow internet connections)
        page.setDefaultNavigationTimeout(0); // setting it for slow internet connection
        page.setDefaultTimeout(0); // setting it for slow internet connection

        // Setting a good userAgent because with the default one, the website will recognize the bot
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36');

        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, "webdriver", {
                get: () => false, // setting the webdriver value to false, so the website will think its not a bot
            });
            window.navigator.chrome = {
                runtime: {}, // just another workaround
            };
            Object.defineProperty(navigator, "plugins", {
                get: () => [1, 2, 3, 4, 5], // you can pass anything because website will check the length of pulgins array
            });
            Object.defineProperty(navigator, "languages", {
                get: () => ["en-US", "en"], // optional, just tell the website to render things in english
            });
            const originalQuery = window.navigator.permissions.query;
            return (window.navigator.permissions.query = (parameters) =>
                parameters.name === "notifications"
                    ? Promise.resolve({ state: Notification.permission }) // Accepting notifications, so they won't interupt the bot
                    : originalQuery(parameters));
        });

        // await page.setRequestInterception(true); // setting to true so we can intercept the request and change parameters

        // page.on("request", (req) => {
        //     const url = req.url().toString().toLowerCase();
        //     if (
        //         // if website is trying to send a request for captcha or to cloudflare, it will block it so they can't disturb the bot
        //         url.indexOf("captcha") != -1 ||
        //         url.indexOf("cloudflare") != -1
        //     ) {
        //         req.abort();
        //     } else {
        //         req.continue();
        //     }
        // });

        return page;
    }

    async start() {
        try {
            // Launch the browser and create a new page for working
            console.log("Launching the browser...");
            const page = await this.initializeBrowser();
            console.log("Configuration completed, navigating to the given video url...");

            await page.goto(this.url)

        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = { YoutubeBot };