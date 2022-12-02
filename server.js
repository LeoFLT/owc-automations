const db = require("./db");
const Koa = require("koa");
const router = require("koa-router")();
const fetch = require("node-fetch");
const fs = require("fs");
const https = require("https");

const options = {
    key: fs.readFileSync('/path/to/cert/key'),
    cert: fs.readFileSync('/path/to/cert/file'),
    ca: fs.readFileSync('/path/to/cert/chain')
};

const app = new Koa();

router.get("/callback", async function (ctx, next) {
    ctx.type = "html";
    ctx.body = fs.createReadStream("index.html");
    if (!ctx?.query?.code || !ctx?.query?.state) {
        ctx.response.body = "Error: Invalid authentication code/state";
        ctx.response.status = 400;
        return next();
    }

    db.findOne({ interaction: ctx.query.state }, async (err, doc) => {
        if (err) {
            ctx.response.body = "Error. You may close this window.";
            ctx.response.status = 500;
            return next();
        } else if (doc) {
            let headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
            };
            let body = {
                "client_id": parseInt(process.env.OSU_CLIENT_ID),
                "client_secret": process.env.OSU_CLIENT_SECRET,
                "code": ctx.query.code,
                "grant_type": "authorization_code",
                "redirect_uri": process.env.CALLBACK_URI
            };

            try {
                const resToken = await fetch("https://osu.ppy.sh/oauth/token", {
                    method: "POST",
                    headers,
                    body: JSON.stringify(body),
                });
                const token = await resToken.json();

                if (!token.access_token) {
                    ctx.response.body = "Error: No access token";
                    ctx.response.status = 400;
                    return next();
                }

                headersUser = { ...headers, "Authorization": `${token.token_type} ${token.access_token}` };

                const resUser = await fetch("https://osu.ppy.sh/api/v2/me", {
                    method: "GET",
                    headers: headersUser
                });

                const user = await resUser.json();
                if (!user) {
                    ctx.body = "Error: user not found";
                    ctx.status = 500;
                    return next();
                }

                if (user?.is_restricted) {
                    ctx.body = "Error: Restricted users may not participate in official tournaments."
                    ctx.status = 403;
                    return next();
                }
                const sheetReq = `${process.env.API_DEPLOYMENT_URL}?apiKey=${process.env.API_KEY}&id=${user.id}`
                const sheetRes = await fetch(sheetReq);
                const result = await sheetRes.json();
                console.log({ result });
                if (result.status === 200) {
                    const userInfo = { ...result, ...doc, usernameAPI: user.username };
                    app.emit("user_verified", userInfo);
                    ctx.response.body = "Verification successful. You may close this window.";
                    return next();
                } else {
                    ctx.response.body = `Error: ${result.status}`;
                    ctx.response.status = 500;
                    return next();
                }
            } catch (e) {
                if (!ctx.body)
                    ctx.response.body = "An unknown error has occurred. You may close this tab.";
                ctx.response.status = 500;
                console.log(e);
                return next();
            }
        }
    });
});


app.use(router.routes()).use(router.allowedMethods());
https.createServer(options, app.callback()).listen(443);

module.exports = app;
