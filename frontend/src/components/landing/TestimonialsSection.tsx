import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const testimonials = [
  { name: 'James Kariuki', role: 'Project Manager, Nairobi', text: 'ICDBO Data Analytics reduced our project delays by 40%. The insights are incredibly accurate for Kenyan market conditions.', rating: 5 },
  { name: 'Amina Hassan', role: 'Civil Engineer, Mombasa', text: 'The budget tracking and professional directory saved us millions. Best construction platform in East Africa.', rating: 5 },
  { name: 'Peter Odhiambo', role: 'Contractor, Kisumu', text: 'From document management to risk alerts, everything is streamlined. My team productivity increased by 60%.', rating: 5 },
];

const TestimonialsSection = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="scroll-mt-24 py-24 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-['Space_Grotesk'] mb-4">{t('testimonials.title')}</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="card-3d p-6 relative"
            >
              <Quote className="w-8 h-8 text-primary/20 absolute top-4 right-4" />
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: item.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{item.text}"</p>
              <div>
                <div className="font-semibold text-sm">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
