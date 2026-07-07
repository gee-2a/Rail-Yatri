import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import TrainAnimation from '@/components/TrainAnimation';
import {
  Mail, Phone, MapPin, Send, HelpCircle,
  Train, Compass, Shield, Heart, HelpCircleIcon
} from 'lucide-react';

/* ==========================================================================
   ABOUT PAGE
   ========================================================================== */
export function AboutPage() {
  const navigate = useNavigate();

  const coreValues = [
    { icon: Compass, title: "Intelligent Routing", desc: "Proprietary search engine finding the fastest and cheapest routes across Indian Railways." },
    { icon: Shield, title: "Zero Fraud Booking", desc: "Bank-grade encryption protecting transactions with strict anti-bot booking safeguards." },
    { icon: Heart, title: "Traveler-First Support", desc: "Round-the-clock emergency support regarding ticket upgrades, refunds, or status tracking." }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-28 pb-32">
      <div className="max-w-5xl mx-auto px-4 space-y-16">
        
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Revolutionizing Indian Rail Travel
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-[#6C757D] max-w-xl mx-auto leading-relaxed"
          >
            RailYatri is a premium independent ticketing assistant designed to bring simplicity, elegance, and peace of mind back to long-distance train journeys.
          </motion.p>
        </div>

        {/* Visual Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { num: "5M+", label: "Happy Journeys", desc: "Passengers helped across India" },
            { num: "99.9%", label: "System Uptime", desc: "Fastest response time under load" },
            { num: "24/7", label: "Dedicated Support", desc: "Direct human assistant lines" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-[#E5E5E5] text-center shadow-sm"
            >
              <div className="text-3xl font-black text-[#E63946]" style={{ fontFamily: 'Outfit, sans-serif' }}>{stat.num}</div>
              <div className="font-bold text-gray-900 text-sm mt-1">{stat.label}</div>
              <div className="text-xs text-[#6C757D] mt-1">{stat.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Why We Started RailYatri
            </h2>
            <p className="text-sm text-[#6C757D] leading-relaxed">
              For decades, planning a railway journey in India was synonymous with navigating complex waiting lists, confusing reservation classes, and slow websites. We set out to build a platform that strips away the noise and makes booking tickets a seamless, 3-click experience.
            </p>
            <p className="text-sm text-[#6C757D] leading-relaxed">
              Leveraging real-time location metrics and historical cancellation data, RailYatri doesn't just sell tickets—we actively monitor your reservations and predict seat movements.
            </p>
          </div>
          <div className="bg-gradient-to-tr from-[#1D3557] to-[#457B9D] rounded-3xl p-8 text-white space-y-6 shadow-lg">
            <h3 className="font-bold text-lg">Quick Highlights</h3>
            <ul className="space-y-4 text-xs text-white/90">
              <li className="flex items-start gap-2">
                <span className="bg-white/20 p-1.5 rounded-lg font-bold">01</span>
                <span>Automatic promotion pipeline promoting RAC tickets to Confirmed instantly upon cancellations.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-white/20 p-1.5 rounded-lg font-bold">02</span>
                <span>Automated PDF ticket compilation containing verified journey QR codes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-white/20 p-1.5 rounded-lg font-bold">03</span>
                <span>Dynamic seat selectors providing lower-berth filters for elderly passengers.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black text-gray-900 text-center" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coreValues.map((val, i) => {
              const Icon = val.icon;
              return (
                <div key={i} className="bg-white p-6 rounded-2xl border border-[#E5E5E5] space-y-3 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 flex items-center justify-center text-[#E63946]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">{val.title}</h3>
                  <p className="text-xs text-[#6C757D] leading-relaxed">{val.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
      <TrainAnimation />
    </div>
  );
}

/* ==========================================================================
   CONTACT PAGE
   ========================================================================== */
export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.warning('Please fill in all required fields');
      return;
    }
    setSending(true);
    setTimeout(() => {
      toast.success('Your message has been sent! We will get back to you within 24 hours.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSending(false);
    }, 1200);
  };

  const contactInfos = [
    { icon: Phone, title: "Call Us", details: "+91 80 4911 3557", desc: "Mon-Sat, 9am - 6pm IST" },
    { icon: Mail, title: "Support Email", details: "support@railyatri.com", desc: "Replies within 4 hours" },
    { icon: MapPin, title: "Headquarters", details: "RailYatri HQ, MG Road", desc: "Bangalore, Karnataka, India" }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-28 pb-32">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-12">
          <h1 className="text-3xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Get in Touch
          </h1>
          <p className="text-sm text-[#6C757D] max-w-sm mx-auto">
            Have questions about booking refunds, corporate travel, or API integrations? Drop us a line.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel - Info columns */}
          <div className="lg:col-span-4 space-y-4">
            {contactInfos.map((info, i) => {
              const Icon = info.icon;
              return (
                <div key={i} className="bg-white p-5 rounded-2xl border border-[#E5E5E5] flex gap-4 items-start shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 flex items-center justify-center text-[#E63946] shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{info.title}</h3>
                    <div className="text-sm font-semibold text-[#1D3557] mt-0.5">{info.details}</div>
                    <span className="text-[11px] text-[#6C757D] block mt-1">{info.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right panel - Form Card */}
          <div className="lg:col-span-8 bg-white border border-[#E5E5E5] rounded-3xl p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-[#6C757D]">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E5E5E5] px-3.5 py-2.5 rounded-xl text-sm outline-none text-[#0A0A0A] focus:border-[#E63946]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-[#6C757D]">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E5E5E5] px-3.5 py-2.5 rounded-xl text-sm outline-none text-[#0A0A0A] focus:border-[#E63946]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#6C757D]">Subject</label>
                <input
                  type="text"
                  placeholder="How can we help you?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E5E5E5] px-3.5 py-2.5 rounded-xl text-sm outline-none text-[#0A0A0A] focus:border-[#E63946]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#6C757D]">Message</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Write your query details here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E5E5E5] px-3.5 py-2.5 rounded-xl text-sm outline-none text-[#0A0A0A] focus:border-[#E63946] resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#E63946] hover:bg-[#D62828] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> {sending ? 'Sending Query...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
      <TrainAnimation />
    </div>
  );
}

/* ==========================================================================
   FAQ PAGE
   ========================================================================== */
export function FAQPage() {
  const faqs = [
    {
      q: "How does the RAC (Reservation Against Cancellation) system work?",
      a: "If a coach has no confirmed seats remaining, you are issued an RAC ticket. RAC ticket holders are allowed to board the train and get sitting space. If any confirmed passenger cancels their booking, RAC ticket holders are automatically promoted to Confirmed berths based on registration date."
    },
    {
      q: "Can I cancel a booking at the last minute?",
      a: "Tickets can be cancelled up to 4 hours before the scheduled train departure. Within 4 hours of departure, refunds are not permitted as charts are completed. Refunds are calculated dynamically based on time remaining: 75% refund if cancelled >24h in advance, and 50% refund if cancelled between 4h and 24h in advance."
    },
    {
      q: "How do I download my ticket PDF?",
      a: "You can download your E-ticket PDF directly from the 'Booking Confirmation' page or under your account's 'My Bookings' history tab. Clicking 'Download Ticket' will download a computer-generated PDF containing a verified ticket QR code."
    },
    {
      q: "Is there a limit to the number of passengers per booking?",
      a: "Yes, you can register a maximum of 6 passengers per single transaction. This is aligned with IRCTC commercial booking regulations to prevent reservation hoarding."
    },
    {
      q: "How is my booking seat assigned?",
      a: "Our reservation engine uses an automated seat-assignment helper that checks the coach database for adjacent open seats to keep families/groups seated side-by-side. Preference is also given to senior citizens for lower berth assignments."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-28 pb-32">
      <div className="max-w-3xl mx-auto px-4 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-3xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-[#6C757D] max-w-sm mx-auto">
            Find answers regarding ticketing, RAC queues, refund percentages, and dynamic pricing rules.
          </p>
        </div>

        {/* Radix Accordions */}
        <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6 sm:p-8 shadow-sm">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-b border-[#E5E5E5] last:border-b-0 py-2">
                <AccordionTrigger className="text-left font-bold text-gray-900 hover:text-[#E63946] text-sm py-4">
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4.5 h-4.5 text-[#E63946] shrink-0" /> {faq.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-xs text-[#6C757D] leading-relaxed pl-6.5 pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

      </div>
      <TrainAnimation />
    </div>
  );
}

/* ==========================================================================
   404 NOT FOUND PAGE
   ========================================================================== */
export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-28 pb-32 flex items-center justify-center text-center px-4">
      <div className="bg-white p-10 rounded-3xl border border-[#E5E5E5] max-w-md shadow-lg space-y-6">
        
        {/* 404 Illustration representation */}
        <div className="relative w-36 h-36 mx-auto bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center">
          <Train className="w-16 h-16 text-[#E63946] opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center text-5xl font-black text-[#1D3557] select-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
            404
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Train Went Off Track!
          </h2>
          <p className="text-xs text-[#6C757D] leading-relaxed max-w-xs mx-auto">
            The page you are looking for has been moved, archived, or doesn't exist. Let's redirect you back to safety.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => navigate('/')}
            className="w-full py-3.5 bg-[#1D3557] hover:bg-[#15283F] text-white font-bold rounded-xl transition-all shadow-md active:scale-95 text-sm"
          >
            Back to Home Page
          </button>
        </div>

      </div>
      <TrainAnimation />
    </div>
  );
}
