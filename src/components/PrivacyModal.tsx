import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">
            Privacy Policy
          </DialogTitle>
        </DialogHeader>

        <div className="prose prose-sm sm:prose dark:prose-invert max-w-none py-4">
          <p className="text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">1. Introduction</h2>
            <p>
              Welcome to Talk to My Sim ("we," "our," or "us"). We are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and services (collectively, the "Service").
            </p>
            <p>
              Please read this Privacy Policy carefully. By accessing or using our Service, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy and our Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-base font-medium mb-2">2.1 Personal Information</h3>
            <p>We may collect personal information that you voluntarily provide to us when you:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Register for an account</li>
              <li>Create or customize a Sim</li>
              <li>Use the chat features</li>
              <li>Contact our customer support</li>
              <li>Subscribe to our newsletters</li>
            </ul>
            <p>This information may include:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Name</li>
              <li>Email address</li>
              <li>Profile information</li>
              <li>Payment information</li>
              <li>Communications with us or through the Service</li>
            </ul>

            <h3 className="text-base font-medium mb-2">2.2 Sim Content and Conversations</h3>
            <p>
              When you create a Sim or engage in conversations with Sims, we collect and store the content you provide, including text inputs, uploaded documents, and conversation history. This information is used to train and improve your Sim and provide the Service.
            </p>

            <h3 className="text-base font-medium mb-2">2.3 Automatically Collected Information</h3>
            <p>When you access or use our Service, we may automatically collect certain information, including:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Device information (type, model, operating system)</li>
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Usage data (pages visited, time spent, features used)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">3. How We Use Your Information</h2>
            <p>We may use the information we collect for various purposes, including to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide, maintain, and improve our Service</li>
              <li>Create and train Sims based on your inputs</li>
              <li>Process transactions and manage your account</li>
              <li>Send you service-related notifications</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Protect the security and integrity of our Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">4. How We Share Your Information</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf (e.g., payment processing, data analysis, email delivery)</li>
              <li><strong>Business Partners:</strong> Companies we partner with to offer integrated services</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
            <p>
              We do not sell your personal information to third parties for their direct marketing purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">6. Your Data Rights</h2>
            <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Access to your personal information</li>
              <li>Correction of inaccurate or incomplete information</li>
              <li>Deletion of your personal information</li>
              <li>Restriction or objection to processing</li>
              <li>Data portability</li>
              <li>Withdrawal of consent</li>
            </ul>
            <p>
              To exercise these rights, please contact us at privacy@talktomysim.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">7. Children's Privacy</h2>
            <p>
              Our Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us, and we will take steps to delete such information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">8. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to collect information about your browsing activities and to remember your preferences. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">9. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="text-lg font-semibold mb-4">10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at: privacy@talktomysim.com
            </p>
          </section>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline" size="sm">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyModal;
