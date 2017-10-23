import * as request from 'web-request';
import { injectable } from 'inversify';
import config from '../config';

@injectable()
export class VerificationClient implements VerificationClientInterface {
  tenantToken: string;
  baseUrl: string;

  constructor(baseUrl: string) {
    request.defaults({
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      throwResponseError: true
    });

    this.baseUrl = baseUrl;
    this.tenantToken = config.auth.token;
  }

  async initiateVerification(method: string, data: InitiateData): Promise<InitiateResult> {
    const result = await request.json<InitiateResult>(`/methods/${ method }/actions/initiate`, {
      baseUrl: this.baseUrl,
      auth: {
        bearer: this.tenantToken
      },
      method: 'POST',
      body: data
    });

    result.method = method;
    delete result.code;

    return result;
  }

  async validateVerification(method: string, id: string, code: string): Promise<ValidationResult> {
    return await request.json<ValidationResult>(`/methods/${ method }/verifiers/${ id }/actions/validate`, {
      baseUrl: this.baseUrl,
      auth: {
        bearer: this.tenantToken
      },
      method: 'POST',
      body: {
        code
      }
    });
  }

  async invalidateVerification(method: string, id: string): Promise<void> {
    await request.json<Result>(`/methods/${ method }/verifiers/${ id }`, {
      baseUrl: this.baseUrl,
      auth: {
        bearer: this.tenantToken
      },
      method: 'DELETE'
    });
  }
}

const VerificationClientType = Symbol('VerificationClientInterface');
export { VerificationClientType };
