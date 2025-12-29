import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): any {
    const { id, name, emails, photos } = profile;
    const email = emails && emails[0] ? emails[0].value : null;
    const fullName = name
      ? `${name.givenName || ''} ${name.familyName || ''}`.trim() || name.displayName || ''
      : '';
    const avatar = photos && photos[0] ? photos[0].value : null;

    const user = {
      googleId: id,
      email,
      name: fullName,
      avatar,
      accessToken,
    };
    done(null, user);
  }
}

