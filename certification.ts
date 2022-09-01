import { encode, decode }  from '@msgpack/msgpack';
import { createHash } from 'crypto';
import * as zlib from 'zlib';
import * as testresp from './testdata/testresp.json';

const stage = 'dev';

async function certify (jsonPayload) {
  const trimmedJson = jsonPayload.trim();
  console.log(trimmedJson);

  try {
    // TODO: check JSON against schema: https://github.com/ubirch/cannabis-certificate-schema/tree/main/schema

    // TODO: Create certificate payload as messagepack
      const msgPackPayload = getMsgPackPayload(trimmedJson);
      console.log(uInt8Array2Hex(msgPackPayload));

    // TODO: Hash this messagepack payload
      const hash = getHashedPayload(msgPackPayload);
      console.log(hash);

    // TODO: Send hash to UCC
//      const resp = await sendHash(hash);
      const resp = getTestResp();
      console.log('!!!!!!!!!!!!!!!!!!!!!!!!!! ATTENTION - Testresponse !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
      console.log('Hash has been anchored');
      console.log(resp);

    // TODO: extract hash and signature from UPP
    let [signature, hashUpp] = getSignatureAndUppFromResp(resp);
    console.log('signature: ' + signature);
    console.log('upp: ' + hashUpp);

    // TODO: (nice2have) verify signature of returned UPP? (maybe not in v0 but could be a good idea to mitigate MITM)

    // TODO: replace hash in result upp by messagepacked payoad
    let msgPackUpp = replaceHashByMsgPackInUpp(hashUpp, msgPackPayload);

    // TODO: create packed version: C01:BASE45_STRING(COMPRESS_ZLIB(NEW UPP))
    const packaged = createPackedVersion(msgPackUpp);

  } catch (err) {
    console.log('ERROR!!!!!!!!')
    console.log(err.message)
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

async function sendHash (hash) {
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
  console.log('Upp with hash: ');
  console.log(unpacked_upp);

  const uppLength = unpacked_upp.length;
  // TODO: replace hash in result upp by messagepacked payoad from step 1 (2nd to last (vorletzte) element of the UPP message pack)
  unpacked_upp[uppLength - 2] = msgPackPayload;

  // TODO: replace type in result upp by upp type 0xEE (3rd to last (vor-vorletzte) element)
  unpacked_upp[uppLength - 3] = CERT_HINT;

  console.log('Upp with msgpack: ');
  console.log(unpacked_upp);
  // TODO: create upp from new structure if needed
  return encode(unpacked_upp);
}

function createPackedVersion(msgPackUpp: Uint8Array) {
  // TODO: ZLIB compress the UPP
  console.log(msgPackUpp);
//  const zlibbed_upp = zlib.deflateSync(msgPackUpp);
//  console.log(zlibbed_upp);

  // TODO: base45 encode the zlibed UPP with prefix (<prefix>:<base_45_zlibbed_upp>)


  // TODO: create packed version: C01:BASE45_STRING(COMPRESS_ZLIB(NEW UPP))
  return undefined;
}

function uInt8Array2Hex(val: Uint8Array) {
  return Buffer.from(val).toString('hex');
}

// test hash button click listener
document.getElementById('json-test').addEventListener('click', function () {
  certify((document.getElementById("json-input") as HTMLTextAreaElement).value);
});
