import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  color?: string;
}

export class MoveToFolderDto {
  @IsString()
  @IsOptional()
  folderId?: string;
}
