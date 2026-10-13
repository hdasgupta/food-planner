import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <article className="privacy-policy">
      <Link className="privacy-back" to="/">← Back to Food Planner</Link>
      <p className="eyebrow">FOOD PLANNER</p>
      <h1>Privacy Policy</h1>
      <p><strong>Last updated:</strong> 13 October 2026</p>
      <p>
        This Privacy Policy explains how Food Planner handles information when you use the
        website or Android app. The app helps you manage recipes and plan meals for different dates.
      </p>

      <h2>Information we handle</h2>
      <ul>
        <li><strong>Account information:</strong> information you provide when registering, such as your name and email address, and authentication information needed to keep your account secure.</li>
        <li><strong>Meal-planning information:</strong> meal plans, selected recipes, quantities, units, and notes you save.</li>
        <li><strong>App preferences:</strong> settings such as theme preference and locally remembered quantity or unit values.</li>
        <li><strong>Email delivery details:</strong> if you use an email feature, the email address and menu information needed to send the requested message or configured menu delivery.</li>
        <li><strong>Technical data:</strong> the service may process routine request and security information needed to operate, protect, and troubleshoot the app.</li>
      </ul>

      <h2>How information is used</h2>
      <p>
        Information is used to provide account access, save and retrieve your meal plans, display recipes,
        remember your preferences, deliver emails you request or configure, and protect the service from
        misuse. Local preferences may be stored on your device using browser or app storage.
      </p>

      <h2>Storage and sharing</h2>
      <p>
        Account and meal-planning information may be stored on the application's backend database.
        Information may be processed by hosting, database, or email providers that support the service.
        It is not sold to advertisers. Information may also be disclosed where required by law or when
        reasonably necessary to protect the service, its users, or their security.
      </p>

      <h2>Retention and security</h2>
      <p>
        Information is retained for as long as needed to operate your account and provide the service,
        or as otherwise required for legitimate operational or legal purposes. Reasonable technical and
        organizational safeguards are used, but no online service can guarantee absolute security.
      </p>

      <h2>Your choices</h2>
      <p>
        You can avoid entering optional information, manage email settings where available, and clear
        locally stored app preferences through your browser or device settings. If you need help with
        account information or want to request its deletion, contact the service operator through the
        support channel used to provide this app.
      </p>

      <h2>Children's privacy</h2>
      <p>
        Food Planner is a general meal-planning tool and is not designed to collect personal information
        from children specifically. A parent or guardian should contact the service operator if they
        believe a child has provided personal information and would like it reviewed.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        This policy may be updated when the app's features or data practices change. The revised version
        will be published on this page with an updated date.
      </p>
    </article>
  );
}
