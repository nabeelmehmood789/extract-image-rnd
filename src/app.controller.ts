import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import {unlink} from "fs";
import * as ffmpeg from "ffmpeg";
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './files/',
        filename: function(req,file,cb){
          const extensionName = file.originalname.split(".").pop();
          cb(null,uuidv4()+"."+extensionName);
        }
      }),
    }),
  )
  async uploadedFile(@UploadedFile() file) {
    const frameSettings = {
      every_n_percentage: 50,
      number: 1,
    };
    return new Promise(async (resolve, reject) => {
      try {
        const video = await new ffmpeg(`./files/${file.filename}`);
        video.fnExtractFrameToJPG('./files', frameSettings, () => {
          unlink(`files/${file.filename}`,(err)=>{
              if(err){
                console.log(err);
              }
          });
          resolve(`files/${file.filename}_1.jpg`);
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}
