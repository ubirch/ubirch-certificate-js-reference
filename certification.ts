import { encode, decode }  from '@msgpack/msgpack';
import { createHash } from 'crypto';
import * as zlib from 'zlib';
import * as base45 from 'base45';
import * as testresp from './testdata/testresp.json';

const stage = 'dev';

async function certify (jsonPayload) {
  try {
    const trimmedJson = jsonPayload.trim();
    log(trimmedJson);

    // TODO: check JSON against schema: e.g. https://github.com/ubirch/cannabis-certificate-schema/tree/main/schema

    // TODO: Create certificate payload as messagepack
      const msgPackPayload = getMsgPackPayload(trimmedJson);
      log(uInt8Array2Hex(msgPackPayload));

    // TODO: Hash this messagepack payload
      const hash = getHashedPayload(msgPackPayload);
      log(hash);

    // TODO: Send hash to UCC
     const resp = await certifyHash(hash);
     log('Hash has been anchored');
      // const resp = getTestResp();
      // log('!!!!!!!!!!!!!!!!!!!!!!!!!! ATTENTION - Testresponse !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
      log(resp.toString());

    // TODO: extract hash and signature from UPP
    let [signature, hashUpp] = getSignatureAndUppFromResp(resp);
    log('signature: ' + signature);
    log('upp: ' + hashUpp);

    // TODO: (nice2have) verify signature of returned UPP? (maybe not in v0 but could be a good idea to mitigate MITM)

    // TODO: replace hash in result upp by messagepacked payoad
    let msgPackUpp = replaceHashByMsgPackInUpp(hashUpp, msgPackPayload);
    log(msgPackUpp.toString());

    // TODO: create packed version: C01:BASE45_STRING(COMPRESS_ZLIB(NEW UPP))
    const packaged = packSignedUpp(msgPackUpp);
    displaySignedUpp(packaged);

  } catch (err) {
    log('ERROR!!!!!!!!')
    log(err.message)
  }
}

async function verify (packedSignedUpp: string) {
  try {
      if (!packedSignedUpp) {
        throw new Error('No SignedUPP inserted');
      }
      log('start verification with: ' + packedSignedUpp);

      // TODO: unpack UPP with msgpack payload
      const msgPackUpp = unpackSignedUpp(packedSignedUpp);
      log(msgPackUpp.toString());

      // TODO: extract signature and check it (not in v0 but later)

      // TODO: extract the messagepack payload
      const msgpackPayload = getMsgPackPayloadFromUpp(msgPackUpp);
      log(uInt8Array2Hex(msgpackPayload));

      // TODO: extract data from msgpack payload
      // TODO: schema validation of extracted data
      // TODO: display extracted data

      // TODO: hash it (sha256)
      const hash = getHashedPayload(msgpackPayload);
      log(hash);

      // TODO: send it to the verify endpoint
      const resp = await verifyHash(hash);
      log(resp);

      // TODO: For verification in v0 we can use the v1 verify endpoint without token
      // TODO: Later we will need to provide a token for testing the verification

      // TODO: show verification result - handle that signed upps will never be anchored in any blockchains
      displayVerificationResult(resp);

  } catch (err) {
      log('ERROR!!!!!!!!')
      log(err.message)
  }
}

function getMsgPackPayload (jsonPayload) {
  return encode(jsonPayload);
}

function getHashedPayload (payload) {
  return createHash('sha256').update(payload).digest('base64');
}

function getTestResp() {
  return testresp;
}

async function certifyHash (hash) {
  /**
   example:
   curl --location --request POST https://api.certify.demo.ubirch.com/api/v1/x509/anchor \
   --cert-type p12 \
   --cert "$PFX:$(cat "$PWD")" \
   --header 'X-Identity-Id: 776d1279-bb02-55e7-9da1-e2d01a14a758' \
   --header 'Content-Type: text/plain' \
   --data "$hash"
   */

  const url = 'https://api.certify.' + stage + '.ubirch.com/api/v1/x509/anchor';

  // TODO: Configure x-identity-id header in the request with target identity (deviceID of the PoC): --header 'X-Identity-Id: 776d1279-bb02-55e7-9da1-e2d01a14a758'
  const options = {
    method: 'POST',
    body: hash,
    headers: {
      'Content-type': 'text/plain',
      'X-UPP-Type-Id': 'signed',
      'X-Identity-Id': '58dcddb4-44a8-5482-a973-95541394c0ba'
    }
  };

  // TODO: Send hash to UCC
  return fetch(url, options)
    .catch((err) => err.message as string)
    .then((response) => {
      if (typeof response === 'string') {
        throw new Error(response);
      }

      switch (response.status) {
        case 200: {
          return response.json();
        }
        case 404: {
          throw new Error('Something cannot be found');
        }
        case 401: {
          throw new Error('You are not authorised to create a certificate')
        }
        case 403: {
          throw new Error('You are not authorised to create a certificate')
        }
        case 405: {
          throw new Error('You are not authorised to create a certificate')
        }
        case 409: {
          throw new Error('This certificate has already been anchored! You need to change something in the JSON')
        }
        case 500: {
          throw new Error('An internal server error occurred')
        }
        default: {
          throw new Error('An unexpected error occurred')
        }
      }
    });
}

async function verifyHash (hash) {
  /**
   example:
   curl -s -X POST https://verify.demo.ubirch.com/api/upp/verify -d '24gpRTHckCjMTMxR17dBHxa8cKMm8uZ+I5HsFCOIbqU='
  */

  const url = 'https://verify.' + stage + '.ubirch.com/api/upp/verify';

  // TODO: Configure x-identity-id header in the request with target identity (deviceID of the PoC): --header 'X-Identity-Id: 776d1279-bb02-55e7-9da1-e2d01a14a758'
  const options = {
    method: 'POST',
    body: hash
  };

  // TODO: Send hash to Verification API
  return fetch(url, options)
    .catch((err) => err.message as string)
    .then((response) => {
      if (typeof response === 'string') {
        throw new Error(response);
      }

      switch (response.status) {
        case 200: {
          return response.json();
        }
        case 404: {
          throw new Error('Something cannot be found');
        }
        case 401: {
          throw new Error('You are not authorised to create a certificate')
        }
        case 403: {
          throw new Error('You are not authorised to create a certificate')
        }
        case 405: {
          throw new Error('You are not authorised to create a certificate')
        }
        case 409: {
          throw new Error('This certificate has already been anchored! You need to change something in the JSON')
        }
        case 500: {
          throw new Error('An internal server error occurred')
        }
        default: {
          throw new Error('An unexpected error occurred')
        }
      }
    });
}

function getSignatureAndUppFromResp(resp: any): [ string, string ] {
  try {
    const body = resp.data.body;
    const signature = body.publicKey;
    const upp = body.upp;
    return [signature, upp];

  } catch (err) {
    throw new Error(err.message)
  }
}

const CERT_HINT = 0xEE
const CERT_PREFIX = "C01:"

function replaceHashByMsgPackInUpp(hashUpp: string, msgPackPayload: Uint8Array) {
  // TODO: unpack upp
  let unpacked_upp: any[] = decode(Buffer.from(hashUpp, 'base64')) as any[];
  log('Upp with hash: ');
  log(unpacked_upp.toString());

  const uppLength = unpacked_upp.length;
  // TODO: replace hash in result upp by messagepacked payoad from step 1 (2nd to last (vorletzte) element of the UPP message pack)
  unpacked_upp[uppLength - 2] = msgPackPayload;

  // TODO: replace type in result upp by upp type 0xEE (3rd to last (vor-vorletzte) element)
  unpacked_upp[uppLength - 3] = CERT_HINT;

  log('Upp with msgpack: ');
  log(unpacked_upp.toString());
  // TODO: create upp from new structure if needed
  return encode(unpacked_upp);
}

function packSignedUpp(msgPackUpp: Uint8Array) {
  // TODO: ZLIB compress the UPP
  const buf = Buffer.from(msgPackUpp);
 const zlibbed_upp = zlib.deflateSync(buf);

  // TODO: base45 encode the zlibed UPP with prefix (<prefix>:<base_45_zlibbed_upp>)
  const base45ed_upp = base45.encode(zlibbed_upp);

  // TODO: create packed version: C01:BASE45_STRING(COMPRESS_ZLIB(NEW UPP))
  return CERT_PREFIX + base45ed_upp;
}

function unpackSignedUpp(packedUpp: string) {
  // TODO: remove prefix
  const upp_withoutPrefix = packedUpp.replace(new RegExp("^" + CERT_PREFIX), '');

  // TODO: base45 decode the STRING without prefix
  const unBase45ed_upp = base45.decode(upp_withoutPrefix);

  // TODO: ZLIB decompress the result
  return zlib.inflateSync(unBase45ed_upp);
}

function getMsgPackPayloadFromUpp(msgPackUpp: Buffer) {
   const unpackedUpp: any[] = decode(msgPackUpp) as any[];
   const len = unpackedUpp.length;
   const msgpackPayload = unpackedUpp[len-2];
  return msgpackPayload;
}


function uInt8Array2Hex(val: Uint8Array) {
  return Buffer.from(val).toString('hex');
}

function displaySignedUpp(signedUpp) {
  (document.getElementById('signed-upp-output')as HTMLTextAreaElement).value = signedUpp;
}

function displayVerificationResult(resp: any) {
  let verificationSuccessful = !(!resp.upp || !resp.upp.length);
  (document.getElementById('output')as HTMLTextAreaElement).value = "#################### RESULT #####################\n" + (verificationSuccessful ? 'Verification successful' : 'Verification failed!!!!');
}
function log(message: string) {
  (document.getElementById('log')as HTMLTextAreaElement).value += message;
}
// start certification button click listener
document.getElementById('start-certification').addEventListener('click', function () {
  certify((document.getElementById("json-input") as HTMLTextAreaElement).value);
});

// start verification button click listener
document.getElementById('start-verification').addEventListener('click', function () {
  verify((document.getElementById("signed-upp-output") as HTMLTextAreaElement).value);
});
