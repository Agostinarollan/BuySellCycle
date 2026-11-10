import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaNivel2Dto } from './create-categoria-nivel2.dto';
export class UpdateCategoriaNivel2Dto extends PartialType(
CreateCategoriaNivel2Dto,
) {}