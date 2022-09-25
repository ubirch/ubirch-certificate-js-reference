import { EUbirchCertificationStateKeys, IUbirchCertificationResult, UbirchCertification } from './node_modules/@ubirch/ubirch-certification-js';
import { EUbirchVerificationStateKeys, IUbirchVerificationResult } from '@ubirch/ubirch-verification-js';
import environment from './environment.dev';
import { EUbirchHashAlgorithms, EUbirchStages, UbirchVerification } from './node_modules/@ubirch/ubirch-verification-js';

let ubirchCertification;
let ubirchVerification;
let certSubscription = null;
let verifySubscription = null;
let selectedHashAlgo = EUbirchHashAlgorithms.SHA256;

function setupUbirchCertification() {
  ubirchCertification = new UbirchCertification({
    deviceId: environment.device,
    stage: environment.stage as EUbirchStages,
  });
  (document.getElementById('log') as HTMLInputElement).value = '';
  if (!certSubscription) certSubscription = ubirchCertification.messenger.subscribe(updateLog);
}

async function certify (jsonPayload: string) {
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

      // TODO: send it to the verify endpoint and check response
      const resp = ubirchVerification
        .verifyUPP(packedSignedUpp)
        .then((response) => {
          updateLog(response);
          displayVerificationResult(response)
        });

  } catch (err) {
    const msg =
      'Verification failed!!\n\nErrorResponse:\n' + JSON.stringify(err, null, 2);
    updateLog(msg);
    displayVerificationResult({
      verificationState: EUbirchVerificationStateKeys.VERIFICATION_FAILED,
      failed: {
        code: err.code,
        errorBECodes: err.errorBECodes,
        message: err.message
      }
    } as IUbirchVerificationResult);
  }
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
if (document.getElementById('start-certification')) {
  document.getElementById('start-certification').addEventListener('click', function () {
    certify((document.getElementById("json-input") as HTMLTextAreaElement).value);
  });

}

// start verification button click listener
if (document.getElementById('start-verification')) {
  document.getElementById('start-verification').addEventListener('click', function () {
    verify((document.getElementById("signed-upp-output") as HTMLTextAreaElement).value);
  });

}
