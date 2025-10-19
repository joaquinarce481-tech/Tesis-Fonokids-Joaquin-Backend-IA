import { IsString } from "class-validator";

export class AssistantPageDto {

  @IsString()
  readonly prompt: string;
  
}