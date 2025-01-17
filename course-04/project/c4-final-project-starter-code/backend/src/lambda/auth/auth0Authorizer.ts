import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set

const jwksUrl = 'https://dev--0mhheds.us.auth0.com/.well-known/jwks.json'
            
const logger = createLogger('auth')

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {

  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  verify(token, populateKey, { algorithms: ['HS256'] }, function (err, decodeed: object) {
    // Checking is valid token here
    if (err) {
      console.log('Error: ', err)
      throw new Error('Invalid JWT token!')
    }
    const jwtPayload = jwt.payload
    // Checking is valid token here
    if (decodeed['sub'] !== jwt.payload.sub || decodeed['iss'] !== jwtPayload.iss || decodeed['iat'] !== jwtPayload.iat || decodeed['exp'] !== jwtPayload.exp) {
      throw new Error('Incorrect JWT token!')
    }
    
    return jwtPayload
  })

  const jwtPayload = jwt.payload
  // return Token here
  return jwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

function populateKey(header, callback) {
  // Required rsa key
  const jwksClient = require('jwks-rsa');
  const client = jwksClient({ jwksUri: jwksUrl })

  // Get signing key value
  client.getSigningKey(header.pid, function (err, key) {
    if (err) { console.log('Error: ', err) }
    const signing_key = key.publicKey || key.rsaPublicKey;
    callback(null, signing_key);
  });
}
