import Bao from "baojs";
import serveStatic from "serve-static-bun";
import { validateSession, saveData, TESTCONFIG } from "medal-popup";

const app = new Bao();

app.get("/validate-session/:session", async (ctx) => {
  const session = ctx.params.session;
  if (!session) {
    return ctx.sendText("No session provided");
  }
  const result = await validateSession(session, {
    "key": TESTCONFIG.key,
    "skey": TESTCONFIG.skey
  });

  return ctx.sendText(result ?? "");
});

app.get("/save-data/:session/:data", async (ctx) => {
  const session = ctx.params.session;
  const data = ctx.params.data;
  if (!session || !data) {
    return ctx.sendText("No session or data provided");
  }
  const result = await saveData(JSON.parse(decodeURIComponent(data)), session, {
    "key": TESTCONFIG.key,
    "skey": TESTCONFIG.skey
  });

  return ctx.sendText(result ?? "");
});


app.get("/", async (ctx) => {
  const content = Bun.file("index.html");
  ctx.sendText(await content.text());
  ctx.res?.headers.append("Content-Type", "text/html");
  return ctx;
});
app.get("/index.html", serveStatic("/", { middlewareMode: "bao" }));
app.get("/favicon.ico", serveStatic("/", { middlewareMode: "bao" }));
app.get("/dist/*any", serveStatic("/", { middlewareMode: "bao" }));
app.get("/js/*any", serveStatic("/", { middlewareMode: "bao" }));


const server = app.listen({ port: 3000 });


console.log(`Listening on http://localhost:${server.port}`);
