import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse } from './types/auth-response.type';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a local user and return a JWT.' })
  @ApiOkResponse({ description: 'User registered and authenticated.' })
  @ApiBadRequestResponse({ description: 'Invalid registration payload.' })
  @ApiConflictResponse({ description: 'Email or username is already in use.' })
  register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email or username and return a JWT.' })
  @ApiOkResponse({ description: 'User authenticated.' })
  @ApiBadRequestResponse({ description: 'Invalid login payload.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login or register with a Google ID token.' })
  @ApiOkResponse({ description: 'Google user authenticated.' })
  @ApiBadRequestResponse({ description: 'Invalid Google login payload.' })
  @ApiUnauthorizedResponse({ description: 'Invalid Google ID token.' })
  googleLogin(@Body() dto: GoogleLoginDto): Promise<AuthResponse> {
    return this.authService.googleLogin(dto);
  }
}
