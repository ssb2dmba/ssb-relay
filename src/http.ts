/*
 * This file is part of the ssb-relay distribution (https://github.com/ssb2dmba/ssb-relay).
 * Copyright (c) 2023 DMBA Emmanuel Florent.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import express, { Express, Request, response, Response } from 'express';
import { Scuttlebot } from './types/scuttlebot-type';

const cookieParser = require("cookie-parser");
const session = require("express-session");
const mustacheExpress = require('mustache-express');
const svgCaptcha  = require('svg-captcha');
const pull = require("pull-stream");


declare module 'express-session' { 
    interface SessionData {
    captcha: string;
}
}

export function setupExpressApp(bot: Scuttlebot) {

    const port = 8000;

    const app = express();
    app.use(express.static(__dirname + '/public'));
    app.use(require('body-parser').urlencoded({ extended: true }));
    app.use(cookieParser("Your secret key"));
    app.use(session());

    app.set('views', `${__dirname}/views`);
    app.set('view engine', 'mustache');
    app.engine('mustache', mustacheExpress());

    app.set('port', port);

    function createInvite(sbot: Scuttlebot, n: number) {
        return function readInvite(end: any, cb:any) {
          if (end === true) {
            return;
          }
          if (end) {
            return cb(end);
          }
          sbot.invite.create({modern: false}, cb);
        };
      }

    app.get("/invite/captcha.svg", async function (req: Request, res: Response) {
        var captcha = svgCaptcha.create({size: 4, charPreset:"abcdefghjkmnopqrstuvwxyz"});
        req.session.captcha = captcha.text;
        res.type('svg');
        res.status(200).send(captcha.data);
    });

    app.get('/invite/invite-captcha-reponse', (req: Request, res: Response) => {
        res.render('invite-captcha-reponse', { invitation: req.query.invitation });
    });

    app.post('/invite/invite-captcha-reponse', (req: any, res: Response) => {
        var captcha = req.body.captcha;
        if (!captcha || captcha != req.session.captcha) {
            return res.render('invite-captcha-invalid');
        }
        pull(
            createInvite(bot, 1),
            pull.take(1),
            pull.drain((invitation:any) => {
                // replace ipv6 server adress with request hostname
                // there was a problem with ssb-invite and could not configure properly hostname
                let dotct = invitation.split(":").length - 1;
                if (dotct == 9) { // ipv4
                    invitation = invitation.replace(invitation.split(":").slice(0,8).join(":"),req.hostname)
                }
               // invitation = invitation.replace(/\[.*?\]\s?/g, req.hostname);
                res.render('invite-captcha-reponse', { invitation });
            }, reportIfError),
        );
    });

    app.get('/invite/', (req: Request, res: Response) => {
        res.render('invite-captcha-request');
    });

    return app.listen(app.get('port'), () => {
        console.log('Web app is running on port %s', app.get('port'));
    });

    function reportIfError(err: any) {
        if (err) {
          console.error(err);
        }
      }    
}
