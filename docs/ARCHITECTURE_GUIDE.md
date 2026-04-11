# Архитектурное Руководство gym-like-backend

## Структура Модуля

```
src/<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts
├── <feature>.service.ts
├── <feature>.service.spec.ts
├── entities/
│   └── <entity>.entity.ts
├── dto/
│   ├── create-<feature>.dto.ts
│   └── update-<feature>.dto.ts
└── types/
    └── <enum>.ts
```

## Entity (TypeORM)

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('my_entities')
export class MyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'float' })
  value: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Правила:**
- UUID primary key
- Всегда добавляй `createdAt` и `updatedAt`
- Правильно выбирай типы колонок
- Для отношений используй `@ManyToOne`, `@OneToMany`

## DTO (Валидация)

```typescript
import { IsNotEmpty, IsString, IsNumber, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMyEntityDto {
  @ApiProperty({ description: 'Название', example: 'Example' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Значение', example: 10 })
  @IsNotEmpty()
  @IsNumber()
  value: number;
}

export class UpdateMyEntityDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  value?: number;
}
```

## Service (CRUD операции)

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { MyEntity } from './entities/my-entity.entity';
import { CreateMyEntityDto } from './dto/create-my-entity.dto';
import { UpdateMyEntityDto } from './dto/update-my-entity.dto';

@Injectable()
export class MyEntitiesService {
  constructor(
    @InjectRepository(MyEntity)
    private repo: Repository<MyEntity>,
  ) {}

  async create(dto: CreateMyEntityDto): Promise<MyEntity> {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(search?: string, skip = 0, take = 10) {
    const where = search ? { title: Like(`%${search}%`) } : {};
    const [data, total] = await this.repo.findAndCount({ where, skip, take, order: { createdAt: 'DESC' } });
    return { data, total };
  }

  async findOne(id: string): Promise<MyEntity> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Entity with ID "${id}" not found`);
    return entity;
  }

  async update(id: string, dto: UpdateMyEntityDto): Promise<MyEntity> {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
```

## Controller (REST API)

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MyEntitiesService } from './my-entities.service';
import { MyEntity } from './entities/my-entity.entity';
import { CreateMyEntityDto } from './dto/create-my-entity.dto';
import { UpdateMyEntityDto } from './dto/update-my-entity.dto';

@ApiTags('my-entities')
@Controller('my-entities')
export class MyEntitiesController {
  constructor(private service: MyEntitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create entity' })
  @ApiResponse({ status: 201, type: MyEntity })
  create(@Body() dto: CreateMyEntityDto): Promise<MyEntity> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all entities' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  findAll(@Query('search') search?: string, @Query('skip') skip: number = 0, @Query('take') take: number = 10) {
    return this.service.findAll(search, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get entity by ID' })
  @ApiResponse({ status: 200, type: MyEntity })
  findOne(@Param('id') id: string): Promise<MyEntity> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update entity' })
  @ApiResponse({ status: 200, type: MyEntity })
  update(@Param('id') id: string, @Body() dto: UpdateMyEntityDto): Promise<MyEntity> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete entity' })
  @ApiResponse({ status: 204 })
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
```

## Module

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MyEntitiesService } from './my-entities.service';
import { MyEntitiesController } from './my-entities.controller';
import { MyEntity } from './entities/my-entity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MyEntity])],
  controllers: [MyEntitiesController],
  providers: [MyEntitiesService],
  exports: [MyEntitiesService],
})
export class MyEntitiesModule {}
```

## Регистрация в AppModule

1. Импортируй модуль:
```typescript
@Module({
  imports: [
    // ...
    MyEntitiesModule,
  ],
})
export class AppModule {}
```

2. Добавь Entity в TypeOrmModule.forRoot():
```typescript
TypeOrmModule.forRoot({
  entities: [User, Metric, Exercise, MyEntity], // Добавить сюда
  synchronize: true,
})
```

## Юнит-тесты (Service.spec.ts)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { MyEntitiesService } from './my-entities.service';
import { MyEntity } from './entities/my-entity.entity';

describe('MyEntitiesService', () => {
  let service: MyEntitiesService;
  let mockRepo: any;

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MyEntitiesService,
        { provide: getRepositoryToken(MyEntity), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<MyEntitiesService>(MyEntitiesService);
  });

  it('should create entity', async () => {
    const dto = { title: 'Test', value: 10 };
    const expected = { id: '123', ...dto };
    mockRepo.create.mockReturnValue(dto);
    mockRepo.save.mockResolvedValue(expected);

    const result = await service.create(dto);
    expect(result).toEqual(expected);
  });

  it('should throw NotFoundException if entity not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
  });
});
```

## Enum

```typescript
// src/<feature>/types/<name>.enum.ts
export enum MyEnum {
  VALUE_A = 'a',
  VALUE_B = 'b',
  VALUE_C = 'c',
}
```

Использование в Entity и DTO:
```typescript
@Column({ type: 'varchar', length: 10 })
type: MyEnum;

@IsEnum(MyEnum)
type: MyEnum;
```

## Чек-лист для новых модулей

- ✅ Структура: entities/, dto/, types/, .module.ts, .controller.ts, .service.ts, .service.spec.ts
- ✅ Entity: UUID, createdAt, updatedAt, правильные типы
- ✅ DTO: Create и Update с валидацией и Swagger аннотациями
- ✅ Service: CRUD методы, обработка ошибок
- ✅ Controller: REST методы, Swagger docs
- ✅ Module: Регистрация в AppModule и в TypeOrmModule.forRoot entities[]
- ✅ Tests: юнит-тесты для сервиса
- ✅ Код компилируется: `npm run build`
- ✅ Тесты проходят: `npm run test`
