import { IsString, Matches } from "class-validator";

export class LoginUserDto {
    @IsString()
    username!: string;

    @IsString()
    @Matches(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,16}$/, {
        message:
            "비밀번호는 영문 대소문자, 특수문자, 숫자를 포함하여 8~16자리로 입력해주세요.",
    })
    password!: string;
}
