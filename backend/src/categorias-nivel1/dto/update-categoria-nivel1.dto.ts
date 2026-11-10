import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaNivel1Dto } from './create-categoria-nivel1.dto';
export class UpdateCategoriaNivel1Dto extends PartialType(
CreateCategoriaNivel1Dto,
) {}