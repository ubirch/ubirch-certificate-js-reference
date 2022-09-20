import { createHash } from 'crypto';
import { decode }  from '@msgpack/msgpack';
import * as zlib from 'zlib';
import * as base45 from 'base45';
import environment from './environment';
import { UbirchVerification, EUbirchHashAlgorithms, EUbirchStages } from "./node_modules/@ubirch/ubirch-verification-js";
import { IUbirchCertificationResult, UbirchCertification, EUbirchCertificationStateKeys } from '@ubirch/ubirch-certification-js';

let ubirchCertification;
let ubirchVerification;
let certSubscription = null;
let verifySubscription = null;
let selectedHashAlgo = EUbirchHashAlgorithms.SHA256;

const CERT_HINT = 0xEE
const CERT_PREFIX = "C01:"

function setupUbirchCertification() {
  ubirchCertification = new UbirchCertification({
    deviceId: environment.device,
    stage: environment.stage as EUbirchStages,
  });
  (document.getElementById('log') as HTMLInputElement).value = '';
  if (!certSubscription) certSubscription = ubirchCertification.messenger.subscribe(updateLog);
}

async function certify (jsonPayload) {
  try {
    if (!jsonPayload) {
      throw new Error('No JSON data inserted');
    }
    updateLog('start certification with: ' + jsonPayload);

    if (!ubirchCertification) {
      setupUbirchCertification();
    }

    const json = JSON.parse(jsonPayload);

    ubirchCertification
      .certifyJson(json)
      .then((response) => {
        updateLog(response);
        displayCertificationResult(response);
      })
  } catch (err) {
    const msg =
      'Certification failed!!\n\nErrorResponse:\n' + JSON.stringify(err, null, 2);
    updateLog(msg);
    displayCertificationResult({
      certificationState: EUbirchCertificationStateKeys.CERTIFICATION_FAILED,
      failed: {
        code: err.code,
        message: err.message
      }
    } as IUbirchCertificationResult);
  }
}

function setupUbirchVerification() {
  try {
    const token = environment.token;
    if (token) {
      // create ubirchVerificationWidget instance
      ubirchVerification = new UbirchVerification({
        algorithm: selectedHashAlgo,
        stage: environment.stage as EUbirchStages,
        accessToken: token
      });
      (document.getElementById('log') as HTMLInputElement).value = '';
      if (!verifySubscription) verifySubscription = ubirchVerification.messenger.subscribe(updateLog);
    } else {
      throw new Error(`Token of stage ${environment.stage} not set!\n`);
    }
  } catch (e) {
    window.alert(e.message);
  }
}

async function verify (packedSignedUpp: string) {
  try {
      if (!packedSignedUpp) {
        throw new Error('No SignedUPP inserted');
      }
      updateLog('start verification with: ' + packedSignedUpp);

      if (!ubirchVerification) {
        setupUbirchVerification();
      }

      // TODO: check prefix of upp
      if (! packedSignedUpp.startsWith(CERT_PREFIX)) {
        throw new Error('Verification Failed!! Wrong Prefix!!!!');
      }

      // TODO: unpack UPP with msgpack payload
      const msgPackUpp = unpackSignedUpp(packedSignedUpp);
      updateLog(msgPackUpp.toString());

      // TODO check type of upp
      if (!checkUppType(msgPackUpp, CERT_HINT)) {
        throw new Error('Verification failed!!!! - wrong type of upp!!');
      }

      // TODO: extract signature and check it (not in v0 but later)

      // TODO: extract the messagepack payload
      const msgpackPayload = getMsgPackPayloadFromUpp(msgPackUpp);
      updateLog(uInt8Array2Hex(msgpackPayload));

      // TODO: extract data from msgpack payload

      // TODO: schema validation of extracted data
      // TODO: display extracted data

      // TODO: hash it (sha256)
      const hash = getHashedPayload(msgpackPayload);
      updateLog(hash);

      // TODO: send it to the verify endpoint and check response
      const resp = await ubirchVerification.verifyHash(hash);

      // TODO: show verification result
      //  TODO: handle that signed upps will never be anchored in any blockchains
      displayVerificationResult(resp);

  } catch (err) {
      updateLog('ERROR!!!!!!!!')
      updateLog(err.message)
  }
}

function getHashedPayload (payload) {
  return createHash('sha256').update(payload).digest('base64');
}

function unpackSignedUpp(packedUpp: string) {
  // TODO: remove prefix
  const upp_withoutPrefix = packedUpp.replace(new RegExp("^" + CERT_PREFIX), '');

  // TODO: base45 decode the STRING without prefix
  const unBase45ed_upp = base45.decode(upp_withoutPrefix);

  // TODO: ZLIB decompress the result
  return zlib.inflateSync(unBase45ed_upp);
}

function checkUppType(msgPackUpp: Buffer, type: any) {
  const unpackedUpp: any[] = decode(msgPackUpp) as any[];
  const len = unpackedUpp.length;
  const uppType = unpackedUpp[len-3];
  return uppType === type;
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

function displayVerificationResult(resp: any) {
  let result = "#################### RESULT #####################\n";
  result += JSON.stringify(resp);
  (document.getElementById('output')as HTMLTextAreaElement).value = result;
}

function displayCertificationResult(resp: IUbirchCertificationResult) {
  if (resp.certificationState === EUbirchCertificationStateKeys.CERTIFICATION_FAILED) {
    (document.getElementById('signed-upp-output')as HTMLTextAreaElement).value =
      "#################### CERTIFICATION_FAILED #####################\n"  +
      resp.failed.code +
      resp.failed.message ? "\n" + resp.failed.message : '';
  } else {
    (document.getElementById('signed-upp-output')as HTMLTextAreaElement).value = resp.upp.upp;
  }
}

function updateLog(message: string) {
  console.log(message);

  (document.getElementById('log')as HTMLTextAreaElement).value =
    JSON.stringify(message, null, 2) + "\n\n" + (document.getElementById('log')as HTMLTextAreaElement).value;
}
// start certification button click listener
document.getElementById('start-certification').addEventListener('click', function () {
  certify((document.getElementById("json-input") as HTMLTextAreaElement).value);
});

// start verification button click listener
document.getElementById('start-verification').addEventListener('click', function () {
  verify((document.getElementById("signed-upp-output") as HTMLTextAreaElement).value);
});
