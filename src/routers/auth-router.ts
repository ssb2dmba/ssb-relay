import express from 'express'
import { Request, Response } from 'express'
import { CreateAuthChallengeImpl } from "../use-cases/auth/create-auth-challenge-impl";
import { VerifyAuthChallengeImpl } from "../use-cases/auth/verify-auth-challenge-impl";
import { IAuthenticationService }  from "../entities/auth-challenge-service"


export default function AuthRouter(
    challengeUseCase: CreateAuthChallengeImpl,
    verifyUseCase: VerifyAuthChallengeImpl
) {
    const router = express.Router()

    router.get('/', async (req: Request, res: Response) => {
        try {
            const challenge: IAuthenticationService.AuthChallengeStruct = await challengeUseCase.execute();
            (req.session as any).challenge = challenge;
            res.send(challenge);
        } catch (err: any) {
            res.status(400).send({ message: err.message });
        }
    });

    router.post('/', async (req: Request, res: Response) => {
        try {
            let sessionChallenge: IAuthenticationService.AuthChallengeStruct = (req.session as any).challenge
            let responses:IAuthenticationService.AuthResult|null = await verifyUseCase.execute(sessionChallenge, req.body)
            if (responses == null) {
                res.status(403).send({ message: "unauthorized" })
            }
            res.json(responses)
        } catch (err) {
            console.log((err as Error).message)
            res.status(500).send({ message: (err as Error).message })
        }
    })

    return router
}