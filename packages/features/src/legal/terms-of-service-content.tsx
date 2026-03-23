const sectionClass = 'space-y-3'
const h2Class =
  'scroll-mt-24 text-lg font-semibold tracking-tight text-foreground first:mt-0'
const pClass = 'text-[15px] leading-relaxed text-muted-foreground'
const ulClass = 'list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-muted-foreground'

/** Full Terms of Service body (used on /terms and marketing). */
export function TermsOfServiceContent() {
  return (
    <div className="space-y-10">
      <p className="text-sm text-muted-foreground">
        <strong className="font-medium text-foreground">Last updated:</strong> March 23,
        2026
      </p>

      <section className={sectionClass}>
        <h2 className={h2Class}>1. Agreement to terms</h2>
        <p className={pClass}>
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of Scan It
          (the &quot;Service&quot;), including our websites and applications. By accessing or
          using the Service, you agree to be bound by these Terms. If you do not agree, do
          not use the Service.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>2. Description of the service</h2>
        <p className={pClass}>
          Scan It lets you use a phone or other device as a barcode or QR code scanner and
          relay scanned content to a paired computer session. Features may change over time.
          The Service is provided for convenience only and may be modified or discontinued
          at any time without notice.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>3. Scan data, transmission, and storage</h2>
        <p className={pClass}>
          <strong className="font-medium text-foreground">
            Barcodes and QR codes you scan are transmitted to our servers
          </strong>{' '}
          so we can deliver pairing, routing, and real-time features.{' '}
          <strong className="font-medium text-foreground">
            That data may be stored for a short time
          </strong>{' '}
          as required to operate the Service (for example, to show recent scans on your
          desk, maintain sessions, or protect against abuse). Retention is limited and not
          intended for long-term archiving; we do not guarantee any particular retention
          period or deletion schedule.
        </p>
        <p className={pClass}>
          You are solely responsible for the content you scan and for complying with laws
          and third-party rights that apply to you. Do not use the Service to scan or
          process unlawful, confidential, or sensitive data you are not authorized to handle.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>4. Disclaimers</h2>
        <p className={pClass}>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY
          KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p className={pClass}>
          We do not warrant that the Service will be uninterrupted, error-free, or free of
          harmful components, or that scans will be decoded correctly or delivered without
          delay or loss.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>5. Limitation of liability</h2>
        <p className={pClass}>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SCAN IT, ITS
          OPERATORS, AFFILIATES, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
          SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA,
          GOODWILL, OR BUSINESS OPPORTUNITY, ARISING OUT OF OR RELATED TO YOUR USE OF THE
          SERVICE OR ANY SCAN DATA, WHETHER OR NOT WE HAVE BEEN ADVISED OF THE POSSIBILITY
          OF SUCH DAMAGES.
        </p>
        <p className={pClass}>
          <strong className="font-medium text-foreground">
            We accept no responsibility whatsoever for scan data
          </strong>{' '}
          (including its accuracy, completeness, security, confidentiality, or use after
          transmission), for how you or others rely on it, or for any damages arising from
          your use of the Service.{' '}
          <strong className="font-medium text-foreground">
            You use Scan It at your own risk.
          </strong>
        </p>
        <p className={pClass}>
          Some jurisdictions do not allow certain limitations; in those jurisdictions, our
          liability is limited to the fullest extent permitted by law.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>6. Indemnity</h2>
        <p className={pClass}>
          You agree to defend, indemnify, and hold harmless the Service and its operators
          from any claims, damages, losses, or expenses (including reasonable attorneys&apos;
          fees) arising from your use of the Service, your scan data, or your violation of
          these Terms.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>7. Acceptable use</h2>
        <p className={pClass}>You agree not to:</p>
        <ul className={ulClass}>
          <li>Use the Service in violation of applicable law or third-party rights.</li>
          <li>
            Attempt to disrupt, overload, or gain unauthorized access to the Service or
            related systems.
          </li>
          <li>
            Reverse engineer or attempt to extract source code except where permitted by
            law.
          </li>
        </ul>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>8. Termination</h2>
        <p className={pClass}>
          We may suspend or terminate access to the Service at any time, with or without
          cause or notice. Provisions that by their nature should survive (including
          disclaimers, limitations of liability, and indemnity) will survive termination.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>9. Changes to these terms</h2>
        <p className={pClass}>
          We may update these Terms from time to time. The &quot;Last updated&quot; date will change
          when we do. Continued use of the Service after changes constitutes acceptance of
          the revised Terms.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>10. Contact</h2>
        <p className={pClass}>
          For questions about these Terms, contact us using the details in the site footer:
        </p>
        <ul className="list-none space-y-1.5 pl-0 text-[15px] text-muted-foreground">
          <li>Phone: +46735029113</li>
          <li>Email: signeratsvanberg@gmail.com</li>
          <li>
            X (formerly Twitter):{' '}
            <span className="text-foreground">@GlennSvanberg</span>
          </li>
        </ul>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>11. Governing law</h2>
        <p className={pClass}>
          These Terms are governed by the laws of Sweden, without regard to conflict-of-law
          principles, except where mandatory consumer protections in your country of
          residence apply and cannot be waived.
        </p>
      </section>
    </div>
  )
}
