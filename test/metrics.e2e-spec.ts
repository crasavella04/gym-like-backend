import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '../src/validation/validation.pipe';
import { Metric } from '../src/metrics/entities/metrics.entity';
import { User } from '../src/users/entities/user.entity';

const TEST_EMAIL = 'test@mail.ru';
const TEST_PASSWORD = 'Password1!';

describe('Metrics (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let accessToken: string;
  let testUserId: string;
  let metricRepository: Repository<Metric>;
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

    const dataSource = app.get(DataSource);
    metricRepository = dataSource.getRepository(Metric);
    userRepository = dataSource.getRepository(User);

    const loginRes = await request(server)
      .post('/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
      .expect(200);

    accessToken = (loginRes.body as { access_token: string }).access_token;

    const user = await userRepository.findOneOrFail({
      where: { email: TEST_EMAIL },
    });
    testUserId = user.id;

    await metricRepository.delete({ userId: testUserId });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /metrics', () => {
    it('должен создать первую метрику и записать в БД', async () => {
      await request(server)
        .post('/metrics')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ height: 180, weight: 75, waistCircumference: 80 })
        .expect(201);

      const metrics = await metricRepository.find({
        where: { userId: testUserId },
      });

      expect(metrics).toHaveLength(1);
      expect(metrics[0].height).toBe(180);
      expect(metrics[0].weight).toBe(75);
      expect(metrics[0].waistCircumference).toBe(80);
    });

    it('должен создать вторую метрику и записать в БД', async () => {
      await request(server)
        .post('/metrics')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          height: 180,
          weight: 73,
          waistCircumference: 78,
          chestCircumference: 95,
          hipCircumference: 100,
        })
        .expect(201);

      const metrics = await metricRepository.find({
        where: { userId: testUserId },
      });

      expect(metrics).toHaveLength(2);
      expect(metrics[1].weight).toBe(73);
      expect(metrics[1].chestCircumference).toBe(95);
      expect(metrics[1].hipCircumference).toBe(100);
    });

    it('должен вернуть 401 без токена', () => {
      return request(server).post('/metrics').send({ weight: 75 }).expect(401);
    });
  });

  describe('GET /metrics', () => {
    it('должен вернуть все метрики пользователя', async () => {
      const res = await request(server)
        .get('/metrics')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const body = res.body as Metric[];
      const dbMetrics = await metricRepository.find({
        where: { userId: testUserId },
      });

      expect(body).toHaveLength(dbMetrics.length);
    });

    it('должен вернуть 401 без токена', () => {
      return request(server).get('/metrics').expect(401);
    });
  });

  describe('PATCH /metrics/:metricId', () => {
    it('должен обновить метрику и проверить изменения в БД', async () => {
      const [metric] = await metricRepository.find({
        where: { userId: testUserId },
      });

      await request(server)
        .patch(`/metrics/${metric.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ weight: 70, waistCircumference: 77 })
        .expect(200);

      const updated = await metricRepository.findOne({
        where: { id: metric.id },
      });

      expect(updated?.weight).toBe(70);
      expect(updated?.waistCircumference).toBe(77);
      expect(updated?.height).toBe(metric.height);
    });

    it('должен вернуть 404 при несуществующей метрике', () => {
      return request(server)
        .patch('/metrics/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ weight: 70 })
        .expect(404);
    });

    it('должен вернуть 401 без токена', () => {
      return request(server)
        .patch('/metrics/00000000-0000-0000-0000-000000000000')
        .send({ weight: 70 })
        .expect(401);
    });
  });
});
