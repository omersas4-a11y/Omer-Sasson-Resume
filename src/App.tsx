import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Menu, X, Mail, ExternalLink } from 'lucide-react';
import heroImage from './assets/images/regenerated_image_1779118632268.jpg';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './lib/firebase';

import weflowImage from './assets/images/regenerated_image_1781630166699.png';
import guideDogImage from './assets/images/regenerated_image_1781791887516.png';
import bugCalendarImage from './assets/images/regenerated_image_1781875695294.png';
import logoImage from './assets/images/regenerated_image_1781949602646.png';

const Projects = [
  {
    id: "bug-calendar",
    title: "Bug Calendar",
    category: "Prototype",
    description: "Built to solve a real problem at the Israeli retail chain Bug, this system makes shift scheduling easy and fair. It collects employees' availability and automatically creates a balanced schedule, saving the manager valuable time. The system is currently active in two physical branches, with plans to expand to more stores.",
    image: bugCalendarImage,
    link: "https://bugcalendar.netlify.app/?demo=true"
  },
  {
    id: "weflow",
    title: "Play Different Academy",
    category: "Prototype",
    description: "Created in collaboration with a close friend and founder, the Play Different Academy website serves as an engaging landing page dedicated to welcoming new athletes. By combining visual storytelling with clear insights into the coach's philosophy and daily activities, it allows parents to easily explore the program and register their kids, keeping the focus on inspiring the next generation of players.",
    image: weflowImage,
    link: "https://play-different-academy.netlify.app/"
  },
  {
    id: "milab",
    title: "Israel Guide Dog Centre",
    category: "Figma Prototype",
    description: "Created as a conceptual project for an Advanced Product Design course, this system is a comprehensive volunteer screening platform designed for the Israel Guide Dog Centre. By organizing the complexities of the onboarding process, it features intuitive application dashboards, interview scheduling calendars, and training cycle management. This seamless interface allows coordinators to easily navigate administrative tasks, keeping the focus entirely on pairing dedicated volunteers with future guide dogs.",
    image: guideDogImage,
    link: "https://www.figma.com/proto/Drfg2um5EGEHbXQmY580Pd/%D7%90%D7%A4%D7%99%D7%95%D7%9F-%D7%9E%D7%95%D7%A6%D7%A8-%D7%AA%D7%A8%D7%92%D7%99%D7%9C-2-%D7%9C%D7%99%D7%A0%D7%95%D7%A8-%D7%95%D7%A2%D7%95%D7%9E%D7%A8?node-id=0-1&p=f&viewport=827%2C-747%2C0.35&t=CNJaTZ26Tw37Jlzt-0&scaling=scale-down&content-scaling=fixed&starting-point-node-id=200%3A334&show-proto-sidebar=1"
  }
];

const ScrollReveal = ({ children, delay = 0, yOffset = 30, xOffset = 0, className = "", as = "div" }: { children: React.ReactNode, delay?: number, yOffset?: number, xOffset?: number, className?: string, as?: any, key?: string | number }) => {
  const ref = useRef<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      
      if (rect.top <= windowHeight * 0.8) {
        setIsVisible(true);
      } else if (rect.top > windowHeight) {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const MotionComponent = (motion as any)[as] || motion.div;

  return (
    <MotionComponent
      ref={ref}
      initial={{ opacity: 0, y: yOffset, x: xOffset }}
      animate={isVisible ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y: yOffset, x: xOffset }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </MotionComponent>
  );
};

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', details: '' });
  const [isSending, setIsSending] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const emailModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emailModalRef.current && !emailModalRef.current.contains(event.target as Node)) {
        setEmailModalOpen(false);
      }
    };
    if (emailModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [emailModalOpen]);

  const openEmailProvider = (provider: string) => {
    const email = "omersas4@gmail.com";
    const subject = encodeURIComponent("Contact from Portfolio");
    let url = "";

    switch (provider) {
      case 'gmail':
        url = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}`;
        break;
      case 'outlook':
        url = `https://outlook.live.com/owa/?path=/mail/action/compose&to=${email}&subject=${subject}`;
        break;
      default:
        url = `mailto:${email}?subject=${subject}`;
    }
    window.open(url, '_blank');
    setEmailModalOpen(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.details) {
      alert("Please fill in all your details.");
      return;
    }
    
    try {
      setIsSending(true);
      
      // Save to Firebase Firestore to track messages
      try {
        await addDoc(collection(db, 'messages'), {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          details: formData.details,
          createdAt: serverTimestamp()
        });
      } catch (fbError) {
        handleFirestoreError(fbError, OperationType.CREATE, 'messages');
      }

      const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
          },
          body: JSON.stringify({
              access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "YOUR_ACCESS_KEY_HERE",
              name: formData.name,
              email: formData.email,
              message: formData.details,
              subject: formData.subject,
          }),
      });
      
      const result = await response.json();
      
      if (response.status === 200) {
        alert("Message sent successfully!");
        setFormData({ name: '', email: '', subject: '', details: '' });
      } else {
        throw new Error(result.message || "Failed to send message via Web3Forms");
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      alert("Failed to send message. Please replace VITE_WEB3FORMS_ACCESS_KEY in Settings or .env file with your access key.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink font-sans selection:bg-accent selection:text-white flex flex-col lg:flex-row relative">
      {/* Mobile Top Navigation */}
      <div className="lg:hidden fixed top-0 w-full h-[70px] bg-white border-b border-ink/10 flex items-center justify-between px-6 z-50">
        <div className="flex items-center cursor-default">
          <img src={logoImage} alt="Omer Sasson Logo" className="w-12 h-12 object-contain transition-transform duration-300 hover:scale-105" />
        </div>
        <button onClick={() => setMobileMenuOpen(true)}>
          <Menu className="w-6 h-6 text-ink" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[60] bg-white flex flex-col p-8"
          >
            <div className="flex justify-end">
               <button onClick={() => setMobileMenuOpen(false)}>
                 <X className="w-8 h-8 text-ink" />
               </button>
            </div>
            <div className="flex flex-col gap-8 mt-12 text-3xl font-display font-bold uppercase">
              <a href="#home" onClick={() => setMobileMenuOpen(false)} className="hover:text-accent">Home</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="hover:text-accent">About</a>
              <a href="#portfolio" onClick={() => setMobileMenuOpen(false)} className="hover:text-accent">Portfolio</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-accent">Contact</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Left Navigation Bar */}
      <nav className="hidden lg:flex fixed top-0 bottom-0 left-0 w-[88px] bg-white border-r border-ink/10 flex-col items-center justify-between py-12 z-50">
        <div className="w-16 h-16 flex items-center justify-center hover:opacity-80 transition-opacity cursor-default">
          <img src={logoImage} alt="Omer Sasson Logo" className="w-14 h-14 object-contain transition-transform duration-300 hover:scale-105" />
        </div>
        
        <div className="flex-1 flex items-center justify-center relative w-full h-full">
          <div className="absolute rotate-[-90deg] flex items-center gap-12 whitespace-nowrap text-sm font-bold uppercase tracking-widest text-[#758696]">
             <a href="#contact" className="hover:text-accent transition-colors">Contact</a>
             <a href="#portfolio" className="hover:text-accent transition-colors">Portfolio</a>
             <a href="#about" className="hover:text-accent transition-colors">About</a>
             <a href="#home" className="hover:text-accent transition-colors">Home</a>
          </div>
        </div>

        <div className="flex flex-col gap-6 items-center">
          <a href="https://linkedin.com/in/omer-sasson-5a9004285/" target="_blank" rel="noreferrer" className="text-ink/60 hover:text-accent transition-colors flex items-center justify-center">
             <span className="font-bold text-lg leading-none">in</span>
          </a>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-[88px] pt-[70px] lg:pt-0">
        
        {/* HERO SECTION */}
        <section id="home" className="flex flex-col lg:flex-row min-h-[calc(100vh-70px)] lg:min-h-screen border-b border-ink/10 bg-white">
          <div className="flex-1 flex flex-col justify-center px-8 lg:px-20 py-16 lg:py-0 relative">
            
            <ScrollReveal 
              as="h1"
              yOffset={30}
              className="text-5xl lg:text-[76px] font-bold font-display leading-[1.1] text-ink mb-8 overflow-hidden"
            >
              Hello, I’m Omer. <br/><span className="text-accent">nice to meet you!</span>
            </ScrollReveal>
            
            <ScrollReveal 
              as="p"
              delay={0.1}
              yOffset={30}
              className="text-lg lg:text-xl text-[#758696] font-normal leading-relaxed max-w-lg mb-12"
            >
              I'm a Communications student specializing in Human-Computer Interaction (HCI), with a strong passion for UX/UI design and creating user-centered digital products.
            </ScrollReveal>
            

          </div>
          
          <div className="flex-1 min-h-[50vh] lg:min-h-screen bg-cover bg-[center_20%] border-l border-ink/10 grayscale-[30%]" style={{ backgroundImage: `url(${heroImage})` }}>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="py-24 lg:py-32 px-6 lg:px-20 border-b border-ink/10 bg-[#fafafa]">
          <div className="max-w-7xl mx-auto">
             <div className="grid lg:grid-cols-12 gap-16">
                
                {/* Left side: Bio */}
                <ScrollReveal 
                  xOffset={-30}
                  className="lg:col-span-5"
                >
                  <h2 className="text-4xl lg:text-6xl font-bold font-display uppercase tracking-tight text-ink mb-8">
                    About Me
                  </h2>
                  <p className="text-lg text-[#758696] leading-relaxed mb-6">
                    Leveraging an analytical background as an Information Systems NCO alongside hands-on experience in prototyping and visual design to solve complex problems and deliver engaging user experiences.
                  </p>
                  <a href="/Omer_Sasson_Resume.pdf" target="_blank" className="inline-flex items-center gap-2 mt-4 px-8 py-3 bg-ink text-white font-bold uppercase tracking-widest text-xs hover:bg-accent transition-colors rounded-sm">
                    View Full Resume
                  </a>
                </ScrollReveal>
                
                {/* Right side: Resume Details */}
                <ScrollReveal 
                  xOffset={30}
                  delay={0.2}
                  className="lg:col-span-7 grid sm:grid-cols-2 gap-12"
                >
                   
                   {/* Experience */}
                   <div className="space-y-12">
                      <div>
                        <h4 className="text-2xl font-bold font-display text-ink mb-6 border-b border-ink/10 pb-4">Experience</h4>
                        
                        <div className="mb-8">
                          <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Feb 2026 - Present</span>
                          <h5 className="font-bold text-lg text-ink">Head of Content</h5>
                          <p className="text-sm font-semibold text-ink/60 mb-2">SHiFT Club (Reichman University)</p>
                          <ul className="list-disc list-outside ml-4 text-sm text-[#758696] space-y-1">
                            <li>Design and manage a dynamic, semester-based educational syllabus.</li>
                            <li>Scout and collaborate with top industry professionals.</li>
                            <li>Create engaging digital assets for social media to boost club visibility.</li>
                          </ul>
                        </div>

                        <div>
                          <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">May 2021 - Apr 2023</span>
                          <h5 className="font-bold text-lg text-ink">Information Systems NCO</h5>
                          <p className="text-sm font-semibold text-ink/60 mb-2">IDF (MEKALAR)</p>
                          <ul className="list-disc list-outside ml-4 text-sm text-[#758696] space-y-1">
                            <li>Synthesized complex data into clear reports for senior officers.</li>
                            <li>Managed and monitored complex data processes, ensuring accuracy.</li>
                          </ul>
                        </div>
                      </div>
                   </div>

                   {/* Education & Skills */}
                   <div className="space-y-12">
                      <div>
                        <h4 className="text-2xl font-bold font-display text-ink mb-6 border-b border-ink/10 pb-4">Education</h4>
                        
                        <div className="mb-8">
                          <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Nov 2024 - Present</span>
                          <h5 className="font-bold text-lg text-ink">HCI Student</h5>
                          <p className="text-sm font-semibold text-ink/60 mb-2">Reichman University</p>
                          <p className="text-sm text-[#758696]">School of Communication | Human Computer Interaction.<br/>Focusing on UX, product, and user-centered design.</p>
                        </div>

                        <div>
                          <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Sep 2017 - Jun 2020</span>
                          <h5 className="font-bold text-lg text-ink">Full Diploma</h5>
                          <p className="text-sm font-semibold text-ink/60 mb-2">Ben Zvi High School</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-2xl font-bold font-display text-ink mb-6 border-b border-ink/10 pb-4">Skills & Tools</h4>
                        <div className="flex flex-wrap gap-2">
                           {["Wireframing", "Problem Solving", "Creative Thinking", "Data Analysis", "Visual Design", "Figma", "Generative AI", "Google AI Studio", "Canva"].map(skill => (
                             <span key={skill} className="bg-[#e4e4e4] text-ink px-3 py-1 text-xs font-bold uppercase tracking-wider">{skill}</span>
                           ))}
                        </div>
                      </div>
                   </div>

                </ScrollReveal>
             </div>
          </div>
        </section>

        {/* PORTFOLIO SECTION */}
        <section id="portfolio" className="py-24 lg:py-32 px-6 lg:px-20 border-b border-ink/10 bg-white">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal 
              as="h2"
              yOffset={30}
              className="text-4xl lg:text-6xl font-bold font-display uppercase tracking-tight text-ink mb-20 text-center"
            >
              Selected Works
            </ScrollReveal>
            
            <div className="space-y-32">
              {Projects.map((proj, i) => (
                <ScrollReveal 
                  as="div"
                  key={proj.id} 
                  yOffset={50}
                  delay={i * 0.1}
                  className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center group"
                >
                  <div className="w-full lg:w-[60%] border border-ink/10 rounded-xl overflow-hidden shadow-sm transition-shadow duration-500 group-hover:shadow-xl bg-[#fafafa]">
                     <a href={proj.link} target="_blank" rel="noreferrer" className="block relative aspect-[16/10] p-12">
                       <img src={proj.image} alt={proj.title} className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-700" referrerPolicy="no-referrer" />
                     </a>
                  </div>
                  
                  <div className="w-full lg:w-[40%] flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4 block">
                      {proj.category}
                    </span>
                    <h3 className="text-3xl lg:text-5xl font-bold font-display text-ink mb-6">
                      {proj.title}
                    </h3>
                    <p className="text-lg text-[#758696] font-normal leading-relaxed mb-8">
                      {proj.description}
                    </p>
                    <a href={proj.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-ink hover:text-accent transition-colors group/link w-fit relative">
                      <span className="relative">
                        View Project
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover/link:w-full transition-all duration-300"></span>
                      </span>
                      <ArrowUpRight className="w-4 h-4"/>
                    </a>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="py-24 lg:py-32 px-6 lg:px-20 bg-[#fafafa]">
          <div className="max-w-7xl mx-auto">
             <ScrollReveal 
               as="div"
               yOffset={30}
               className="mb-16"
             >
               <h2 className="text-4xl lg:text-6xl font-bold font-display uppercase tracking-tight text-ink mb-6">
                 Let's Work Together
               </h2>
               <p className="text-lg text-[#758696] max-w-xl">
                 I’m currently available for new opportunities. Feel free to reach out if you have a project in mind or just want to say hi!
               </p>
             </ScrollReveal>

             <div className="grid lg:grid-cols-12 gap-16 lg:gap-24">
                {/* Contact Form - Left Column */}
                <ScrollReveal 
                  as="div"
                  yOffset={30}
                  delay={0.1}
                  className="lg:col-span-8"
                >
                  <form className="space-y-6" onSubmit={handleFormSubmit}>
                    <div className="grid sm:grid-cols-2 gap-6">
                       <div className="space-y-2 group">
                         <label className="text-xs font-bold uppercase tracking-widest text-[#758696] group-focus-within:text-accent transition-colors">Name</label>
                         <input 
                           type="text" 
                           placeholder="Your Name" 
                           value={formData.name}
                           onChange={e => setFormData({...formData, name: e.target.value})}
                           className="w-full bg-white border border-ink/10 px-5 py-4 focus:outline-none focus:border-accent font-normal placeholder:text-ink/30 transition-all rounded-sm shadow-sm"
                         />
                       </div>
                       <div className="space-y-2 group">
                         <label className="text-xs font-bold uppercase tracking-widest text-[#758696] group-focus-within:text-accent transition-colors">Email</label>
                         <input 
                           type="email" 
                           placeholder="Your Email" 
                           value={formData.email}
                           onChange={e => setFormData({...formData, email: e.target.value})}
                           className="w-full bg-white border border-ink/10 px-5 py-4 focus:outline-none focus:border-accent font-normal placeholder:text-ink/30 transition-all rounded-sm shadow-sm"
                         />
                       </div>
                    </div>
                    <div className="space-y-2 group">
                       <label className="text-xs font-bold uppercase tracking-widest text-[#758696] group-focus-within:text-accent transition-colors">Subject</label>
                       <input 
                         type="text" 
                         placeholder="What's this about?" 
                         value={formData.subject}
                         onChange={e => setFormData({...formData, subject: e.target.value})}
                         className="w-full bg-white border border-ink/10 px-5 py-4 focus:outline-none focus:border-accent font-normal placeholder:text-ink/30 transition-all rounded-sm shadow-sm"
                       />
                    </div>
                    <div className="space-y-2 group">
                       <label className="text-xs font-bold uppercase tracking-widest text-[#758696] group-focus-within:text-accent transition-colors">Message</label>
                       <textarea 
                         rows={6}
                         placeholder="Tell me about your project..." 
                         value={formData.details}
                         onChange={e => setFormData({...formData, details: e.target.value})}
                         className="w-full bg-white border border-ink/10 px-5 py-4 focus:outline-none focus:border-accent font-normal placeholder:text-ink/30 resize-y transition-all rounded-sm shadow-sm"
                       />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isSending}
                      className={`px-10 py-4 bg-ink text-white font-bold uppercase tracking-widest text-xs hover:bg-accent transition-colors rounded-sm shadow-md flex items-center justify-center gap-2 ${isSending ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isSending ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </ScrollReveal>

                {/* Contact Details - Right Column */}
                <ScrollReveal 
                   as="div"
                   yOffset={30}
                   delay={0.2}
                   className="lg:col-span-4 space-y-12"
                >
                   <div className="space-y-8">
                     <div>
                       <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Location</span>
                       <a href="https://maps.google.com/?q=Kiryat+Ono,+Israel" target="_blank" rel="noreferrer" className="text-lg font-bold font-display text-ink hover:text-accent transition-colors relative group w-fit block">
                         Kiryat Ono, Israel
                         <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"></span>
                       </a>
                     </div>
                     <div>
                       <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Phone</span>
                       <a href="tel:0523770456" className="text-lg font-bold font-display text-ink hover:text-accent transition-colors relative group w-fit block">
                         052-3770456
                         <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"></span>
                       </a>
                     </div>
                     <div className="relative" ref={emailModalRef}>
                       <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Email</span>
                       <button 
                         onClick={() => setEmailModalOpen(!emailModalOpen)}
                         className="text-lg font-bold font-display text-ink hover:text-accent transition-colors relative group w-fit block"
                       >
                         omersas4@gmail.com
                         <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"></span>
                       </button>

                       <AnimatePresence>
                         {emailModalOpen && (
                           <motion.div
                             initial={{ opacity: 0, y: 10, scale: 0.95 }}
                             animate={{ opacity: 1, y: 0, scale: 1 }}
                             exit={{ opacity: 0, y: 10, scale: 0.95 }}
                             className="absolute z-[70] left-0 mt-2 w-48 bg-white border border-ink/10 shadow-xl rounded-lg overflow-hidden py-1"
                           >
                              <button onClick={() => openEmailProvider('gmail')} className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex items-center gap-2 text-sm font-semibold transition-colors">
                                <Mail className="w-4 h-4 text-[#EA4335]" /> Gmail
                              </button>
                              <button onClick={() => openEmailProvider('outlook')} className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex items-center gap-2 text-sm font-semibold transition-colors">
                                <Mail className="w-4 h-4 text-[#0078D4]" /> Outlook
                              </button>
                              <button onClick={() => openEmailProvider('default')} className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex items-center gap-2 text-sm font-semibold transition-colors">
                                <ExternalLink className="w-4 h-4 text-zinc-500" /> Default App
                              </button>
                           </motion.div>
                         )}
                       </AnimatePresence>
                     </div>
                     <div>
                       <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">LinkedIn</span>
                       <a 
                         href="https://linkedin.com/in/omer-sasson-5a9004285/" 
                         target="_blank" 
                         rel="noreferrer" 
                         className="text-lg font-bold font-display text-ink hover:text-accent transition-colors flex items-center gap-2 relative group w-fit"
                       >
                         <span className="relative">
                           Omer Sasson
                           <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"></span>
                         </span>
                         <ArrowUpRight className="w-4 h-4"/>
                       </a>
                     </div>
                   </div>
                </ScrollReveal>
             </div>
          </div>
          
          <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-ink/10 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="text-xs font-bold uppercase tracking-widest text-[#758696]">
               © {new Date().getFullYear()} Omer Sasson.
             </div>
             <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-[#758696]">
                <a href="#home" className="hover:text-accent transition-colors">Back to top</a>
             </div>
          </div>
        </section>
        
      </main>
    </div>
  );
}
