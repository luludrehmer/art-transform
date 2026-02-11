import { Card } from "@/components/ui/card";
import { Mail, Phone, Clock } from "lucide-react";

export default function Support() {
  return (
    <div className="flex-1 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 font-display">Get Support</h1>
          <p className="text-muted-foreground text-lg">
            We're here to help. Reach out and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Email Us</h3>
            <a
              href="mailto:info@art-and-see.com"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              info@art-and-see.com
            </a>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Call Us</h3>
            <a
              href="tel:+13322960276"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              +1 (332) 296 0276
            </a>
            <p className="text-xs text-muted-foreground/60 mt-1">WhatsApp available</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Response Time</h3>
            <p className="text-sm text-muted-foreground">Mon–Fri, 9 AM – 6 PM EST</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Usually within 24 hours</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
