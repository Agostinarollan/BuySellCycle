import { PartialType } from '@nestjs/mapped-types';
import { CreateMarcaDto } from './create-marca.dto';

// PartialType copia las validaciones de CreateMarcaDto pero hace
// que todos los campos sean opcionales (ideal para PATCH).
export class UpdateMarcaDto extends PartialType(CreateMarcaDto) {}
