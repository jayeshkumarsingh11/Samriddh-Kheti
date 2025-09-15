
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { sendContactEmail } from "@/ai/flows/send-contact-email";


const ContactEmailInputSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});
export type ContactEmailInput = z.infer<typeof ContactEmailInputSchema>;


export default function ContactUs() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactEmailInput>({
    resolver: zodResolver(ContactEmailInputSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: ContactEmailInput) {
    setIsSubmitting(true);
    try {
      // Call the AI flow to process and send the email
      await sendContactEmail(values);
      
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We will get back to you shortly.",
      });

      form.reset();
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem sending your message. Please try again.",
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div id="contact-us" className="bg-muted/40 scroll-mt-20">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-headline text-primary">{t('contact_us_title')}</h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('contact_us_subtitle')}
          </p>
        </header>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{t('contact_form_title')}</CardTitle>
              <CardDescription>{t('contact_form_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form_name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('form_name_placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form_email')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('form_email_placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form_subject')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('form_subject_placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form_message')}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t('form_message_placeholder')} className="min-h-[120px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                     {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     ) : (
                       <Send className="mr-2 h-4 w-4" />
                     )}
                     {isSubmitting ? 'Sending...' : t('send_message_button')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
