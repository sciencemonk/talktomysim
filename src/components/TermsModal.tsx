import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">
            Terms of Service
          </DialogTitle>
        </DialogHeader>

        <div className="prose prose-sm sm:prose dark:prose-invert max-w-none py-4">
          <p className="text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">1. Introduction</h2>
            <p>
              Welcome to Talk to My Sim. These Terms of Service ("Terms") govern your access to and use of the Talk to My Sim website, mobile application, and services (collectively, the "Service"), operated by Talk to My Sim ("we," "us," or "our").
            </p>
            <p>
              By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">2. Definitions</h2>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>"Sim"</strong> refers to the AI-powered digital assistant or clone created using our Service.</li>
              <li><strong>"Content"</strong> refers to text, data, information, feedback, suggestions, questions, responses, and other materials provided by users to create, train, or interact with Sims.</li>
              <li><strong>"User"</strong> refers to individuals who access or use our Service, whether as a guest or registered user.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">3. Account Registration</h2>
            <p>
              To access certain features of the Service, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
            </p>
            <p>
              You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">4. Subscription and Payment</h2>
            <p>
              Some aspects of the Service may be offered on a subscription basis. By subscribing to our Service, you agree to pay the applicable fees as they become due. Subscription fees are non-refundable except as expressly set forth in these Terms or as required by applicable law.
            </p>
            <p>
              We may change our fees at any time. If we change our fees, we will provide notice of the change on the website or via email, at our option, at least 14 days before the change takes effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">5. User Content and Conduct</h2>
            <p>
              By providing Content to the Service, you grant us a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform the Content in connection with the Service and our business operations.
            </p>
            <p>
              You represent and warrant that you own or have the necessary rights to grant us the license to use the Content as described above, and that the Content does not violate the rights of any third party.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">6. Intellectual Property</h2>
            <p>
              The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of Talk to My Sim and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
            </p>
            <p>
              When you create a Sim using our Service, you retain ownership of the Content you provide to create and train the Sim. However, we own the technology, algorithms, and systems used to create, train, and operate the Sim.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">7. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
            <p>
              Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">8. Limitation of Liability</h2>
            <p>
              In no event shall Talk to My Sim, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">9. Disclaimer</h2>
            <p>
              Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">10. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="text-lg font-semibold mb-4">11. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at: terms@talktomysim.com
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

export default TermsModal;
