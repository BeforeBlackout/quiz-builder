import { BadRequestException, Injectable, type PipeTransform } from "@nestjs/common";

export const ID_MAX = 2_147_483_647;

@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = Number(value);
    if (!/^[1-9]\d*$/.test(value) || id > ID_MAX) {
      throw new BadRequestException(
        `Validation failed (positive numeric id up to ${ID_MAX} is expected)`,
      );
    }
    return id;
  }
}
