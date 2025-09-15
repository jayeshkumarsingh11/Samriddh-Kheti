
'use server';

/**
 * @fileOverview A flow for handling contact form submissions.
 *
 * - sendContactEmail - A function that processes the contact form data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { ContactEmailInput } from '@/components/ContactUs';


// The Zod schema is now defined in the client component (ContactUs.tsx)
// and the type is imported. We still need a schema here for the flow definition.
const ContactEmailInputSchema = z.object({
  name: z.string().describe("The sender's name."),
  email: z.string().email().describe("The sender's email address."),
  subject: z.string().describe('The subject of the message.'),
  message: z.string().describe('The content of the message.'),
});


export async function sendContactEmail(input: ContactEmailInput): Promise<{ success: boolean }> {
  return sendContactEmailFlow(input);
}

const sendContactEmailFlow = ai.defineFlow(
  {
    name: 'sendContactEmailFlow',
    inputSchema: ContactEmailInputSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async (input) => {
    console.log('Received contact form submission:');
    console.log('Name:', input.name);
    console.log('Email:', input.email);
    console.log('Subject:', input.subject);
    console.log('Message:', input.message);
    
    // =================================================================
    // TODO: Add your email sending logic here.
    //
    // Example using a hypothetical email service:
    //
    // import { sendEmail } from '@/lib/email';
    // await sendEmail({
    //   to: 'your-email@example.com', // Replace with your email address
    //   from: 'noreply@yourdomain.com', // A verified sending address
    //   subject: `New message from ${input.name}: ${input.subject}`,
    //   html: `<p>You have a new message from ${input.name} (${input.email}):</p><p>${input.message}</p>`,
    // });
    // =================================================================

    // For now, we'll just simulate a successful operation.
    // In a real implementation, you'd return success based on the email service's response.
    return { success: true };
  }
);
