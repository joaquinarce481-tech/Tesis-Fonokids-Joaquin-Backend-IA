import { IsString } from 'class-validator';

export class AudioToTextDto {
  
  @IsString()
  readonly audioFile: string; // Base64 del audio o path del archivo
}