"use client";

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export const AnimatedTestimonials = ({
  testimonials,
  autoplay = false,
  className,
}) => {
  const [active, setActive] = useState(0);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const isActive = (index) => {
    return index === active;
  };

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay]);

  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10;
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '5rem 2rem' }} className={className}>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '5rem', alignItems: 'center' }}>
        <div>
          <div style={{ position: 'relative', height: '20rem', width: '100%' }}>
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: randomRotateY(),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : randomRotateY(),
                    zIndex: isActive(index)
                      ? 999
                      : testimonials.length + 2 - index,
                    y: isActive(index) ? [0, -80, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: randomRotateY(),
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, transformOrigin: 'bottom' }}
                >
                  <img
                    src={testimonial.src}
                    alt={testimonial.name}
                    draggable={false}
                    style={{ height: '100%', width: '100%', borderRadius: '1.5rem', objectFit: 'cover', objectPosition: 'center' }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center' }}>
            <button
              onClick={handlePrev}
              style={{ height: '2.5rem', width: '2.5rem', borderRadius: '50%', backgroundColor: '#1e293b', border: '2px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <IconArrowLeft style={{ height: '1.25rem', width: '1.25rem', color: '#f1f5f9' }} />
            </button>
            <button
              onClick={handleNext}
              style={{ height: '2.5rem', width: '2.5rem', borderRadius: '50%', backgroundColor: '#1e293b', border: '2px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <IconArrowRight style={{ height: '1.25rem', width: '1.25rem', color: '#f1f5f9' }} />
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', padding: '1rem 0' }}>
          <motion.div
            key={active}
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: -20,
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
          >
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f1f5f9', margin: '0 0 0.25rem 0' }}>
              {testimonials[active].name}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
              {testimonials[active].designation}
            </p>
            <motion.p style={{ fontSize: '1.125rem', color: '#cbd5e1', marginTop: '2rem', lineHeight: 1.6 }}>
              {testimonials[active].quote.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{
                    filter: "blur(10px)",
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    filter: "blur(0px)",
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                    delay: 0.02 * index,
                  }}
                  style={{ display: 'inline-block' }}
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
