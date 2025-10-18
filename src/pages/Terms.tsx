import TopNavigation from "@/components/TopNavigation";
import SimpleFooter from "@/components/SimpleFooter";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNavigation />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using our services, you accept and agree to be bound by the terms and 
              provisions of this agreement. If you do not agree to these terms, please do not use our 
              services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground">
              We provide AI-powered simulation and tutoring services through our platform. The service 
              may be modified, updated, or discontinued at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="mb-4">To use certain features of our services, you must register for an account. You agree to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. User Conduct</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Use the service for any illegal purpose or in violation of any laws</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Attempt to gain unauthorized access to any portion of the service</li>
              <li>Transmit any viruses, malware, or harmful code</li>
              <li>Collect or harvest information about other users</li>
              <li>Use the service to harass, abuse, or harm others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
            <p className="text-muted-foreground mb-4">
              All content, features, and functionality of the service, including but not limited to 
              text, graphics, logos, and software, are owned by us or our licensors and protected by 
              copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-muted-foreground">
              You retain ownership of any content you submit to the service, but you grant us a 
              worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute 
              your content in connection with operating the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Payment and Billing</h2>
            <p className="text-muted-foreground mb-4">
              Certain features of the service may require payment. You agree to provide accurate billing 
              information and authorize us to charge your payment method for all fees incurred.
            </p>
            <p className="text-muted-foreground">
              All fees are non-refundable unless otherwise stated. We reserve the right to change our 
              pricing with notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
            <p className="text-muted-foreground">
              We may terminate or suspend your account and access to the service at any time, without 
              prior notice or liability, for any reason, including breach of these terms. You may also 
              terminate your account at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">
              The service is provided "as is" and "as available" without warranties of any kind, either 
              express or implied. We do not warrant that the service will be uninterrupted, secure, or 
              error-free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, we shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages resulting from your use of or 
              inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify and hold us harmless from any claims, damages, losses, liabilities, 
              and expenses arising from your use of the service or violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
            <p className="text-muted-foreground">
              These terms shall be governed by and construed in accordance with applicable laws, without 
              regard to conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. We will provide notice of material 
              changes by posting the updated terms on this page. Your continued use of the service after 
              changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us through our 
              contact page or via email.
            </p>
          </section>
        </div>
      </main>

      <SimpleFooter />
    </div>
  );
};

export default Terms;
