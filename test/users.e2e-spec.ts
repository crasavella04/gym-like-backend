import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '../src/validation/validation.pipe';
import { User } from '../src/users/entities/user.entity';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let accessToken: string;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    server = app.getHttpServer() as Server;
    userRepository = app.get(DataSource).getRepository(User);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('должен вернуть access_token при верных данных', async () => {
      const res = await request(server)
        .post('/auth/login')
        .send({ email: 'test@mail.ru', password: 'Password1!' })
        .expect(200);

      const body = res.body as { access_token: string };
      expect(body.access_token).toBeDefined();
      accessToken = body.access_token;
    });
  });

  describe('PATCH /users', () => {
    it('Обновление данных пользователя', async () => {
      await request(server)
        .patch('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstname: 'Иван',
          lastname: 'Петров',
          gender: 'male',
          trainingGoal: 'maintenance',
          height: 188,
          date_birth: 1083096000,
        })
        .expect(200);

      const user = await userRepository.findOne({
        where: { email: 'test@mail.ru' },
      });

      expect(user?.firstname).toBe('Иван');
      expect(user?.lastname).toBe('Петров');
      expect(user?.gender).toBe('male');
      expect(user?.trainingGoal).toBe('maintenance');
      expect(user?.height).toBe(188);
      expect(user?.date_birth).toBe(1083096000);
    });

    it('Обновление данных пользователя 2', async () => {
      await request(server)
        .patch('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstname: 'Anna',
          lastname: 'Petrova',
          gender: 'female',
          trainingGoal: 'weight_loss',
          height: 164,
          date_birth: 1083034000,
        })
        .expect(200);

      const user = await userRepository.findOne({
        where: { email: 'test@mail.ru' },
      });

      expect(user?.firstname).toBe('Anna');
      expect(user?.lastname).toBe('Petrova');
      expect(user?.gender).toBe('female');
      expect(user?.trainingGoal).toBe('weight_loss');
      expect(user?.height).toBe(164);
      expect(user?.date_birth).toBe(1083034000);
    });

    it('должен вернуть 401 без токена', () => {
      return request(server)
        .patch('/users')
        .send({ firstname: 'Иван' })
        .expect(401);
    });
  });
});
