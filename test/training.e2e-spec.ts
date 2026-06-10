import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '../src/validation/validation.pipe';
import { Training } from '../src/training/entities/training.entity';
import { ExerciseSets } from '../src/training/entities/exercise_sets.entity';
import { Exercise } from '../src/exercises/entities/exercises.entity';
import { ExerciseTypeEnum } from '../src/exercises/types/ExerciseTypeEnum';
import { User } from '../src/users/entities/user.entity';

const TEST_EMAIL = 'test@mail.ru';
const TEST_PASSWORD = 'Password1!';
const NULL_UUID = '00000000-0000-0000-0000-000000000000';

interface TrainingResponse {
  id: string;
  title: string;
  date: number;
  exercises: Array<{
    id: string;
    sets: Array<{
      id: string;
      plannedWeight: number | null;
      plannedReps: number | null;
      realWeight: number | null;
      realReps: number | null;
    }>;
  }>;
}

describe('Training (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let accessToken: string;
  let testUserId: string;
  let testExerciseId: string;
  let createdTrainingId: string;
  let createdSetIds: string[];
  let trainingRepository: Repository<Training>;
  let exerciseSetsRepository: Repository<ExerciseSets>;
  let exerciseRepository: Repository<Exercise>;
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
    trainingRepository = dataSource.getRepository(Training);
    exerciseSetsRepository = dataSource.getRepository(ExerciseSets);
    exerciseRepository = dataSource.getRepository(Exercise);
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

    // Берём первое доступное упражнение типа weight
    const exercise =
      (await exerciseRepository.findOne({
        where: { type: ExerciseTypeEnum.WEIGHT },
      })) ??
      (await exerciseRepository.save(
        exerciseRepository.create({
          title: 'Test Exercise',
          type: ExerciseTypeEnum.WEIGHT,
        }),
      ));

    testExerciseId = exercise.id;

    await trainingRepository.delete({ userId: testUserId });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /training', () => {
    it('должен вернуть пустой список тренировок', async () => {
      const res = await request(server)
        .get('/training')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body as TrainingResponse[]).toHaveLength(0);
    });

    it('должен вернуть 401 без токена', () => {
      return request(server).get('/training').expect(401);
    });
  });

  describe('POST /training', () => {
    it('должен создать тренировку с плановыми показателями и записать в БД', async () => {
      const res = await request(server)
        .post('/training')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Тренировка 1',
          date: 1716000000,
          exercises: [
            {
              id: testExerciseId,
              type: 'weight',
              sets: [
                { weight: 80, reps: 10 },
                { weight: 85, reps: 8 },
                { weight: 90, reps: 6 },
              ],
            },
          ],
        })
        .expect(201);

      const body = res.body as TrainingResponse;
      createdTrainingId = body.id;
      createdSetIds = body.exercises[0].sets.map((s) => s.id);

      // Проверяем тренировку в БД
      const training = await trainingRepository.findOne({
        where: { id: createdTrainingId },
        relations: ['exercises', 'exercises.sets'],
      });

      expect(training).not.toBeNull();
      expect(training?.title).toBe('Тренировка 1');
      expect(training?.userId).toBe(testUserId);
      expect(training?.exercises).toHaveLength(1);

      const sets = training!.exercises[0].sets.sort(
        (a, b) => a.orderNumber - b.orderNumber,
      );
      expect(sets).toHaveLength(3);

      // Плановые значения записаны корректно
      expect(sets[0].plannedWeight).toBe(80);
      expect(sets[0].plannedReps).toBe(10);
      expect(sets[1].plannedWeight).toBe(85);
      expect(sets[1].plannedReps).toBe(8);
      expect(sets[2].plannedWeight).toBe(90);
      expect(sets[2].plannedReps).toBe(6);

      // Фактические значения пусты
      expect(sets[0].realWeight).toBeNull();
      expect(sets[0].realReps).toBeNull();
    });

    it('должен вернуть 401 без токена', () => {
      return request(server)
        .post('/training')
        .send({ title: 'Test', date: 1716000000, exercises: [] })
        .expect(401);
    });
  });

  describe('GET /training/:id', () => {
    it('должен вернуть тренировку с упражнениями и подходами', async () => {
      const res = await request(server)
        .get(`/training/${createdTrainingId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const body = res.body as TrainingResponse;
      expect(body.id).toBe(createdTrainingId);
      expect(body.title).toBe('Тренировка 1');
      expect(body.exercises).toHaveLength(1);
      expect(body.exercises[0].sets).toHaveLength(3);
    });

    it('должен вернуть 404 для несуществующей тренировки', () => {
      return request(server)
        .get(`/training/${NULL_UUID}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('должен вернуть 401 без токена', () => {
      return request(server).get(`/training/${NULL_UUID}`).expect(401);
    });
  });

  describe('PATCH /training/:trainingId/sets/:setId', () => {
    it('должен записать фактические значения для первого подхода и проверить в БД', async () => {
      await request(server)
        .patch(`/training/${createdTrainingId}/sets/${createdSetIds[0]}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ realWeight: 78, realReps: 10 })
        .expect(200);

      const set = await exerciseSetsRepository.findOneOrFail({
        where: { id: createdSetIds[0] },
      });

      expect(set.realWeight).toBe(78);
      expect(set.realReps).toBe(10);
      // Плановые значения не изменились
      expect(set.plannedWeight).toBe(80);
      expect(set.plannedReps).toBe(10);
    });

    it('должен частично обновить — только realReps без realWeight', async () => {
      await request(server)
        .patch(`/training/${createdTrainingId}/sets/${createdSetIds[1]}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ realReps: 7 })
        .expect(200);

      const set = await exerciseSetsRepository.findOneOrFail({
        where: { id: createdSetIds[1] },
      });

      expect(set.realReps).toBe(7);
      expect(set.realWeight).toBeNull();
      // Плановые значения не изменились
      expect(set.plannedWeight).toBe(85);
      expect(set.plannedReps).toBe(8);
    });

    it('должен обновить третий подход и вернуть все фактические значения через GET', async () => {
      await request(server)
        .patch(`/training/${createdTrainingId}/sets/${createdSetIds[2]}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ realWeight: 87, realReps: 5 })
        .expect(200);

      const res = await request(server)
        .get(`/training/${createdTrainingId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const body = res.body as TrainingResponse;
      const sets = body.exercises[0].sets;

      expect(sets[0].realWeight).toBe(78);
      expect(sets[0].realReps).toBe(10);
      expect(sets[0].plannedWeight).toBe(80);

      expect(sets[1].realReps).toBe(7);
      expect(sets[1].realWeight).toBeNull();

      expect(sets[2].realWeight).toBe(87);
      expect(sets[2].realReps).toBe(5);
    });

    it('должен вернуть 404 для несуществующего подхода', () => {
      return request(server)
        .patch(`/training/${createdTrainingId}/sets/${NULL_UUID}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ realWeight: 80 })
        .expect(404);
    });

    it('должен вернуть 401 без токена', () => {
      return request(server)
        .patch(`/training/${createdTrainingId}/sets/${createdSetIds[0]}`)
        .send({ realWeight: 80 })
        .expect(401);
    });
  });

  describe('PATCH /training/:id', () => {
    it('должен обновить заголовок и дату тренировки', async () => {
      await request(server)
        .patch(`/training/${createdTrainingId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Обновлённая тренировка', date: 1716100000 })
        .expect(200);

      const training = await trainingRepository.findOne({
        where: { id: createdTrainingId },
      });

      expect(training?.title).toBe('Обновлённая тренировка');
      expect(Number(training?.date)).toBe(1716100000);
    });

    it('должен вернуть 404 для несуществующей тренировки', () => {
      return request(server)
        .patch(`/training/${NULL_UUID}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Test' })
        .expect(404);
    });

    it('должен вернуть 401 без токена', () => {
      return request(server)
        .patch(`/training/${NULL_UUID}`)
        .send({ title: 'Test' })
        .expect(401);
    });
  });

  describe('GET /training (после создания)', () => {
    it('должен вернуть не пустой список тренировок', async () => {
      const res = await request(server)
        .get('/training')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body as TrainingResponse[]).toHaveLength(1);
    });
  });

  describe('DELETE /training/:id', () => {
    it('должен удалить тренировку из БД', async () => {
      await request(server)
        .delete(`/training/${createdTrainingId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const training = await trainingRepository.findOne({
        where: { id: createdTrainingId },
      });
      expect(training).toBeNull();
    });

    it('должен вернуть 404 для несуществующей тренировки', () => {
      return request(server)
        .delete(`/training/${NULL_UUID}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('должен вернуть 401 без токена', () => {
      return request(server).delete(`/training/${NULL_UUID}`).expect(401);
    });
  });
});
