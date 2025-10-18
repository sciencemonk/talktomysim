import TopNavigation from "@/components/TopNavigation";
import SimpleFooter from "@/components/SimpleFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <h2>Agreement to Terms</h2>
            <p>
              By accessing or using SimProject ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
              If you disagree with any part of these terms, you may not access the Service.
            </p>

            <h2>Description of Service</h2>
            <p>
              SimProject provides an AI-powered platform for creating and interacting with simulated personas and advisors. 
              We reserve the right to modify, suspend, or discontinue the Service at any time.
            </p>

            <h2>User Accounts</h2>
            <h3>Registration</h3>
            <p>
              To use certain features, you must register for an account. You agree to:
            </p>
            <ul>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information</li>
              <li>Keep your password secure and confidential</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>

            <h3>Account Termination</h3>
            <p>
              We may terminate or suspend your account at any time for violations of these Terms or for any other reason 
              at our sole discretion.
            </p>

            <h2>Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any illegal purpose</li>
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit harmful code or malware</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Impersonate any person or entity</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Collect user information without consent</li>
            </ul>

            <h2>Intellectual Property</h2>
            <h3>Our Content</h3>
            <p>
              The Service and its original content, features, and functionality are owned by SimProject and are 
              protected by international copyright, trademark, and other intellectual property laws.
            </p>

            <h3>User Content</h3>
            <p>
              You retain ownership of content you create or upload. By posting content, you grant us a worldwide, 
              non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content in connection 
              with the Service.
            </p>

            <h2>Payment Terms</h2>
            <p>
              Certain features may require payment. You agree to:
            </p>
            <ul>
              <li>Provide accurate payment information</li>
              <li>Pay all fees as described on the Service</li>
              <li>Be responsible for all charges incurred</li>
            </ul>
            <p>
              All fees are non-refundable unless otherwise stated. We reserve the right to change our pricing at any time.
            </p>

            <h2>Disclaimers</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. 
              WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
            </p>
            <p>
              The AI-generated content is for informational purposes only and should not be considered professional advice.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SimProject SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
            </p>

            <h2>Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless SimProject from any claims, damages, losses, liabilities, and 
              expenses arising from your use of the Service or violation of these Terms.
            </p>

            <h2>Dispute Resolution</h2>
            <p>
              Any disputes arising from these Terms or the Service shall be resolved through binding arbitration, except 
              where prohibited by law.
            </p>

            <h2>Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
              without regard to its conflict of law provisions.
            </p>

            <h2>Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of material changes. 
              Your continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>

            <h2>Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable, the remaining provisions will continue 
              in full force and effect.
            </p>

            <h2>Contact Information</h2>
            <p>
              For questions about these Terms, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> legal@simproject.org<br />
              <strong>Address:</strong> [Your Address]
            </p>
          </CardContent>
        </Card>
      </div>
      <SimpleFooter />
    </div>
  );
};

export default Terms;
