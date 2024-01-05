import request from 'supertest';
import express from 'express';
import AuthRouter from './auth-router';
import { RootUserRepositoryImpl } from '../repository/root-user-repository-impl';
import { CreateAuthChallengeImpl } from '../use-cases/auth/create-auth-challenge-impl';
import { VerifyAuthChallengeImpl } from '../use-cases/auth/verify-auth-challenge-impl';
import session from 'express-session'
import cookieParser from 'cookie-parser';

describe('AuthRouter', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(require('body-parser').urlencoded({ extended: true }));
    app.use(cookieParser("Your secret key"));
    app.use(session());

    let stack = {} as any;
    stack.getDbConnectionPool = function () {
      return {
        query: jest.fn().mockResolvedValue({
          rows: [
            { key: 'testKey' },
          ]
        })
      }
    };
    let authRouter = AuthRouter(
      new CreateAuthChallengeImpl(new RootUserRepositoryImpl(stack.getDbConnectionPool())),
      new VerifyAuthChallengeImpl(new RootUserRepositoryImpl(stack.getDbConnectionPool()))
    )

    app.use('/auth', authRouter);
  });

  test('GET /auth', async () => {
    const response = await request(app).get('/auth');
    expect(response.status).toBe(200);
    // example:
    // {
    //   value: {
    //     nonce: '4615907b2640286ca6a2321927ef223cffb8d0ff39bbdcf98e1037199953af86',
    //     timestamp: 1704440813091
    //   },
    //   key: 'testKey'
    // }


  });

});