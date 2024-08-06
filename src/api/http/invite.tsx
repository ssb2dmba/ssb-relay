import { Invite } from "@fedify/fedify";
import b2a from "b2a";
import { Hono } from "hono";
import { CookieStore, type Session, sessionMiddleware } from "hono-sessions";
import { cors } from "hono/cors";
import type { FC } from "hono/jsx";
import pull from "pull-stream";
import { renderToString } from "react-dom";
import svgCaptcha from "svg-captcha";
import type { Scuttlebot } from "../../ssb/types/scuttlebot-type";
import InviteCaptchaInvalid from "./views/invite-captcha-invalid";
import InviteCaptchaRequest from "./views/invite-captcha-request";
import InviteCaptchaResponse from "./views/invite-captcha-response";

type CallbackFunction = (end: boolean | string) => void;

function createInvite(sbot: Scuttlebot, n: number) {
  return function readInvite(end: any, cb: any) {
    if (end === true) {
      return;
    }
    if (end) {
      return cb(end);
    }
    sbot.invite.create({ modern: false }, cb);
  };
}

function getInvitePromise(sbot: Scuttlebot): Promise<string> {
  return new Promise((resolve, reject) => {
    pull(
      createInvite(sbot, 1),
      pull.take(1),
      pull.drain(
        (invitation: string) => {
          resolve(invitation);
        },
        (error: string) => {
          console.log(error);
          reject(error);
        },
      ),
    );
  });
}

function createApi(sbot: Scuttlebot) {
  const api = new Hono<{
    Variables: {
      session: Session;
      session_key_rotation: boolean;
    };
  }>();

  const store = new CookieStore();
  api.use("/*", cors());
  api.use(
    "*",
    sessionMiddleware({
      store,
      encryptionKey: "password_at_least_32_characters_long", // Required for CookieStore, recommended for others
      expireAfterSeconds: 900, // Expire session after 15 minutes of inactivity
      cookieOptions: {
        sameSite: "Lax", // Recommended for basic CSRF protection in modern browsers
        path: "/", // Required for this library to work properly
        httpOnly: true, // Recommended to avoid XSS attacks
      },
    }),
  );

  api.get("captcha.svg", (c) => {
    const captcha = svgCaptcha.create({
      size: 4,
      charPreset: "abcdefghjkmnopqrstuvwxyz",
    });
    const session = c.get("session");
    session.set("captcha", captcha.text);
    c.header("Content-Type", "image/svg+xml;charset=utf-8");
    return c.body(captcha.data);
  });

  api.get("/", (c) => {
    return c.html(<InviteCaptchaRequest />);
  });

  api.post("/invite-captcha-reponse", async (c) => {
    const bypass = sbot.config.captcha?.always_true || false;
    const body = await c.req.parseBody();
    const captcha = body.captcha;
    const session = c.get("session");
    if (!bypass && (!captcha || captcha !== session.get("captcha"))) {
      console.warn("invalid captcha");
      return c.html(<InviteCaptchaInvalid error="invalid" />);
    }
    try {
      let invite = await getInvitePromise(sbot);
      invite = invite.split("@")[1];
      const host = c.req.header("host");
      invite = btoa(`${host}:8008:@${invite}`); // @TODO read port from sbots config
      console.warn("🎉 new invite sent");
      return c.redirect(`/invite/invite-captcha-reponse?invite=${invite}`);
    } catch (e) {
      c.html(<InviteCaptchaInvalid error={e} />);
    }
  });

  api.get("/invite-captcha-reponse", async (c) => {
    const invite = c.req.query("invite");
    return c.html(<InviteCaptchaResponse invite={invite} />);
  });

  return api;
}

export default createApi;
