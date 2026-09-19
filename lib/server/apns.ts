import http2 from "node:http2";
import jwt from "jsonwebtoken";

type SendApnsInput = {
  deviceToken: string;
  title: string;
  message: string;
  url?: string;
};

type ApnsResult = {
  success: boolean;
  status: number;
  reason?: string;
};

function getApnsConfig() {
  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID;
  const bundleId = process.env.APNS_BUNDLE_ID;
  const privateKey = process.env.APNS_PRIVATE_KEY;

  if (!keyId) {
    throw new Error("Missing APNS_KEY_ID");
  }

  if (!teamId) {
    throw new Error("Missing APNS_TEAM_ID");
  }

  if (!bundleId) {
    throw new Error("Missing APNS_BUNDLE_ID");
  }

  if (!privateKey) {
    throw new Error("Missing APNS_PRIVATE_KEY");
  }

  return {
    keyId,
    teamId,
    bundleId,

    // Allows the key to work whether Vercel preserved real
    // line breaks or stored them as \n.
    privateKey: privateKey.replace(/\\n/g, "\n"),
  };
}

function createProviderToken() {
  const {
    keyId,
    teamId,
    privateKey,
  } = getApnsConfig();

  return jwt.sign(
    {},
    privateKey,
    {
      algorithm: "ES256",
      issuer: teamId,
      header: {
        alg: "ES256",
        kid: keyId,
      },
    }
  );
}

async function sendToApnsHost(
  host: string,
  input: SendApnsInput
): Promise<ApnsResult> {
  const {
    bundleId,
  } = getApnsConfig();

  const providerToken = createProviderToken();

  const client = http2.connect(host);

  return new Promise<ApnsResult>((resolve, reject) => {
    let settled = false;

    const finish = (result: ApnsResult) => {
      if (settled) return;

      settled = true;
      client.close();
      resolve(result);
    };

    client.on("error", (error) => {
      if (settled) return;

      settled = true;
      client.destroy();
      reject(error);
    });

    const request = client.request({
      ":method": "POST",
      ":path": `/3/device/${input.deviceToken}`,
      authorization: `bearer ${providerToken}`,
      "apns-topic": bundleId,
      "apns-push-type": "alert",
      "apns-priority": "10",
      "apns-expiration": "0",
    });

    let status = 0;
    let responseBody = "";

    request.setEncoding("utf8");

    request.on("response", (headers) => {
      status = Number(headers[":status"] ?? 0);
    });

    request.on("data", (chunk) => {
      responseBody += chunk;
    });

    request.on("end", () => {
      if (status === 200) {
        finish({
          success: true,
          status,
        });

        return;
      }

      let reason = responseBody;

      try {
        const parsed = JSON.parse(responseBody);

        if (parsed?.reason) {
          reason = parsed.reason;
        }
      } catch {
        // Keep Apple's raw response if it wasn't JSON.
      }

      finish({
        success: false,
        status,
        reason:
          reason || "Unknown APNs error",
      });
    });

    request.on("error", (error) => {
      if (settled) return;

      settled = true;
      client.destroy();
      reject(error);
    });

    const payload = {
      aps: {
        alert: {
          title: input.title,
          body: input.message,
        },
        sound: "default",
      },

      url: input.url ?? "/live-centre",
    };

    request.end(JSON.stringify(payload));
  });
}

export async function sendApnsNotification(
  input: SendApnsInput
): Promise<ApnsResult> {
  /*
   * TestFlight/App Store builds use production APNs.
   * Xcode development builds use sandbox APNs.
   *
   * Try production first. If Apple tells us the token does not
   * belong to that environment, retry against sandbox.
   */

  const productionResult =
    await sendToApnsHost(
      "https://api.push.apple.com",
      input
    );

  if (
    productionResult.success ||
    productionResult.reason !== "BadDeviceToken"
  ) {
    return productionResult;
  }

  return sendToApnsHost(
    "https://api.sandbox.push.apple.com",
    input
  );
}