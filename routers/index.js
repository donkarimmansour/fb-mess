// const login = require('ts-messenger-api').default;

const puppeteer = require('puppeteer');

module.exports = (app) => {
    let glbrowser, glpage;
    const timeout = 50000;
    let friends = [];
    let total = 0
    let senttotal = 0


    const selectors = {
        messageContent: "div > div[contenteditable]"
    }

    app.get("/", (req, res) => {
        friends = []
        res.render("index", { err: "", friends: friends , counter : "0" });
    }); 

    app.post("/alert", async (req, res) => {
        res.render("index", { friends: friends, counter : `${total}/${senttotal}`  , error: "" }); 
    });

    app.get("/alert", async (req, res) => {
        res.render("index", { friends: friends, counter : `${total}/${senttotal}`  , error: "" }); 
    }); 

    app.post("/", async (req, res) => {

        const { message, ids } = req.body

        if (message && ids && ids.length > 0) {

            try {


                await init({ headless: false }).then(async () => {
                    console.log("init");

                }).catch((err) => {
                    res.render("index", { friends: friends, errtitle: "Error", error: err.message });
                });

                const allId = ids.split("\n")

                total = allId.length
                senttotal = 0

                res.locals.counter = `${total}/${senttotal}` 

                new Promise((resolve, reject) => {

                    var step = 0

                    if (step === (allId.length - 1)) {
                        reject("counter")
                    } else {

                        const repater = async (id) => {

                            if (step === allId.length) { resolve("okey"); return; }

                            const newId = id.split(",")
                            await sendMessage(newId, message).then(result => {

                                if (result && !("err" in result)) {
                                    friends.push(`[${newId[0]} , ${newId[1]}] => ${result}`)
                                } else if (result.err) {
                                    friends.push(`[${newId[0]} , ${newId[1]}] => ${result.msg}`)
                                } else if (!result.err) {
                                    friends.push(`[${newId[0]} , ${newId[1]}] => ${result.msg}`)
                                } else {
                                    friends.push(`[${newId[0]} , ${newId[1]}] => error!`)
                                }
                                senttotal++ 

                                console.log("result => ", result);

                                // res.localscounter = `${total}/${senttotal}`  
                                // res.locals.friends = friends


                               //  res.render("index", { friends: friends, counter : `${total}/${senttotal}`  , errtitle: "", error: "" });

                            })



                            step++
                            await repater(allId[step])
                        }

                        repater(allId[step])

                    }






                })
                    .then(() => {
                        console.log("finished");
                        res.render("index", { friends: friends, errtitle: "Done", error: "finished" });
                    })
                    .catch((err) => {
                        console.log("errors");
                        res.render("index", { friends: friends, errtitle: "Error", error: err.message });
                    })





            } catch (error) {
                res.render("index", { friends: friends, errtitle: "Error", error: error });
            }

        } else {
            res.render("index", { friends: friends, errtitle: "Error", error: "please enter your data" });

        }


    });



    const sendMessage = async (userId, message) => {


        if (glbrowser === undefined && glpage === undefined) {
            return { err: true, msg: "page err", userId }
        }

        const messageUrl = generateFacebookMessageURL(userId[1]);

        await glpage.goto(messageUrl, { timeout: timeout, waitUntil: 'networkidle0' });

        // await glpage.waitForSelector(selectors.messageContent, {timeout : 5000}); 


        await glpage.evaluate(async (selectors, userId, message) => {
            window.messageData = [];

            let isoffline = true;
            console.log(document.querySelector("div > div[contenteditable]"));
            if (document.querySelector(selectors.messageContent)) isoffline = false;
 
            window.messageData.push(isoffline);
            console.log(window.messageData); 
            await handleMessage(userId, message);
 
        }, selectors, userId, message);

        return res

    }

    const handleMessage = async (userId, message) => {

        if (glpage === undefined) {
            return { err: true, msg: "handle err", userId }
        }


        const isoffline = await glpage?.evaluate(() => window.messageData.shift());
        console.log(isoffline);

        if (isoffline) {
            res = { err: true, msg: "offline", userId };
        } else {

            const newMessage = message.replace('[name]', userId[0])

            await glpage.focus(selectors.messageContent)

            await glpage.keyboard.type(newMessage).then(async () => {
                await glpage.keyboard.press('Enter').then(() => {
                    res = { err: false, msg: "sent", userId }

                }).catch((e) => {
                    res = { err: true, msg: "press err", userId };
                });
            }).catch((e) => {
                res = { err: true, msg: "typing err", userId }
            });
        }

    };



    function sleep(duration) {
        return new Promise(((resolve) => {
            setTimeout(resolve, duration);
        }));
    }

    const init = async (options) => {

        await sleep(options.delay);

        const browserOptions = {
            headless: options.headless,
            args: [ 
                '--no-sandbox',
                '--disable-setuid-sendbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--user-data-dir=C:/Users/benze/AppData/Local/Google/Chrome/User Data',
                //  '--profile-directory=Profile 1'
            ],
            ignoreDefaultArgs: ["--hide-scrollbars"],
            //  timeout : options.timeout
        };



        browserOptions.executablePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
        const browser = await puppeteer.launch(browserOptions);

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36');
        await page.exposeFunction("handleMessage", handleMessage);


        gloptions = options
        glbrowser = browser
        glpage = page
    }

    const closeBrowser = async () => {
        await glbrowser?.close();
    }

    const closePage = async () => {
        await glpage?.close();
    }

    const generateFacebookMessageURL = id => {
        return `https://www.messenger.com/t/${id}`;
    }


};
