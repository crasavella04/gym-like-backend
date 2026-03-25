import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  constructor(private readonly configService: ConfigService) {}

  async save(file: Express.Multer.File): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const imgName = uuidv4() + '.' + fileExtension;
    const filePath = path.resolve(__dirname, '..', '..', 'static');

    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }

    fs.writeFileSync(path.resolve(filePath, imgName), file.buffer);
    return this.configService.get('STATIC_URL') + '/' + imgName;
  }

  async remove(filename: string) {
    const filePath = path.resolve(__dirname, '..', '..', 'static', filename);
    await fs.promises.unlink(filePath);
  }
}
