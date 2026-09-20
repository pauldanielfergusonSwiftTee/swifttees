export const metadata = {
  title: "Privacy Policy | Swift Tees",
  description: "Privacy Policy for the Swift Tees golf app.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="text-3xl font-bold">Swift Tees Privacy Policy</h1>

      <p className="mt-3 text-sm text-gray-500">
        Last updated: 20 September 2026
      </p>

      <div className="mt-8 space-y-8 leading-7 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            About Swift Tees
          </h2>
          <p className="mt-2">
            Swift Tees is a golf trip companion app providing live scoring,
            leaderboards, commentary, event information and a history of golf
            trips.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            Information We Collect
          </h2>
          <p className="mt-2">
            Swift Tees may collect information entered into the app as part of
            its golf scoring and event features. This can include player names,
            golf scores, team information and other information relating to a
            golf event.
          </p>

          <p className="mt-3">
            If you enable push notifications, Swift Tees also stores a device
            push-notification token. This allows notifications relating to
            scoring, leaderboards, results and events to be delivered to your
            device.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            How We Use Information
          </h2>
          <p className="mt-2">
            Information is used only to provide and operate Swift Tees
            features, including scoring, leaderboards, commentary, event
            information, score synchronisation and push notifications.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            Data Storage and Services
          </h2>
          <p className="mt-2">
            Swift Tees uses third-party infrastructure and hosting services to
            operate the app and securely store the information required for its
            features. Push notifications on Apple devices are delivered using
            Apple Push Notification service (APNs).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            Advertising and Tracking
          </h2>
          <p className="mt-2">
            Swift Tees does not use personal information for third-party
            advertising and does not use collected information to track users
            across apps or websites for advertising purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            Data Sharing
          </h2>
          <p className="mt-2">
            Swift Tees does not sell personal information. Information may be
            processed by service providers where necessary to operate the app
            and its features.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            Your Choices
          </h2>
          <p className="mt-2">
            You can choose whether to allow push notifications through your
            device settings. You can also request information about data
            associated with you, or request its correction or deletion, by
            contacting Swift Tees.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            Changes to This Policy
          </h2>
          <p className="mt-2">
            This Privacy Policy may be updated as Swift Tees develops. Any
            changes will be published on this page.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Contact</h2>
          <p className="mt-2">
            For privacy questions or requests relating to Swift Tees, please
            contact the developer using the contact details provided through
            the Swift Tees App Store listing.
          </p>
        </section>
      </div>
    </main>
  );
}