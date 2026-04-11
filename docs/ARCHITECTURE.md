# Архитектурные Требования для gym-like-backend

Данный документ описывает ключевые архитектурные принципы и паттерны, которым необходимо следовать при разработке проекта `gym-like-backend`. Эти требования основаны на анализе существующего кода и лучших практиках NestJS.

## 1. Общая Структура Проекта (Feature-driven)

*   **Модули по фичам:** Код организован по модулям, где каждый модуль соответствует отдельной фиче (например, `src/auth`, `src/exercises`, `src/ingredients`). Новая функциональность должна следовать этому паттерну.
*   **Стандартная организация модуля:** Внутри каждого модуля должна быть стандартная структура:
    ```
    src/<feature>/
      <feature>.module.ts
      <feature>.controller.ts
      <feature>.service.ts
      entities/
        <entity>.entity.ts
      dto/
        Create<Feature>Dto.ts
        Update<Feature>Dto.ts
      types/
        <EnumOrType>.ts
      <feature>.service.spec.ts  (юнит-тесты)
    ```

## 2. ORM и Базы Данных

*   **TypeORM:** В проекте используется TypeORM для взаимодействия с базой данных. Все новые сущности должны быть определены с использованием декораторов TypeORM:
    *   `@Entity()` — для определения сущности
    *   `@PrimaryGeneratedColumn('uuid')` — для UUID primary key
    *   `@Column()` — для определения колонок
    *   `@CreateDateColumn()`, `@UpdateDateColumn()` — для временных меток
    *   `@OneToMany()`, `@ManyToOne()`, `@ManyToMany()` — для взаимосвязей
*   **Репозитории:** Взаимодействие с базой данных должно осуществляться через TypeORM репозитории. Сервисы должны внедрять репозитории через DI (Dependency Injection).
*   **Миграции:** Управление изменениями схемы базы данных должно производиться через TypeORM миграции.

## 3. Типизация и Валидация

*   **Строгая типизация с TypeScript:** Весь код должен быть написан на TypeScript с использованием строгой типизации (`strict: true` в `tsconfig.json`).
*   **DTO (Data Transfer Objects):** Обязательно использование DTO для входных и выходных данных API:
    *   `Create<Feature>Dto` — для операций создания
    *   `Update<Feature>Dto` — для операций обновления
    *   DTO должны содержать декораторы `@IsNotEmpty()`, `@IsString()`, `@IsNumber()` и т.д. из `class-validator`
*   **Валидация:** Входящие данные должны быть валидированы с использованием `class-validator` и `class-transformer` через кастомный или встроенный `ValidationPipe`.
*   **Enum'ы:** Использовать TypeScript Enum'ы для предопределенных наборов значений (например, `enum UnitEnum { GRAM = 'g', LITER = 'l', PIECES = 'pcs' }`).

## 4. Разделение Ответственности (Separation of Concerns)

*   **Контроллеры (Controllers):**
    *   Должны быть "тонкими" — минимум логики
    *   Задачи: принимать HTTP-запросы, вызывать сервисы, возвращать HTTP-ответы
    *   Использовать декораторы: `@Controller()`, `@Get()`, `@Post()`, `@Patch()`, `@Delete()`, `@Param()`, `@Query()`, `@Body()`
    *   НЕ должны содержать бизнес-логику
    *   Обязательна документация через декораторы `@ApiOperation()`, `@ApiResponse()` (Swagger)

*   **Сервисы (Services):**
    *   Содержат основную бизнес-логику приложения
    *   Взаимодействуют с репозиториями и другими сервисами
    *   Должны быть независимы от HTTP-контекста
    *   Должны быть помечены как `@Injectable()`
    *   Методы должны выбрасывать исключения `NotFoundException`, `BadRequestException` и т.д.

*   **Сущности (Entities):**
    *   Определяют структуру данных и взаимосвязи с базой данных
    *   Должны быть определены с использованием декораторов TypeORM
    *   НЕ должны содержать бизнес-логику

*   **DTOs:**
    *   Определяют контракты данных для API
    *   Используются для валидации входных данных
    *   Должны быть отделены от Entities

## 5. Аутентификация и Авторизация

*   **JWT-based:** Система использует JWT (JSON Web Tokens) для аутентификации и авторизации
*   **Существующие модули:**
    *   `src/auth` — модуль аутентификации
    *   `src/jwt` — модуль JWT с типами (`IPayload`)
*   **Требования для новой функциональности:**
    *   Если эндпоинт требует защиты, использовать `@UseGuards(JwtAuthGuard)` или аналог
    *   Если требуется проверка ролей, использовать кастомные декораторы и Guards

## 6. API Документация (Swagger)

*   **Обязательна документация API через Swagger:**
    *   `@ApiOperation({ summary: '...' })`
    *   `@ApiResponse({ status: 200, description: '...' })`
    *   `@ApiParam()` и `@ApiQuery()` для параметров
*   **Все публичные эндпоинты должны быть документированы**

## 7. Тестирование

*   **Юнит-тесты (Unit Tests):**
    *   Обязательны для всех сервисов
    *   Используется Jest
    *   Файлы: `<feature>.service.spec.ts`
    *   Должны включать тесты для основных методов и edge cases

*   **E2E-тесты (Integration Tests):**
    *   Для проверки полного взаимодействия (контроллер → сервис → БД)
    *   Файлы в директории `test/`
    *   Используется Jest с `@nestjs/testing`

## 8. Конфигурация, Линтинг и Форматирование

*   **Конфигурация:**
    *   Использование `@nestjs/config` для управления переменными окружения
    *   Файлы `.env` для локальной разработки
    *   Переменные должны быть типизированы

*   **Линтинг и Форматирование:**
    *   ESLint — для проверки качества кода
    *   Prettier — для форматирования
    *   Соблюдение правил, определённых в `eslint.config.mjs`

## 9. Совместимость со Средой

*   **Docker:**
    *   Все изменения должны быть совместимы с Docker-окружением
    *   `docker-compose.yml` определяет сервисы (БД, приложение и т.д.)
    *   Убедитесь, что приложение корректно работает в контейнеризированной среде

## 10. Инструменты и Команды

*   **Стандартные команды NestJS:**
    ```bash
    npm run build       # Сборка проекта
    npm run start       # Запуск приложения
    npm run start:dev   # Запуск в режиме разработки (с hot-reload)
    npm run test        # Запуск юнит-тестов
    npm run test:e2e    # Запуск E2E-тестов
    npm run lint        # Проверка кода ESLint
    ```

*   **Git workflow:**
    *   Создавайте feature-ветки из `dev`: `git checkout -b feature/your-feature dev`
    *   После завершения — создавайте Pull Request в `dev`
    *   После merge в `dev` — на основе review, код может быть merged в `main`

## 11. Примеры

### Пример структуры модуля (Ingredients)

```
src/ingredients/
  ├── ingredients.module.ts
  ├── ingredients.controller.ts
  ├── ingredients.service.ts
  ├── ingredients.service.spec.ts
  ├── dto/
  │   ├── create-ingredient.dto.ts
  │   └── update-ingredient.dto.ts
  ├── entities/
  │   └── ingredient.entity.ts
  └── types/
      └── unit.enum.ts
```

### Пример Entity (Ingredient)

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('float')
  calories: number;

  @Column()
  unit: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Пример DTO (CreateIngredientDto)

```typescript
import { IsNotEmpty, IsString, IsNumber, IsEnum } from 'class-validator';
import { UnitEnum } from '../types/unit.enum';

export class CreateIngredientDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  calories: number;

  @IsNotEmpty()
  @IsEnum(UnitEnum)
  unit: UnitEnum;
}
```

### Пример Service

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
  ) {}

  async create(createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
    const ingredient = this.ingredientsRepository.create(createIngredientDto);
    return this.ingredientsRepository.save(ingredient);
  }

  async findAll(search?: string): Promise<Ingredient[]> {
    const query = this.ingredientsRepository.createQueryBuilder('ingredient');
    if (search) {
      query.where('ingredient.title ILIKE :search', { search: `%${search}%` });
    }
    return query.getMany();
  }

  async findOne(id: string): Promise<Ingredient> {
    const ingredient = await this.ingredientsRepository.findOne({ where: { id } });
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }
    return ingredient;
  }

  async update(id: string, updateIngredientDto: UpdateIngredientDto): Promise<Ingredient> {
    await this.findOne(id); // проверяем существование
    await this.ingredientsRepository.update(id, updateIngredientDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const ingredient = await this.findOne(id);
    await this.ingredientsRepository.remove(ingredient);
  }
}
```

### Пример Controller

```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { Ingredient } from './entities/ingredient.entity';

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ingredient' })
  @ApiResponse({ status: 201, description: 'Ingredient created' })
  async create(@Body() createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
    return this.ingredientsService.create(createIngredientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ingredients with optional search' })
  @ApiResponse({ status: 200, description: 'List of ingredients' })
  async findAll(@Query('search') search?: string): Promise<Ingredient[]> {
    return this.ingredientsService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ingredient by ID' })
  @ApiResponse({ status: 200, description: 'Ingredient found' })
  async findOne(@Param('id') id: string): Promise<Ingredient> {
    return this.ingredientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ingredient' })
  @ApiResponse({ status: 200, description: 'Ingredient updated' })
  async update(
    @Param('id') id: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
  ): Promise<Ingredient> {
    return this.ingredientsService.update(id, updateIngredientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete ingredient' })
  @ApiResponse({ status: 200, description: 'Ingredient deleted' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.ingredientsService.remove(id);
  }
}
```

---

**Этот документ должен быть ориентиром для всех разработчиков (включая автоматизированных агентов) при разработке новых фич для `gym-like-backend`.**
