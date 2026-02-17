import {
    IsString,
    MinLength,
    MaxLength,
    IsArray,
    ArrayMinSize,
    ArrayMaxSize,
    IsNotEmpty,
    IsDate
} from 'class-validator';

export class PollDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(100)
    statement: string;

    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(6)
    options: string[];

    @IsDate()
    @IsNotEmpty()
    validTill: Date;
}
