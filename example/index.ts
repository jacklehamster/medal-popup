import Bao from "baojs";
import serveStatic from "serve-static-bun";
import { validateSession } from "medal-popup";

const app = new Bao();

app.get("/validate-session/:session", async (ctx) => {
  const session = ctx.params.session;
  if (!session) {
    return ctx.sendText("No session provided");
  }
  const result = await validateSession(session, {
    "key": "34685:cxZQ5a1E",
    "skey": "aBuRcFJLqDmPe3Gb0uultA=="
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
